"use client";

import React from "react";
import ChatInterface from "@/components/chat-interface";
import Link from "next/link";
import { literatureReviewPrompt } from "@/lib/prompts/literature-review-prompt";
import { Button } from "@/components/ui/button";
import { usePDFContext } from "@/context/PDFContext";

const LiteratureReview = () => {
  const { extractedText } = usePDFContext();
  console.log(extractedText);
  
  // Replace [ARTICLE CONTENT] with the actual PDF text
  const fullPrompt = literatureReviewPrompt.replace('[ARTICLE CONTENT]', extractedText);

  const handleMakeFlashcards = () => {
    // Implement flashcard creation logic here
    console.log("Make flashcards");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <h1 className="text-center p-4 text-2xl font-semibold leading-none tracking-tight">
        Literature Review
      </h1>
      <div className="flex-grow flex flex-col p-4">
        <div className="w-full h-full max-w-4xl mx-auto flex-grow flex flex-col">
          <ChatInterface prompt={fullPrompt} />
        </div>
        <div className="w-full max-w-4xl mx-auto mt-4">
          <div className="flex justify-between">
            <Button onClick={handleMakeFlashcards} variant="outline">
              Make Flashcards
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiteratureReview;