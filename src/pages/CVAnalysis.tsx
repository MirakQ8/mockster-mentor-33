
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components';
import { toast } from '@/components/ui/use-toast';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, Award, AlertTriangle, FileText, Sparkles, Lightbulb } from 'lucide-react';
import { analyzeCV } from '@/lib/gemini';
import { useNavigate } from 'react-router-dom';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

const CVAnalysis = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    jobTitle: string;
    skills: string[];
    questions: string[];
    improvements: string[];
    yearsExperience?: number;
  } | null>(null);
  const [yearsExperience, setYearsExperience] = useState<number>(2);

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
    setAnalysis(null);
  };

  const handleExperienceChange = (value: number[]) => {
    setYearsExperience(value[0]);
  };

  const analyzeResume = async () => {
    if (!file) {
      toast({
        title: "No CV uploaded",
        description: "Please upload your CV to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Read the file content
      const fileText = await readFileAsText(file);
      
      console.log("Analyzing CV content with experience:", yearsExperience);
      
      // Call Gemini API to analyze the CV with experience level
      const cvAnalysis = await analyzeCV(fileText, yearsExperience);
      
      console.log("Received analysis from Gemini API:", cvAnalysis);
      
      // Set the analysis state with the data from Gemini
      setAnalysis(cvAnalysis);
      
      // Store the analysis data in sessionStorage for use in Interview.tsx
      sessionStorage.setItem('cv-analysis', JSON.stringify({
        ...cvAnalysis,
        yearsExperience: yearsExperience
      }));
      
      toast({
        title: "CV Analysis Complete",
        description: "We've analyzed your CV and prepared recommendations.",
      });
    } catch (error) {
      console.error("Error analyzing CV:", error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your CV. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = () => reject(new Error("File reading error"));
      reader.readAsText(file);
    });
  };
  
  const startInterview = () => {
    navigate('/interview');
  };

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-12 px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold mb-2">CV Analysis & Recommendations</h1>
          <p className="text-muted-foreground">
            Get personalized insights and interview questions based on your CV
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="p-6 rounded-xl h-full shadow-lg border-primary/10 hover:border-primary/30 transition-colors">
              <div className="flex items-center mb-4">
                <FileText className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-xl font-semibold">Upload Your CV</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Upload your CV in PDF or TXT format to get personalized analysis and interview questions.
              </p>
              <FileUpload 
                onFileChange={handleFileChange} 
                className="mb-6"
              />
              
              <div className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="experience" className="text-base">
                    Years of Experience: {yearsExperience}
                  </Label>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-muted-foreground">0</span>
                    <Slider
                      id="experience"
                      min={0}
                      max={20}
                      step={1}
                      defaultValue={[yearsExperience]}
                      onValueChange={handleExperienceChange}
                      className="mx-4 flex-1"
                    />
                    <span className="text-sm text-muted-foreground">20+</span>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={analyzeResume} 
                disabled={!file || isAnalyzing}
                className="w-full py-6 rounded-xl"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing CV...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze CV
                  </>
                )}
              </Button>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {analysis ? (
              <Card className="p-6 rounded-xl h-full shadow-lg border-primary/10 overflow-y-auto">
                <div className="flex items-center mb-4">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <h2 className="text-xl font-semibold">Analysis Results</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-lg mb-2">Detected Job Title</h3>
                    <div className="bg-primary/10 text-primary font-medium px-4 py-2 rounded-lg inline-block">
                      {analysis.jobTitle}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-2">Key Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.skills.map((skill, index) => (
                        <span 
                          key={index} 
                          className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-2 flex items-center">
                      <Lightbulb className="mr-2 h-4 w-4 text-amber-500" />
                      CV Improvement Recommendations
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Our AI suggests these improvements to enhance your CV:
                    </p>
                    <div className="space-y-2">
                      {analysis.improvements.map((improvement, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <p>{improvement}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-2 flex items-center">
                      <Award className="mr-2 h-4 w-4 text-primary" />
                      Generated Interview Questions
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Based on your profile, here are some questions you might encounter:
                    </p>
                    <div className="max-h-[200px] overflow-y-auto pr-2 space-y-2">
                      {analysis.questions.map((question, index) => (
                        <div key={index} className="text-sm bg-muted p-3 rounded-lg border border-border/50">
                          {question}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium text-lg mb-2">What's Next?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ready to practice with these questions? Try our virtual interview!
                  </p>
                  <Button 
                    onClick={startInterview}
                    className="w-full py-6 rounded-xl"
                  >
                    Start Practice Interview
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-6 rounded-xl h-full flex items-center justify-center shadow-lg border-primary/10">
                <div className="text-center">
                  <div className="mb-4 text-muted-foreground">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium">No Analysis Yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Upload your CV and click "Analyze CV" to get started
                  </p>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
        
        <footer className="mt-16 text-center text-muted-foreground text-sm">
          <p>© 2025 Mockster. All rights reserved.</p>
        </footer>
      </div>
    </PageTransition>
  );
};

export default CVAnalysis;
