
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Mic, Send, ArrowRight, Pause } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';

const Interview = () => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mock questions - in a real app, these would come from the backend based on CV analysis
  const mockQuestions = [
    "Tell me about your background and experience in this field.",
    "Describe a challenging project you worked on and how you overcame obstacles.",
    "How do you stay updated with the latest trends and technologies in your industry?",
    "What are your strengths and weaknesses related to this position?",
    "Where do you see yourself professionally in 5 years?",
  ];
  
  const currentQuestion = mockQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / mockQuestions.length) * 100;
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswer('');
    } else {
      // All questions answered, navigate to feedback
      navigate('/feedback');
    }
  };
  
  const handleSubmitAnswer = () => {
    if (!answer.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsSubmitting(false);
      handleNextQuestion();
    }, 1000);
  };
  
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // In a real app, this would start speech-to-text
      console.log("Started recording...");
    } else {
      // In a real app, this would stop speech-to-text and process result
      console.log("Stopped recording...");
      // Simulate speech-to-text result
      setAnswer("This is a simulated speech-to-text response. In the actual app, this would be the transcribed text from your spoken answer.");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-12 px-4 max-w-3xl mx-auto">
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold mb-2">Mock Interview</h1>
            <p className="text-muted-foreground">
              Question {currentQuestionIndex + 1} of {mockQuestions.length}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            className="h-1 bg-primary rounded-full mt-4"
          />
        </div>
        
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <Card className="p-6 rounded-xl border bg-card shadow-sm">
            <div className="mb-6">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-medium">AI</span>
              </div>
              <h2 className="text-xl font-medium text-center mb-2">
                {currentQuestion}
              </h2>
            </div>
          </Card>
          
          <div className="space-y-4">
            <Textarea
              placeholder="Type your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="min-h-[150px] text-base p-4 rounded-xl"
            />
            
            <div className="flex space-x-3">
              <Button
                type="button"
                variant={isRecording ? "destructive" : "outline"}
                className="flex-1 py-6 rounded-xl"
                onClick={toggleRecording}
              >
                {isRecording ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" /> Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" /> Record Answer
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                className="flex-1 py-6 rounded-xl"
                disabled={!answer.trim() || isSubmitting}
                onClick={handleSubmitAnswer}
              >
                {isSubmitting ? "Submitting..." : (
                  <>
                    {currentQuestionIndex < mockQuestions.length - 1 ? (
                      <>
                        Next Question <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Finish Interview <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Interview;
