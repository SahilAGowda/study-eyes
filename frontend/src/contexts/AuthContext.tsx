import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDefaultRoute } from '../routes';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  token?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (userData: User, redirectTo?: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing auth token on mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setIsAuthenticated(true);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  /**
   * Login user and redirect to appropriate dashboard based on role
   * @param userData - User data including role
   * @param redirectTo - Optional custom redirect path
   */
  const login = (userData: User, redirectTo?: string) => {
    console.log('AuthContext.login - userData received:', userData);
    console.log('AuthContext.login - userData.role:', userData.role);
    
    setIsAuthenticated(true);
    setUser(userData);
    
    // Store token and user data
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', userData.role);

    console.log('AuthContext.login - Stored in localStorage:', {
      user: JSON.parse(localStorage.getItem('user') || '{}'),
      role: localStorage.getItem('role')
    });

    // Redirect based on role or custom path
    const destination = redirectTo || getDefaultRoute(userData.role);
    
    console.log(`User logged in as ${userData.role}, redirecting to ${destination}`);
    navigate(destination, { replace: true });
  };

  /**
   * Logout user and clear session
   */
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    
    // Clear all auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    
    navigate('/login', { replace: true });
  };

  /**
   * Update user data without re-authentication
   */
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};