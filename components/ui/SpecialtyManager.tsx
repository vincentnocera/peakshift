"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface Specialty {
  name: string;
  subtopics: string[];
}

export function SpecialtyManager() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    const response = await fetch('/api/get-specialties');
    if (response.ok) {
      const data = await response.json();
      setSpecialties(data.specialties);
    }
  };

  const handleDeleteSpecialty = async (specialtyName: string) => {
    if (!confirm(`Delete specialty "${specialtyName}" and all its subtopics?`)) return;
    
    const response = await fetch('/api/delete-specialty', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: specialtyName }),
    });

    if (response.ok) {
      toast({ description: "Specialty deleted successfully" });
      fetchSpecialties();
    } else {
      toast({ variant: "destructive", description: "Failed to delete specialty" });
    }
  };

  const handleDeleteSubtopic = async (specialtyName: string, subtopicName: string) => {
    if (!confirm(`Delete subtopic "${subtopicName}"?`)) return;
    
    const response = await fetch('/api/delete-subtopic', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        specialtyName,
        subtopicName 
      }),
    });

    if (response.ok) {
      toast({ description: "Subtopic deleted successfully" });
      fetchSpecialties();
    } else {
      toast({ variant: "destructive", description: "Failed to delete subtopic" });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Manage Specialties & Subtopics</h2>
      
      {specialties.map((specialty) => (
        <div key={specialty.name} className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">{specialty.name}</h3>
            <button
              onClick={() => handleDeleteSpecialty(specialty.name)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Delete Specialty
            </button>
          </div>
          
          <div className="pl-4 space-y-2">
            {specialty.subtopics.map((subtopic) => (
              <div key={subtopic} className="flex justify-between items-center">
                <span className="text-sm">{subtopic}</span>
                <button
                  onClick={() => handleDeleteSubtopic(specialty.name, subtopic)}
                  className="text-red-600 hover:text-red-800 text-xs"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}