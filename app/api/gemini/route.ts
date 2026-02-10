import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      console.log("Error: Empty query received");
      return NextResponse.json(
        { error: "Please provide a valid question or description" },
        { status: 400 }
      );
    }
    
    console.log(`Processing query: "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`);
    
    const apiKey = process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.error("Missing Google API Key");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-lite-latest",
    });
    
    const systemPrompt = `You are a medical assistant AI specialized ONLY in first aid and emergency response procedures. 
You MUST REFUSE to answer any questions not directly related to medical emergencies, first aid, or general health or medical facts or advice.

If asked about non-medical topics including but not limited to:
- Politics, news, or current events
- Entertainment, movies, or celebrities
- Technology topics not related to medical devices
- General knowledge questions not related to health
- Personal opinions on non-medical topics
- Legal, financial, or other professional advice

ALWAYS respond with: "I'm designed to only provide information about first aid, medical emergencies, and health-related topics. Please ask me about those areas instead."

For medical inquiries:
- Provide clear, concise advice for handling medical situations.
- For serious emergencies, always remind users to contact emergency services (907 in Ethiopia) immediately.
- Focus on evidence-based information.
- Respond in an informative, clear, and compassionate tone.

Format your response using Markdown:
- Use **bold** for important warnings and key steps.
- Use numbered lists for sequential instructions.
- Use bullet points (*) for lists of symptoms or considerations.
- Use headings (##) to organize longer responses.
- Use > blockquotes for disclaimers or important notices.

Additionally, for every response:
1. Provide a **response** to the user's query.
2. Generate **4 concise predictions** for possible user replies to your follow-up questions. These predictions should be short, relevant, and formatted as a list. For example:
   - "They are unconscious."
   - "They have a history of panic attacks."
   - "They are breathing normally."
   - "They are not responding."

The predictions should be returned in a separate field in the API response, not as part of the main response text. Ensure the predictions are actionable and directly related to the follow-up questions.
Separate the predictions from the main response with a clear delimiter which should always be Predictions: followed by the list of predictions.`;
    
    // Add more detailed error logging
    try {
      const result = await model.generateContent({
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "model", parts: [{ text: "I understand and will follow these guidelines." }] },
          { role: "user", parts: [{ text: query }] }
        ]
      });
      
      const responseText = result.response.text();
      const predictions = extractPredictions(responseText); 

      const mainResponse = responseText.split("Predictions:")[0].trim();
      console.log("Response generated successfully");
      
      return NextResponse.json({ response: mainResponse, predictions });
    } catch (genAIError) {
      console.error("Specific Gemini API error:", genAIError);
      const errorMessage = genAIError instanceof Error ? genAIError.message : "Unknown error";
      return NextResponse.json(
        { error: `AI API error: ${errorMessage}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("General API handler error:", error);
    return NextResponse.json(
      { error: "We're experiencing technical difficulties. Please try again later." },
      { status: 500 }
    );
  }
}

function extractPredictions(responseText: string): string[] {
  const predictionsStart = responseText.indexOf("Predictions:");
  if (predictionsStart === -1) return [];

  const predictionsText = responseText
    .substring(predictionsStart)
    .replace("Here are four predictions for possible follow-up questions:", "")
    .trim();

  const predictions = predictionsText
    .split("\n")
    .map((line) => line.replace(/^- /, "").trim()) // Remove list markers
    .filter((line) => line.length > 0 && line !== "Predictions:");

  return predictions;
}