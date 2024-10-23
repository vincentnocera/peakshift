"use client";

import React from "react";
import dynamic from "next/dynamic";

const PDFExtractor = dynamic(() => import("@/components/PDFExtractor"), {
  ssr: false,
});

const SomePage: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl text-center mb-4">PDF Text Extractor</h1>
      <div className="flex justify-center">
        <PDFExtractor />
      </div>
    </div>
  );
};

export default SomePage;
