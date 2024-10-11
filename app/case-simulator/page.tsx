'use client'

import React from 'react';
import ChatInterface from '../components/chat-interface';
import Link from 'next/link';

const CaseSimulation = () => {
    const handleMakeFlashcards = () => {
        // Implement flashcard creation logic here
        console.log("Make flashcards");
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex flex-col">
            <h1 className="text-4xl font-bold mb-8 text-center">Case Simulation</h1>
            <ChatInterface prompt="This is a test prompt." />
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