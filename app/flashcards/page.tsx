"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";

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

const FlashcardPracticePage: React.FC = () => {
  const { user } = useUser();
  const userId = user?.id;
  const [decks, setDecks] = React.useState<Record<string, DeckData>>({});
  const [flippedCards, setFlippedCards] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    const fetchFlashcards = async () => {
      if (userId) {
        const response = await fetch('/api/fetch-flashcards');
        if (response.ok) {
          const data = await response.json();
          setDecks(data);
        }
      }
    };

    fetchFlashcards();
  }, [userId]);

  const toggleCard = (deckId: string, cardIndex: number) => {
    const cardId = `${deckId}-${cardIndex}`;
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-center">Flashcard Practice</h1>
      {Object.entries(decks).map(([deckId, deck]) => (
        <div key={deckId} className="mb-8">
          <h2 className="text-xl font-bold mb-4">
            Deck created on {new Date(deck.createdAt).toLocaleDateString()}
          </h2>
          <div className="flex flex-col items-center gap-4">
            {deck.cards.map((flashcard, index) => {
              const cardId = `${deckId}-${index}`;
              const isFlipped = flippedCards.has(cardId);

              return (
                <div
                  key={index}
                  className="relative w-full max-w-2xl h-48 cursor-pointer perspective-1000"
                  onClick={() => toggleCard(deckId, index)}
                >
                  <div
                    style={{
                      transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                      transition: "transform 0.5s",
                      transformStyle: "preserve-3d",
                    }}
                    className="absolute w-full h-full"
                  >
                    {/* Front of card */}
                    <div className="absolute w-full h-full backface-hidden p-4 bg-secondary rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <p className="font-bold">Q: {flashcard.front}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Category: {flashcard.category}
                        </p>
                        <p className="text-sm text-gray-400 mt-4 italic">
                          Click to reveal answer
                        </p>
                      </div>
                    </div>

                    {/* Back of card */}
                    <div className="absolute w-full h-full backface-hidden p-4 bg-secondary rounded-lg rotate-y-180 flex items-center justify-center">
                      <div className="text-center">
                        <p className="font-bold">A: {flashcard.back}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Category: {flashcard.category}
                        </p>
                        <p className="text-sm text-gray-400 mt-4 italic">
                          Click to hide answer
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlashcardPracticePage;
