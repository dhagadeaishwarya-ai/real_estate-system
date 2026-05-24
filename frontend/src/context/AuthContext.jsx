import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate active token on boot
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profileData = await authAPI.getProfile();
          setUser(profileData);
        } catch (error) {
          console.error('Session verification failed. Logging out...', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authAPI.login(email, password);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed. Please try again.';
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const data = await authAPI.register(name, email, password, role);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed.';
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isAgent: user?.role === 'agent',
    isSeller: user?.role === 'seller',
    isBuyer: user?.role === 'buyer'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
