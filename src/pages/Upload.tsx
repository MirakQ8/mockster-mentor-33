
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { FileUpload } from '@/components';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';
import { FileText, BrainCircuit, BarChart } from 'lucide-react';

const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [experience, setExperience] = useState<number>(2);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');

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

  const handleAnalyzeCV = () => {
    if (!file) {
      toast({
        title: "No CV uploaded",
        description: "Please upload your CV to analyze.",
        variant: "destructive",
      });
      return;
    }
    
    navigate('/analysis');
  };

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-12 px-4 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-2">Upload Your CV</h1>
            <p className="text-muted-foreground">
              Our AI will analyze your CV to create a personalized experience
            </p>
          </motion.div>
        </div>
        
        <Tabs defaultValue="upload" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="upload" className="text-sm">
              <FileText className="mr-2 h-4 w-4" />
              Upload CV
            </TabsTrigger>
            <TabsTrigger value="about" className="text-sm">
              <BrainCircuit className="mr-2 h-4 w-4" />
              About AI Analysis
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
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
                className="pt-4 flex flex-col sm:flex-row gap-4"
              >
                <Button
                  type="submit"
                  className="flex-1 rounded-xl py-6"
                  disabled={isLoading || !file}
                >
                  {isLoading ? "Analyzing CV..." : "Start Interview"}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAnalyzeCV}
                  className="rounded-xl py-6"
                  disabled={!file}
                >
                  Analyze CV Only
                </Button>
              </motion.div>
            </form>
          </TabsContent>
          
          <TabsContent value="about">
            <Card className="p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <BrainCircuit className="mr-2 h-5 w-5 text-primary" />
                How Our AI Analysis Works
              </h2>
              
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Our advanced AI system uses Google's Gemini API to analyze your CV and extract key information:
                </p>
                
                <div className="pl-4 border-l-2 border-primary/20">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-primary font-medium mr-2">•</span>
                      <span><span className="font-medium text-foreground">Job Title Detection:</span> We identify your professional role based on your experience and skills.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary font-medium mr-2">•</span>
                      <span><span className="font-medium text-foreground">Skills Extraction:</span> We recognize and categorize your technical and soft skills.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary font-medium mr-2">•</span>
                      <span><span className="font-medium text-foreground">Experience Analysis:</span> We evaluate your work history to customize interview questions.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary font-medium mr-2">•</span>
                      <span><span className="font-medium text-foreground">Technical Question Generation:</span> We create role-specific technical questions tailored to your field.</span>
                    </li>
                  </ul>
                </div>
                
                <p>
                  This analysis powers both your mock interview experience and provides suggestions for improving your CV to better showcase your qualifications.
                </p>
                
                <div className="bg-primary/5 p-4 rounded-lg mt-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <BarChart className="mr-2 h-4 w-4 text-primary" />
                    Privacy & Data Security
                  </h3>
                  <p className="text-sm">
                    Your CV data is only used for analysis purposes. We don't store your personal information beyond what's needed to provide our services, and all processing is done securely.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
};

export default Upload;
