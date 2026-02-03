// Simple workflow state machine to drive control pages.
function computeWorkflowState({
  preclean,
  postclean,
  released,
  pendingHandovers,
  handoverDamages,
  openDamages,
  handoverRequired
}) {
  if (released) {
    return { state: "Released", actions: ["findings"] };
  }
  if (postclean) {
    if (handoverRequired || pendingHandovers || handoverDamages || openDamages) {
      return { state: "PostCleanCompleted", actions: ["damage", "handover"] };
    }
    return { state: "ReadyForAreaLead", actions: ["damage", "inspection"] };
  }
  if (preclean) {
    return { state: "PreCleanCompleted", actions: ["damage", "postclean"] };
  }
  return { state: "NotStarted", actions: ["preclean", "damage"] };
}
