import React, { useState } from 'react';
import { Card, Tabs, Form, Input, Button, Switch, Select, Radio, Divider, Upload, message, Typography, Row, Col, Checkbox } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  BellOutlined, 
  SafetyOutlined, 
  UploadOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [profileForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [appearanceForm] = Form.useForm();
  
  // 初始化表单值
  useState(() => {
    if (user) {
      profileForm.setFieldsValue({
        name: user.name || '',
        email: user.email,
        role: user.role,
        teamId: user.teamId || '',
      });
    }
  });

  // 提交个人资料表单
  const handleProfileSubmit = (values: any) => {
    console.log('更新个人资料:', values);
    message.success('个人资料已更新');
  };

  // 提交安全设置表单
  const handleSecuritySubmit = (values: any) => {
    console.log('更新安全设置:', values);
    message.success('安全设置已更新');
  };

  // 提交通知设置表单
  const handleNotificationSubmit = (values: any) => {
    console.log('更新通知设置:', values);
    message.success('通知设置已更新');
  };

  // 提交外观设置表单
  const handleAppearanceSubmit = (values: any) => {
    console.log('更新外观设置:', values);
    message.success('外观设置已更新');
  };

  return (
    <div className="settings">
      <Title level={2}>设置</Title>
      <Paragraph>管理您的账户设置和偏好。</Paragraph>

      <Card>
        <Tabs defaultActiveKey="profile">
          <TabPane 
            tab={
              <span>
                <UserOutlined />
                个人资料
              </span>
            } 
            key="profile"
          >
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleProfileSubmit}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="avatar"
                    label="头像"
                  >
                    <Upload
                      name="avatar"
                      listType="picture-card"
                      showUploadList={false}
                      action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                    >
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>上传</div>
                      </div>
                    </Upload>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="姓名"
                    rules={[{ required: true, message: '请输入您的姓名' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="email"
                label="电子邮件"
                rules={[
                  { required: true, message: '请输入您的电子邮件' },
                  { type: 'email', message: '请输入有效的电子邮件地址' }
                ]}
              >
                <Input disabled />
              </Form.Item>

              <Form.Item
                name="role"
                label="角色"
              >
                <Input disabled />
              </Form.Item>

              <Form.Item
                name="teamId"
                label="团队"
              >
                <Select disabled>
                  <Option value="team1">Alpha Team</Option>
                  <Option value="team2">Bravo Squad</Option>
                  <Option value="team3">Charlie Group</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="bio"
                label="个人简介"
              >
                <Input.TextArea rows={4} placeholder="请简要介绍自己..." />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  保存个人资料
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <LockOutlined />
                安全设置
              </span>
            } 
            key="security"
          >
            <Form
              form={securityForm}
              layout="vertical"
              onFinish={handleSecuritySubmit}
            >
              <Form.Item
                name="currentPassword"
                label="当前密码"
                rules={[{ required: true, message: '请输入当前密码' }]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="新密码"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 8, message: '密码长度至少为8个字符' }
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="确认新密码"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请确认新密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不匹配'));
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Divider />

              <Form.Item
                name="twoFactor"
                label="双因素认证"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="hardwareKey"
                label="硬件密钥"
              >
                <div>
                  <p>硬件密钥可以提供额外的安全保障。</p>
                  <Button icon={<SafetyOutlined />}>
                    管理硬件密钥
                  </Button>
                </div>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  保存安全设置
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <BellOutlined />
                通知设置
              </span>
            } 
            key="notifications"
          >
            <Form
              form={notificationForm}
              layout="vertical"
              onFinish={handleNotificationSubmit}
            >
              <Form.Item
                name="emailNotifications"
                label="电子邮件通知"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="notificationTypes"
                label="通知类型"
                initialValue={['updates', 'team', 'schedule']}
              >
                <Checkbox.Group>
                  <Row>
                    <Col span={8}>
                      <Checkbox value="updates">平台更新</Checkbox>
                    </Col>
                    <Col span={8}>
                      <Checkbox value="team">团队活动</Checkbox>
                    </Col>
                    <Col span={8}>
                      <Checkbox value="schedule">赛程变更</Checkbox>
                    </Col>
                    <Col span={8}>
                      <Checkbox value="strategy">战术讨论</Checkbox>
                    </Col>
                    <Col span={8}>
                      <Checkbox value="comments">评论与回复</Checkbox>
                    </Col>
                    <Col span={8}>
                      <Checkbox value="mentions">提及我的</Checkbox>
                    </Col>
                  </Row>
                </Checkbox.Group>
              </Form.Item>

              <Form.Item
                name="notificationFrequency"
                label="通知频率"
                initialValue="immediate"
              >
                <Radio.Group>
                  <Radio value="immediate">实时</Radio>
                  <Radio value="daily">每日摘要</Radio>
                  <Radio value="weekly">每周摘要</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  保存通知设置
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <GlobalOutlined />
                外观设置
              </span>
            } 
            key="appearance"
          >
            <Form
              form={appearanceForm}
              layout="vertical"
              onFinish={handleAppearanceSubmit}
            >
              <Form.Item
                name="theme"
                label="主题"
                initialValue="light"
              >
                <Radio.Group>
                  <Radio value="light">浅色</Radio>
                  <Radio value="dark">深色</Radio>
                  <Radio value="system">跟随系统</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="language"
                label="语言"
                initialValue="zh-CN"
              >
                <Select>
                  <Option value="zh-CN">中文（简体）</Option>
                  <Option value="en-US">English</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="compactMode"
                label="紧凑模式"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="animationEnabled"
                label="启用动画"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  保存外观设置
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Settings;
