
import React from 'react';
import InterviewHistory from '@/components/InterviewHistory';
import PageTransition from '@/components/PageTransition';

const InterviewHistoryPage: React.FC = () => {
  return (
    <PageTransition>
      <div className="pt-24 pb-16">
        <InterviewHistory />
      </div>
    </PageTransition>
  );
};

export default InterviewHistoryPage;
