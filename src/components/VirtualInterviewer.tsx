
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface VirtualInterviewerProps {
  question: string;
  isAsking: boolean;
}

const VirtualInterviewer: React.FC<VirtualInterviewerProps> = ({ question, isAsking }) => {
  return (
    <Card className="p-6 rounded-xl border shadow-md bg-card/80 backdrop-blur-sm relative overflow-hidden">
      <div className="flex items-start space-x-4">
        <Avatar className="w-16 h-16 border-2 border-primary ring-2 ring-primary/20 shadow-md">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback className="bg-primary/10 text-xl font-medium text-primary">AI</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h3 className="font-medium text-lg mb-2">Virtual Interviewer</h3>
          
          <div className="relative">
            {isAsking ? (
              <motion.div 
                className="flex space-x-2 items-center"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-3 h-3 bg-primary rounded-full"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0.2,
                    ease: "easeInOut",
                  }}
                  className="w-3 h-3 bg-primary rounded-full"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0.4,
                    ease: "easeInOut",
                  }}
                  className="w-3 h-3 bg-primary rounded-full"
                />
                <p className="ml-2 text-muted-foreground">Thinking...</p>
              </motion.div>
            ) : (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-lg leading-relaxed"
              >
                {question}
              </motion.p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VirtualInterviewer;
