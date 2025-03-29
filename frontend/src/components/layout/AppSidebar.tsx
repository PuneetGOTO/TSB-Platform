import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  ExperimentOutlined,
  BookOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

interface AppSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const AppSidebar = ({ collapsed, onCollapse }: AppSidebarProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">仪表盘</Link>,
    },
    {
      key: '/battle-sandbox',
      icon: <ThunderboltOutlined />,
      label: <Link to="/battle-sandbox">战争沙盘</Link>,
    },
    {
      key: '/team-management',
      icon: <TeamOutlined />,
      label: <Link to="/team-management">团队管理</Link>,
    },
    {
      key: '/live-streams',
      icon: <GlobalOutlined />,
      label: <Link to="/live-streams">直播中心</Link>,
    },
    {
      key: '/ar-experience',
      icon: <ExperimentOutlined />,
      label: <Link to="/ar-experience">AR体验</Link>,
    },
    {
      key: '/strategy-library',
      icon: <BookOutlined />,
      label: <Link to="/strategy-library">策略库</Link>,
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">设置</Link>,
    },
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={220}
      style={{
        backgroundColor: '#1a1a1a',
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
      }}
      theme="dark"
    >
      <div
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '16px 0',
        }}
      >
        {!collapsed ? (
          <h1 style={{ color: '#1e88e5', margin: 0, fontSize: '18px' }}>
            TSB平台
          </h1>
        ) : (
          <h1 style={{ color: '#1e88e5', margin: 0, fontSize: '20px' }}>TSB</h1>
        )}
      </div>
      <Menu
        theme="dark"
        defaultSelectedKeys={['/']}
        selectedKeys={[currentPath]}
        mode="inline"
        items={menuItems}
        style={{ backgroundColor: '#1a1a1a' }}
      />
    </Sider>
  );
};

export default AppSidebar;
