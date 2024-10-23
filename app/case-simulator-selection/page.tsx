'use client';

import { useState } from 'react';
import Link from 'next/link';
import DynamicSelect from "../../components/dropdown"; // Updated import path
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// Define the CaseSimulatorSelection component
const CaseSimulatorSelection = () => {
  const [setting, setSetting] = useState('');
  const [disorder, setDisorder] = useState('');

  const isSelectionComplete = setting && disorder;
  console.log(isSelectionComplete);

  // Define options for the dropdowns
  const settingOptions = ["Outpatient", "Inpatient"];
  const disorderOptions = [
    "Addiction",
    "Schizophrenia Spectrum",
    "Bipolar Disorders",
    "Unipolar Disorders",
    "Anxiety Disorders",
    "Eating Disorders",
  ];

  return (
    <div className="page-container min-h-screen p-8">
        <Card className="text-foreground p-8 rounded-lg w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Case Simulator Selection</CardTitle>
          </CardHeader>
          <div className="flex justify-between mb-6 space-x-4">
          <div className="w-1/2 relative">
            <CardContent className="text-center">Setting</CardContent>
            <DynamicSelect 
              options={settingOptions} 
              label="Setting" 
              onValueChange={setSetting}
            />
          </div>

          <div className="w-1/2 relative">
            <CardContent className="text-center">Disorder</CardContent>
            <DynamicSelect
              options={disorderOptions} 
              label="Disorder" 
              onValueChange={setDisorder}
            />
          </div>
        </div>

        <div className="flex justify-center">
        {isSelectionComplete ? (
          <Button asChild>
            <Link
              href={`/case-simulator?setting=${setting}&disorder=${disorder}`}
            >
              Start Simulation
            </Link>
          </Button>
        ) : (
          <Button
            onClick={() => alert('Please select both a setting and a disorder before starting the simulation.')}
            className="opacity-50"
            asChild
          >
            <span>Start Simulation</span>
          </Button>
        )}
        </div>
      </Card>
    </div>
  );
};

// Export the component for use in other parts of the application
export default CaseSimulatorSelection;




            // block text-center py-4 text-xl font-semibold rounded-md bg-blue-500 text-white hover:bg-blue-600 transition duration-300"
