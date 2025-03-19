
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
    <Card className="p-6 rounded-xl border bg-card shadow-sm">
      <div className="flex items-start space-x-4">
        <Avatar className="w-16 h-16 border-2 border-primary">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback className="bg-secondary text-xl font-medium">AI</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h3 className="font-medium text-lg mb-2">Virtual Interviewer</h3>
          
          <div className="relative">
            {isAsking && (
              <motion.div 
                className="absolute -left-6 top-1/2 -translate-y-1/2"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5] 
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5 
                }}
              >
                <div className="w-3 h-3 bg-primary rounded-full" />
              </motion.div>
            )}
            
            <p className="text-base">
              {question}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VirtualInterviewer;
