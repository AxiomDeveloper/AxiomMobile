// core/agent.js (enhanced with real AI stub - add your key)
export const Agent = {
  async processMessage(msg) {
    // Real AI integration (use Groq for fast agentic responses)
    const API_KEY = 'YOUR_GROQ_API_KEY'; // Add your key here
    if (!API_KEY) return { content: 'API key missing - placeholder response to: ' + msg };
    
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768', // Agentic model
          messages: [{ role: 'system', content: 'You are an agentic AI OS assistant.' }, { role: 'user', content: msg }],
          temperature: 0.7,
          max_tokens: 1024
        })
      });
      const data = await res.json();
      return { content: data.choices[0].message.content };
    } catch (e) {
      return { content: 'Agent error: ' + e.message };
    }
  }
};
console.log('Agent ready');