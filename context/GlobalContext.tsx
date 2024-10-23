import React, { createContext, useState, useContext, ReactNode } from 'react';

interface GlobalContextType {
  extractedText: string;
  setExtractedText: (text: string) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [extractedText, setExtractedText] = useState('');

  return (
    <GlobalContext.Provider value={{ extractedText, setExtractedText }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};

