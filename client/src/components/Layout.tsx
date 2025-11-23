import React from 'react';
import { useApp } from '../context/AppContext';
import { useAdmin } from '../context/AdminContext';
import { Link, useLocation } from 'wouter';
import { Moon, Sun, Globe, Lock, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t, language, setLanguage, theme, toggleTheme } = useApp();
  const { isLoggedIn, logout } = useAdmin();
  const [_, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans transition-colors duration-300">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
        <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src="/DMT_Department_of_Motor_Traffic_1200px_23_02_12-removebg-preview_1763897823261.png" 
              alt="DMT Logo" 
              className="h-12 w-auto bg-white rounded-full p-1"
            />
            <div>
              <h1 className="text-lg md:text-xl font-bold leading-tight">{t.header.title}</h1>
              <p className="text-xs md:text-sm opacity-90">{t.header.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLoggedIn && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation('/admin-dashboard')}
                  className="text-primary-foreground hover:bg-primary/80 text-xs md:text-sm"
                >
                  Admin
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    logout();
                    setLocation('/');
                  }}
                  className="text-primary-foreground hover:bg-primary/80 hover:text-white"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            )}
            {!isLoggedIn && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation('/admin-login')}
                className="text-primary-foreground hover:bg-primary/80 hover:text-white"
                title="Admin Login"
              >
                <Lock className="h-5 w-5" />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80 hover:text-white">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('en')}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('si')}>සිංහල</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('ta')}>தமிழ்</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="text-primary-foreground hover:bg-primary/80 hover:text-white"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full px-2 sm:px-3 md:px-4 lg:px-6 py-6 sm:py-8 md:py-10 animate-in fade-in duration-500">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full bg-muted py-6 text-center text-sm text-muted-foreground mt-auto">
        <p>&copy; {new Date().getFullYear()} Department of Motor Traffic. All rights reserved.</p>
      </footer>
    </div>
  );
}
