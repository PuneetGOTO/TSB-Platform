import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, Alert, Row, Col, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, KeyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const { Title, Paragraph } = Typography;

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresHardwareKey, setRequiresHardwareKey] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError(null);
    
    try {
      await login(values.email, values.password, values.hardwareKey);
      navigate('/');
    } catch (err: any) {
      if (err.message === 'Hardware key required') {
        setRequiresHardwareKey(true);
        setError('需要硬件密钥进行验证，请输入您的硬件密钥。');
      } else {
        setError('登录失败，请检查您的邮箱和密码是否正确。');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Col xs={22} sm={16} md={12} lg={8} xl={6}>
        <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <img src="/logo.png" alt="TSB Platform" style={{ height: 64, marginBottom: 16 }} />
            <Title level={3}>宣传团队平台</Title>
            <Paragraph type="secondary">登录以访问团队资源和工具</Paragraph>
          </div>
          
          {error && (
            <Alert 
              message={error} 
              type="error" 
              showIcon 
              style={{ marginBottom: 24 }} 
            />
          )}
          
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={handleSubmit}
            size="large"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入您的邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="邮箱" 
              />
            </Form.Item>
            
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入您的密码' }]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="密码" 
              />
            </Form.Item>
            
            {requiresHardwareKey && (
              <Form.Item
                name="hardwareKey"
                rules={[{ required: true, message: '请输入硬件密钥' }]}
              >
                <Input 
                  prefix={<KeyOutlined />} 
                  placeholder="硬件密钥" 
                />
              </Form.Item>
            )}
            
            <Form.Item>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              
              <a 
                style={{ float: 'right' }} 
                href="/forgot-password"
                onClick={(e) => { e.preventDefault(); alert('重置密码功能暂未实现'); }}
              >
                忘记密码
              </a>
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
              >
                登录
              </Button>
            </Form.Item>
            
            <Divider>
              <span style={{ color: '#999', fontWeight: 'normal', fontSize: 14 }}>或</span>
            </Divider>
            
            <Form.Item>
              <Button 
                block 
                onClick={() => { alert('注册功能暂未实现'); }}
              >
                注册新账号
              </Button>
            </Form.Item>
          </Form>
        </Card>
        
        <div style={{ textAlign: 'center', margin: '24px 0' }}>
          <p style={{ color: '#999' }}>宣传团队平台 © {new Date().getFullYear()}</p>
        </div>
      </Col>
    </Row>
  );
};

export default Login;
