import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (googleToken: string) => Promise<void>;
  adminLogin: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('fk_token');
    const savedUser = localStorage.getItem('fk_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (googleToken: string) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token: googleToken }),
    });
    
    if (!res.ok) throw new Error('Login failed');
    
    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('fk_token', data.token);
    localStorage.setItem('fk_user', JSON.stringify(data.user));
  };

  const adminLogin = (user: User, token: string) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('fk_token', token);
    localStorage.setItem('fk_user', JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('fk_token');
    localStorage.removeItem('fk_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, adminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
