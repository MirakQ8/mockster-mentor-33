
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { FileUpload } from '@/components';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';

const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [experience, setExperience] = useState<number>(2);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const handleExperienceChange = (value: number[]) => {
    setExperience(value[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No CV uploaded",
        description: "Please upload your CV to proceed.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate processing time
    setTimeout(() => {
      // Success! In a real app, this would submit the file and experience to the server
      toast({
        title: "CV uploaded successfully",
        description: "Preparing your personalized interview...",
      });
      setIsLoading(false);
      navigate('/interview');
    }, 2000);
  };

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-12 px-4 max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-2">Upload Your CV</h1>
            <p className="text-muted-foreground">
              We'll analyze your CV to create personalized interview questions
            </p>
          </motion.div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <FileUpload 
              onFileChange={handleFileChange} 
              className="mb-8"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="experience" className="text-base">
                Years of Experience: {experience}
              </Label>
              <div className="flex items-center mt-2">
                <span className="text-sm text-muted-foreground">0</span>
                <Slider
                  id="experience"
                  min={0}
                  max={20}
                  step={1}
                  defaultValue={[experience]}
                  onValueChange={handleExperienceChange}
                  className="mx-4 flex-1"
                />
                <span className="text-sm text-muted-foreground">20+</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="pt-4"
          >
            <Button
              type="submit"
              className="w-full rounded-xl py-6"
              disabled={isLoading || !file}
            >
              {isLoading ? "Analyzing CV..." : "Start Interview"}
            </Button>
          </motion.div>
        </form>
      </div>
    </PageTransition>
  );
};

export default Upload;
