import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminContextType {
  isLoggedIn: boolean;
  adminUsername: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState<string | null>(null);

  // Check localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dmt_admin_token');
    if (saved) {
      setIsLoggedIn(true);
      setAdminUsername('admin');
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    // Hardcoded credentials
    if (username === 'admin' && password === '123') {
      setIsLoggedIn(true);
      setAdminUsername(username);
      localStorage.setItem('dmt_admin_token', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setAdminUsername(null);
    localStorage.removeItem('dmt_admin_token');
  };

  return (
    <AdminContext.Provider value={{ isLoggedIn, adminUsername, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
