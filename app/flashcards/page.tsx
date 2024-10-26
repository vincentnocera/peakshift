"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import type { DeckData } from "@/types/flashcards";

const FlashcardPracticePage: React.FC = () => {
  const { user } = useUser();
  const userId = user?.id;
  const [decks, setDecks] = React.useState<Record<string, DeckData>>({});
  const [flippedCards, setFlippedCards] = React.useState<Set<string>>(new Set());
  const [currentCard, setCurrentCard] = React.useState<{
    deckId: string;
    cardIndex: number;
  } | null>(null);

  React.useEffect(() => {
    const fetchFlashcards = async () => {
      if (userId) {
        const response = await fetch('/api/fetch-flashcards');
        if (response.ok) {
          const data = await response.json();
          setDecks(data);
          setCurrentCard(findNextDueCard(data));
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

  // Helper function to find the next due card
  const findNextDueCard = (decks: Record<string, DeckData>) => {
    const now = new Date().toISOString();
    
    for (const [deckId, deck] of Object.entries(decks)) {
      for (let i = 0; i < deck.cards.length; i++) {
        const card = deck.cards[i];
        if (!card.progress?.nextReview || card.progress.nextReview <= now) {
          return { deckId, cardIndex: i };
        }
      }
    }
    return null;
  };

  // Function to handle user review of a flashcard (correct/incorrect)
  const handleReview = async (deckId: string, cardIndex: number, wasCorrect: boolean) => {
    try {
      // Make API call to update the flashcard's progress based on user's response
      const response = await fetch('/api/update-flashcard', {
        method: 'POST', // Using POST method to update data
        headers: {
          'Content-Type': 'application/json', // Set content type for JSON data
        },
        body: JSON.stringify({ // Convert request data to JSON string
          deckId, // ID of the deck containing the card
          cardIndex, // Index of the card within the deck
          wasCorrect, // Boolean indicating if user got card correct
        }),
      });

      if (response.ok) {
        // If update was successful, fetch fresh flashcard data
        const updatedResponse = await fetch('/api/fetch-flashcards');
        if (updatedResponse.ok) {
          // Parse the updated flashcard data
          const data = await updatedResponse.json();
          // Update the decks state with new data
          setDecks(data);
          
          // Clear flipped state
          setFlippedCards(new Set());
          
          // Find and set next due card
          setCurrentCard(findNextDueCard(data));
        }
      }
    } catch (error) {
      // Log any errors that occur during the update process
      console.error('Error updating flashcard:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-center text-2xl mb-8">Flashcard Practice</h1>
      
      {!currentCard ? (
        <div className="text-center text-lg">
          No cards due for now! 🎉
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          {/* Show only current card */}
          {(() => {
            const deck = decks[currentCard.deckId];
            const flashcard = deck?.cards[currentCard.cardIndex];
            const cardId = `${currentCard.deckId}-${currentCard.cardIndex}`;
            const isFlipped = flippedCards.has(cardId);

            return (
              <div
                className="relative w-full max-w-2xl h-48 cursor-pointer perspective-1000"
                onClick={() => toggleCard(currentCard.deckId, currentCard.cardIndex)}
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
                      <p className="text-sm text-gray-400 mt-4 italic">
                        Click to reveal answer
                      </p>
                    </div>
                  </div>

                  {/* Back of card */}
                  <div className="absolute w-full h-full backface-hidden p-4 bg-secondary rounded-lg rotate-y-180 flex items-center justify-center">
                    <div className="text-center">
                      <p className="font-bold">A: {flashcard.back}</p>
                      <p className="text-sm text-gray-400 mt-4 italic">
                        Click to hide answer
                      </p>
                      
                      {/* Add review buttons */}
                      <div className="absolute bottom-4 w-full left-0 flex justify-between px-8">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReview(currentCard.deckId, currentCard.cardIndex, false);
                          }}
                          className="p-2 rounded-full bg-red-500 hover:bg-red-600"
                        >
                          👎
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReview(currentCard.deckId, currentCard.cardIndex, true);
                          }}
                          className="p-2 rounded-full bg-green-500 hover:bg-green-600"
                        >
                          👍
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default FlashcardPracticePage;
