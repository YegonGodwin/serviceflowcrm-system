import { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'client' | 'employee';
  token: string;
  phone?: string;
  address?: string;
  companyName?: string;
  department?: string;
  position?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('serviceflow_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('serviceflow_user', JSON.stringify(userData));
    
    // Navigate based on role
    if (userData.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (userData.role === 'client') {
      navigate('/client/dashboard');
    } else if (userData.role === 'employee') {
      navigate('/employee/dashboard');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('serviceflow_user');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
