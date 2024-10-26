export interface CardProgress {
  interval: number;  // Days until next review
  easeFactor: number;  // Multiplier for interval increases
  consecutiveCorrect: number;  // Number of times correctly answered in a row
  lastReviewed: string | null;  // Timestamp of last review
  nextReview: string;  // Timestamp of next scheduled review
}

export interface Flashcard {
  front: string;
  back: string;
  progress: CardProgress;
}

export interface DeckData {
  cards: Flashcard[];
  createdAt: number;
}
