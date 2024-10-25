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

export async function POST(req: Request) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get PDF text from request body
    const { pdfText } = await req.json();

    // Generate flashcards using AI SDK
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: flashcardsSchema,
      schemaName: "MedicalFlashcards",
      schemaDescription: "Generate medical flashcards from the provided text",
      prompt: `Create educational medical flashcards from the following text.
               Focus on key concepts, diagnoses, treatments, and important facts.
               Make sure each flashcard is concise but comprehensive.
               Text: ${pdfText}`,
    });

    // Store flashcards in Vercel KV
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
    console.error("Error processing PDF:", error);
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }
    return new Response("Error processing PDF", { status: 500 });
  }
}
