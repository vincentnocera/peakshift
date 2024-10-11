'use client';

import { useState } from 'react';
import Link from 'next/link';

// Define the CaseSimulatorSelection component
const CaseSimulatorSelection = () => {
  const [setting, setSetting] = useState('');
  const [disorder, setDisorder] = useState('');

  const isSelectionComplete = setting && disorder;

  return (
    <div className="page-container min-h-screen bg-gray-100 p-8">
      <div className="content-box max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="heading-2 mb-6 text-center">Case Simulator Selection</h1>
        
        <div className="flex justify-between mb-6 space-x-4">
          <div className="w-1/2 relative">
            <label className="block text-gray-700 text-xl mb-2 text-center" htmlFor="setting">
              Setting
            </label>
            <div className="relative">
              <select
                id="setting"
                value={setting}
                onChange={(e) => setSetting(e.target.value)}
                className="appearance-none w-full bg-white border-2 border-blue-500 rounded-md py-3 px-4 pr-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              >
                <option value="">Select a setting</option>
                <option value="Outpatient">Outpatient</option>
                <option value="Inpatient">Inpatient</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-500">
                <svg className="h-6 w-6 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="w-1/2 relative">
            <label className="block text-gray-700 text-xl mb-2 text-center" htmlFor="disorder">
              Disorders
            </label>
            <div className="relative">
              <select
                id="disorder"
                value={disorder}
                onChange={(e) => setDisorder(e.target.value)}
                className="appearance-none w-full bg-white border-2 border-blue-500 rounded-md py-3 px-4 pr-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              >
                <option value="">Select a disorder</option>
                <option value="Addiction">Addiction</option>
                <option value="Schizophrenia Spectrum">Schizophrenia Spectrum</option>
                <option value="Bipolar Disorders">Bipolar Disorders</option>
                <option value="Unipolar Disorders">Unipolar Disorders</option>
                <option value="Anxiety Disorders">Anxiety Disorders</option>
                <option value="Eating Disorders">Eating Disorders</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-500">
                <svg className="h-6 w-6 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
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
            disabled
            className="btn-primary"
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
