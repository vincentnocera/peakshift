import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Card
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed cursor-pointer",
        isDragActive && "border-blue-500"
      )}
    >
      <CardContent className="flex items-center justify-center h-48">
        <input {...getInputProps()} />
        <p className="text-center text-muted-foreground">
          {isDragActive
            ? "Drop the files here..."
            : "Drag and drop files here or click to upload"}
        </p>
      </CardContent>
    </Card>
  );
};
