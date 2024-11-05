import { kv } from "@vercel/kv";
import { auth } from "@clerk/nextjs/server";
import { DeckData } from "@/types/flashcards";

export async function POST(req: Request) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get deck and card info from request
    const { deckId, cardIndex } = await req.json();
    console.log('API received - deckId:', deckId, 'userId:', userId);
    console.log('Looking up key:', `flashcards:${userId}`);

    // Remove 'deck:' prefix if it exists in the deckId
    const cleanDeckId = deckId.replace('deck:', '');

    // Get current deck data
    const deckData = (await kv.hget(`flashcards:${userId}`, `deck:${cleanDeckId}`)) as DeckData;
    console.log('Received deck data:', deckData);
    if (!deckData) {
      return new Response("Deck not found", { status: 404 });
    }

    console.log('Attempting to delete card at index:', cardIndex);
    console.log('Current cards array:', deckData.cards);

    // Remove the card at the specified index
    deckData.cards.splice(cardIndex, 1);

    // If deck is now empty, delete the entire deck
    if (deckData.cards.length === 0) {
      await kv.hdel(`flashcards:${userId}`, `deck:${cleanDeckId}`);
    } else {
      // Otherwise update the deck with the card removed
      await kv.hset(`flashcards:${userId}`, {
        [`deck:${cleanDeckId}`]: deckData,
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting flashcard:", error);
    return new Response(
      JSON.stringify({ error: "Error deleting flashcard" }), 
      { status: 500 }
    );
  }
} 