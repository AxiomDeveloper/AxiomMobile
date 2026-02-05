const gmailBtn = document.getElementById("gmailBtn");
const icloudBtn = document.getElementById("icloudBtn");
const analyzeBtn = document.getElementById("analyzeBtn");
const cleanupBtn = document.getElementById("cleanupBtn");
const output = document.getElementById("output");
const dashboard = document.getElementById("dashboard");

let connected = {
  gmail: false,
  icloud: false
};

gmailBtn.onclick = () => {
  connected.gmail = true;
  gmailBtn.textContent = "✅ Gmail Connected";
  dashboard.classList.remove("hidden");
};

icloudBtn.onclick = () => {
  connected.icloud = true;
  icloudBtn.textContent = "✅ iCloud Connected";
  dashboard.classList.remove("hidden");
};

analyzeBtn.onclick = async () => {
  output.textContent = "🧠 Running deep analysis (this may take a bit)…";

  try {
    const result = await window.Agent.analyze();
    output.textContent = JSON.stringify(result, null, 2);
  } catch (err) {
    output.textContent = "Error: " + err.message;
  }
};

cleanupBtn.onclick = async () => {
  output.textContent = "🧹 Generating intelligent cleanup plan…";

  try {
    const result = await window.Agent.cleanupPlan();
    output.textContent = JSON.stringify(result, null, 2);
  } catch (err) {
    output.textContent = "Error: " + err.message;
  }
};