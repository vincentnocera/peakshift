"use client";

import React from "react";
import ChatInterface from "@/components/chat-interface";
import { caseSimulatorPrompt } from "@/lib/prompts/case-simulator-prompt";

const CaseSimulation = () => {


  return (
    <div className="min-h-screen w-full p-8">
      <h1 className="text-2xl font-bold mb-4 text-center">Case Simulation</h1>
      
      {/* Chat interface container with higher z-index */}
      <div className="w-full max-w-4xl mx-auto relative z-20">
        {/* Chat messages area */}
        <div className="rounded-lg p-4 mb-4">
          <ChatInterface prompt={caseSimulatorPrompt} />
        </div>
        
        {/* Chat input area */}
        <div className="relative">
          {/* Your input field and buttons */}
        </div>
      </div>
    </div>
  );
};

export default CaseSimulation;
