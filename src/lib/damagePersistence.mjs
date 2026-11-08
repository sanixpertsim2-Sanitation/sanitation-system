export function fromDamageRow(row) {
  return {
    id: row.id, lineName: row.line_name, equipmentArea: row.equipment_area,
    description: row.description, severity: row.severity, status: row.status,
    reportedBy: row.reported_by, createdAt: row.created_at,
    photo: row.photo_data ? { dataUrl: row.photo_data, timestamp: row.created_at } : null,
    fixedBy: row.fixed_by, closedAt: row.closed_at,
    closePhoto: row.close_photo_data ? { dataUrl: row.close_photo_data, timestamp: row.closed_at } : null,
  };
}

function requireDatabase(client) {
  if (!client) throw new Error("Database is not configured. Report was not saved. Contact your administrator.");
}

export async function insertDamageReport(client, report) {
  requireDatabase(client);
  const { data, error } = await client.from("damage_reports").insert({
    line_name: report.lineName, equipment_area: report.equipmentArea,
    description: report.description, severity: report.severity, status: report.status,
    reported_by: report.reportedBy, created_at: report.createdAt,
    photo_data: report.photo?.dataUrl || null,
  }).select("*").single();
  if (error || !data?.id) throw new Error("Database did not confirm the report was saved. Keep these details and check the report log before retrying.");
  return fromDamageRow(data);
}

export async function persistDamageUpdate(client, id, updates) {
  requireDatabase(client);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error("This older report is saved only on this device. It must be migrated to the database before it can be updated.");
  }
  const fields = { status: "status", fixedBy: "fixed_by", closedAt: "closed_at" };
  const patch = {};
  for (const [key, column] of Object.entries(fields)) {
    if (Object.hasOwn(updates, key)) patch[column] = updates[key];
  }
  if (Object.hasOwn(updates, "closePhoto")) patch.close_photo_data = updates.closePhoto?.dataUrl || null;
  const { data, error } = await client.from("damage_reports").update(patch).eq("id", id).select("*").single();
  if (error || !data?.id) throw new Error("Database did not confirm the update. Check the report log before retrying.");
  return fromDamageRow(data);
}

// Preserve legacy device-only reports instead of silently replacing them on reload.
export function mergeDamageReports(local, remote) {
  const ids = new Set(remote.map((report) => report.id));
  return [...remote, ...local.filter((report) => !ids.has(report.id))];
}
