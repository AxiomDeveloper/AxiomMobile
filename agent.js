const SYSTEM_PROMPT = `
You are an autonomous email cleanup agent.

RULES:
- Output JSON only
- No explanations
- Max 80 tokens

CATEGORIES:
personal, work, finance, subscription, marketing, spam

ACTIONS:
keep, archive, delete, unsubscribe, flag
`;

async function runAnalysis() {
  const prompt = `
${SYSTEM_PROMPT}

TASK:
Summarize inbox state and identify major cleanup opportunities.

Return JSON:
{
  "summary": "",
  "top_categories": [],
  "noise_level": "low|medium|high"
}
`;

  const result = await window.callLLM(prompt);
  return safeJSON(result);
}

async function runCleanupPlan() {
  const prompt = `
${SYSTEM_PROMPT}

TASK:
Generate a cleanup plan for a noisy inbox.

Return JSON:
{
  "recommended_actions": [
    { "category": "", "action": "", "reason": "" }
  ]
}
`;

  const result = await window.callLLM(prompt);
  return safeJSON(result);
}

function safeJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { error: "Invalid LLM output", raw: text };
  }
}

window.Agent = {
  analyze: runAnalysis,
  cleanupPlan: runCleanupPlan
};