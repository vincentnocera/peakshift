'use client';

import { useState } from 'react';
import Link from 'next/link';
import DynamicSelect from "../components/dropdown"; // Updated import path

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
    <div className="page-container min-h-screen bg-gray-100 p-8">
      <div className="content-box max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="heading-2 mb-6 text-center">Case Simulator Selection</h1>
        
        <div className="flex justify-between mb-6 space-x-4">
          <div className="w-1/2 relative">
            <label className="block text-gray-700 text-xl mb-2 text-center" htmlFor="setting">
              Setting
            </label>
            <DynamicSelect 
              options={settingOptions} 
              label="Setting" 
              onValueChange={setSetting}
            />
          </div>

          <div className="w-1/2 relative">
            <label className="block text-gray-700 text-xl mb-2 text-center" htmlFor="disorder">
              Disorders
            </label>
            <DynamicSelect 
              options={disorderOptions} 
              label="Disorder" 
              onValueChange={setDisorder}
            />
          </div>
        </div>

        <div className="flex justify-center">
        {isSelectionComplete ? (
          <Link
            href={`/case-simulator?setting=${setting}&disorder=${disorder}`}
            className="btn-primary" 
          >
            Start Simulation
          </Link>
        ) : (
          <button
            onClick={() => alert('Please select both a setting and a disorder before starting the simulation.')}
            className="btn-primary opacity-50"
          >
            Start Simulation
          </button>
        )}
        </div>
      </div>
    </div>
  );
};

// Export the component for use in other parts of the application
export default CaseSimulatorSelection;




            // block text-center py-4 text-xl font-semibold rounded-md bg-blue-500 text-white hover:bg-blue-600 transition duration-300"
