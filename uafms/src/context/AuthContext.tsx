'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'admin' | 'university_partner';
  profileCompleted: boolean;
  universityId?: {
    _id: string;
    name: string;
    logo?: string;
  } | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();


  useEffect(() => {
    const validateSession = async () => {
      const savedToken = localStorage.getItem('uafms_token');
      const savedUser = localStorage.getItem('uafms_user');

      if (!savedToken || !savedUser) {
        setIsLoading(false);
        return;
      }

      try {

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mec-backend-9uu9.onrender.com/api';
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setToken(savedToken);

          localStorage.setItem('uafms_user', JSON.stringify(userData));
        } else if (response.status === 401 || response.status === 403) {

          console.warn('Session expired. Please log in again.');
          localStorage.removeItem('uafms_token');
          localStorage.removeItem('uafms_user');
          setUser(null);
          setToken(null);
        } else {

          console.log(`📡 Server error ${response.status}, using cached session.`);
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setToken(savedToken);
        }
      } catch (err) {

        console.warn('📡 Network error during validation, using cached session.');
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, []);

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('uafms_user', JSON.stringify(userData));
    localStorage.setItem('uafms_token', authToken);


    if (userData.role === 'admin') {
      router.push('/admin');
    } else if (userData.role === 'university_partner') {
      router.push('/university');
    } else {
      router.push('/student');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('uafms_user');
    localStorage.removeItem('uafms_token');
    router.push('/login');
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem('uafms_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
