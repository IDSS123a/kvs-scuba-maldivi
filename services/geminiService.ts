
import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI client using Vite environment variable
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export async function getDiveTips(topic: string): Promise<string> {
  try {
    // Generate content by specifying the model and the prompt.
    // Adjusted: Removed maxOutputTokens as it requires a thinkingBudget for Gemini 3 models.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide 3 quick, helpful tips for a scuba diver visiting the Maldives regarding: ${topic}. Keep it concise and formatted for a mobile app.`,
      config: {
        temperature: 0.7,
      }
    });
    // Use the .text property to access the generated text from the response.
    return response?.text || "No tips available at the moment.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The AI Dive Assistant is resting. Please try again later.";
  }
}
