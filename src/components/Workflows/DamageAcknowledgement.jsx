"use client";

import { useMemo, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import CameraCapture from "./CameraCapture";

import { sendDamageNotification } from "@/lib/damageNotifications.mjs";

export default function DamageAcknowledgement({ lineName = "MACY Production" }) {
  const { state, damageLoadError, updateDamageReport } = useApp();
  const [closeStates, setCloseStates] = useState({});

  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const openReports = useMemo(
    () => state.damageReports.filter((report) => report.status === "Open"),
    [state.damageReports]
  );

  const saveUpdate = async (report, updates) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setMessage("");
    try {
      const saved = await updateDamageReport(report.id, updates);
      const sent = await sendDamageNotification(saved, {
        subject: `Damage update (${saved.status}) - ${lineName}`,
        photo: saved.status === "Closed" ? saved.closePhoto : saved.photo,
      });
      setMessage(sent ? "Update saved. Notification accepted by the email server."
        : "Update saved, but email notification was not confirmed. Contact management directly. Do not repeat the update.");
      setCloseStates((prev) => ({ ...prev, [report.id]: { fixedBy: "", closePhoto: null, showClose: false } }));
    } catch (error) {
      setMessage(error.message || "Update was not confirmed. Your closure details have been kept.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  if (openReports.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-100">
        {damageLoadError ? <p role="alert">{damageLoadError}</p> : "All loaded open damage reports are acknowledged or closed."}
        {message && <p role="status">{message}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
      {damageLoadError && <p role="alert">{damageLoadError}</p>}
      {message && <p role="status">{message}</p>}
      <p className="font-semibold">Damage Acknowledgement Required</p>
      <p className="mt-1 text-xs text-red-200/80">
        All open reports must be handed over or closed before submission.
      </p>

      <div className="mt-4 space-y-3">
        {openReports.map((report) => {
          const closeState = closeStates[report.id] || {
            fixedBy: "",
            closePhoto: null,
            showClose: false,
          };

          return (
            <div
              key={report.id}
              className="rounded-xl border border-red-500/30 bg-slate-950/60 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-100">
                    {report.equipmentArea}
                  </p>
                  <p className="text-xs text-slate-400">
                    {report.description}
                  </p>
                </div>
                <span className="rounded-full border border-red-400/40 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-red-200">
                  {report.severity}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  disabled={busy}
                  onClick={() => saveUpdate(report, { status: "Handover" })}
                  className="rounded-full border border-amber-400/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200"
                >
                  Mark Handover
                </button>
                <button
                  onClick={() =>
                    setCloseStates((prev) => ({
                      ...prev,
                      [report.id]: { ...closeState, showClose: true },
                    }))
                  }
                  className="rounded-full border border-emerald-400/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200"
                >
                  Close Fixed
                </button>
              </div>

              {closeState.showClose && (
                <fieldset disabled={busy} className="mt-3 space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                  <input
                    className="w-full rounded-lg border border-emerald-500/30 bg-slate-950/60 px-3 py-2 text-xs text-slate-100"
                    placeholder="Fixed by (name / team)"
                    value={closeState.fixedBy}
                    onChange={(event) =>
                      setCloseStates((prev) => ({
                        ...prev,
                        [report.id]: {
                          ...closeState,
                          fixedBy: event.target.value,
                        },
                      }))
                    }
                  />
                  <CameraCapture
                    label="Closure Photo (Camera Only)"
                    required
                    onCapture={(photo) =>
                      setCloseStates((prev) => ({
                        ...prev,
                        [report.id]: { ...closeState, closePhoto: photo },
                      }))
                    }
                  />
                  <button
                    disabled={busy || !closeState.fixedBy.trim() || !closeState.closePhoto}
                    onClick={() => saveUpdate(report, { status: "Closed", fixedBy: closeState.fixedBy.trim(), closePhoto: closeState.closePhoto, closedAt: new Date().toISOString() })}
                    className="w-full rounded-xl bg-emerald-500 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-900"
                  >
                    Submit Closure
                  </button>
                </fieldset>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

