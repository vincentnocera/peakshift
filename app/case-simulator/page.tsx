"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ChatInterface from "@/components/chat-interface";
import { caseSimulatorPrompt } from "@/lib/prompts/case-simulator-prompt";
import { Loader2 } from "lucide-react";
import { getChatSession } from "@/app/actions/chat-sessions";
import { ChatMessage } from "@/types/chat";

const CaseSimulation = () => {
  const [article, setArticle] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingMessages, setExistingMessages] = useState<ChatMessage[]>();
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId');

  useEffect(() => {
    const initialize = async () => {
      // If we have a chatId, load existing chat session
      if (chatId) {
        try {
          const session = await getChatSession(chatId);
          console.log('Full session data:', session);
          console.log('Retrieved chat session messages:', JSON.stringify(session.messages, null, 2));
          setExistingMessages(session.messages);
        } catch (err) {
          setError('Failed to load chat session. Please try again.');
          console.error(err);
        }
        return;
      }

      // Otherwise, fetch new article for a new session
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

    initialize();
  }, [chatId, searchParams]);

  if (error) {
    return <div className="text-center text-red-500 p-8">{error}</div>;
  }

  if (!article && !existingMessages) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // For new sessions, insert the article into the prompt
  const promptWithArticle = article 
    ? caseSimulatorPrompt.replace('[INSERT ARTICLE HERE]', article)
    : '';

  return (
    <div className="min-h-screen w-full p-8">
      <div className="w-full max-w-4xl mx-auto">
        <ChatInterface 
          prompt={promptWithArticle} 
          initialMessages={existingMessages}
          chatId={chatId || ''}
        />
      </div>
    </div>
  );
};

export default CaseSimulation;
