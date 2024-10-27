"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { usePDFContext } from "@/context/PDFContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CardHeader, CardTitle } from "@/components/ui/card";

const PDFExtractor = dynamic(() => import("@/components/PDFExtractor"), {
  ssr: false,
});

const ExtractPDFPage: React.FC = () => {
  const { extractedText } = usePDFContext();
  const [isProcessing, setIsProcessing] = useState(false);
  // Add new state for completion status
  const [isComplete, setIsComplete] = useState(false);

  const handleMakeFlashcards = async () => {
    if (!extractedText) return;

    setIsProcessing(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch("/api/make-flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pdfText: extractedText }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to create flashcards");
      }

      const data = await response.json();
      console.log(data);
      // Set completion status instead of showing toast
      setIsComplete(true);
      setIsProcessing(false);
      console.log("Complete status set to true");
    } catch (error) {
      console.error("Error creating flashcards:", error);
      setIsComplete(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4">
      <CardHeader className="text-center">
        <CardTitle>Upload Literature</CardTitle>
      </CardHeader>
      <div className="flex flex-col items-center gap-4">
        <PDFExtractor />
        {extractedText && extractedText.length > 0 && (
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleMakeFlashcards}
              className="mt-4 w-48"
              variant="outline"
              disabled={isProcessing || isComplete}
            >
              {isProcessing 
                ? "Creating Flashcards..." 
                : isComplete 
                  ? "Flashcards added ✓" 
                  : "Create Flashcards"}
            </Button>
            <Button asChild className="w-48" variant="default">
              <Link href="/literature-review">Start Literature Review</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExtractPDFPage;
