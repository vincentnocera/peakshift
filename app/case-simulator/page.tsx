'use client'

import React from 'react';
import ChatInterface from '../components/chat-interface';
import Link from 'next/link';
import { caseSimulatorPrompt } from '@/lib/prompts/case-simulator-prompt';
import { Button } from "@/components/ui/button"

const CaseSimulation = () => {
    const handleMakeFlashcards = () => {
        // Implement flashcard creation logic here
        console.log("Make flashcards");
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="p-8 flex-grow flex flex-col items-center">
                <h1 className="mb-8 text-center">Case Simulation</h1>
                <div className="w-full max-w-3xl flex-grow flex flex-col">
                    <ChatInterface prompt={caseSimulatorPrompt} />
                </div>
                <div className="w-full max-w-3xl mt-4">
                    <div className="flex justify-between">
                        <Button onClick={handleMakeFlashcards} variant="outline">
                            Make Flashcards
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/">
                                Back to Home
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CaseSimulation;
