"use client";

import React, { useRef, useEffect, useState } from "react";
import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, Loader2, Info } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useSearchParams, useRouter } from "next/navigation";
import { ChatMessage } from "@/types/chat";

interface ChatInterfaceProps {
  prompt: string;
  initialMessages?: ChatMessage[];
  chatId: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  prompt,
  initialMessages,
  chatId: initialChatId,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [chatId, setChatId] = useState<string | undefined>(initialChatId);

  const {
    messages: rawMessages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
  } = useChat({
    api: "/api/chat-gemini",
    id: chatId || undefined,
    initialMessages: initialMessages || [
      { role: "system", content: prompt, id: "system" },
      {
        role: "assistant",
        content: "Hello! Let me know when you're ready to start.",
        id: "assistant",
      },
    ],
    body: {
      chatId,
    },
    onResponse: (response) => {
      const chatIdHeader = response.headers.get('X-Chat-ID');
      if (chatIdHeader && chatIdHeader !== chatId) {
        setChatId(chatIdHeader);
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("chatId", chatIdHeader);
        router.replace(newUrl.toString());
      }
    },
  });

  // Update chatId whenever URL params change
  useEffect(() => {
    const newChatId = searchParams.get("chatId");
    if (newChatId && newChatId !== chatId) {
      setChatId(newChatId);
    }
  }, [searchParams, chatId]);

  const extractQuotes = (content: string) => {
    const quotes: string[] = [];
    const thinkingMatches =
      content.match(/<thinking>([\s\S]*?)<\/thinking>/g) || [];

    thinkingMatches.forEach((thinkingBlock) => {
      const quoteMatches =
        thinkingBlock.match(/<quote>([\s\S]*?)<\/quote>/g) || [];
      quoteMatches.forEach((qm) => {
        const captured = qm.replace(/<\/?quote>/g, "").trim();
        if (captured) quotes.push(captured);
      });
    });
    return quotes;
  };

  const cleanMessageContent = (content: string) => {
    // let cleanedContent = content;
    const segments = content.split('<thinking>');
    
    // If no thinking tags, just return the content
    if (segments.length === 1) return content.trim();
    
    // Handle the first segment (before any thinking tags)
    let result = segments[0];
    
    // Process each segment that started with a thinking tag
    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i];
      const closingTagIndex = segment.indexOf('</thinking>');
      
      if (closingTagIndex === -1) {
        // If we don't find a closing tag, this is a partial tag in streaming
        // Don't add anything from this segment yet
        break;
      }
      
      // Add the content that comes after the closing tag
      result += segment.substring(closingTagIndex + '</thinking>'.length);
    }
    
    return result.trim();
  };

  useEffect(() => {
    if (initialMessages) {
      console.log("Initial messages passed to ChatInterface:", initialMessages);
    }
  }, [initialMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    if (isRecording && mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (recordingTimeout.current) clearTimeout(recordingTimeout.current);
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
    originalHandleSubmit(e);
  };

  const displayMessages = rawMessages
    .filter((message) => message.role !== "system")
    .map((message) => {
      const quotes =
        message.role === "assistant" ? extractQuotes(message.content) : [];
      const cleanedContent = cleanMessageContent(message.content);
      return { ...message, content: cleanedContent, quotes };
    })
    .filter((message) => message.content.length > 0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    if (isRecording && mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (recordingTimeout.current) clearTimeout(recordingTimeout.current);
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
    handleSubmit(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isRecording && mediaRecorder) {
        mediaRecorder.stop();
        setIsRecording(false);
        if (recordingTimeout.current) {
          clearTimeout(recordingTimeout.current);
        }
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }
      handleSubmit(e as React.FormEvent);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const recordingTimeout = useRef<NodeJS.Timeout>();

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
            handleInputChange({ target: { value: data.text } } as any);
          } catch (error) {
            console.error("Error transcribing audio:", error);
          }
          stream.getTracks().forEach((track) => track.stop());
        };
        setMediaRecorder(recorder);
        recorder.start();
        setIsRecording(true);
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

  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  useEffect(() => {
    if (!isLoading) {
      setShowLoadingIndicator(false);
    } else {
      const latestMessage = rawMessages[rawMessages.length - 1];
      if (latestMessage?.role === "assistant") {
        const cleanedContent = cleanMessageContent(latestMessage.content);
        setShowLoadingIndicator(!cleanedContent);
      } else {
        setShowLoadingIndicator(true);
      }
    }
  }, [isLoading, rawMessages]);

  return (
    <div className="flex flex-col h-full">
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
                key={`md-${message.id}-${index}`}
                className="prose prose-sm dark:prose-invert space-y-4"
                components={{
                  p: ({ children }) => (
                    <p key={`p-${index}`} className="mb-6 last:mb-0">{children}</p>
                  ),
                  h1: ({ children }) => (
                    <h1 key={`h1-${index}`} className="mt-8 mb-4">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 key={`h2-${index}`} className="mt-8 mb-4">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 key={`h3-${index}`} className="mt-8 mb-4">{children}</h3>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>

              {message.role === "assistant" && message.quotes?.length > 0 && (
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

        {showLoadingIndicator && (
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

      <div className="fixed bottom-0 left-0 right-0 bg-background z-[5]">
        <div className="w-full max-w-4xl mx-auto p-4">
          <form onSubmit={handleFormSubmit} className="flex w-full">
            <div className="relative flex-grow">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
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
    </div>
  );
};

export default ChatInterface;
