import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

interface Flashcard {
    front: string;
    back: string;
    category: string;
}

interface DeckData {
    cards: Flashcard[];
    lastReviewed: string | null;
    nextReview: string;
    createdAt: number;
}

export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const flashcardDecks = await kv.hgetall<Record<string, DeckData>>(`flashcards:${userId}`);
    return NextResponse.json(flashcardDecks || {});
}
