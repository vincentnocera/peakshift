'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useChat } from 'ai/react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  prompt: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ prompt }) => {
  // Helper function to clean teaching strategy tags and handle incomplete sections
  const cleanMessageContent = (content: string) => {
    // Find the last complete teaching strategy section
    const lastCompleteTagIndex = content.lastIndexOf('</thinking>');
    
    if (lastCompleteTagIndex === -1) {
      // If there's an opening tag but no closing tag, only show content before the opening tag
      const openingTagIndex = content.lastIndexOf('<thinking>');
      if (openingTagIndex !== -1) {
        content = content.substring(0, openingTagIndex);
      }
    }
    
    // Remove all complete teaching strategy sections
    return content.replace(/<thinking>[\s\S]*?<\/thinking>/g, '').trim();
  };

  const { messages: rawMessages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat-experimental',
    initialMessages: [
      { role: 'system', content: prompt, id: 'system' },
      { role: 'assistant', content: 'Hello, ready to get started?', id: 'assistant' }
    ],
  });

  // Log the latest message whenever rawMessages changes
  const latestMessage = rawMessages[rawMessages.length - 1];
  if (latestMessage && latestMessage.role === 'assistant') {
  }

  // Clean the messages before displaying them
  const displayMessages = rawMessages
    .filter(message => message.role !== 'system')
    .map(message => ({
      ...message,
      content: cleanMessageContent(message.content)
    }));

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as React.FormEvent);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages]);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  // Add new state for recording
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const recordingTimeout = useRef<NodeJS.Timeout>();

  // Add new function to handle recording
  const handleRecording = async () => {
    if (isRecording) {
      mediaRecorder?.stop();
      setIsRecording(false);
      if (recordingTimeout.current) {
        clearTimeout(recordingTimeout.current);
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,         // mono
            sampleRate: 16000,       // 16 kHz
            echoCancellation: true,
            noiseSuppression: true
          }
        });

        // Try to use a more efficient format
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus'
          : 'audio/webm';

        const recorder = new MediaRecorder(stream, {
          mimeType,
          audioBitsPerSecond: 16000  // Reduced from 16000 * 16
        });

        const audioChunks: Blob[] = [];

        recorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: mimeType });
          console.log('Audio blob size:', audioBlob.size, 'bytes');
          
          try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'audio.webm');  // Changed extension to match format

            // Send to our API route
            const response = await fetch('/api/transcribe', {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              throw new Error('Transcription failed');
            }

            const data = await response.json();
            
            // Update the input field with the transcribed text
            handleInputChange({ target: { value: data.text } } as any);
          } catch (error) {
            console.error('Error transcribing audio:', error);
            // You might want to show an error toast/notification here
          }

          // Clean up
          stream.getTracks().forEach(track => track.stop());
        };

        setMediaRecorder(recorder);
        recorder.start();
        setIsRecording(true);

        // Set timeout for 1 minute
        recordingTimeout.current = setTimeout(() => {
          if (recorder.state === 'recording') {
            recorder.stop();
            setIsRecording(false);
          }
        }, 60000);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    }
  };

  return (
    // Add min-h-[600px] to give a good starting height
    <Card className="flex flex-col h-full min-h-[600px]">
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayMessages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] p-3 rounded-lg break-words ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              <ReactMarkdown
                className="prose prose-sm dark:prose-invert"
                components={{
                  p: ({ children }) => (
                    <p className="mb-4 last:mb-0">{children}</p>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="p-4">
        <form onSubmit={handleSubmit} className="flex w-full">
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
                className={isRecording ? "bg-red-500 hover:bg-red-600" : ""}
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Button 
                type="submit"
                size="icon"
                disabled={isLoading}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;


// TODO: let's just make sure when we are getting rid of the hidden teaching strategy tags that we are not removing that information from the information that the AI sees; we want it to be able to see its previous hidden thoughts on future thoughts