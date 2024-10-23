import React, { useState } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import * as pdfjsLib from "pdfjs-dist";
import { Button } from "@/components/ui/button";

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.7.76/pdf.worker.min.mjs`;

const PDFExtractor: React.FC = () => {
  const [extractedText, setExtractedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;

    setIsLoading(true);
    const file = files[0];
    setFileName(file.name);

    try {
      const text = await extractTextFromPDF(file);
      setExtractedText(text);
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

  return (
    <div className="p-4">
      <FileUpload onFilesSelected={handleFilesSelected} />
      {isLoading && <p className="mt-4">Extracting text from PDF...</p>}
      {extractedText && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">
            Extracted Text from {fileName}:
          </h3>
          <div className="mt-2 p-4 bg-gray-100 rounded-lg shadow">
            <div className="max-h-96 overflow-y-auto">
              {extractedText.split("\n").map((line, index) => (
                <p key={index} className="mb-2">
                  {line}
                </p>
              ))}
            </div>
          </div>
          <Button onClick={handleCopyText} className="mt-4">
            Copy Text
          </Button>
        </div>
      )}
    </div>
  );
};

export default PDFExtractor;
