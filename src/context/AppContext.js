"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

import { fromDamageRow, insertDamageReport, persistDamageUpdate, mergeDamageReports } from "@/lib/damagePersistence.mjs";

const STORAGE_KEY = "sanixpertState";

const defaultState = {
  employees: [],
  currentUser: null,
  bagCounts: {
    covered: "",
    retrieved: "",
  },
  stages: {
    preClean: false,
    postClean: false,
    handover: false,
    lead: false,
  },
  stageInProgress: {
    preCleanBy: null,
    postCleanBy: null,
  },
  stageTimes: {
    preCleanAt: null,
    postCleanAt: null,
    handoverAt: null,
    leadAt: null,
  },
  handoverRequired: null,
  handoverTasks: [
    {
      id: "task-1",
      text: "Verify all lines and conveyors are clean to sanitation standard.",
      status: "pending",
    },
    {
      id: "task-2",
      text: "Inspect all coverings and confirm every cover is removed.",
      status: "pending",
    },
    {
      id: "task-3",
      text: "Verify drain strainers near the line are clean and clear.",
      status: "pending",
    },
    {
      id: "task-4",
      text: "Verify housekeeping and garbage removal is completed for the line.",
      status: "pending",
    },
  ],
  damageReports: [],
  activityFeed: [],
  lineStatus: {
    macy: { stage: "Idle", submittedBy: "-", timestamp: null },
    jfk: { stage: "Coming Soon", submittedBy: "-", timestamp: null },
    cece: { stage: "Coming Soon", submittedBy: "-", timestamp: null },
  },
};

const AppContext = createContext(null);

const loadState = () => {
  if (typeof window === "undefined") return defaultState;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultState;
    return { ...defaultState, ...JSON.parse(stored) };
  } catch {
    return defaultState;
  }
};

