const RECIPIENT = "adarsh@sanixperts.ca";
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);

function photoAttachment(payload) {
  const photo = payload.photoData || payload.photoUrl;
  if (!photo) return undefined;
  // Attach only uploaded image bytes. Never fetch client-supplied URLs or files.
  if (typeof photo !== "string") throw new Error("Invalid photo.");
  const match = /^data:image\/(jpeg|png|gif|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(photo);
  if (!match || match[2].length % 4 !== 0) throw new Error("Photo must be a base64 JPEG, PNG, GIF, or WebP image.");
  if (match[2].length > Math.ceil(MAX_PHOTO_BYTES / 3) * 4) throw new Error("Photo exceeds the 5 MB email attachment limit.");
  const content = Buffer.from(match[2], "base64");
  if (!content.length || content.length > MAX_PHOTO_BYTES || content.toString("base64") !== match[2]) throw new Error("Invalid photo data.");
  return { filename: `damage-photo.${match[1] === "jpeg" ? "jpg" : match[1]}`, content, contentType: `image/${match[1]}`, cid: "damage-photo" };
}

export function createDamageEmailHandler({ createTransport, env = process.env }) {
  return async function POST(request) {
    let payload;
    let attachment;
    try {
      payload = await request.json();
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Invalid request body.");
      if (typeof payload.to !== "string" || payload.to.trim().toLowerCase() !== RECIPIENT) throw new Error("Invalid damage report recipient.");
      for (const key of ["reporter", "lineName", "equipmentArea", "timestamp", "description", "subject", "severity", "status", "fixedBy"]) {
        if (payload[key] != null && typeof payload[key] !== "string") throw new Error(`Invalid ${key}.`);
      }
      if (payload.severity && !["High", "Medium", "Low"].includes(payload.severity)) throw new Error("Invalid severity.");
      attachment = photoAttachment(payload);
    } catch (error) {
      return Response.json({ ok: false, error: error instanceof SyntaxError ? "Invalid JSON request body." : error.message }, { status: 400 });
    }

    const port = Number(env.SMTP_PORT || 587);
    if (!env.SMTP_HOST?.trim() || !env.SMTP_USER?.trim() || !env.SMTP_PASS || !Number.isInteger(port) || port < 1 || port > 65535 || (env.SMTP_SECURE != null && !["true", "false"].includes(env.SMTP_SECURE))) {
      return Response.json({ ok: false, error: "Email service is not configured. Contact an administrator." }, { status: 503 });
    }
    const severity = payload.severity || "High";
    const color = severity === "High" ? "#dc2626" : severity === "Medium" ? "#f59e0b" : "#2563eb";
    const heading = severity === "High" ? "URGENT: HIGH SEVERITY DAMAGE" : severity === "Medium" ? "ALERT: MEDIUM SEVERITY DAMAGE" : "DAMAGE REPORTED";
    const html = `<div style="border:5px solid ${color};padding:20px;font-family:Arial,sans-serif;">
      <h1 style="color:${color};margin-top:0;">${heading}</h1>
      <p><strong>Reported By:</strong> ${escapeHtml(payload.reporter || "Unknown")}</p>
      <p><strong>Line:</strong> ${escapeHtml(payload.lineName || "MACY Production")}</p>
      <p><strong>Status:</strong> ${escapeHtml(payload.status || "Open")}</p>
      ${payload.fixedBy ? `<p><strong>Fixed By:</strong> ${escapeHtml(payload.fixedBy)}</p>` : ""}
      <p><strong>Equipment/Area:</strong> ${escapeHtml(payload.equipmentArea || "-")}</p>
      <p><strong>Timestamp:</strong> ${escapeHtml(payload.timestamp || "")}</p><hr />
      <p><strong>Description:</strong> ${escapeHtml(payload.description || "")}</p>
      ${attachment ? '<img src="cid:damage-photo" alt="Damage Photo" style="max-width:100%;border-radius:8px;" />' : ""}
    </div>`;
    try {
      const transporter = createTransport({
        host: env.SMTP_HOST, port,
        secure: env.SMTP_SECURE == null ? port === 465 : env.SMTP_SECURE === "true",
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
        connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 30000,
      });
      const result = await transporter.sendMail({
        from: env.ALERT_FROM || "sanixpert@alerts.com", to: RECIPIENT,
        subject: payload.subject || heading, html,
        attachments: attachment ? [attachment] : [],
        disableFileAccess: true, disableUrlAccess: true,
      });
      const accepted = (result?.accepted || []).map((recipient) => String(typeof recipient === "object" ? recipient.address : recipient).toLowerCase());
      if (!accepted.includes(RECIPIENT) || result?.rejected?.length || result?.pending?.length) {
        return Response.json({ ok: false, error: "The mail server did not accept the damage alert. Contact an administrator before retrying." }, { status: 502 });
      }
      // SMTP acceptance is not proof of final inbox delivery.
      return Response.json({ ok: true, sent: true, status: "accepted" });
    } catch {
      return Response.json({ ok: false, error: "The email service could not confirm acceptance of the damage alert. Contact an administrator before retrying." }, { status: 502 });
    }
  };
}
