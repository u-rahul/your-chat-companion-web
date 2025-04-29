
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, File } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export const FileUpload = ({ onFileSelect, selectedFile }: FileUploadProps) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    
    if (file) {
      // Check if the file is a PDF
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed");
        return;
      }
      
      // Check if the file is within the size limit (5MB)
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 5) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      onFileSelect(file);
      toast.success(`${file.name} selected`);
    }
  };
  
  const handleRemoveFile = () => {
    onFileSelect(null);
  };

  return (
    <div className="flex items-center gap-2">
      {selectedFile ? (
        <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-md text-sm">
          <File className="h-4 w-4 text-purple-500" />
          <span className="truncate max-w-[150px]">{selectedFile.name}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs" 
            onClick={handleRemoveFile}
          >
            Remove
          </Button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="file"
            id="file-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept="application/pdf"
            onChange={handleFileChange}
          />
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Paperclip className="h-4 w-4" />
            <span>Attach PDF (max 5MB)</span>
          </Button>
        </div>
      )}
    </div>
  );
};
