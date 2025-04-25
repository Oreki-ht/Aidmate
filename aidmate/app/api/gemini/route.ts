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
      model: "gemini-2.0-flash-lite",
    });
    
    const systemPrompt = `You are a medical assistant AI specialized in first aid and emergency response procedures. 
    Provide clear, concise advice for handling medical situations.
    For serious emergencies, always remind users to contact emergency services immediately.
    Focus on evidence-based information and respond in an informative, clear and compassionate tone.
    Format your response using Markdown:
    - Use **bold** for important warnings and key steps
    - Use numbered lists for sequential instructions
    - Use bullet points (*) for lists of symptoms or considerations
    - Use headings (##) to organize longer responses
    - Use > blockquotes for disclaimers or important notices`;
    
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
      console.log("Response generated successfully");
      
      return NextResponse.json({ response: responseText });
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