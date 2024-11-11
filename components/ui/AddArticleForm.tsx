"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface Specialty {
  name: string;
  subtopics: string[];
}

interface AddArticleFormProps {
  onArticleAdded?: () => void;
}

export function AddArticleForm({ onArticleAdded }: AddArticleFormProps) {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [specialty, setSpecialty] = useState("");
  const [newSpecialty, setNewSpecialty] = useState("");
  const [subtopic, setSubtopic] = useState("");
  const [newSubtopic, setNewSubtopic] = useState("");
  const [text, setText] = useState("");

  const { toast } = useToast();

  // Fetch specialties on mount
  useEffect(() => {
    const fetchSpecialties = async () => {
      const response = await fetch('/api/get-specialties');
      if (response.ok) {
        const data = await response.json();
        setSpecialties(data.specialties);
      }
    };
    fetchSpecialties();
  }, []);

  // Handle new specialty submission
  const handleNewSpecialty = async () => {
    const response = await fetch('/api/add-specialty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newSpecialty }),
    });
    if (response.ok) {
      // Refresh specialties list
      const specialtiesResponse = await fetch('/api/get-specialties');
      const data = await specialtiesResponse.json();
      setSpecialties(data.specialties);
      // Select the newly added specialty
      setSpecialty(newSpecialty);
      setNewSpecialty("");
    }
  };

  // Handle new subtopic submission
  const handleNewSubtopic = async () => {
    const response = await fetch('/api/add-subtopic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        specialtyName: specialty,
        subtopicName: newSubtopic 
      }),
    });
    if (response.ok) {
      // Refresh specialties list
      const specialtiesResponse = await fetch('/api/get-specialties');
      const data = await specialtiesResponse.json();
      setSpecialties(data.specialties);
      // Select the newly added subtopic
      setSubtopic(newSubtopic);
      setNewSubtopic("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine final specialty and subtopic values
    const finalSpecialty = specialty === "new" ? newSpecialty : specialty;
    const finalSubtopic = subtopic === "new" ? newSubtopic : subtopic;

    const response = await fetch("/api/add-article", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        specialty: finalSpecialty,
        subtopic: finalSubtopic,
        dateAdded: new Date().toISOString(),
      }),
    });

    if (response.ok) {
      // Show success toast
      toast({ description: "Article added successfully" });
      
      // Reset form
      setText("");
      setSpecialty("");
      setNewSpecialty("");
      setSubtopic("");
      setNewSubtopic("");
      
      // Trigger article list refresh
      onArticleAdded?.();
    } else {
      // Show error toast
      toast({ 
        variant: "destructive", 
        description: "Failed to add article" 
      });
      console.error('Failed to add article');
    }
  };

  // Handle enter key for new specialty
  const handleSpecialtyKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNewSpecialty();
    }
  };

  // Handle enter key for new subtopic
  const handleSubtopicKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNewSubtopic();
    }
  };

  // Prevent form submission on enter
  const handleFormKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  // Add this helper function to check if form is valid
  const isFormValid = () => {
    const finalSpecialty = specialty === "new" ? newSpecialty : specialty;
    const finalSubtopic = subtopic === "new" ? newSubtopic : subtopic;
    return (
      finalSpecialty &&
      finalSubtopic &&
      text.length > 0 &&
      text.length <= 80000
    );
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-4"
      onKeyPress={handleFormKeyPress}
    >
      {/* Specialty Selection */}
      <div>
        <label className="block mb-2">Specialty</label>
        <select 
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Specialty</option>
          {specialties.map((s) => (
            <option key={s.name} value={s.name}>{s.name}</option>
          ))}
          <option value="new">Add New Specialty</option>
        </select>
        
        {specialty === "new" && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              onKeyPress={handleSpecialtyKeyPress}
              placeholder="Enter new specialty"
              className="w-full p-2 border rounded"
            />
            <button
              type="button"
              onClick={handleNewSpecialty}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Subtopic Selection */}
      <div>
        <label className="block mb-2">Subtopic</label>
        <select
          value={subtopic}
          onChange={(e) => setSubtopic(e.target.value)}
          className="w-full p-2 border rounded"
          disabled={!specialty || specialty === "new"}
        >
          <option value="">Select Subtopic</option>
          {specialty && specialties.find(s => s.name === specialty)?.subtopics.map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
          <option value="new">Add New Subtopic</option>
        </select>

        {subtopic === "new" && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newSubtopic}
              onChange={(e) => setNewSubtopic(e.target.value)}
              onKeyPress={handleSubtopicKeyPress}
              placeholder="Enter new subtopic"
              className="mt-2 w-full p-2 border rounded"
            />
            <button
              type="button"
              onClick={handleNewSubtopic}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Article Text */}
      <div>
        <label className="block mb-2">Article Text</label>
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 border rounded h-48"
            placeholder="Enter article text..."
          />
          <span className={`absolute bottom-2 right-2 text-sm ${
            text.length > 80000 ? 'text-red-500' : 'text-gray-500'
          }`}>
            {text.length}/80000
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!isFormValid()}
        className={`px-4 py-2 rounded ${
          isFormValid()
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Add Article
      </button>
    </form>
  );
} 