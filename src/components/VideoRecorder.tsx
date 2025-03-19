
import React, { useEffect, useRef, useState } from 'react';
import { toast } from '@/components/ui/use-toast';

interface VideoRecorderProps {
  stream: MediaStream;
  isRecording: boolean;
  questionNumber: number;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({
  stream,
  isRecording,
  questionNumber,
}) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Start and stop recording based on isRecording prop
  useEffect(() => {
    let intervalId: number;
    
    if (isRecording) {
      startRecording();
      // Start timer to track recording duration
      intervalId = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      stopRecording();
      clearInterval(intervalId);
      setRecordingDuration(0);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        stopRecording();
      }
    };
  }, [isRecording]);

  const startRecording = () => {
    chunksRef.current = [];
    
    try {
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log('video/webm;codecs=vp9,opus is not supported');
        mediaRecorderRef.current = new MediaRecorder(stream);
      } else {
        mediaRecorderRef.current = new MediaRecorder(stream, options);
      }

      mediaRecorderRef.current.ondataavailable = handleDataAvailable;
      mediaRecorderRef.current.onstop = handleStop;
      mediaRecorderRef.current.start();
      
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recorder:', error);
      toast({
        title: 'Recording Error',
        description: 'Failed to start video recording. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      console.log('Recording stopped');
    }
  };

  const handleDataAvailable = (event: BlobEvent) => {
    if (event.data && event.data.size > 0) {
      chunksRef.current.push(event.data);
    }
  };

  const handleStop = () => {
    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
    chunksRef.current = [];

    // Create a URL for the recorded video blob
    const videoURL = URL.createObjectURL(blob);
    
    // Save the recording locally
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = videoURL;
    a.download = `interview-question-${questionNumber}.webm`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(videoURL);
    }, 100);
    
    toast({
      title: 'Recording Saved',
      description: `Your video response for question ${questionNumber} has been saved to your device.`,
    });
  };

  return null; // This component doesn't render anything visible
};

export default VideoRecorder;
