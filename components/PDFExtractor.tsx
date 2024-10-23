import React, { useState } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import * as pdfjsLib from "pdfjs-dist";
import { Button } from "@/components/ui/button";
import { usePDFContext } from "@/context/PDFContext";

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.7.76/pdf.worker.min.mjs`;

const PDFExtractor: React.FC = () => {
  // Get both extractedText and setExtractedText from context
  const { extractedText, setExtractedText } = usePDFContext();
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;

    setIsLoading(true);
    const file = files[0];
    setFileName(file.name);

    try {
      const text = await extractTextFromPDF(file);
      setExtractedText(text); // Now updating the context instead of local state
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      setExtractedText("Error extracting text from PDF");
    } finally {
      setIsLoading(false);
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await (pdfjsLib as any).getDocument({ data: arrayBuffer })
      .promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter((item: any) => "str" in item)
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n\n";
    }

    return fullText;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(extractedText);
  };

  const handleRemove = () => {
    setExtractedText("");
    setFileName("");
  };

  return (
    <div className="p-4 w-1/2">
      <FileUpload onFilesSelected={handleFilesSelected} />
      {isLoading && <p className="mt-4 text-muted-foreground">Extracting text from PDF...</p>}
      {fileName && extractedText && (
        <div className="mt-4 p-4 bg-secondary rounded-lg border flex justify-between items-center">
          <h3 className="text-lg font-semibold text-foreground">{fileName}</h3>
          <Button 
            onClick={handleRemove} 
            variant="ghost" 
            size="sm"
            className="text-muted-foreground hover:text-destructive"
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
};

export default PDFExtractor;
