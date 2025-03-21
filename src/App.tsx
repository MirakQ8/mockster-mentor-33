
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ClerkProvider } from "@clerk/clerk-react";
import { Navbar } from '@/components';
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import Interview from "./pages/Interview";
import Feedback from "./pages/Feedback";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AuthWrapper from "./components/auth/AuthWrapper";
import CVAnalysis from "./pages/CVAnalysis";
import History from "./pages/History";

// Clerk publishable key
const CLERK_PUBLISHABLE_KEY = "pk_test_c291bmQtc3R1cmdlb24tMzIuY2xlcmsuYWNjb3VudHMuZGV2JA";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}
      clerkJSVersion="5.56.0-snapshot.v20250312225817"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" closeButton />
        <BrowserRouter>
          <Navbar />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/sign-in/*" element={<SignIn />} />
              <Route path="/sign-up/*" element={<SignUp />} />
              <Route path="/upload" element={
                <AuthWrapper>
                  <Upload />
                </AuthWrapper>
              } />
              <Route path="/interview" element={
                <AuthWrapper>
                  <Interview />
                </AuthWrapper>
              } />
              <Route path="/feedback" element={
                <AuthWrapper>
                  <Feedback />
                </AuthWrapper>
              } />
              <Route path="/analysis" element={
                <AuthWrapper>
                  <CVAnalysis />
                </AuthWrapper>
              } />
              <Route path="/history" element={
                <AuthWrapper>
                  <History />
                </AuthWrapper>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </TooltipProvider>
    </ClerkProvider>
  </QueryClientProvider>
);

export default App;
