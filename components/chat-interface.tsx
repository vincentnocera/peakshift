"use client";

import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, Loader2, Info } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useSearchParams, useRouter } from "next/navigation";
import { ChatMessage } from "@/types/chat";
import { getChatSession } from "@/app/actions/chat-sessions";

interface ChatInterfaceProps {
  prompt: string;
  initialMessages?: ChatMessage[];
  chatId: string;
}

interface DisplayMessage extends ChatMessage {
  quotes?: string[];
  displayContent?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  prompt,
  initialMessages,
  chatId: initialChatId,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Helper: Extract any quotes that exist between <thinking> and </thinking> tags
  const parseMessage = (content: string) => {
    // First, find all thinking blocks (using [\s\S] instead of . with /s flag)
    const thinkingBlocks = content.match(/<thinking>([\s\S]*?)<\/thinking>/g) || [];
    
    // Extract all quotes from all thinking blocks
    const quotes: string[] = [];
    thinkingBlocks.forEach(block => {
      const blockQuotes = block.match(/<quote>([\s\S]*?)<\/quote>/g) || [];
      blockQuotes.forEach(quote => {
        const cleanQuote = quote.replace(/<\/?quote>/g, '').trim();
        if (cleanQuote) quotes.push(cleanQuote);
      });
    });

    // Remove thinking blocks from content
    const cleanedContent = content.replace(/<thinking>[\s\S]*?<\/thinking>/g, '').trim();

    return { cleanedContent, quotes };
  };

  // Parse initial messages if they exist
  const parsedInitialMessages = initialMessages?.map(message => {
    if (message.role === "assistant") {
      const { cleanedContent, quotes } = parseMessage(message.content);
      return { 
        ...message, 
        content: message.content, // Keep original content
        displayContent: cleanedContent, // Add cleaned content
        quotes 
      };
    }
    return message;
  });

  // Update the messages state initialization to use parsed messages
  const [messages, setMessages] = useState<DisplayMessage[]>(
    parsedInitialMessages ?? [
      { role: "system", content: prompt, id: "system" },
      {
        role: "assistant",
        content: "Hello! Let me know when you're ready to start.",
        displayContent: "Hello! Let me know when you're ready to start.",
        id: "assistant",
      },
    ],
  );
  const [chatId, setChatId] = useState<string | undefined>(initialChatId);

  // The user input
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Microphone / recording state
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const recordingTimeout = useRef<NodeJS.Timeout>();

  // Scroll to bottom ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add new state for chat history loading
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Add a function to fetch chat history using the server action
  const fetchChatHistory = async (id: string) => {
    try {
      setIsLoadingHistory(true);
      const chatSession = await getChatSession(id);
      
      // Store the original messages, only add display properties
      const processedMessages = chatSession.messages.map((message: ChatMessage) => {
        if (message.role === "assistant") {
          const { cleanedContent, quotes } = parseMessage(message.content);
          return {
            ...message,  // Keep original content
            displayContent: cleanedContent,  // Add cleaned content for display
            quotes  // Add extracted quotes
          };
        }
        return message;
      });

      // Don't add a new system message - the original one should be in the chat history
      setMessages(processedMessages);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Update the chatId effect to fetch history when changed
  useEffect(() => {
    const newChatId = searchParams.get("chatId");
    if (newChatId && newChatId !== chatId) {
      setChatId(newChatId);
      fetchChatHistory(newChatId);
    }
  }, [searchParams, chatId, prompt]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus the input if not loading
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  // Reference for the input <textarea>
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Helper: Extract quotes from <thinking><quote> blocks
  // const extractQuotes = (content: string) => {
  //   const quotes: string[] = [];
  //   const thinkingMatches =
  //     content.match(/<thinking>([\s\S]*?)<\/thinking>/g) || [];

  //   thinkingMatches.forEach((thinkingBlock) => {
  //     const quoteMatches = thinkingBlock.match(/<quote>([\s\S]*?)<\/quote>/g) || [];
  //     quoteMatches.forEach((qm) => {
  //       const captured = qm.replace(/<\/?quote>/g, "").trim();
  //       if (captured) quotes.push(captured);
  //     });
  //   });
  //   return quotes;
  // };

  // Handler: Microphone record toggle
  const handleRecording = async () => {
    (document.activeElement as HTMLElement)?.blur();
    if (isRecording) {
      mediaRecorder?.stop();
      setIsRecording(false);
      if (recordingTimeout.current) clearTimeout(recordingTimeout.current);
      if (mediaRecorder) {
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }
      inputRef.current?.focus();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm";
        const recorder = new MediaRecorder(stream, {
          mimeType,
          audioBitsPerSecond: 16000,
        });
        const audioChunks: Blob[] = [];

        recorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: mimeType });
          try {
            const formData = new FormData();
            formData.append("audio", audioBlob, "audio.webm");
            const response = await fetch("/api/transcribe", {
              method: "POST",
              body: formData,
            });
            if (!response.ok) throw new Error("Transcription failed");
            const data = await response.json();
            setInput(data.text);
          } catch (error) {
            console.error("Error transcribing audio:", error);
          }
          stream.getTracks().forEach((track) => track.stop());
        };

        setMediaRecorder(recorder);
        recorder.start();
        setIsRecording(true);

        // Auto-stop after X ms
        recordingTimeout.current = setTimeout(() => {
          if (recorder.state === "recording") {
            recorder.stop();
            setIsRecording(false);
          }
        }, 120000);
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    }
  };

