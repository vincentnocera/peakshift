"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { usePDFContext } from "@/context/PDFContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const PDFExtractor = dynamic(() => import("@/components/PDFExtractor"), {
  ssr: false,
});

const ExtractPDFPage: React.FC = () => {
  const { extractedText } = usePDFContext();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMakeFlashcards = async () => {
    if (!extractedText) return;

    setIsProcessing(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

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
      toast({
        title: "Success!",
        description: "Flashcards have been created and saved.",
      });
    } catch (error) {
      console.error("Error creating flashcards:", error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to create flashcards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4">
      <CardHeader className="text-center">
        <CardTitle>PDF Text Extractor</CardTitle>
      </CardHeader>
      <div className="flex flex-col items-center gap-4">
        <PDFExtractor />
        {extractedText && extractedText.length > 0 && (
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleMakeFlashcards}
              className="mt-4 w-48"
              variant="default"
              disabled={isProcessing}
            >
              {isProcessing ? "Creating Flashcards..." : "Create Flashcards"}
            </Button>
            <Button asChild className="w-48" variant="outline">
              <Link href="/literature-review">Start Literature Review</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExtractPDFPage;
