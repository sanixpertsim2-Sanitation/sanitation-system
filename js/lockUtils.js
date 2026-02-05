// Task locking helpers to prevent concurrent edits.
async function acquireTaskLock({ supabase, area, task, userName }) {
  if (!supabase) return { ok: false, reason: "Supabase not loaded" };
  if (!area || !task || !userName) return { ok: false, reason: "Missing lock fields" };

  const { data, error } = await supabase
    .from("task_locks")
    .select("*")
    .eq("area", area)
    .eq("task", task)
    .limit(1);

  if (error) return { ok: false, reason: "Lock check failed" };

  const existing = data && data.length ? data[0] : null;
  if (existing && existing.status === "Completed") {
    return { ok: false, reason: "Task already submitted. Use Help / Unlock to reopen." };
  }
  if (existing && existing.status === "InProgress" && existing.locked_by !== userName) {
    if (task === "line") {
      return { ok: false, reason: `${existing.locked_by} is currently cleaning this line.` };
    }
    if (task === "preclean") {
      return { ok: false, reason: `${existing.locked_by} is currently working on this pre-cleaning.` };
    }
    const labelMap = {
      preclean: "Pre-Cleaning",
      postclean: "Post-Cleaning",
      handover: "Handover",
      inspection: "Area Lead Verification"
    };
    const label = labelMap[task] || "Task";
    return { ok: false, reason: `${label} currently in progress by ${existing.locked_by}` };
  }

  const { error: upsertError } = await supabase
    .from("task_locks")
    .upsert({
      area,
      task,
      locked_by: userName,
      locked_at: new Date().toISOString(),
      status: "InProgress"
    }, { onConflict: "area,task" });

  if (upsertError) return { ok: false, reason: "Unable to lock task" };
  return { ok: true };
}

async function completeTaskLock({ supabase, area, task, userName }) {
  if (!supabase) return;
  await supabase
    .from("task_locks")
    .upsert({
      area,
      task,
      locked_by: userName,
      locked_at: new Date().toISOString(),
      status: "Completed"
    }, { onConflict: "area,task" });
}

async function unlockTask({ supabase, area, task, reason }) {
  if (!supabase) return;
  await supabase
    .from("task_locks")
    .upsert({
      area,
      task,
      locked_by: "UNLOCK",
      locked_at: new Date().toISOString(),
      status: "Unlocked",
      unlock_reason: reason || "Manual unlock"
    }, { onConflict: "area,task" });
}
