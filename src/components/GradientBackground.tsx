
import React from 'react';
import { cn } from '@/lib/utils';

interface GradientBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

const GradientBackground = ({ children, className }: GradientBackgroundProps) => {
  return (
    <div 
      className={cn(
        "relative overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/20 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default GradientBackground;
