'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface PDFContextType {
  extractedText: string;
  setExtractedText: (text: string) => void;
}

const PDFContext = createContext<PDFContextType | undefined>(undefined);

export const PDFProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [extractedText, setExtractedText] = useState('');

  return (
    <PDFContext.Provider value={{ extractedText, setExtractedText }}>
      {children}
    </PDFContext.Provider>
  );
};

export const usePDFContext = () => {
  const context = useContext(PDFContext);
  if (context === undefined) {
    throw new Error('usePDFContext must be used within a PDFProvider');
  }
  return context;
};
