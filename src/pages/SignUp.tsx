
import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import PageTransition from '@/components/PageTransition';

const SignUpPage = () => {
  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-12 px-4 flex justify-center">
        <SignUp 
          routing="path" 
          path="/sign-up" 
          signInUrl="/sign-in"
          appearance={{
            elements: {
              rootBox: "mx-auto w-full max-w-md",
              card: "rounded-xl shadow-lg",
              headerTitle: "text-2xl font-bold",
              headerSubtitle: "text-muted-foreground",
              formButtonPrimary: "bg-primary hover:bg-primary/90 text-white rounded-lg",
            }
          }}
        />
      </div>
    </PageTransition>
  );
};

export default SignUpPage;
