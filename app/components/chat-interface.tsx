'use client';

import React from 'react';
import { useChat } from 'ai/react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInterfaceProps {
  prompt: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ prompt }) => {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [{ role: 'system', content: prompt, id: 'system' }, {role: 'assistant', content: 'Hello!  Ready to begin?', id: 'assistant' }],
  });

  const displayMessages = messages.filter(message => message.role !== 'system');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as React.FormEvent);
    }
  };

  return (
    <Card className="flex flex-col flex-grow">
      <CardContent className="flex-grow overflow-y-auto p-4">
        {displayMessages.map((message) => (
          <div key={message.id} className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-lg ${
              message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            }`}>
              {message.content}
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="p-4">
        <form onSubmit={handleSubmit} className="flex w-full space-x-2">
          <Textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            disabled={isLoading}
            className="flex-grow resize-none"
            rows={1}
          />
          <Button type="submit" disabled={isLoading}>
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;
