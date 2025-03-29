import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import AppHeader from './components/layout/AppHeader';
import AppSidebar from './components/layout/AppSidebar';
import Dashboard from './pages/Dashboard';
import BattleSandbox from './pages/BattleSandbox';
import TeamManagement from './pages/TeamManagement';
import LiveStreams from './pages/LiveStreams';
import ARExperience from './pages/ARExperience';
import StrategyLibrary from './pages/StrategyLibrary';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { useAuth } from './hooks/useAuth';
import './App.css';

const { Content } = Layout;

function App() {
  const { isAuthenticated, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>加载中...</p>
      </div>
    );
  }

  // Authentication routes
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppSidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout>
        <AppHeader />
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/battle-sandbox" element={<BattleSandbox />} />
            <Route path="/team-management" element={<TeamManagement />} />
            <Route path="/live-streams" element={<LiveStreams />} />
            <Route path="/ar-experience" element={<ARExperience />} />
            <Route path="/strategy-library" element={<StrategyLibrary />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
