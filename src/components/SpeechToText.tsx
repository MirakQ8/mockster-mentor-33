
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Pause } from 'lucide-react';

interface SpeechToTextProps {
  onTranscript: (text: string) => void;
  isRecording: boolean;
  toggleRecording: () => void;
}

const SpeechToText: React.FC<SpeechToTextProps> = ({ 
  onTranscript, 
  isRecording,
  toggleRecording
}) => {
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }
        
        if (finalTranscript) {
          setTranscript(prev => {
            const updated = prev + ' ' + finalTranscript;
            onTranscript(updated.trim());
            return updated;
          });
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript]);

  useEffect(() => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  }, [isRecording]);

  return (
    <Button
      type="button"
      variant={isRecording ? "destructive" : "outline"}
      className="flex-1 py-6 rounded-xl"
      onClick={toggleRecording}
    >
      {isRecording ? (
        <>
          <Pause className="mr-2 h-4 w-4" /> Stop Recording
        </>
      ) : (
        <>
          <Mic className="mr-2 h-4 w-4" /> Record Answer
        </>
      )}
    </Button>
  );
};

export default SpeechToText;
