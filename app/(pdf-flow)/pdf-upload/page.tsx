"use client";

import React from "react";
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

  // Add this console log to debug
  console.log("Extracted text length:", extractedText?.length);

  return (
    <div className="p-4">
      <CardHeader className="text-center">
        <CardTitle>PDF Text Extractor</CardTitle>
      </CardHeader>
      <div className="flex flex-col items-center gap-4">
        <PDFExtractor />
        {/* Modify the condition to be more explicit */}
        {extractedText && extractedText.length > 0 && (
          <Button asChild className="mt-4 w-48" variant="default">
            <Link href="/literature-review">
              Start Literature Review
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExtractPDFPage;
