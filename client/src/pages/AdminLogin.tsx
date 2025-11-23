import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
  const { login, isLoggedIn } = useAdmin();
  const [_, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      setLocation('/admin-dashboard');
    }
  }, [isLoggedIn, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = login(username, password);
      if (!success) {
        setError('Invalid username or password');
      } else {
        // Redirect on success
        setLocation('/admin-dashboard');
      }
    } catch (err) {
      setError('Login failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/20">
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center gap-2 sm:gap-3">
            <Lock className="h-5 w-5 sm:h-6 sm:w-6" />
            <CardTitle className="text-lg sm:text-xl">Admin Login</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4 sm:pt-6">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {error && (
              <Alert className="bg-red-50 border-red-200 text-sm sm:text-base">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">Username</label>
              <Input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="bg-background text-sm sm:text-base"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="bg-background text-sm sm:text-base"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-sm sm:text-base py-2 sm:py-2.5"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
