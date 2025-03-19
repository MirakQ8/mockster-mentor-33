
import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import PageTransition from '@/components/PageTransition';

const SignInPage = () => {
  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-12 px-4 flex justify-center">
        <SignIn 
          routing="path" 
          path="/sign-in"
          signUpUrl="/sign-up"
          redirectUrl="/"
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

export default SignInPage;
