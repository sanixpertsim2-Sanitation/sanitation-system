// Hidden unlock helper for admin recovery.
function attachUnlock({ supabase, area, task }) {
  const unlock = document.getElementById("unlockHelp");
  if (!unlock) return;
  unlock.addEventListener("click", async () => {
    const pin = prompt("Help / Unlock\n\nEnter PIN or Cancel to use face verification");
    if (pin === "2451") {
      await unlockTask({ supabase, area, task, reason: "PIN unlock" });
      alert("Unlocked. You may reopen the step.");
      return;
    }
    const face = await ensureFaceVerified({
      supabase,
      role: "admin",
      area
    });
    if (face.ok) {
      await unlockTask({ supabase, area, task, reason: "Face unlock" });
      alert("Unlocked. You may reopen the step.");
    } else {
      alert("Unlock failed.");
    }
  });
}
