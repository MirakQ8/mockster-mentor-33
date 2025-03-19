
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, ArrowRight, Video, VideoOff, Timer, Mic, MicOff, Camera } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import VirtualInterviewer from '@/components/VirtualInterviewer';
import SpeechToText from '@/components/SpeechToText';
import { analyzeFeedback, generateDefaultQuestions } from '@/lib/gemini';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Interview = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAsking, setIsAsking] = useState(true);
  const [answers, setAnswers] = useState<string[]>([]);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const [questions, setQuestions] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      const savedAnalysis = sessionStorage.getItem('cv-analysis');
      
      if (savedAnalysis) {
        try {
          const analysis = JSON.parse(savedAnalysis);
          if (analysis.questions && Array.isArray(analysis.questions) && analysis.questions.length > 0) {
            console.log("Retrieved questions from CV analysis:", analysis.questions);
            setQuestions(analysis.questions);
          } else {
            const jobTitle = analysis.jobTitle || "Software Developer";
            const generatedQuestions = await generateDefaultQuestions(jobTitle);
            setQuestions(generatedQuestions);
            
            toast({
              title: "Generated personalized questions",
              description: `Created questions for ${jobTitle} role based on your CV.`,
              variant: "default"
            });
          }
        } catch (error) {
          console.error("Error parsing CV analysis from session storage:", error);
          setDefaultQuestions();
        }
      } else {
        await setDefaultQuestions();
        toast({
          title: "No CV analysis found",
          description: "Using default interview questions. For personalized questions, please analyze your CV first.",
          variant: "default"
        });
      }
      setIsLoading(false);
    };
    
    fetchQuestions();
    
    // Try to automatically open the camera when the component loads
    enableCameraWithPermission();
    
    // Cleanup on unmount
    return () => {
      stopVideoStream();
    };
  }, []);
  
  const setDefaultQuestions = async () => {
    console.log("Generating default questions");
    const generatedQuestions = await generateDefaultQuestions();
    setQuestions(generatedQuestions);
  };
  
  const currentQuestion = questions[currentQuestionIndex] || "Loading question...";
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsAsking(false);
        if (videoEnabled) {
          setTimeRemaining(120);
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex, videoEnabled, isLoading]);
  
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
  
  const enableCameraWithPermission = async () => {
    try {
      // Request camera and microphone permissions with appropriate constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: false // We don't need audio for the video feed
      });
      
      if (stream) {
        // Store the stream reference for later cleanup
        streamRef.current = stream;
        
        // Set the video element's srcObject to display the stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true; // Mute to prevent feedback
          
          console.log("Setting up video stream...");
          
          // Explicitly try to play the video
          try {
            await videoRef.current.play();
            console.log("Video is playing");
            setVideoEnabled(true);
            setCameraError(null);
            
            toast({
              title: "Camera activated",
              description: "Your camera is now ready for the interview."
            });
          } catch (error) {
            console.error("Error playing video:", error);
            setCameraError("Unable to play video stream. Please try again.");
            stopVideoStream();
          }
        }
      }
    } catch (error: any) {
      console.error("Camera access error:", error);
      setCameraError(error.message || "Camera access denied. Please check your browser permissions.");
      
      toast({
        title: "Camera access denied",
        description: "Please allow camera access in your browser settings to use this feature.",
        variant: "destructive"
      });
    }
  };
  
  const toggleVideo = async () => {
    if (videoEnabled) {
      stopVideoStream();
      setVideoEnabled(false);
    } else {
      enableCameraWithPermission();
    }
  };
  
  const stopVideoStream = () => {
    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    // Clear the video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setTimeRemaining(null);
    setCameraError(null);
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
      
      if (videoEnabled) {
        stopVideoStream();
        setVideoEnabled(false);
      }
      
      setTimeRemaining(null);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswer('');
      setIsAsking(true);
      
      if (isRecording) {
        setIsRecording(false);
      }
      
      // Auto-enable camera for the next question
      setTimeout(() => {
        enableCameraWithPermission();
      }, 2500);
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
      <div className="min-h-screen pt-20 pb-12 px-4 md:px-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold mb-2">Mock Interview</h1>
            <p className="text-muted-foreground">
              Question {currentQuestionIndex +.1} of {questions.length}
            </p>
          </motion.div>
          
          <div className="relative h-2 bg-secondary rounded-full mt-6 overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-primary rounded-full"
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <VirtualInterviewer 
                  question={currentQuestion} 
                  isAsking={isAsking} 
                />
              </div>
              
              <div className="flex flex-col space-y-4">
                {videoEnabled ? (
                  <Card className="relative overflow-hidden rounded-xl border border-primary/20 shadow-md h-[240px] flex items-center justify-center bg-black">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline
                      muted 
                      className="w-full h-full object-cover"
                    />
                    {timeRemaining !== null && (
                      <div className="absolute top-2 right-2 bg-background/80 text-foreground px-3 py-1 rounded-full text-sm flex items-center shadow-md border border-border">
                        <Timer className="w-4 h-4 mr-2 text-primary" />
                        {formatTime(timeRemaining)}
                      </div>
                    )}
                  </Card>
                ) : (
                  <Card className="relative overflow-hidden rounded-xl border border-muted shadow-md h-[240px] flex items-center justify-center bg-muted/20">
                    <div className="text-center p-4">
                      <Camera className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
                      <p className="text-muted-foreground mb-2">Camera is off</p>
                      
                      {cameraError ? (
                        <Alert variant="destructive" className="mb-2 text-sm">
                          <AlertDescription>{cameraError}</AlertDescription>
                        </Alert>
                      ) : null}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={toggleVideo} 
                        className="mt-2"
                        disabled={isAsking}
                      >
                        Enable camera
                      </Button>
                    </div>
                  </Card>
                )}
                
                <div className="flex flex-col space-y-2">
                  <Button
                    type="button"
                    variant={videoEnabled ? "destructive" : "outline"}
                    size="sm"
                    onClick={toggleVideo}
                    className="w-full"
                    disabled={isAsking}
                  >
                    {videoEnabled ? (
                      <>
                        <VideoOff className="mr-2 h-4 w-4" />
                        Disable Camera
                      </>
                    ) : (
                      <>
                        <Video className="mr-2 h-4 w-4" />
                        Enable Camera
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant={isRecording ? "destructive" : "outline"}
                    size="sm"
                    onClick={toggleRecording}
                    className="w-full"
                    disabled={isAsking}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="mr-2 h-4 w-4" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        Record Audio
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Textarea
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={isAsking}
                className="min-h-[150px] text-base p-4 rounded-xl focus:ring-primary/50"
              />
              
              <div className="flex justify-end">
                <Button
                  type="button"
                  className="px-8 py-6 rounded-xl shadow-lg"
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
        )}
        
        {isRecording && (
          <SpeechToText
            onTranscript={handleTranscript}
            isRecording={isRecording}
            toggleRecording={toggleRecording}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default Interview;
