const api = CONFIG.API_BASE;

document.getElementById("gmailBtn").onclick = () => {
  window.location.href = `${api}/auth/gmail`;
};

document.getElementById("icloudBtn").onclick = () => {
  window.location.href = `${api}/auth/icloud`;
};

document.getElementById("analyze").onclick = async () => {
  const res = await fetch(`${api}/analyze`, { credentials: "include" });
  const data = await res.json();
  document.getElementById("insights").innerText =
    JSON.stringify(data, null, 2);
};

document.getElementById("cleanup").onclick = async () => {
  const res = await fetch(`${api}/cleanup/plan`, { credentials: "include" });
  alert("Cleanup plan generated. Review before executing.");
};