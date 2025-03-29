// 使用JavaScript版本替代TypeScript
import React from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

// 创建上下文
const AuthContext = React.createContext(null);

// 提供者组件
export function AuthProvider(props) {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

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
  const login = async (username, password) => {
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
  const register = async (username, password, email) => {
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
      {props.children}
    </AuthContext.Provider>
  );
}

// 自定义钩子
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
}

// 为了向后兼容，也导出相同的函数
export default { AuthProvider, useAuth };
