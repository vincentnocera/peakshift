'use client';

import React from 'react';
import { useChat } from 'ai/react';

interface ChatInterfaceProps {
  prompt: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ prompt }) => {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    initialInput: prompt,
    api: '/api/chat',
  });

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col flex-grow">
      <div className="bg-white rounded-lg shadow-md p-6 mb-4 flex-grow overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
              {message.content}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex mb-4">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          className="flex-grow border border-gray-300 rounded-l-md rounded-r-md mr-2 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message here..."
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
