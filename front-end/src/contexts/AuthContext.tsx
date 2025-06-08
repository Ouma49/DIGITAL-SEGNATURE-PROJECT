
import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthState, LoginCredentials, RegisterCredentials, User } from '@/types/auth';
import { toast } from 'sonner';
import { authService } from '@/services/auth/authService';

interface AuthContextProps {
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have a token
        const token = localStorage.getItem('token');
        if (token) {
          // Verify token with backend
          try {
            const tokenCheck = await authService.checkToken();
            if (tokenCheck.data?.valid) {
              // Get user info
              const userResponse = await authService.getCurrentUser();
              if (userResponse.data) {
                const user: User = {
                  id: userResponse.data.id || '',
                  email: userResponse.data.email,
                  name: userResponse.data.fullName,
                  createdAt: new Date().toISOString(),
                };
                
                setAuthState({
                  user,
                  isAuthenticated: true,
                  isLoading: false,
                });
              } else {
                // Token valid but couldn't get user info
                authService.logout();
                setAuthState({ user: null, isAuthenticated: false, isLoading: false });
              }
            } else {
              // Invalid token
              authService.logout();
              setAuthState({ user: null, isAuthenticated: false, isLoading: false });
            }
          } catch (error) {
            console.error('Token validation error:', error);
            authService.logout();
            setAuthState({ user: null, isAuthenticated: false, isLoading: false });
          }
        } else {
          setAuthState({ user: null, isAuthenticated: false, isLoading: false });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    };

    checkAuth();
  }, []);

  // Use the real API service
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const response = await authService.login({
        email: credentials.email,
        password: credentials.password
      });
      
      if (response.status === 'success' && response.token && response.userInfo) {
        const user: User = {
          id: response.userInfo.id || '',
          email: response.userInfo.email,
          name: response.userInfo.fullName,
          createdAt: new Date().toISOString(),
        };
        
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        
        toast.success('Welcome back!');
        return true;
      }
      
      toast.error('Login failed');
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      return false;
    }
  };

  // Use the real API service
  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    try {
      const response = await authService.register({
        name: credentials.name,
        email: credentials.email,
        password: credentials.password
      });
      
      if (response.status === 'success') {
        // After registration, log the user in
        return await login({
          email: credentials.email,
          password: credentials.password
        });
      }
      
      toast.error('Registration failed');
      return false;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        register,
        logout,
      }}
    >
      {children}
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
