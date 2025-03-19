
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Award, BarChart3 } from 'lucide-react';
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
            <Button asChild variant="outline" size="lg" className="rounded-full px-8">
              <Link to="/interview">Try Demo</Link>
            </Button>
          </motion.div>
        </div>

        <motion.div 
          className="mb-24 relative"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="aspect-video rounded-2xl overflow-hidden shadow-xl border">
            <div className="bg-secondary/50 w-full h-full flex items-center justify-center">
              <p className="text-muted-foreground">Interview Interface Preview</p>
            </div>
          </div>
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[80%] h-16 bg-gradient-to-t from-background to-transparent" />
        </motion.div>

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
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-6">Ready to improve your interview skills?</h2>
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/upload">Upload Your CV</Link>
          </Button>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Index;
