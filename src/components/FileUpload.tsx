
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileChange: (file: File) => void;
  acceptedFileTypes?: string[];
  maxSize?: number; // in bytes
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileChange,
  acceptedFileTypes = ['.pdf', '.docx', '.doc'],
  maxSize = 5 * 1024 * 1024, // 5MB
  className,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;
    
    setError(null);
    
    // Check file type
    const fileExtension = `.${selectedFile.name.split('.').pop()}`.toLowerCase();
    if (!acceptedFileTypes.includes(fileExtension)) {
      setError(`File type not supported. Please upload ${acceptedFileTypes.join(', ')}`);
      return;
    }
    
    // Check file size
    if (selectedFile.size > maxSize) {
      setError(`File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
      return;
    }
    
    setFile(selectedFile);
    onFileChange(selectedFile);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    handleFileChange(droppedFile);
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl transition-all duration-200 ease-in-out",
          "flex flex-col items-center justify-center p-10 text-center",
          isDragging ? "border-primary bg-primary/5" : "border-border",
          error ? "border-destructive/50 bg-destructive/5" : "",
          file ? "border-primary/50 bg-primary/5" : "",
          "hover:border-primary/50 hover:bg-primary/5"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          accept={acceptedFileTypes.join(',')}
          className="hidden"
        />
        
        {file ? (
          <div className="animate-fadeIn">
            <CheckCircle className="mx-auto h-12 w-12 text-primary mb-4" />
            <div className="flex items-center justify-center space-x-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{file.name}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {(file.size / 1024).toFixed(2)} KB · Click to change
            </p>
          </div>
        ) : error ? (
          <div className="animate-fadeIn">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <p className="text-destructive font-medium">{error}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please try again with a supported file
            </p>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">
              Drag & drop your CV here
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Supported formats: PDF, DOCX, DOC (Max {maxSize / (1024 * 1024)}MB)
            </p>
            <Button variant="secondary" className="mt-4">
              Browse Files
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
