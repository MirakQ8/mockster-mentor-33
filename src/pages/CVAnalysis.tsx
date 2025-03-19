
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components';
import { toast } from '@/components/ui/use-toast';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, Award, AlertTriangle } from 'lucide-react';
import { analyzeCV } from '@/lib/gemini';

const CVAnalysis = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    jobTitle: string;
    skills: string[];
    questions: string[];
  } | null>(null);

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
    setAnalysis(null);
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
      
      console.log("Analyzing CV content...");
      
      // Call Gemini API to analyze the CV - pass 10 for number of questions
      const cvAnalysis = await analyzeCV(fileText, 10);
      
      console.log("Received analysis from Gemini API:", cvAnalysis);
      
      // Set the analysis state with the data from Gemini
      setAnalysis(cvAnalysis);
      
      // Store the analysis data in sessionStorage for use in Interview.tsx
      sessionStorage.setItem('cv-analysis', JSON.stringify(cvAnalysis));
      
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
            Get personalized insights and improvement suggestions for your CV
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="p-6 rounded-xl h-full">
              <h2 className="text-xl font-semibold mb-4">Upload Your CV</h2>
              <FileUpload 
                onFileChange={handleFileChange} 
                className="mb-6"
              />
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
                  "Analyze CV"
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
              <Card className="p-6 rounded-xl h-full">
                <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
                
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
                      <Award className="mr-2 h-4 w-4 text-primary" />
                      Generated Interview Questions
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Based on your profile, here are some questions you might encounter:
                    </p>
                    <ul className="space-y-2">
                      {analysis.questions.map((question, index) => (
                        <li key={index} className="text-sm bg-muted p-2 rounded">
                          {question}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium text-lg mb-2">What's Next?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ready to practice with these questions? Try our virtual interview!
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = '/interview'}
                  >
                    Start Practice Interview
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-6 rounded-xl h-full flex items-center justify-center">
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
