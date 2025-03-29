import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Badge, Space, Typography } from 'antd';
import { BellOutlined, SettingOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';

const { Header } = Layout;
const { Text } = Typography;

const AppHeader = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(3); // Example notification count

  const userMenu = (
    <Menu items={[
      {
        key: '1',
        icon: <UserOutlined />,
        label: '个人资料',
      },
      {
        key: '2',
        icon: <SettingOutlined />,
        label: '设置',
      },
      {
        type: 'divider',
      },
      {
        key: '3',
        icon: <LogoutOutlined />,
        label: '登出',
        onClick: logout,
      },
    ]} />
  );

  const notificationMenu = (
    <Menu
      items={[
        {
          key: '1',
          label: (
            <div>
              <p><strong>战术更新</strong></p>
              <p>A队已完成资源转移任务</p>
              <Text type="secondary">10分钟前</Text>
            </div>
          ),
        },
        {
          key: '2',
          label: (
            <div>
              <p><strong>直播通知</strong></p>
              <p>团队Alpha开始了直播</p>
              <Text type="secondary">30分钟前</Text>
            </div>
          ),
        },
        {
          key: '3',
          label: (
            <div>
              <p><strong>系统警告</strong></p>
              <p>检测到异常登录尝试</p>
              <Text type="secondary">1小时前</Text>
            </div>
          ),
        },
      ]}
    />
  );

  return (
    <Header 
      style={{ 
        padding: '0 24px', 
        background: '#1e1e1e', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        height: '64px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <div className="logo" style={{ color: '#1e88e5', fontWeight: 'bold', fontSize: '18px' }}>
        TSB 宣传平台
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Space size={16}>
          <Dropdown overlay={notificationMenu} trigger={['click']} placement="bottomRight">
            <Badge count={notifications} size="small">
              <Button type="text" icon={<BellOutlined style={{ fontSize: '18px', color: '#fff' }} />} />
            </Badge>
          </Dropdown>
          
          <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Avatar style={{ backgroundColor: '#1e88e5' }} icon={<UserOutlined />} />
              <span style={{ marginLeft: 8, color: '#fff' }}>
                {user?.name || '用户'}
              </span>
            </div>
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
};

export default AppHeader;
