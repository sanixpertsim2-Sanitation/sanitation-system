export async function sendDamageNotification(report, { subject, photo, fetcher = fetch } = {}) {
  try {
    const response = await fetcher("/api/send-email", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "adarsh@sanixperts.ca",
        subject: subject || `${report.severity} severity damage reported from ${report.lineName}`,
        description: report.description, photoData: (photo || report.photo)?.dataUrl,
        timestamp: report.closedAt || report.createdAt, equipmentArea: report.equipmentArea,
        reporter: report.reportedBy, severity: report.severity, lineName: report.lineName,
        status: report.status, fixedBy: report.fixedBy,
      }),
    });
    const result = await response.json();
    return response.ok && result.ok === true && result.sent === true && !result.mocked;
  } catch {
    return false;
  }
}
