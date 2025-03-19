import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, ArrowRight, Video, VideoOff, Timer } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import VirtualInterviewer from '@/components/VirtualInterviewer';
import SpeechToText from '@/components/SpeechToText';
import { analyzeFeedback } from '@/lib/gemini';

const Interview = () => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAsking, setIsAsking] = useState(true);
  const [answers, setAnswers] = useState<string[]>([]);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [questions, setQuestions] = useState<string[]>([]);
  
  useEffect(() => {
    const savedAnalysis = sessionStorage.getItem('cv-analysis');
    
    if (savedAnalysis) {
      try {
        const analysis = JSON.parse(savedAnalysis);
        if (analysis.questions && Array.isArray(analysis.questions) && analysis.questions.length > 0) {
          console.log("Retrieved questions from CV analysis:", analysis.questions);
          setQuestions(analysis.questions);
        } else {
          setDefaultQuestions();
          toast({
            title: "No specific questions found",
            description: "Using default interview questions. For personalized questions, please analyze your CV first.",
            variant: "default"
          });
        }
      } catch (error) {
        console.error("Error parsing CV analysis from session storage:", error);
        setDefaultQuestions();
      }
    } else {
      setDefaultQuestions();
      toast({
        title: "No CV analysis found",
        description: "Using default interview questions. For personalized questions, please analyze your CV first.",
        variant: "default"
      });
    }
  }, []);
  
  const setDefaultQuestions = () => {
    console.log("Using default questions");
    setQuestions([
      "Tell me about your background and experience in this field.",
      "Describe a challenging project you worked on and how you overcame obstacles.",
      "How do you stay updated with the latest trends and technologies in your industry?",
      "What are your strengths and weaknesses related to this position?",
      "Where do you see yourself professionally in 5 years?",
      "Tell me about a time when you had to learn a new technology quickly.",
      "How do you handle tight deadlines and pressure?",
      "Describe your approach to debugging and troubleshooting.",
      "How do you collaborate with team members who have different working styles?",
      "What aspects of your work do you find most enjoyable?"
    ]);
  };
  
  const currentQuestion = questions[currentQuestionIndex] || "Loading question...";
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAsking(false);
      if (videoEnabled) {
        setTimeRemaining(120);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [currentQuestionIndex, videoEnabled]);
  
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !isAsking) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
      
      return () => clearInterval(interval);
    } else if (timeRemaining === 0) {
      toast({
        title: "Time's up!",
        description: "Please submit your answer now."
      });
    }
  }, [timeRemaining, isAsking]);
  
  const toggleVideo = async () => {
    if (videoEnabled) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current = null;
      }
      setVideoEnabled(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        setVideoEnabled(true);
        
        toast({
          title: "Video enabled",
          description: "You'll have 2 minutes to answer each question."
        });
      } catch (error) {
        console.error("Error accessing camera:", error);
        toast({
          title: "Camera access denied",
          description: "Please allow camera access to use this feature.",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleNextQuestion = () => {
    if (questions.length === 0) {
      toast({
        title: "No questions available",
        description: "Please wait for questions to load or refresh the page.",
        variant: "destructive"
      });
      return;
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setAnswers(prev => {
        const updatedAnswers = [...prev];
        updatedAnswers[currentQuestionIndex] = answer;
        return updatedAnswers;
      });
      
      setTimeRemaining(null);
      
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswer('');
      setIsAsking(true);
    } else {
      setAnswers(prev => {
        const updatedAnswers = [...prev];
        updatedAnswers[currentQuestionIndex] = answer;
        return updatedAnswers;
      });
      
      handleGenerateFeedback();
    }
  };
  
  const handleGenerateFeedback = async () => {
    setIsSubmitting(true);
    
    try {
      const finalAnswers = [...answers];
      finalAnswers[currentQuestionIndex] = answer;
      
      toast({
        title: "Analyzing your responses",
        description: "Our AI is evaluating your interview performance...",
      });
      
      const feedback = await analyzeFeedback(questions, finalAnswers);
      
      sessionStorage.setItem('interview-feedback', JSON.stringify(feedback));
      
      setIsSubmitting(false);
      navigate('/feedback');
    } catch (error) {
      console.error("Error generating feedback:", error);
      toast({
        title: "Error analyzing responses",
        description: "Please try again later.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  const handleSubmitAnswer = () => {
    if (!answer.trim()) return;
    handleNextQuestion();
  };
  
  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };
  
  const handleTranscript = (text: string) => {
    setAnswer(text);
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
              Question {currentQuestionIndex + 1} of {questions.length}
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
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <VirtualInterviewer 
                question={currentQuestion} 
                isAsking={isAsking} 
              />
            </div>
            
            {videoEnabled && (
              <div className="w-1/3 relative">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  className="w-full h-auto rounded-xl border border-border"
                />
                {timeRemaining !== null && (
                  <div className="absolute top-2 right-2 bg-background/80 text-foreground px-2 py-1 rounded-full text-sm flex items-center">
                    <Timer className="w-3 h-3 mr-1" />
                    {formatTime(timeRemaining)}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <Textarea
              placeholder="Type your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={isAsking}
              className="min-h-[150px] text-base p-4 rounded-xl"
            />
            
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={toggleVideo}
                className="flex items-center"
              >
                {videoEnabled ? (
                  <>
                    <VideoOff className="mr-2 h-4 w-4" />
                    Disable Video
                  </>
                ) : (
                  <>
                    <Video className="mr-2 h-4 w-4" />
                    Enable Video
                  </>
                )}
              </Button>
              
              <SpeechToText
                onTranscript={handleTranscript}
                isRecording={isRecording}
                toggleRecording={toggleRecording}
              />
              
              <Button
                type="button"
                className="flex-1 py-6 rounded-xl"
                disabled={!answer.trim() || isSubmitting || isAsking}
                onClick={handleSubmitAnswer}
              >
                {isSubmitting ? "Submitting..." : (
                  <>
                    {currentQuestionIndex < questions.length - 1 ? (
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
