const api = window.CONFIG.API_BASE;

const gmailBtn = document.getElementById("gmailBtn");
const icloudBtn = document.getElementById("icloudBtn");
const analyzeBtn = document.getElementById("analyzeBtn");
const cleanupBtn = document.getElementById("cleanupBtn");
const output = document.getElementById("output");
const dashboard = document.getElementById("dashboard");

gmailBtn.onclick = () => {
  window.location.href = `${api}/auth/gmail`;
};

icloudBtn.onclick = () => {
  window.location.href = `${api}/auth/icloud`;
};

analyzeBtn.onclick = async () => {
  output.textContent = "Analyzing inbox with AI agent…";

  const res = await fetch(`${api}/analyze`, {
    credentials: "include"
  });

  const data = await res.json();
  dashboard.classList.remove("hidden");
  output.textContent = JSON.stringify(data, null, 2);
};

cleanupBtn.onclick = async () => {
  output.textContent = "Generating cleanup plan…";

  const res = await fetch(`${api}/cleanup/plan`, {
    credentials: "include"
  });

  const data = await res.json();
  output.textContent = JSON.stringify(data, null, 2);
};