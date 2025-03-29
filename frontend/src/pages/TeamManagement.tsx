import React, { useState } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, Space, Typography, Tooltip, Tag } from 'antd';
import { UserOutlined, TeamOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Option } = Select;

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  joinDate: string;
  status: 'active' | 'inactive';
  teamId: string;
}

interface Team {
  id: string;
  name: string;
  leader: string;
  memberCount: number;
  region: string;
  focus: string[];
}

const TeamManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'teams' | 'members'>('teams');
  const [addTeamVisible, setAddTeamVisible] = useState(false);
  const [addMemberVisible, setAddMemberVisible] = useState(false);
  const [teamForm] = Form.useForm();
  const [memberForm] = Form.useForm();

  // 示例数据
  const teams: Team[] = [
    { id: '1', name: 'Alpha Team', leader: '李明', memberCount: 8, region: '华东', focus: ['赛事宣传', '战术分析'] },
    { id: '2', name: 'Bravo Squad', leader: '王静', memberCount: 6, region: '华北', focus: ['社区管理', 'AR体验'] },
    { id: '3', name: 'Charlie Group', leader: '张伟', memberCount: 10, region: '华南', focus: ['内容创作', '直播'] },
    { id: '4', name: 'Delta Force', leader: '刘洋', memberCount: 5, region: '西北', focus: ['赛事组织', '战术研发'] },
  ];

  const members: TeamMember[] = [
    { id: '101', name: '李明', role: '团队领导', email: 'liming@example.com', joinDate: '2023-03-15', status: 'active', teamId: '1' },
    { id: '102', name: '王静', role: '战术分析师', email: 'wangjing@example.com', joinDate: '2023-04-20', status: 'active', teamId: '2' },
    { id: '103', name: '张伟', role: '内容创作者', email: 'zhangwei@example.com', joinDate: '2023-02-10', status: 'active', teamId: '3' },
    { id: '104', name: '刘洋', role: '赛事组织者', email: 'liuyang@example.com', joinDate: '2023-05-01', status: 'active', teamId: '4' },
    { id: '105', name: '赵芳', role: 'AR设计师', email: 'zhaofang@example.com', joinDate: '2023-06-12', status: 'inactive', teamId: '2' },
  ];

  // 团队表格列定义
  const teamColumns = [
    {
      title: '团队名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '团队领导',
      dataIndex: 'leader',
      key: 'leader',
    },
    {
      title: '成员数量',
      dataIndex: 'memberCount',
      key: 'memberCount',
    },
    {
      title: '区域',
      dataIndex: 'region',
      key: 'region',
    },
    {
      title: '专注领域',
      dataIndex: 'focus',
      key: 'focus',
      render: (tags: string[]) => (
        <>
          {tags.map(tag => (
            <Tag color="blue" key={tag}>
              {tag}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: Team) => (
        <Space size="middle">
          <Tooltip title="编辑团队">
            <Button type="text" icon={<EditOutlined />} />
          </Tooltip>
          <Tooltip title="删除团队">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 成员表格列定义
  const memberColumns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: '电子邮件',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '加入日期',
      dataIndex: 'joinDate',
      key: 'joinDate',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '活跃' : '非活跃'}
        </Tag>
      ),
    },
    {
      title: '团队',
      dataIndex: 'teamId',
      key: 'teamId',
      render: (teamId: string) => {
        const team = teams.find(t => t.id === teamId);
        return team ? team.name : '未分配';
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: TeamMember) => (
        <Space size="middle">
          <Tooltip title="编辑成员">
            <Button type="text" icon={<EditOutlined />} />
          </Tooltip>
          <Tooltip title="删除成员">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 添加团队表单提交
  const handleAddTeam = (values: any) => {
    console.log('添加团队:', values);
    setAddTeamVisible(false);
    teamForm.resetFields();
  };

  // 添加成员表单提交
  const handleAddMember = (values: any) => {
    console.log('添加成员:', values);
    setAddMemberVisible(false);
    memberForm.resetFields();
  };

  return (
    <div className="team-management">
      <Title level={2}>团队管理</Title>
      <Paragraph>管理宣传团队的成员和团队结构。</Paragraph>

      <Card
        style={{ marginBottom: 24 }}
        tabList={[
          {
            key: 'teams',
            tab: (
              <span>
                <TeamOutlined /> 团队
              </span>
            ),
          },
          {
            key: 'members',
            tab: (
              <span>
                <UserOutlined /> 成员
              </span>
            ),
          },
        ]}
        activeTabKey={activeTab}
        onTabChange={(key) => setActiveTab(key as 'teams' | 'members')}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => activeTab === 'teams' ? setAddTeamVisible(true) : setAddMemberVisible(true)}
          >
            添加{activeTab === 'teams' ? '团队' : '成员'}
          </Button>
        }
      >
        {activeTab === 'teams' ? (
          <Table columns={teamColumns} dataSource={teams} rowKey="id" />
        ) : (
          <Table columns={memberColumns} dataSource={members} rowKey="id" />
        )}
      </Card>

      {/* 添加团队模态框 */}
      <Modal
        title="添加新团队"
        visible={addTeamVisible}
        onCancel={() => setAddTeamVisible(false)}
        footer={null}
      >
        <Form
          form={teamForm}
          layout="vertical"
          onFinish={handleAddTeam}
        >
          <Form.Item
            name="name"
            label="团队名称"
            rules={[{ required: true, message: '请输入团队名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="leader"
            label="团队领导"
            rules={[{ required: true, message: '请输入团队领导' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="region"
            label="区域"
            rules={[{ required: true, message: '请选择区域' }]}
          >
            <Select>
              <Option value="华东">华东</Option>
              <Option value="华北">华北</Option>
              <Option value="华南">华南</Option>
              <Option value="西北">西北</Option>
              <Option value="西南">西南</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="focus"
            label="专注领域"
            rules={[{ required: true, message: '请选择专注领域' }]}
          >
            <Select mode="multiple">
              <Option value="赛事宣传">赛事宣传</Option>
              <Option value="战术分析">战术分析</Option>
              <Option value="社区管理">社区管理</Option>
              <Option value="AR体验">AR体验</Option>
              <Option value="内容创作">内容创作</Option>
              <Option value="直播">直播</Option>
              <Option value="赛事组织">赛事组织</Option>
              <Option value="战术研发">战术研发</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              创建团队
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加成员模态框 */}
      <Modal
        title="添加新成员"
        visible={addMemberVisible}
        onCancel={() => setAddMemberVisible(false)}
        footer={null}
      >
        <Form
          form={memberForm}
          layout="vertical"
          onFinish={handleAddMember}
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请输入角色' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="电子邮件"
            rules={[
              { required: true, message: '请输入电子邮件' },
              { type: 'email', message: '请输入有效的电子邮件地址' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="teamId"
            label="所属团队"
            rules={[{ required: true, message: '请选择所属团队' }]}
          >
            <Select>
              {teams.map(team => (
                <Option key={team.id} value={team.id}>{team.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            initialValue="active"
          >
            <Select>
              <Option value="active">活跃</Option>
              <Option value="inactive">非活跃</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              添加成员
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeamManagement;
