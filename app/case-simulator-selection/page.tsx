"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Specialty {
  name: string;
  subtopics: string[];
}

const CaseSimulatorSelection = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedSubtopics, setSelectedSubtopics] = useState<string[]>([]);
  const [openSpecialty, setOpenSpecialty] = useState(false);
  const [openSubtopics, setOpenSubtopics] = useState(false);

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

  // When specialty is selected, automatically select all its subtopics
  useEffect(() => {
    if (selectedSpecialty) {
      const specialty = specialties.find(s => s.name === selectedSpecialty);
      if (specialty) {
        setSelectedSubtopics(specialty.subtopics);
      }
    } else {
      setSelectedSubtopics([]);
    }
  }, [selectedSpecialty, specialties]);

  const handleSpecialtySelect = (specialty: string) => {
    setSelectedSpecialty(specialty);
  };

  const handleSubtopicToggle = (subtopic: string) => {
    setSelectedSubtopics((current) =>
      current.includes(subtopic)
        ? current.filter((s) => s !== subtopic)
        : [...current, subtopic]
    );
  };

  const currentSpecialty = specialties.find(s => s.name === selectedSpecialty);
  const subtopicOptions = currentSpecialty?.subtopics || [];

  const selectAllSubtopics = useCallback(() => {
    if (currentSpecialty) {
      setSelectedSubtopics(currentSpecialty.subtopics);
    }
  }, [currentSpecialty]);

  const deselectAllSubtopics = () => {
    setSelectedSubtopics([]);
  };

  const isSelectionComplete = selectedSpecialty && selectedSubtopics.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center w-full p-8">
      <Card className="text-foreground p-8 rounded-lg w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            Case Simulator Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Specialty Dropdown */}
          <DropdownMenu open={openSpecialty} onOpenChange={setOpenSpecialty}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full">
                {selectedSpecialty || "Select Specialty"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56"
              align="start"
              onPointerLeave={() => setOpenSpecialty(false)}
            >
              {specialties.map((specialty) => (
                <DropdownMenuCheckboxItem
                  key={specialty.name}
                  checked={selectedSpecialty === specialty.name}
                  onCheckedChange={() => handleSpecialtySelect(specialty.name)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {specialty.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Subtopics Dropdown */}
          <DropdownMenu open={openSubtopics} onOpenChange={setOpenSubtopics}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full"
                disabled={!selectedSpecialty}
              >
                Select Subtopics
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56"
              align="start"
              onPointerLeave={() => setOpenSubtopics(false)}
            >
              <DropdownMenuCheckboxItem
                checked={selectedSubtopics.length === subtopicOptions.length}
                onCheckedChange={(checked) =>
                  checked ? selectAllSubtopics() : deselectAllSubtopics()
                }
                className="border-b"
                onSelect={(e) => e.preventDefault()}
              >
                Select All
              </DropdownMenuCheckboxItem>
              {subtopicOptions.map((subtopic) => (
                <DropdownMenuCheckboxItem
                  key={subtopic}
                  checked={selectedSubtopics.includes(subtopic)}
                  onCheckedChange={() => handleSubtopicToggle(subtopic)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {subtopic}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
        <div className="flex justify-center">
          {isSelectionComplete ? (
            <Button asChild>
              <Link
                href={`/case-simulator?specialty=${selectedSpecialty}&subtopics=${selectedSubtopics.join(",")}`}
              >
                Start Simulation
              </Link>
            </Button>
          ) : (
            <Button
              onClick={() =>
                alert(
                  "Please select a specialty and at least one subtopic before starting the simulation.",
                )
              }
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

export default CaseSimulatorSelection;
