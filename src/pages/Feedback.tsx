
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Redo, Download, ThumbsUp, ThumbsDown, Laptop } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

type FeedbackType = {
  overallScore: number;
  feedback: string;
  strengths: string[];
  areasToImprove: string[];
  questionFeedback: Array<{
    question: string;
    score: number;
    feedback: string;
  }>;
};

const Feedback = () => {
  const [feedback, setFeedback] = useState<FeedbackType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = () => {
      try {
        const savedFeedback = sessionStorage.getItem('interview-feedback');
        
        if (savedFeedback) {
          const parsedFeedback = JSON.parse(savedFeedback);
          setFeedback(parsedFeedback);
        } else {
          toast({
            title: "No feedback found",
            description: "Please complete an interview to view feedback.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching feedback:", error);
        toast({
          title: "Error loading feedback",
          description: "There was a problem loading your feedback.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFeedback();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-500";
    if (score >= 70) return "text-amber-500";
    return "text-red-500";
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-amber-500";
    return "bg-red-500";
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </PageTransition>
    );
  }
  
  if (!feedback) {
    return (
      <PageTransition>
        <div className="min-h-screen pt-24 pb-12 px-4 max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6">No Feedback Available</h1>
          <p className="text-muted-foreground mb-8">
            Please complete an interview to receive feedback on your performance.
          </p>
          <Button asChild size="lg">
            <Link to="/interview">Start Interview</Link>
          </Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-12 px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold mb-2">Interview Feedback</h1>
          <p className="text-muted-foreground">
            Review your performance and areas for improvement
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Overall Feedback</h2>
              <p className="text-muted-foreground mb-6">{feedback.feedback}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium flex items-center mb-3">
                    <ThumbsUp className="mr-2 h-4 w-4 text-green-500" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {feedback.strengths.map((strength, index) => (
                      <li key={index} className="text-sm flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium flex items-center mb-3">
                    <ThumbsDown className="mr-2 h-4 w-4 text-amber-500" />
                    Areas to Improve
                  </h3>
                  <ul className="space-y-2">
                    {feedback.areasToImprove.map((area, index) => (
                      <li key={index} className="text-sm flex items-start">
                        <span className="text-amber-500 mr-2">•</span>
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="p-6 rounded-xl text-center">
              <h2 className="text-xl font-semibold mb-3">Overall Score</h2>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32">
                  <circle
                    className="text-muted stroke-current"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="58"
                    cx="64"
                    cy="64"
                  />
                  <circle
                    className="text-primary stroke-current"
                    strokeWidth="8"
                    strokeDasharray={58 * 2 * Math.PI}
                    strokeDashoffset={58 * 2 * Math.PI * (1 - feedback.overallScore / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="58"
                    cx="64"
                    cy="64"
                  />
                </svg>
                <span className="absolute text-4xl font-bold">
                  {feedback.overallScore}
                </span>
              </div>
              
              <div className="mt-6">
                <Button asChild variant="outline" className="w-full mb-3">
                  <Link to="/interview">
                    <Redo className="mr-2 h-4 w-4" />
                    Try Again
                  </Link>
                </Button>
                <Button variant="secondary" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
        
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4 mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Question-by-Question Feedback</h2>
          
          {feedback.questionFeedback.map((qFeedback, index) => (
            <motion.div key={index} variants={item}>
              <Card className="p-4 rounded-xl mb-4">
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium text-sm">Question {index + 1}</h3>
                    <span className={`font-bold ${getScoreColor(qFeedback.score)}`}>{qFeedback.score}/100</span>
                  </div>
                  <Progress value={qFeedback.score} className={`h-2 ${getProgressColor(qFeedback.score)}`} />
                </div>
                <p className="text-sm font-medium mb-2">{qFeedback.question}</p>
                <p className="text-sm text-muted-foreground">{qFeedback.feedback}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-center mt-12"
        >
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/">
              <Laptop className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Feedback;
