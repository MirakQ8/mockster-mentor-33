
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';

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
    // Check if the browser supports the Web Speech API
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
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
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert('Microphone access was denied. Please allow microphone access to use speech recognition.');
          toggleRecording(); // Turn off recording if permission denied
        }
      };
      
      recognitionRef.current.onend = () => {
        // Restart recognition if we're still supposed to be recording
        if (isRecording) {
          try {
            recognitionRef.current.start();
          } catch (error) {
            console.error("Error restarting speech recognition:", error);
          }
        }
      };
    } else {
      console.error("Speech Recognition API not supported in this browser");
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          // Ignore errors when stopping an already stopped recognition
        }
      }
    };
  }, [onTranscript]);

  useEffect(() => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error("Error starting speech recognition:", error);
        }
      }
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error("Error stopping speech recognition:", error);
        }
      }
    }
  }, [isRecording]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-primary p-3 rounded-full shadow-lg animate-pulse">
        <Mic className="h-6 w-6 text-white" />
      </div>
    </div>
  );
};

export default SpeechToText;
