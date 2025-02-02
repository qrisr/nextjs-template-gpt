import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { text } = await request.json();
  const voiceId = 'XB0fDUnXU5powFXDhCwa'; // Deutsche Stimme "Charlotte"

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVEN_LABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2', // Multilingual Modell für bessere deutsche Aussprache
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Fehler bei der Sprachgenerierung');
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  } catch (error) {
    console.error('Eleven Labs API error:', error);
    return NextResponse.json({ error: 'Fehler bei der Sprachgenerierung' }, { status: 500 });
  }
} 