
import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, MessageSquare } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { useQuery } from '@tanstack/react-query';

interface Interview {
  id: number;
  userId: string;
  jobTitle: string;
  yearsExperience: number;
  status: 'pending' | 'completed';
  questions: string[];
  answers?: string[];
  feedback?: string;
  overallScore?: number;
  createdAt: string;
  completedAt?: string;
}

const fetchInterviews = async (userId: string): Promise<Interview[]> => {
  try {
    // In a production environment, this would be a fetch to an API endpoint
    // Since we're using client-side storage for this demo, we'll fetch from sessionStorage
    
    const historyString = sessionStorage.getItem('interview-history');
    let interviews = historyString ? JSON.parse(historyString) : [];
    
    // Filter for the current user
    interviews = interviews.filter((interview: Interview) => interview.userId === userId);
    
    console.log('Fetched interviews from storage:', interviews);
    
    if (interviews.length === 0) {
      // If no interviews are found, return some sample data
      return [
        {
          id: 1,
          userId,
          jobTitle: 'Frontend Developer',
          yearsExperience: 2,
          status: 'completed',
          questions: ['Tell me about yourself', 'What are your strengths?'],
          overallScore: 85,
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
          completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: 2,
          userId,
          jobTitle: 'Backend Engineer',
          yearsExperience: 3,
          status: 'completed',
          questions: ['Tell me about a challenging project', 'How do you handle pressure?'],
          overallScore: 72,
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
          completedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
        {
          id: 3,
          userId,
          jobTitle: 'Full Stack Developer',
          yearsExperience: 4,
          status: 'completed',
          questions: ['Describe your workflow', 'How do you stay updated with technologies?'],
          overallScore: 90,
          createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
          completedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        }
      ];
    }
    
    return interviews;
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return [];
  }
};

// Helper function to calculate interview duration based on creation and completion times
const calculateDuration = (createdAt: string, completedAt?: string): number => {
  if (!completedAt) return 1800; // Default 30 mins
  
  const start = new Date(createdAt).getTime();
  const end = new Date(completedAt).getTime();
  return Math.floor((end - start) / 1000);
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const getScoreColor = (score: number): string => {
  if (score >= 85) return 'text-green-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-red-600';
};

const History: React.FC = () => {
  const { user } = useUser();
  const userId = user?.id || '';

  const { data: interviews = [], isLoading, error } = useQuery({
    queryKey: ['interviews', userId],
    queryFn: () => fetchInterviews(userId),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <PageTransition className="container max-w-5xl py-20">
        <div className="flex justify-center items-center min-h-[50vh]">
          <p className="text-lg text-muted-foreground">Loading interview history...</p>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition className="container max-w-5xl py-20">
        <div className="flex justify-center items-center min-h-[50vh]">
          <p className="text-lg text-red-500">Error loading interview history. Please try again later.</p>
        </div>
      </PageTransition>
    );
  }

  if (interviews.length === 0) {
    return (
      <PageTransition className="container max-w-5xl py-20">
        <div className="flex flex-col justify-center items-center min-h-[50vh] gap-4">
          <h1 className="text-2xl font-bold">No interviews found</h1>
          <p className="text-muted-foreground">
            You haven't completed any interviews yet.
          </p>
          <Button asChild>
            <a href="/interview">Start an Interview</a>
          </Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="container max-w-5xl py-20">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Interview History</h1>
          <p className="text-muted-foreground">
            Review your past interview performances and progress.
          </p>
        </div>
        
        <Separator />
        
        <Tabs defaultValue="table" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="cards">Card View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="table" className="mt-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interviews.map((interview) => (
                    <TableRow key={interview.id}>
                      <TableCell className="font-medium">{interview.jobTitle}</TableCell>
                      <TableCell>{format(new Date(interview.createdAt), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        {formatDuration(calculateDuration(interview.createdAt, interview.completedAt))}
                      </TableCell>
                      <TableCell className={getScoreColor(interview.overallScore || 0)}>
                        {interview.overallScore || 0}%
                      </TableCell>
                      <TableCell>
                        <Badge variant={interview.status === 'completed' ? 'default' : 'outline'}>
                          {interview.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/feedback?id=${interview.id}`}>
                            View Details
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </TabsContent>
          
          <TabsContent value="cards" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {interviews.map((interview) => (
                <Card key={interview.id}>
                  <CardHeader>
                    <CardTitle>{interview.jobTitle}</CardTitle>
                    <CardDescription>
                      {format(new Date(interview.createdAt), 'MMMM dd, yyyy')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {formatDuration(calculateDuration(interview.createdAt, interview.completedAt))}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className={getScoreColor(interview.overallScore || 0)}>
                        Score: <strong>{interview.overallScore || 0}%</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <Badge variant={interview.status === 'completed' ? 'default' : 'outline'}>
                        {interview.status}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`/feedback?id=${interview.id}`}>
                        View Feedback
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
};

export default History;
