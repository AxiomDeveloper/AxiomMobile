const HF_ENDPOINT = window.CONFIG.HF_SPACE_URL;

async function callLLM(prompt) {
  const res = await fetch(HF_ENDPOINT, {
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
  return json.data[0];
}

window.callLLM = callLLM;