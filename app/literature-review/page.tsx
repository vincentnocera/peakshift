"use client";

import React, { useContext } from "react";
import ChatInterface from "../components/chat-interface";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GlobalContext } from "@/context/GlobalContext"; // Assume this exists

const LiteratureReview = () => {
  const { extractedText } = useContext(GlobalContext);

  return (
    <div className="min-h-screen flex flex-col">
      <h1 className="text-center p-4 text-2xl font-semibold leading-none tracking-tight">
        Literature Review
      </h1>
      <div className="flex-grow flex flex-col p-4">
        <div className="w-full h-full max-w-4xl mx-auto flex-grow flex flex-col">
          <ChatInterface prompt={`Analyze the following text:\n\n${extractedText}`} />
        </div>
        <div className="w-full max-w-4xl mx-auto mt-4">
          <div className="flex justify-end">
            <Button asChild variant="outline">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiteratureReview;