export function AppProvider({ children }) {
  const [state, setState] = useState(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const [damageLoadError, setDamageLoadError] = useState("");
  const damageRevision = useRef(0);
  const damageWrites = useRef(new Map());

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      console.warn("Device cache could not be saved. Confirmed database reports remain saved.");
    }
  }, [state, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (!supabase) {
      setDamageLoadError("Database is not configured. Reports cannot be saved or updated.");
      return;
    }
    let cancelled = false;
    const revision = damageRevision.current;
    const loadDamageReports = async () => {
      try {
        const { data, error } = await supabase.from("damage_reports").select("*").order("created_at", { ascending: false });
        if (error || !data) throw new Error("load failed");
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          damageReports: mergeDamageReports(prev.damageReports, data.map((row) => {
            const local = prev.damageReports.find((report) => report.id === row.id);
            return local && (damageWrites.current.get(row.id) || 0) > revision
              ? local : fromDamageRow(row);
          })),
        }));
        setDamageLoadError("");
      } catch {
        if (!cancelled) setDamageLoadError("Database reports could not be loaded. Showing device cache, which may be incomplete or out of date.");
      }
    };
    loadDamageReports();
    return () => { cancelled = true; };
  }, [hydrated]);

  const registerEmployee = ({ name, role, faceId }) => {
    setState((prev) => ({
      ...prev,
      employees: [
        ...prev.employees,
        { id: `emp-${Date.now()}`, name, role, faceId },
      ],
      currentUser: { name, role, faceId },
    }));
  };

  const setCurrentUser = (user) => {
    setState((prev) => ({
      ...prev,
      currentUser: user,
    }));
  };

  const completePreClean = ({ bagsCovered, name }) => {
    const now = new Date().toISOString();
    logEvent("pre_clean_submitted", {
      lineName: "MACY Production",
      bagsCovered,
      submittedBy: name,
      timestamp: now,
    });
    setState((prev) => ({
      ...prev,
      bagCounts: { ...prev.bagCounts, covered: bagsCovered },
      stages: { ...prev.stages, preClean: true },
      stageInProgress: { ...prev.stageInProgress, preCleanBy: null },
      stageTimes: { ...prev.stageTimes, preCleanAt: now },
      lineStatus: {
        ...prev.lineStatus,
        macy: {
          stage: "Under Wash",
          submittedBy: name,
          timestamp: now,
        },
      },
      activityFeed: [
        {
          id: `feed-${Date.now()}`,
          text: `${name} submitted Pre-Clean for MACY Production`,
          timestamp: now,
        },
        ...prev.activityFeed,
      ],
    }));
  };

  const completePostClean = ({ bagsRetrieved, name }) => {
    const now = new Date().toISOString();
    logEvent("post_clean_submitted", {
      lineName: "MACY Production",
      bagsRetrieved,
      submittedBy: name,
      timestamp: now,
    });
    setState((prev) => ({
      ...prev,
      bagCounts: { ...prev.bagCounts, retrieved: bagsRetrieved },
      stages: { ...prev.stages, postClean: true },
      stageInProgress: { ...prev.stageInProgress, postCleanBy: null },
      stageTimes: { ...prev.stageTimes, postCleanAt: now },
      lineStatus: {
        ...prev.lineStatus,
        macy: {
          stage: "Post-Clean Completed",
          submittedBy: name,
          timestamp: now,
        },
      },
      activityFeed: [
        {
          id: `feed-${Date.now()}`,
          text: `${name} submitted Post-Clean for MACY Production`,
          timestamp: now,
        },
        ...prev.activityFeed,
      ],
    }));
  };

  const setHandoverRequired = (value) => {
    setState((prev) => ({ ...prev, handoverRequired: value }));
  };

  const markStageInProgress = (stageKey, name) => {
    setState((prev) => ({
      ...prev,
      stageInProgress: {
        ...prev.stageInProgress,
        [`${stageKey}By`]: name,
      },
    }));
  };

  const updateHandoverTasks = (tasks) => {
    setState((prev) => ({ ...prev, handoverTasks: tasks }));
  };

  const completeHandover = ({ name }) => {
    const now = new Date().toISOString();
    logEvent("handover_submitted", {
      lineName: "MACY Production",
      submittedBy: name,
      timestamp: now,
    });
    setState((prev) => ({
      ...prev,
      stages: { ...prev.stages, handover: true },
      stageTimes: { ...prev.stageTimes, handoverAt: now },
      lineStatus: {
        ...prev.lineStatus,
        macy: {
          stage: "Handover Completed",
          submittedBy: name,
          timestamp: now,
        },
      },
      activityFeed: [
        {
          id: `feed-${Date.now()}`,
          text: `${name} completed Handover for MACY Production`,
          timestamp: now,
        },
        ...prev.activityFeed,
      ],
    }));
  };

  const completeLeadSignoff = ({ name, signature }) => {
    const now = new Date().toISOString();
    logEvent("lead_released", {
      lineName: "MACY Production",
      leadName: name,
      timestamp: now,
    });
    setState((prev) => ({
      ...prev,
      stages: { ...prev.stages, lead: true },
      leadSignature: signature,
      stageTimes: { ...prev.stageTimes, leadAt: now },
      lineStatus: {
        ...prev.lineStatus,
        macy: {
          stage: "Released for Production",
          submittedBy: name,
          timestamp: now,
        },
      },
      activityFeed: [
        {
          id: `feed-${Date.now()}`,
          text: `${name} released MACY Production`,
          timestamp: now,
        },
        ...prev.activityFeed,
      ],
    }));
  };

  const addDamageReport = async (report) => {
    const saved = await insertDamageReport(supabase, report);
    damageRevision.current += 1;
    damageWrites.current.set(saved.id, damageRevision.current);
    setState((prev) => ({
      ...prev,
      damageReports: [saved, ...prev.damageReports.filter((item) => item.id !== saved.id)],
      activityFeed: [{ id: `feed-${Date.now()}`, text: `${saved.reportedBy} reported damage (${saved.severity})`, timestamp: saved.createdAt }, ...prev.activityFeed],
    }));
    return saved;
  };

  const updateDamageReport = async (id, updates) => {
    const saved = await persistDamageUpdate(supabase, id, updates);
    damageRevision.current += 1;
    damageWrites.current.set(saved.id, damageRevision.current);
    setState((prev) => ({
      ...prev,
      damageReports: prev.damageReports.map((report) => report.id === id ? saved : report),
    }));
    return saved;
  };

  const logEvent = (eventType, payload) => {
    if (!supabase) return;
    supabase.from("event_logs").insert([
      {
        line_name: payload.lineName || "MACY Production",
        event_type: eventType,
        payload,
      },
    ]);
  };

  const resetStages = (nextStages) => {
    setState((prev) => ({
      ...prev,
      stages: { ...prev.stages, ...nextStages },
      bagCounts: {
        covered: nextStages.preClean ? prev.bagCounts.covered : "",
        retrieved: nextStages.postClean ? prev.bagCounts.retrieved : "",
      },
    }));
  };

  const value = useMemo(
    () => ({
      state,
      damageLoadError,
      registerEmployee,
      setCurrentUser,
      completePreClean,
      completePostClean,
      setHandoverRequired,
      markStageInProgress,
      updateHandoverTasks,
      completeHandover,
      completeLeadSignoff,
      addDamageReport,
      updateDamageReport,
      resetStages,
    }),
    [state, damageLoadError]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }
  return ctx;
};

