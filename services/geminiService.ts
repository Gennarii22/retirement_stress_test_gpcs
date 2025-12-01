import { GoogleGenAI } from "@google/genai";
import { SimulationResult, FinancialProfile, ScenarioType } from "../types";

// Helper to format currency
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export const generateFinancialAnalysis = async (
  results: SimulationResult[],
  profile: FinancialProfile
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key is missing. Please configure the environment variable.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash";

  // Prepare context
  const baseCase = results.find(r => r.scenario === ScenarioType.BASE);
  const worstCase = results.find(r => r.scenario === ScenarioType.WORST);
  const bestCase = results.find(r => r.scenario === ScenarioType.BEST);

  if (!baseCase || !worstCase || !bestCase) return "Insufficient simulation data.";

  const prompt = `
    Act as a senior institutional portfolio manager and risk analyst.
    Analyze the following retirement stress test simulation for a client.
    
    **Client Profile:**
    - Current Age: ${(new Date().getFullYear() - new Date(profile.personal.birthday).getFullYear())}
    - Life Expectancy: ${profile.personal.lifeExpectancy}
    - Initial Net Worth: ${fmt(baseCase.data[0].netWorth)}
    
    **Simulation Results (Nominal):**
    
    1. **Base Case**: 
       - Ending Wealth: ${fmt(baseCase.metrics.endingNetWorth)}
       - Lowest Point: ${fmt(baseCase.metrics.lowestPoint)}
       - Ruin: ${baseCase.metrics.ruinProbability > 0 ? "YES" : "NO"}
    
    2. **Worst Case (-1.5 SD, High Inflation)**:
       - Ending Wealth: ${fmt(worstCase.metrics.endingNetWorth)}
       - Lowest Point: ${fmt(worstCase.metrics.lowestPoint)}
       - Ruin: ${worstCase.metrics.ruinProbability > 0 ? "YES" : "NO"}

    3. **Best Case (+1.0 SD, Low Inflation)**:
       - Ending Wealth: ${fmt(bestCase.metrics.endingNetWorth)}
       
    **Instructions:**
    - Provide a "Board Room" style summary. Concise, analytical, no fluff.
    - Focus on the probability of ruin in the worst-case scenario.
    - If there is a shortfall, precisely identify the age at which liquidity dries up.
    - Suggest 2 specific, high-level strategic adjustments if the worst case fails (e.g., specific reduction in spending or increased contribution).
    - Tone: Serious, institutional, #556B2F (Olive Drab) aesthetic in spirit (disciplined).
    - Limit response to 2 paragraphs maximum.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text || "Analysis generated no text.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate analysis at this time.";
  }
};