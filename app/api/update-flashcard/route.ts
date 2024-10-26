import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { CardProgress, DeckData } from "@/types/flashcards";

// Helper function to calculate next review interval
const calculateNextReview = (progress: CardProgress, wasCorrect: boolean): CardProgress => {
  if (!wasCorrect) {
    // Reset interval on incorrect answer
    return {
      interval: 1,
      easeFactor: Math.max(1.3, progress.easeFactor - 0.2),
      consecutiveCorrect: 0,
      lastReviewed: new Date().toISOString(),
      nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Next day
    };
  }

  // Calculate new interval for correct answer
  const newInterval = progress.interval * progress.easeFactor;
  const nextReviewDate = new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000);

  return {
    interval: newInterval,
    easeFactor: progress.easeFactor + 0.1,
    consecutiveCorrect: progress.consecutiveCorrect + 1,
    lastReviewed: new Date().toISOString(),
    nextReview: nextReviewDate.toISOString(),
  };
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { deckId, cardIndex, wasCorrect } = await req.json();
  
  // Get current deck
  const deck = await kv.hget(`flashcards:${userId}`, deckId) as DeckData;
  if (!deck) {
    return new NextResponse("Deck not found", { status: 404 });
  }

  // Update card progress
  const card = deck.cards[cardIndex];
  const newProgress = calculateNextReview(card.progress, wasCorrect);
  
  // Update the card with new progress
  deck.cards[cardIndex] = {
    ...card,
    progress: newProgress,
  };

  // Save updated deck
  await kv.hset(`flashcards:${userId}`, { [deckId]: deck });

  return NextResponse.json({ 
    success: true,
    updatedProgress: newProgress 
  });
}
