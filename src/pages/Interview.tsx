
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, ArrowRight, Video, VideoOff, Timer, Mic, MicOff, Save } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import VirtualInterviewer from '@/components/VirtualInterviewer';
import SpeechToText from '@/components/SpeechToText';
import { analyzeFeedback, generateDefaultQuestions } from '@/lib/gemini';
import { Card } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { saveRecording } from '@/lib/db';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [showRecordingAlert, setShowRecordingAlert] = useState(false);
  
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
      
      if (isVideoRecording) {
        stopVideoRecording();
      }
    }
  }, [timeRemaining, isAsking]);
  
  const toggleVideo = async () => {
    if (videoEnabled) {
      stopVideoRecording();
      setVideoEnabled(false);
    } else {
      try {
        // Request both video and audio permissions for a complete interview experience
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          },
          audio: true
        });
        
        if (stream) {
          streamRef.current = stream;
          
          // Ensure we have a valid video element reference
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.muted = true; // Mute to prevent feedback
            
            // Make sure to play the video once it's loaded
            videoRef.current.onloadedmetadata = () => {
              if (videoRef.current) {
                videoRef.current.play()
                  .catch(e => {
                    console.error("Error playing video:", e);
                    toast({
                      title: "Camera error",
                      description: "Unable to display camera feed. Please try again.",
                      variant: "destructive"
                    });
                  });
              }
            };
          }
          
          setVideoEnabled(true);
          
          toast({
            title: "Camera activated",
            description: "You'll have 2 minutes to answer each question."
          });
        }
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
  
  const startVideoRecording = () => {
    if (!streamRef.current) {
      toast({
        title: "Camera not enabled",
        description: "Please enable your camera before recording.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        setIsVideoRecording(false);
        setShowRecordingAlert(false);
        
        if (chunks.length > 0) {
          const recordingBlob = new Blob(chunks, { type: 'video/webm' });
          setRecordedChunks([...recordedChunks, recordingBlob]);
          
          try {
            // Generate a unique ID for this interview if not already done
            const interviewId = sessionStorage.getItem('current-interview-id') || 
              `interview-${Date.now()}`;
            
            if (!sessionStorage.getItem('current-interview-id')) {
              sessionStorage.setItem('current-interview-id', interviewId);
            }
            
            await saveRecording(interviewId, currentQuestionIndex, recordingBlob);
            
            toast({
              title: "Recording saved",
              description: "Your video response has been saved successfully."
            });
          } catch (error) {
            console.error("Error saving recording:", error);
            toast({
              title: "Error saving recording",
              description: "There was a problem saving your video. Please try again.",
              variant: "destructive"
            });
          }
        }
      };
      
      mediaRecorder.start(1000); // Collect data every second
      setIsVideoRecording(true);
      setShowRecordingAlert(true);
      
      toast({
        title: "Recording started",
        description: "Your video is now being recorded."
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Recording error",
        description: "Could not start recording. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const stopVideoRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setTimeRemaining(null);
    setIsVideoRecording(false);
    setShowRecordingAlert(false);
  };
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      stopVideoRecording();
    };
  }, []);
  
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
        stopVideoRecording();
        setVideoEnabled(false);
      }
      
      setTimeRemaining(null);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswer('');
      setIsAsking(true);
      
      if (isRecording) {
        setIsRecording(false);
      }
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
              Question {currentQuestionIndex + 1} of {questions.length}
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
        
        {showRecordingAlert && (
          <Alert variant="destructive" className="mb-4 bg-red-50 border-red-200">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
              <AlertTitle>Recording in progress</AlertTitle>
            </div>
            <AlertDescription>
              Your video is currently being recorded. Continue with your answer.
            </AlertDescription>
          </Alert>
        )}
        
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
                    
                    {videoEnabled && !isAsking && !isVideoRecording && (
                      <div className="absolute bottom-2 right-2 flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={startVideoRecording}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          <Save className="mr-1 h-4 w-4" />
                          Record
                        </Button>
                      </div>
                    )}
                    
                    {isVideoRecording && (
                      <div className="absolute bottom-2 right-2">
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => {
                            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                              mediaRecorderRef.current.stop();
                            }
                          }}
                        >
                          Stop Recording
                        </Button>
                      </div>
                    )}
                  </Card>
                ) : (
                  <Card className="relative overflow-hidden rounded-xl border border-muted shadow-md h-[240px] flex items-center justify-center bg-muted/20">
                    <div className="text-center p-4">
                      <Video className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
                      <p className="text-muted-foreground">Camera is off</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={toggleVideo} 
                        className="mt-4"
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
