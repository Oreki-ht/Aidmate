// app/api/openai/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY,});

export async function POST(request: Request) {
  const { query } = await request.json();

  const apiResponse = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: query }]
    })
  });

  const data = await apiResponse.json();
  console.log(data);

  return NextResponse.json({ response: "done" });
}