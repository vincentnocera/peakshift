// import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { kv } from "@vercel/kv";
import { auth } from "@clerk/nextjs/server";
import type { CardProgress } from "@/types/flashcards";


export const runtime = 'edge' // Add this line to use Edge Runtime

export async function POST(req: Request) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get PDF text from request body
    const { pdfText } = await req.json();

    // Add a length check and truncate if necessary
    const maxLength = 6000; // Adjust this value based on your needs
    const truncatedText = pdfText.length > maxLength 
      ? pdfText.slice(0, maxLength) + "..."
      : pdfText;

    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout

    try {
      // Generate flashcards using AI SDK
      const { object } = await generateObject({
        model: google("gemini-1.5-flash-latest"), // Use the latest model for better performance
        schema: z.object({
          flashcards: z.array(z.object({
            front: z.string(),
            back: z.string()
          })),
        }),
        schemaName: "MedicalFlashcards",
        schemaDescription: "Generate flashcards from the provided text",
        prompt: `Provided text: ${truncatedText}
                Create educational flashcards from the provided text for physicians to use to study.  They will be collecting these flashcards for use over a long period of time to reinforce their knowledge.
                Focus on high yield, discrete pieces of information and key concepts.
                Questions should have specific answers which are useful pieces of information for physicians to know.  We are looking for specific useful or important pieces of information, not generalities.`,
      });

      clearTimeout(timeoutId);

      // Store flashcards in chunks if needed
      const timestamp = Date.now();
      await kv.hset(`flashcards:${userId}`, {
        [`deck:${timestamp}`]: {
          cards: object.flashcards.map(card => ({
            front: card.front,
            back: card.back,
            progress: initializeCardProgress(),
          })),
          createdAt: timestamp,
        },
      });

      return Response.json({
        success: true,
        flashcards: object.flashcards,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error("Error processing PDF:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Error processing PDF",
        details: error instanceof Error ? error.stack : undefined 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Create a function to initialize card progress
const initializeCardProgress = (): CardProgress => ({
  interval: 1,
  easeFactor: 2.5,
  consecutiveCorrect: 0,
  lastReviewed: null,
  nextReview: new Date().toISOString(),
});
