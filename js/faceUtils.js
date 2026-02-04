// Minimal face verification using FaceDetector when available.
// Import shared constants (if available) or define fallbacks
let ALLOWED_IMAGE_TYPES;

// Try to load from constants file (for Node.js environments)
if (typeof require !== 'undefined') {
  try {
    const constants = require('./constants.js');
    ALLOWED_IMAGE_TYPES = constants.ALLOWED_IMAGE_TYPES;
  } catch (e) {
    // Fallback if constants file not available
    ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  }
} else {
  // Browser environment - define constants
  ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
}

// Constants for face image validation heuristics
const FACE_ASPECT_RATIO_MIN = 0.7;  // Portrait photos (taller than wide)
const FACE_ASPECT_RATIO_MAX = 1.5;  // Landscape photos (wider than tall)
const FACE_MIN_DIMENSION = 200;     // Minimum pixel dimension for reliable face detection

async function detectFaceFromFile(file) {
  if (!file) return false;
  
  // Validate file type first
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    console.warn("Invalid file type for face detection:", file.type);
    return false;
  }
  
  // Method 1: Use FaceDetector API if available
  if ("FaceDetector" in window) {
    let bitmap = null;
    try {
      const detector = new FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
      bitmap = await createImageBitmap(file);
      const faces = await detector.detect(bitmap);
      return faces && faces.length > 0;
    } catch (error) {
      console.warn("FaceDetector failed, falling back to basic validation:", error.message);
    } finally {
      // Clean up bitmap to prevent memory leak
      if (bitmap && bitmap.close) {
        bitmap.close();
      }
    }
  }
  
  // Method 2: Basic image validation fallback
  try {
    return validateFaceImageBasic(file);
  } catch (error) {
    console.warn("Basic image validation failed:", error.message);
    return false;
  }
}

// Basic validation for face images when FaceDetector is unavailable
async function validateFaceImageBasic(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    try {
      img.onload = () => {
        try {
          // Basic heuristics for face photos
          const aspectRatio = img.width / img.height;
          const minSize = Math.min(img.width, img.height);
          
          // Face photos typically have aspect ratio between defined bounds
          // and minimum dimension of at least FACE_MIN_DIMENSION
          const validAspectRatio = aspectRatio >= FACE_ASPECT_RATIO_MIN && aspectRatio <= FACE_ASPECT_RATIO_MAX;
          const validSize = minSize >= FACE_MIN_DIMENSION;
          
          resolve(validAspectRatio && validSize);
        } finally {
          URL.revokeObjectURL(url);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(false);
      };
      
      img.src = url;
    } catch (error) {
      URL.revokeObjectURL(url);
      resolve(false);
    }
  });
}

async function ensureFaceVerified({ supabase, role, area }) {
  if (!supabase) return { ok: false, reason: "Supabase not loaded" };

  const name = prompt("Enter your full name to continue:");
  if (!name || !name.trim() || name.trim().length < 2) {
    return { ok: false, reason: "Valid full name required (minimum 2 characters)" };
  }
  const sanitizedName = name.trim().replace(/[<>]/g, '');

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
  if (!hasFace) return { ok: false, reason: "Face not detected or invalid image. Please retake." };

  const stamped = await readAndStampImage(file);

  // Save or update face registry.
  const { data, error } = await supabase
    .from("face_registry")
    .select("id")
    .eq("name", sanitizedName)
    .eq("role", role)
    .limit(1);

  if (error) return { ok: false, reason: "Face registry unavailable" };

  if (data && data.length) {
    try {
      const { error: updateError } = await supabase
        .from("face_registry")
        .update({ photo: stamped, last_seen_at: new Date().toISOString() })
        .eq("id", data[0].id);
      
      if (updateError) {
        console.error("Failed to update face registry:", updateError);
        return { ok: false, reason: "Failed to update face registry" };
      }
    } catch (error) {
      ErrorHandler.showError("Error updating face registry", error);
      return { ok: false, reason: "Failed to update face registry" };
    }
  } else {
    try {
      const { error: insertError } = await supabase
        .from("face_registry")
        .insert({
          name: sanitizedName,
          role,
          photo: stamped,
          created_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error("Failed to save face registry:", insertError);
        return { ok: false, reason: "Failed to save face registry" };
      }
    } catch (error) {
      ErrorHandler.showError("Error saving face registry", error);
      return { ok: false, reason: "Failed to save face registry" };
    }
  }

  return { ok: true, name: sanitizedName, photo: stamped };
}