  // Handler: Send message (non-streaming)
  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;
    setIsLoading(true);

    // Add the user message to state
    const updatedMessages = [
      ...messages,
      { role: "user" as const, content: userMessage, id: `user-${Date.now()}` },
    ];
    setMessages(updatedMessages);
    setInput("");

    try {
      const res = await fetch("/api/chat-gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, messages: updatedMessages }),
      });

      if (!res.ok) {
        throw new Error("Request to /api/chat-gemini failed.");
      }

      const { text: rawAssistantText, chatId: newChatId } = await res.json();

      // Update chatId if it changed (new conversation, etc.)
      if (newChatId && newChatId !== chatId) {
        setChatId(newChatId);
        // Update URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("chatId", newChatId);
        router.replace(newUrl.toString());
      }

      // Clean & parse the final response
      const { cleanedContent, quotes } = parseMessage(rawAssistantText);

      // Add assistant response to state
      const finalMessages = [
        ...updatedMessages,
        {
          role: "assistant" as const,
          content: rawAssistantText,
          displayContent: cleanedContent,
          quotes,
          id: `assistant-${Date.now()}`,
        },
      ];
      setMessages(finalMessages);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Form submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // If recording, stop first
    if (isRecording && mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (recordingTimeout.current) clearTimeout(recordingTimeout.current);
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
    handleSendMessage(input);
  };

  // Handler: Detect Enter (without shift)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e as unknown as React.FormEvent);
    }
  };

  // Filter out system messages from display
  const displayMessages = messages.filter((m) => m.role !== "system");

  return (
    <div className="flex flex-col h-full">
      {isLoadingHistory ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-[100px] pt-6 px-4">
            {displayMessages.map((message, index) => (
              <div
                key={`${message.id}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`
                    ${message.role === "user" ? "max-w-[80%]" : "max-w-full"}
                    p-3 rounded-lg break-words relative
                    ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }
                  `}
                >
                  <ReactMarkdown
                    className="prose prose-sm dark:prose-invert space-y-4"
                  >
                    {message.displayContent || message.content}
                  </ReactMarkdown>

                  {/* If the assistant had <quote> references, show an info icon with them */}
                  {message.role === "assistant" && message.quotes && message.quotes.length > 0 && (
                    <div className="absolute bottom-2 right-2 group">
                      <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                      <div
                        className="absolute right-0 bottom-full mb-2 bg-popover p-2 rounded shadow-md w-96 max-h-[40vh] overflow-y-auto opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out hover:!opacity-100 hover:!visible"
                        style={{
                          zIndex: 1000,
                          transitionDelay: "75ms",
                          transitionProperty: "opacity, visibility",
                        }}
                      >
                        {message.quotes.map((quote, quoteIdx) => (
                          <div
                            key={`quote-${message.id}-${quoteIdx}`}
                            className="bg-popoverItem p-2 mb-1 last:mb-0 rounded text-sm"
                          >
                            {quote}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* "Assistant typing" indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[100%] p-3 rounded-lg break-words bg-secondary text-secondary-foreground">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <div className="fixed bottom-0 left-0 right-0 bg-background z-[5]">
            <div className="w-full max-w-4xl mx-auto p-4">
              <form onSubmit={handleFormSubmit} className="flex w-full">
                <div className="relative flex-grow">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message here..."
                    disabled={isLoading}
                    className="w-full pr-24 resize-none"
                    rows={3}
                  />
                  <div className="absolute right-2 bottom-2 flex gap-2">
                    <Button
                      type="button"
                      size="icon"
                      onClick={handleRecording}
                      disabled={isLoading}
                      className={isRecording ? "bg-red-500 hover:bg-red-600" : ""}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.stopPropagation();
                        }
                      }}
                    >
                      <Mic className="h-5 w-5" />
                    </Button>
                    <Button type="submit" size="icon" disabled={isLoading}>
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatInterface;
