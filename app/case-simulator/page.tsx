"use client";

import React from "react";
import ChatInterface from "@/components/chat-interface";
import { caseSimulatorPrompt } from "@/lib/prompts/case-simulator-prompt";

const CaseSimulation = () => {


  return (
    <div className="min-h-screen flex flex-col">
      <h1 className="text-center p-4 text-2xl font-semibold leading-none tracking-tight">
        Case Simulation
      </h1>
      <div className="flex-grow flex flex-col p-4">
        <div className="w-full h-full max-w-4xl mx-auto flex-grow flex flex-col">
          <ChatInterface prompt={caseSimulatorPrompt} />
        </div>
      </div>
    </div>
  );
};

export default CaseSimulation;
