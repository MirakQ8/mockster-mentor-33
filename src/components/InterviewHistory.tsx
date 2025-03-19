
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';
import { format } from 'date-fns';
import { Clock, BarChart, Award, FileText } from 'lucide-react';
import { Interview } from '@/lib/db';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ChartContainer } from '@/components/ui/chart';

// Mock function to fetch interviews - replace with actual API call
const fetchInterviews = async (userId: string): Promise<Interview[]> => {
  // In a real app, this would be an API call to your backend
  console.log('Fetching interviews for user:', userId);
  
  // Mock data for development
  return [
    {
      id: 1,
      userId,
      jobTitle: 'Frontend Developer',
      yearsExperience: 3,
      status: 'completed',
      overallScore: 85,
      feedback: 'Great communication skills. Could improve technical knowledge.',
      createdAt: new Date('2023-10-15T14:30:00'),
      completedAt: new Date('2023-10-15T15:15:00'),
    },
    {
      id: 2,
      userId,
      jobTitle: 'UX Designer',
      yearsExperience: 2,
      status: 'completed',
      overallScore: 78,
      feedback: 'Good portfolio presentation. Work on explaining design decisions.',
      createdAt: new Date('2023-11-05T10:00:00'),
      completedAt: new Date('2023-11-05T10:45:00'),
    },
    {
      id: 3,
      userId,
      jobTitle: 'Project Manager',
      yearsExperience: 5,
      status: 'completed',
      overallScore: 92,
      feedback: 'Excellent leadership examples. Very well structured answers.',
      createdAt: new Date('2023-12-12T16:20:00'),
      completedAt: new Date('2023-12-12T17:10:00'),
    },
  ];
};

const InterviewHistory: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  
  const { data: interviews, isLoading, error } = useQuery({
    queryKey: ['interviews', user?.id],
    queryFn: () => fetchInterviews(user?.id || ''),
    enabled: !!user?.id,
  });

  if (isLoading) return <div className="flex justify-center p-8">Loading your interview history...</div>;
  if (error) {
    return <div className="flex justify-center p-8 text-destructive">
      Error loading interviews: {error instanceof Error ? error.message : 'Unknown error'}
    </div>;
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-red-500';
  };

  const handleViewDetail = (id: number) => {
    toast({
      title: "Feature coming soon",
      description: `Detailed view for interview #${id} will be available in a future update.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Interview History</h1>
      
      <Tabs defaultValue="table">
        <TabsList className="mb-6">
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="cards">Card View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="table">
          <Table>
            <TableCaption>A history of your mock interviews</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interviews?.map((interview) => {
                const duration = interview.completedAt && interview.createdAt
                  ? Math.round((interview.completedAt.getTime() - interview.createdAt.getTime()) / 60000)
                  : 0;
                
                return (
                  <TableRow key={interview.id}>
                    <TableCell>{format(new Date(interview.createdAt), 'PPP')}</TableCell>
                    <TableCell>{interview.jobTitle}</TableCell>
                    <TableCell>{duration} mins</TableCell>
                    <TableCell className={getScoreColor(interview.overallScore || 0)}>
                      {interview.overallScore || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        interview.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {interview.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewDetail(interview.id)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TabsContent>
        
        <TabsContent value="cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviews?.map((interview) => (
            <Card key={interview.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{interview.jobTitle}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {format(new Date(interview.createdAt), 'PPP')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    <span className={`text-lg font-bold ${getScoreColor(interview.overallScore || 0)}`}>
                      {interview.overallScore || 'N/A'}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    interview.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {interview.status}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {interview.feedback?.substring(0, 100)}
                  {interview.feedback && interview.feedback.length > 100 ? '...' : ''}
                </p>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleViewDetail(interview.id)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Complete Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InterviewHistory;
