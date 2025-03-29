import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name?: string;
  teamId?: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, hardwareKey?: string) => Promise<void>;
  register: (email: string, password: string, name: string, teamId?: string) => Promise<void>;
  logout: () => void;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component (to be used in App.tsx)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        // Set default axios auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify token with backend
        const response = await axios.get('/api/auth/verify');
        
        if (response.data.valid) {
          setIsAuthenticated(true);
          setUser(response.data.user);
        } else {
          // If token is invalid, remove it
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      } catch (err) {
        // If verification fails, remove token
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setError('Session expired. Please login again.');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string, hardwareKey?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password,
        hardwareKey
      });
      
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set default axios auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setIsAuthenticated(true);
      setUser(user);
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data.error || 'Login failed');
        
        // Handle hardware key requirement
        if (err.response.data.requiresHardwareKey) {
          throw new Error('Hardware key required');
        }
      } else {
        setError('Network error. Please try again.');
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string, teamId?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/auth/register', {
        email,
        password,
        name,
        teamId
      });
      
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set default axios auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setIsAuthenticated(true);
      setUser(user);
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data.error || 'Registration failed');
      } else {
        setError('Network error. Please try again.');
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove default axios auth header
    delete axios.defaults.headers.common['Authorization'];
    
    // Update state
    setIsAuthenticated(false);
    setUser(null);
    
    // Call logout endpoint (optional)
    axios.post('/api/auth/logout').catch(() => {
      // Silent fail - we don't care if this fails
    });
  };

  // Auth context value
  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
