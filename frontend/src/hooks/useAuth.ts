// 简化版本的身份验证钩子
import React from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, password: string, email: string) => Promise<void>;
}

// 创建上下文
const AuthContext = React.createContext<AuthContextType | null>(null);

// 提供者组件
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // 检查用户是否已登录
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setLoading(true);
      axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setUser(response.data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  // 登录函数
  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { username, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
    } catch (err) {
      setError('登录失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 登出函数
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // 注册函数
  const register = async (username: string, password: string, email: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, { username, password, email });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
    } catch (err) {
      setError('注册失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 返回提供者
  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

// 自定义钩子
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
}
