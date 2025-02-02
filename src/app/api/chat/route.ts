import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Erstelle den Kontext aus der Chat-Historie
    const messages = [
      {
        role: "system",
        content: `Du bist Jimmy, ein freundlicher und hilfsbereiter KI-Assistent. 
- Stelle dich bei der ersten Nachricht immer als "Jimmy" vor
- Antworte immer auf Deutsch
- Benutze einen freundlichen, aber professionellen Ton
- Wenn du nach deinem Namen gefragt wirst, erwähne dass du Jimmy heißt und als KI-Assistent entwickelt wurdest
- Behalte deine Persönlichkeit während der gesamten Konversation bei
- Beziehe dich gelegentlich auf frühere Teile der Konversation, um Kontinuität zu zeigen`
      },
      // Füge die vorherige Chat-Historie hinzu
      ...(history || []).map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
      // Füge die aktuelle Nachricht hinzu
      { role: "user", content: message },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages,
    });

    return NextResponse.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 