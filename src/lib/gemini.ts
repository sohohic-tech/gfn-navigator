import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function analyzeFitnessVideo(title: string, description: string, lang: string = 'Japanese') {
  if (!API_KEY) {
     throw new Error("GEMINI_API_KEY is not set in .env.local");
  }

  // Model: Gemini Flash 2.0 (Fast and Cost-effective)
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

  // 🤫 DEV NOTE: GFN is basically a "Life Navigator". 
  // It's officially for Fitness, but we've secretly made it work for ANY video.
  // "Users' creativity is the ultimate engine." - Let them discover the hidden path.

  const prompt = `
    Analyze this YouTube video title and description.
    Think as a professional trainer/curator.

    Title: ${title}
    Description: ${description}

    [CRITICAL RULE]
    - If it's a fitness video: Provide workout steps, difficulty, and form tips.
    - If it's NOT fitness (e.g. Comedy, Tech, Edu): Treat it as "Active Entertainment/Education".
      Provide "Enjoyment/Action Steps" (Timestamps of key moments/jokes),
      set difficulty as "None", and estimatedCalories as a humorous estimation based on laughing/active viewing.

    Output MUST be in strictly formatted JSON in the following schema:
    {
       "aiIntroduction": "Summary in Japanese (max 60 chars).",
       "category": "Fit or General",
       "difficulty": "Beginner/Intermediate/Advanced",
       "estimatedCalories": number,
       "navigationItems": [
          { "id": 1, "time": number, "label": "Action/Moment (JP)", "detail": "Context/Advice (JP)" }
       ],
       "aiRecommendedProducts": [
          { "id": "p1", "name": "Related item", "price": number, "reason": "Why this fits (JP)", "image": "Sample image URL" }
       ]
    }

    Rules:
    - Language: ${lang}.
    - Navigation Items: At least 3, Max 6.
    - Only output valid JSON. No Markdown formatting.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean potential markdown wrap
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}
