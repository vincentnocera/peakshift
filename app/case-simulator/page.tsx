'use client'

import React, { useState } from 'react';
import ChatInterface from '../components/chat-interface';  // Update this line
import Link from 'next/link';

const CaseSimulation = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
//   const [errorMessage, _setErrorMessage] = useState('');

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setMessages([...messages, { text: inputMessage, sender: 'user' }]);
      setInputMessage('');
      // Here you would typically call an API to get the AI response
      // For now, we'll just simulate a response
      setTimeout(() => {
        setMessages(prev => [...prev, { text: "AI response here", sender: 'ai' }]);
      }, 1000);
    }
  };

  const handleMakeFlashcards = () => {
    // Implement flashcard creation logic here
    console.log("Make flashcards");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col">
      <h1 className="text-4xl font-bold mb-8 text-center">Case Simulation</h1>
      <ChatInterface 
        onSendMessage={handleSendMessage}
        onMakeFlashcards={handleMakeFlashcards}
        errorMessage={errorMessage}
      />
      <div className="w-full max-w-3xl mx-auto mt-4">
        <div className="flex justify-between">
          <button
            onClick={handleMakeFlashcards}
            className="btn-primary"
          >
            Make Flashcards
          </button>
          <Link href="/"
            className="btn-primary"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CaseSimulation;