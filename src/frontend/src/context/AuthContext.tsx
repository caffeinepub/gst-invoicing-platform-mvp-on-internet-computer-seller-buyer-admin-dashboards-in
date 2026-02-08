import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { isTokenExpired, getTokenExpirationTime } from '../utils/jwt';

interface User {
  email: string;
  fullName?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      if (isTokenExpired(storedToken)) {
        logout();
      } else {
        try {
          const parsedUser = JSON.parse(storedUser) as User;
          setToken(storedToken);
          setUser(parsedUser);
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          logout();
        }
      }
    }

    setIsInitialized(true);
  }, [logout]);

  // Set up auto-logout on token expiry
  useEffect(() => {
    if (!token || !isInitialized) {
      return;
    }

    const expirationTime = getTokenExpirationTime(token);
    if (!expirationTime) {
      return;
    }

    const timeUntilExpiry = expirationTime - Date.now();
    if (timeUntilExpiry <= 0) {
      logout();
      return;
    }

    const timeoutId = setTimeout(() => {
      logout();
    }, timeUntilExpiry);

    return () => clearTimeout(timeoutId);
  }, [token, isInitialized, logout]);

  const value: AuthContextType = {
    token,
    user,
    isAuthenticated: !!token && !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
