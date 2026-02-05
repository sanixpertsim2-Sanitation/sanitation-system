// Utilities for camera-only capture and timestamp stamping.
// Import shared constants (if available) or define fallbacks
// In a browser environment, these will be defined below
let ALLOWED_TYPES, MAX_FILE_SIZE;

// Try to load from constants file (for Node.js environments)
if (typeof require !== 'undefined') {
  try {
    const constants = require('./constants.js');
    ALLOWED_TYPES = constants.ALLOWED_IMAGE_TYPES;
    MAX_FILE_SIZE = constants.MAX_FILE_SIZE;
  } catch (e) {
    // Fallback if constants file not available
    ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  }
} else {
  // Browser environment - define constants
  ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
}

function validateFile(file) {
  if (!file) return { valid: false, error: "No file provided" };
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "Invalid file type. Only JPEG, PNG, and WebP are allowed" };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }
  
  return { valid: true };
}
function stampImageWithTimestamp(image) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);

  const ts = new Date().toLocaleString();
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(10, canvas.height - 40, 260, 30);
  ctx.fillStyle = "#ffffff";
  ctx.font = "16px Segoe UI, Arial";
  ctx.fillText(ts, 18, canvas.height - 18);

  return canvas.toDataURL("image/jpeg", 0.9);
}

async function readAndStampImage(file) {
  if (!file) throw new Error("No file provided");
  
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  const image = new Image();
  const fileUrl = URL.createObjectURL(file);
  
  try {
    image.src = fileUrl;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error("Failed to load image"));
    });
    const stamped = stampImageWithTimestamp(image);
    return stamped;
  } finally {
    URL.revokeObjectURL(fileUrl); // Always cleanup, even on error
  }
}

function enforceCameraOnlyInputs() {
  const inputs = document.querySelectorAll('input[type="file"]');
  inputs.forEach(input => {
    input.setAttribute("accept", "image/*");
    if (!input.getAttribute("capture")) {
      const capture = input.dataset.capture || "environment";
      input.setAttribute("capture", capture);
    }
  });
}

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", enforceCameraOnlyInputs);
}
