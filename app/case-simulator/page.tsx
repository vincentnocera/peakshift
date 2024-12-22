"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ChatInterface from "@/components/chat-interface";
import { caseSimulatorPrompt } from "@/lib/prompts/case-simulator-prompt";
import { Loader2 } from "lucide-react";

const CaseSimulation = () => {
  const [article, setArticle] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const specialty = searchParams.get('specialty');
        const subtopics = searchParams.get('subtopics');

        const response = await fetch(
          `/api/random-article?specialty=${specialty}&subtopics=${subtopics}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch article');
        }

        const data = await response.json();
        setArticle(data.text);
      } catch (err) {
        setError('Failed to load article. Please try again.');
        console.error(err);
      }
    };

    fetchArticle();
  }, [searchParams]);

  if (error) {
    return <div className="text-center text-red-500 p-8">{error}</div>;
  }

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Insert the article into the prompt
  const promptWithArticle = caseSimulatorPrompt.replace(
    '[INSERT ARTICLE HERE]',
    article
  );

  return (
    <div className="min-h-screen w-full p-8">
      <div className="w-full max-w-4xl mx-auto">
        <ChatInterface prompt={promptWithArticle} />
      </div>
    </div>
  );
};

export default CaseSimulation;
