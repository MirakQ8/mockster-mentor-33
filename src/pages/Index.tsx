import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, CheckCircle, Award, BarChart3, HelpCircle } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';

const Index = () => {
  const features = [
    {
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
      title: 'AI-powered Interview Practice',
      description: 'Get realistic interview questions tailored to your CV and job position'
    },
    {
      icon: <Award className="h-6 w-6 text-primary" />,
      title: 'Detailed Feedback',
      description: 'Receive personalized feedback to improve your interview performance'
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-primary" />,
      title: 'Track Your Progress',
      description: 'Monitor your improvement over time with detailed analytics'
    }
  ];

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

  const faqItems = [
    {
      question: "How does the interview practice work?",
      answer: "Our AI generates personalized interview questions based on your CV and job position. You can practice answering in a realistic interview setting, with video recording options and time limits."
    },
    {
      question: "How accurate is the CV analysis?",
      answer: "Our system uses advanced AI to analyze your CV and extract relevant information. While highly accurate, we recommend reviewing the analysis to ensure it aligns with your experience and skills."
    },
    {
      question: "Can I practice for technical interviews?",
      answer: "Yes! Our system generates technical questions specific to your field and role, allowing you to practice answering technical questions that you might encounter in a real interview."
    },
    {
      question: "How can I improve my interview skills?",
      answer: "Practice regularly with our mock interviews, review the detailed feedback we provide, and implement the suggested improvements in your responses and CV."
    }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-4">
              AI-Powered Interview Preparation
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Ace Your Next <span className="text-primary">Interview</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Practice with our AI interviewer, get personalized feedback, and improve your skills with every session.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 mt-8"
          >
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to="/upload">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              className="relative p-8 rounded-2xl border bg-card"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-24"
        >
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Upload CV", description: "Upload your resume for AI analysis" },
              { step: "2", title: "Analyze", description: "Get insights and personalized questions" },
              { step: "3", title: "Practice", description: "Complete a simulated interview" },
              { step: "4", title: "Improve", description: "Review feedback and enhance your skills" }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (index * 0.1), duration: 0.6 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mb-24"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {faqItems.map((faq, index) => (
                <Card key={index} className="p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <HelpCircle className="mr-2 h-5 w-5 text-primary" />
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-6">Ready to improve your interview skills?</h2>
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/upload">Upload Your CV</Link>
          </Button>
        </motion.div>

        <footer className="border-t pt-8 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <div className="font-semibold text-lg mb-2">
                  <span className="text-primary">Mock</span>ster
                </div>
                <p className="text-sm text-muted-foreground">
                  AI-powered interview preparation tool
                </p>
              </div>
              
              <div className="mb-6 md:mb-0">
                <a 
                  href="https://x.com/KarimQ45" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-sm flex items-center hover:text-primary transition-colors"
                >
                  🔹 X Account: @KarimQ45
                </a>
              </div>
            </div>
            
            <div className="text-center text-sm text-muted-foreground mt-8">
              © 2025 Karman. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default Index;
