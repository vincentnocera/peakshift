import { kv } from "@vercel/kv";
import { auth } from "@clerk/nextjs/server";
import { DeckData } from "@/types/flashcards";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { deckId, cardIndex, updatedCard } = await req.json();
    const cleanDeckId = deckId.replace('deck:', '');

    // Get current deck data
    const deckData = (await kv.hget(`flashcards:${userId}`, `deck:${cleanDeckId}`)) as DeckData;
    if (!deckData) {
      return new Response("Deck not found", { status: 404 });
    }

    // Update the card
    deckData.cards[cardIndex] = {
      ...deckData.cards[cardIndex],
      front: updatedCard.front,
      back: updatedCard.back,
    };

    // Save updated deck
    await kv.hset(`flashcards:${userId}`, {
      [`deck:${cleanDeckId}`]: deckData,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error editing flashcard:", error);
    return new Response(
      JSON.stringify({ error: "Error editing flashcard" }), 
      { status: 500 }
    );
  }
} 