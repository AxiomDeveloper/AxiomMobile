async function callLLM(prompt) {
  const endpoint = window.CONFIG?.HF_SPACE_URL;

  if (!endpoint) {
    throw new Error("HF_SPACE_URL not configured");
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [prompt]
    })
  });

  if (!res.ok) {
    throw new Error("LLM request failed");
  }

  const json = await res.json();
  return json.data?.[0] ?? "";
}

window.callLLM = callLLM;