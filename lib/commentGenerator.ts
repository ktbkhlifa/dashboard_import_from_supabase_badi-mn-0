import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Zedt kelmet 'export' hna
export async function generateAnalysis(latestData: any, simulationData: any): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze the following agrivoltaic data point and provide a brief, insightful comment (max 2-3 sentences).
    Focus on the relationship between power generation, crop health indicators, and simulation data.
    - Plant Type: ${latestData.plant_type}
    - Timestamp: ${latestData.timestamp}
    - Power Generation: ${latestData.power_generation_mwh.toFixed(2)} MWh
    - Water Usage: ${latestData.water_usage_m3.toFixed(2)} m³
    - Crop Yield: ${latestData.crop_yield_tons.toFixed(2)} tons
    - Land Use Efficiency: ${latestData.land_use_efficiency_percent.toFixed(2)}%

    Simulation Comparison Data for this crop type:
    - Peak Temp (Open Field): ${simulationData.peak_temp_open_field.toFixed(2)}°C
    - Peak Temp (Under Panels): ${simulationData.peak_temp_under_panels.toFixed(2)}°C
    - Water Savings: ${simulationData.water_savings_percent.toFixed(2)}%
    - DLI (Open Field): ${simulationData.dli_open_field.toFixed(2)}
    - DLI (Under Panels): ${simulationData.dli_under_panels.toFixed(2)}

    Example comment: "Power generation is strong, and the panels are effectively reducing peak temperature by ~${(simulationData.peak_temp_open_field - simulationData.peak_temp_under_panels).toFixed(1)}°C, contributing to a ${simulationData.water_savings_percent.toFixed(0)}% water saving while maintaining a healthy crop yield."
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error generating analysis:", error);
    return "Could not generate analysis at this time.";
  }
}