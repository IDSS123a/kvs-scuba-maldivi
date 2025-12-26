
// Native fetch implementation with Dec 2025 model priority
const PREFERRED_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash'
];

export async function getDiveTips(topic: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return "AI Dive Tips are unavailable. Please configure VITE_GEMINI_API_KEY.";
  }

  for (const model of PREFERRED_MODELS) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `Provide 3 quick, helpful tips for a scuba diver visiting the Maldives regarding: ${topic}. Keep it concise and formatted for a mobile app.` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
        })
      });

      const data = await response.json();

      if (response.ok) {
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No tips available.";
      }

      // If model not found or quota 0, try next model
      if (data.error?.message?.includes('not found') || data.error?.message?.includes('limit: 0')) continue;
      break;
    } catch (error) {
      console.error(`Gemini Service Error (${model}):`, error);
      continue;
    }
  }

  return "The AI Dive Assistant is resting. Please try again later.";
}
