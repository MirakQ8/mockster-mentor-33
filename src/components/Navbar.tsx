
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useUser, UserButton } from '@clerk/clerk-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, Home, FileUp, Video, MessageSquare, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, isSignedIn } = useUser();
  const isMobile = useIsMobile();
  
  const navItems = [
    { path: '/', label: 'Home', icon: <Home className="h-4 w-4 mr-1" /> },
    { path: '/upload', label: 'Upload CV', icon: <FileUp className="h-4 w-4 mr-1" /> },
    { path: '/interview', label: 'Interview', icon: <Video className="h-4 w-4 mr-1" /> },
    { path: '/feedback', label: 'Feedback', icon: <MessageSquare className="h-4 w-4 mr-1" /> },
    { path: '/analysis', label: 'CV Analysis', icon: <FileText className="h-4 w-4 mr-1" /> },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div 
        className="mx-auto my-4 max-w-5xl px-4 sm:px-6 lg:px-8"
        style={{
          background: "linear-gradient(90deg, rgba(238,174,202,0.3) 0%, rgba(148,187,233,0.3) 100%)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderRadius: "1rem",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          border: "1px solid rgba(255, 255, 255, 0.18)"
        }}
      >
        <div className="flex h-16 items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2"
          >
            <div className="bg-gradient-to-r from-primary to-blue-500 text-transparent bg-clip-text">
              <span className="font-bold text-2xl">Mock</span>
              <span className="font-extrabold text-2xl">ster</span>
            </div>
          </Link>
          
          {isMobile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {navItems.map((item) => (
                  <DropdownMenuItem key={item.path} asChild>
                    <Link to={item.path} className="flex items-center">
                      {item.icon}
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <nav className="flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                
                return (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    className={cn(
                      "relative px-3 py-2 text-sm font-medium rounded-full transition-colors flex items-center",
                      isActive 
                        ? "text-white" 
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute inset-0 bg-gradient-to-r from-primary to-blue-500 rounded-full -z-10"
                        transition={{ type: "spring", duration: 0.5 }}
                      />
                    )}
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
          
          {isSignedIn && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden md:block font-medium">
                {user?.primaryEmailAddress?.emailAddress}
              </span>
              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-9 h-9"
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
