import React, { useState } from 'react';
import { FileUpload } from "@/components/ui/FileUpload";
import * as pdfjsLib from 'pdfjs-dist';
// import { TextItem } from 'pdfjs-dist/types/src/display/api';

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.7.76/pdf.worker.min.mjs`;

const PDFExtractor: React.FC = () => {
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;

    setIsLoading(true);
    const file = files[0];

    try {
      const text = await extractTextFromPDF(file);
      setExtractedText(text);
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      setExtractedText('Error extracting text from PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await (pdfjsLib as any).getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter((item: any) => 'str' in item)
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  };

  return (
    <div className="p-4">
      <FileUpload onFilesSelected={handleFilesSelected} />
      {isLoading && <p>Extracting text from PDF...</p>}
      {extractedText && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Extracted Text:</h3>
          <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-96">
            {extractedText}
          </pre>
        </div>
      )}
    </div>
  );
};

export default PDFExtractor;
