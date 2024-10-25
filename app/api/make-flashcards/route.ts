import { openai } from "@ai-sdk/openai";
// import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { kv } from "@vercel/kv";
import { auth } from "@clerk/nextjs/server";

// Define the schema for our flashcards
const flashcardsSchema = z.object({
  flashcards: z.array(
    z.object({
      front: z
        .string()
        .describe("The question or prompt side of the flashcard"),
      back: z
        .string()
        .describe("The answer or explanation side of the flashcard"),
      category: z
        .string()
        .describe("The topic category this flashcard belongs to"),
    }),
  ),
});

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
        model: openai("gpt-4o-mini"), // Use the latest model for better performance
        schema: flashcardsSchema,
        schemaName: "MedicalFlashcards",
        schemaDescription: "Generate medical flashcards from the provided text",
        prompt: `Create educational medical flashcards from the following text.
                Focus on key concepts, diagnoses, treatments, and important facts.
                Limit to 5-10 most important flashcards.
                Text: ${truncatedText}`,
      });

      clearTimeout(timeoutId);

      // Store flashcards in chunks if needed
      const timestamp = Date.now();
      await kv.hset(`flashcards:${userId}`, {
        [`deck:${timestamp}`]: {
          cards: object.flashcards,
          lastReviewed: null,
          nextReview: new Date().toISOString(),
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
