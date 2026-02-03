// Minimal face verification using FaceDetector when available.
async function detectFaceFromFile(file) {
  if (!file) return false;
  if (!("FaceDetector" in window)) {
    // Fallback: accept capture if browser lacks FaceDetector.
    return true;
  }
  const detector = new FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
  const bitmap = await createImageBitmap(file);
  const faces = await detector.detect(bitmap);
  return faces && faces.length > 0;
}

async function ensureFaceVerified({ supabase, role, area }) {
  if (!supabase) return { ok: false, reason: "Supabase not loaded" };

  const name = prompt("Enter your full name to continue:");
  if (!name) return { ok: false, reason: "Name required" };

  // Capture face photo (camera only).
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.capture = "user";

  const file = await new Promise(resolve => {
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      window.removeEventListener("focus", onFocus);
      resolve(result);
    };
    const onFocus = () => {
      setTimeout(() => {
        if (input.files && input.files.length) return;
        finish(null);
      }, 200);
    };
    input.onchange = () => finish(input.files && input.files[0] ? input.files[0] : null);
    window.addEventListener("focus", onFocus, { once: true });
    input.click();
  });

  if (!file) return { ok: false, reason: "Face photo required" };

  const hasFace = await detectFaceFromFile(file);
  if (!hasFace) return { ok: false, reason: "Face not detected. Please retake." };

  const stamped = await readAndStampImage(file);

  // Save or update face registry.
  const { data, error } = await supabase
    .from("face_registry")
    .select("id")
    .eq("name", name)
    .eq("role", role)
    .limit(1);

  if (error) return { ok: false, reason: "Face registry unavailable" };

  if (data && data.length) {
    await supabase
      .from("face_registry")
      .update({ photo: stamped, last_seen_at: new Date().toISOString() })
      .eq("id", data[0].id);
  } else {
    await supabase
      .from("face_registry")
      .insert({
        name,
        role,
        photo: stamped,
        created_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString()
      });
  }

  return { ok: true, name, photo: stamped };
}
