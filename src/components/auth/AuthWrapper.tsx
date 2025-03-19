
import React from 'react';
import { useUser, SignIn, SignUp, SignedIn, SignedOut } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageTransition from '@/components/PageTransition';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <PageTransition>
          <div className="min-h-screen pt-24 pb-12 px-4 max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Sign In to Continue</h1>
              <p className="text-muted-foreground">
                Please sign in or create an account to access your mock interviews
              </p>
            </div>
            <div className="space-y-4">
              <Button 
                onClick={() => navigate('/sign-in')} 
                className="w-full py-6 rounded-xl"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/sign-up')} 
                variant="outline" 
                className="w-full py-6 rounded-xl"
              >
                Create Account
              </Button>
            </div>
          </div>
        </PageTransition>
      </SignedOut>
    </>
  );
};

export default AuthWrapper;
