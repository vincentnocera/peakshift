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
// Define the CaseSimulatorSelection component
const CaseSimulatorSelection = () => {
  const [selectedDisorders, setSelectedDisorders] = useState<string[]>([]);

  const handleDisorderToggle = (disorder: string) => {
    setSelectedDisorders((current) =>
      current.includes(disorder)
        ? current.filter((d) => d !== disorder)
        : [...current, disorder],
    );
  };

  const isSelectionComplete = selectedDisorders.length > 0;

  // Define options for the dropdown
  const disorderOptions = [
    "Substance Use",
    "Psychosis",
    "Bipolarity",
    "Unipolar Depression",
    "Anxiety",
    "Eating Disorders",
  ];

  const [open, setOpen] = useState(false);

  // Wrap selectAll in useCallback to memoize it
  const selectAll = useCallback(() => {
    setSelectedDisorders(disorderOptions);
  }, []);

  const deselectAll = () => {
    setSelectedDisorders([]);
  };

  // Initialize with all disorders selected
  useEffect(() => {
    selectAll();
  }, [selectAll]);

  return (
    <div className="page-container min-h-screen p-8">
      <Card className="text-foreground p-8 rounded-lg w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            Case Simulator Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full">
                Select Disorders
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56"
              align="start"
              onPointerLeave={() => setOpen(false)}
            >
              <DropdownMenuCheckboxItem
                checked={selectedDisorders.length === disorderOptions.length}
                onCheckedChange={(checked) =>
                  checked ? selectAll() : deselectAll()
                }
                className="border-b"
                onSelect={(e) => e.preventDefault()}
              >
                Select All
              </DropdownMenuCheckboxItem>
              {disorderOptions.map((disorder) => (
                <DropdownMenuCheckboxItem
                  key={disorder}
                  checked={selectedDisorders.includes(disorder)}
                  onCheckedChange={() => handleDisorderToggle(disorder)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {disorder}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
        <div className="flex justify-center">
          {isSelectionComplete ? (
            <Button asChild>
              <Link
                href={`/case-simulator?disorders=${selectedDisorders.join(",")}`}
              >
                Start Simulation
              </Link>
            </Button>
          ) : (
            <Button
              onClick={() =>
                alert(
                  "Please select at least one disorder before starting the simulation.",
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

// Export the component for use in other parts of the application
export default CaseSimulatorSelection;

// block text-center py-4 text-xl font-semibold rounded-md bg-blue-500 text-white hover:bg-blue-600 transition duration-300"
