'use client';

import React from 'react';
import { useChat } from 'ai/react';

interface ChatInterfaceProps {
  prompt: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ prompt }) => {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [{ role: 'system', content: prompt, id: 'system' }, {role: 'assistant', content: 'Hello!  Ready to begin?', id: 'assistant' }],
  });

  const displayMessages = messages.filter(message => message.role !== 'system');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as React.FormEvent); // Changed from 'any' to 'React.FormEvent'
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col flex-grow">
      <div className="bg-white rounded-lg shadow-md p-6 mb-4 flex-grow overflow-y-auto">
        {displayMessages.map((message) => (
          <div key={message.id} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
              {message.content}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex mb-4 relative">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-grow border border-gray-300 rounded-md py-2 px-4 pr-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message here..."
          disabled={isLoading}
        />
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
          Press ↵ to send
        </span>
      </form>
    </div>
  );
};

export default ChatInterface;
