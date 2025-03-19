
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Redo, Download, ThumbsUp, ThumbsDown, Laptop, BookOpen, ArrowUpDown } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import jsPDF from 'jspdf';

type FeedbackType = {
  overallScore: number;
  feedback: string;
  strengths: string[];
  areasToImprove: string[];
  questionFeedback: Array<{
    question: string;
    score: number;
    feedback: string;
    difficulty?: string;
    keyPoints?: string[];
  }>;
};

const Feedback = () => {
  const [feedback, setFeedback] = useState<FeedbackType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'order' | 'score' | 'difficulty'>('order');

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
  
  const getDifficultyColor = (difficulty?: string) => {
    if (!difficulty) return "bg-gray-500";
    switch (difficulty.toLowerCase()) {
      case 'easy': return "bg-green-500";
      case 'medium': return "bg-amber-500";
      case 'hard': return "bg-red-500";
      default: return "bg-gray-500";
    }
  };
  
  const handleDownloadReport = () => {
    if (!feedback) return;
    
    try {
      // Create a new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;
      const leftMargin = 20;
      const lineHeight = 7;
      const maxLineWidth = pageWidth - (2 * leftMargin);
      
      // Add title
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Interview Feedback Report', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;
      
      // Add date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const date = new Date().toLocaleDateString();
      doc.text(`Generated on: ${date}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;
      
      // Overall Score
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`Overall Score: ${feedback.overallScore}/100`, leftMargin, yPos);
      yPos += 10;
      
      // Overall Feedback
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Overall Feedback', leftMargin, yPos);
      yPos += 7;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      // Split text to handle wrapping
      const feedbackLines = doc.splitTextToSize(feedback.feedback, maxLineWidth);
      doc.text(feedbackLines, leftMargin, yPos);
      yPos += (feedbackLines.length * lineHeight) + 10;
      
      // Strengths
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Strengths', leftMargin, yPos);
      yPos += 7;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      feedback.strengths.forEach((strength, i) => {
        doc.text(`• ${strength}`, leftMargin, yPos);
        yPos += lineHeight;
      });
      yPos += 7;
      
      // Areas to Improve
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Areas to Improve', leftMargin, yPos);
      yPos += 7;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      feedback.areasToImprove.forEach((area, i) => {
        doc.text(`• ${area}`, leftMargin, yPos);
        yPos += lineHeight;
      });
      yPos += 10;
      
      // Question-by-Question Feedback
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Question-by-Question Feedback', leftMargin, yPos);
      yPos += 10;
      
      // Add each question's feedback
      feedback.questionFeedback.forEach((qf, i) => {
        // Check if we need to add a new page
        if (yPos > doc.internal.pageSize.getHeight() - 40) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Question ${i+1}${qf.difficulty ? ` (${qf.difficulty})` : ''}`, leftMargin, yPos);
        yPos += 7;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        
        const questionLines = doc.splitTextToSize(qf.question, maxLineWidth);
        doc.text(questionLines, leftMargin, yPos);
        yPos += (questionLines.length * lineHeight) + 5;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Score: ${qf.score}/100`, leftMargin, yPos);
        yPos += 7;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const feedbackLines = doc.splitTextToSize(qf.feedback, maxLineWidth);
        doc.text(feedbackLines, leftMargin, yPos);
        yPos += (feedbackLines.length * lineHeight) + 5;
        
        // Add key points if available
        if (qf.keyPoints && qf.keyPoints.length > 0) {
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Key Points:', leftMargin, yPos);
          yPos += 7;
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          qf.keyPoints.forEach(point => {
            const pointLines = doc.splitTextToSize(`• ${point}`, maxLineWidth - 5);
            doc.text(pointLines, leftMargin, yPos);
            yPos += (pointLines.length * lineHeight);
          });
        }
        
        yPos += 10;
      });
      
      // Save the PDF
      const fileName = `interview-feedback-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "Report downloaded",
        description: "Your interview feedback report has been downloaded as a PDF.",
      });
    } catch (error) {
      console.error("Error downloading report:", error);
      toast({
        title: "Download failed",
        description: "There was an error downloading your report. Please try again.",
        variant: "destructive"
      });
    }
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
  
  const getSortedQuestionFeedback = () => {
    if (!feedback?.questionFeedback) return [];
    
    const sorted = [...feedback.questionFeedback];
    
    switch (sortBy) {
      case 'score':
        return sorted.sort((a, b) => b.score - a.score);
      case 'difficulty':
        return sorted.sort((a, b) => {
          const difficultyOrder = { 'hard': 0, 'medium': 1, 'easy': 2, undefined: 3 };
          const diffA = a.difficulty?.toLowerCase() as keyof typeof difficultyOrder || undefined;
          const diffB = b.difficulty?.toLowerCase() as keyof typeof difficultyOrder || undefined;
          return (difficultyOrder[diffA] ?? 3) - (difficultyOrder[diffB] ?? 3);
        });
      default:
        return sorted; // Keep original order
    }
  };
  
  const handleSortChange = (newSortBy: 'order' | 'score' | 'difficulty') => {
    setSortBy(newSortBy);
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
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={handleDownloadReport}
                >
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Question-by-Question Feedback</h2>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant={sortBy === 'order' ? 'default' : 'outline'} 
                onClick={() => handleSortChange('order')}
              >
                Default
              </Button>
              <Button 
                size="sm" 
                variant={sortBy === 'score' ? 'default' : 'outline'} 
                onClick={() => handleSortChange('score')}
              >
                <ArrowUpDown className="w-4 h-4 mr-1" />
                Score
              </Button>
              <Button 
                size="sm" 
                variant={sortBy === 'difficulty' ? 'default' : 'outline'} 
                onClick={() => handleSortChange('difficulty')}
              >
                <BookOpen className="w-4 h-4 mr-1" />
                Difficulty
              </Button>
            </div>
          </div>
          
          {getSortedQuestionFeedback().map((qFeedback, index) => (
            <motion.div key={index} variants={item}>
              <Card className="p-4 rounded-xl mb-4">
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm">Question {index + 1}</h3>
                      {qFeedback.difficulty && (
                        <Badge className={`${getDifficultyColor(qFeedback.difficulty)}`}>
                          {qFeedback.difficulty}
                        </Badge>
                      )}
                    </div>
                    <span className={`font-bold ${getScoreColor(qFeedback.score)}`}>{qFeedback.score}/100</span>
                  </div>
                  <Progress value={qFeedback.score} className={`h-2 ${getProgressColor(qFeedback.score)}`} />
                </div>
                <p className="text-sm font-medium mb-2">{qFeedback.question}</p>
                <p className="text-sm text-muted-foreground mb-3">{qFeedback.feedback}</p>
                
                {qFeedback.keyPoints && qFeedback.keyPoints.length > 0 && (
                  <div className="mt-2 bg-muted/30 p-3 rounded-lg">
                    <h4 className="text-xs font-semibold uppercase mb-2">Key Points</h4>
                    <ul className="space-y-1">
                      {qFeedback.keyPoints.map((point, i) => (
                        <li key={i} className="text-xs flex items-start">
                          <span className="text-primary mr-2">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
