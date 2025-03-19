
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useUser, UserButton } from '@clerk/clerk-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, isSignedIn } = useUser();
  
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/upload', label: 'Upload CV' },
    { path: '/interview', label: 'Interview' },
    { path: '/feedback', label: 'Feedback' },
    { path: '/analysis', label: 'CV Analysis' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="glass mx-auto my-4 rounded-full max-w-3xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold text-lg">
          <span className="text-primary">Mock</span>ster
        </Link>
        
        <nav className="flex space-x-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={cn(
                  "relative px-3 py-1.5 text-sm font-medium rounded-full transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 bg-secondary rounded-full -z-10"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        {isSignedIn && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.primaryEmailAddress?.emailAddress}
            </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
