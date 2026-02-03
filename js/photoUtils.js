// Utilities for camera-only capture and timestamp stamping.
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
  if (!file) return "";
  const image = new Image();
  const fileUrl = URL.createObjectURL(file);
  image.src = fileUrl;
  await new Promise(resolve => {
    image.onload = resolve;
  });
  const stamped = stampImageWithTimestamp(image);
  URL.revokeObjectURL(fileUrl);
  return stamped;
}
