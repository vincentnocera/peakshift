"use client"

import React from "react";
import dynamic from 'next/dynamic';

const PDFExtractor = dynamic(() => import('@/components/PDFExtractor'), { ssr: false });

const SomePage: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">PDF Text Extractor</h1>
      <PDFExtractor />
    </div>
  );
};

export default SomePage;