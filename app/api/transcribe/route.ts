// Import necessary dependencies
import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert File directly to Blob
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBlob = new Blob([arrayBuffer], { type: audioFile.type });

    // Create a File from the Blob
    const audioFileForGroq = new File([audioBlob], audioFile.name, { type: audioFile.type });

    // Pass the file directly to Groq
    const transcription = await groq.audio.transcriptions.create({
      file: audioFileForGroq,
      model: 'whisper-large-v3',
      response_format: 'text',
    });

    return NextResponse.json({ text: transcription }, { status: 200 });
  } catch (error) {
    console.error('Detailed transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 