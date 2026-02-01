import { supabase } from "./supabase.js";

export async function createBatch() {
  const batchId = `MACY-${new Date().toISOString().replace(/[-:.TZ]/g, "")}`;

  const { error } = await supabase
    .from("sanitation_batches")
    .insert([
      {
        batch_id: batchId,
        area: "Line 3",
        line: "Chocolate",
        shift: "Night",
        created_by: "Supervisor"
      }
    ]);

  if (error) {
    alert("Batch creation failed: " + error.message);
    return null;
  }

  return batchId;
}
