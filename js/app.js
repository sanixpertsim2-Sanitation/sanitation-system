function selectLine(line) {
  // UI-state only: selected line for routing/header display.
  localStorage.setItem("selectedLine", line);
  window.location.href = "area.html";
}

function goPreClean() {
  window.location.href = "preclean.html";
}

function goPostClean() {
  window.location.href = "postclean.html";
}

function goDamage() {
  window.location.href = "damage.html";
}

function submitPreClean() {
  alert("Pre-Cleaning submitted successfully");
  window.location.href = "postclean.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const dt = document.getElementById("datetime");
  if (dt) {
    dt.value = new Date().toLocaleString();
  }
});
