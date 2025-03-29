import React, { useState } from 'react';
import { Card, Row, Col, Button, List, Typography, Tag, Tabs, Space, Input, Select, Modal, Form, Rate, Avatar, Statistic } from 'antd';
import { 
  BookOutlined, 
  FileAddOutlined, 
  FilterOutlined, 
  StarOutlined, 
  EyeOutlined, 
  LikeOutlined,
  ShareAltOutlined,
  DownloadOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

interface Strategy {
  id: string;
  title: string;
  description: string;
  author: string;
  authorAvatar: string;
  creationDate: string;
  lastUpdated: string;
  tags: string[];
  category: string;
  rating: number;
  views: number;
  likes: number;
  thumbnail: string;
  status: 'public' | 'team-only' | 'private';
  success?: number; // 成功率
}

const StrategyLibrary: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [strategyForm] = Form.useForm();

  // 示例数据
  const strategies: Strategy[] = [
    {
      id: '1',
      title: '速攻战术：闪电突袭',
      description: '利用快速移动和突然袭击，在对手反应前取得优势。包含详细的队伍分工和时间节点。',
      author: '李明',
      authorAvatar: 'https://via.placeholder.com/32',
      creationDate: '2025-02-10',
      lastUpdated: '2025-03-15',
      tags: ['速攻', '突袭', '团队配合'],
      category: '进攻',
      rating: 4.8,
      views: 352,
      likes: 86,
      thumbnail: 'https://via.placeholder.com/300x180',
      status: 'public',
      success: 78
    },
    {
      id: '2',
      title: '铁壁防守：固若金汤',
      description: '构建坚实防线，利用地形和协同防守反击敌方进攻。适合劣势局面使用。',
      author: '王静',
      authorAvatar: 'https://via.placeholder.com/32',
      creationDate: '2025-02-18',
      lastUpdated: '2025-03-20',
      tags: ['防守', '反击', '资源控制'],
      category: '防守',
      rating: 4.6,
      views: 287,
      likes: 72,
      thumbnail: 'https://via.placeholder.com/300x180',
      status: 'public',
      success: 82
    },
    {
      id: '3',
      title: '资源控制：物资争夺',
      description: '通过控制关键资源点，逐步积累优势，最终压制对手。适合长期对抗。',
      author: '张伟',
      authorAvatar: 'https://via.placeholder.com/32',
      creationDate: '2025-03-01',
      lastUpdated: '2025-03-25',
      tags: ['资源控制', '地图掌控', '持久战'],
      category: '控制',
      rating: 4.5,
      views: 215,
      likes: 58,
      thumbnail: 'https://via.placeholder.com/300x180',
      status: 'team-only'
    },
    {
      id: '4',
      title: '游击战术：风魔忍者',
      description: '采用游击战术，打完就跑，分散敌方注意力，创造单点突破机会。',
      author: '刘洋',
      authorAvatar: 'https://via.placeholder.com/32',
      creationDate: '2025-03-08',
      lastUpdated: '2025-03-28',
      tags: ['游击', '骚扰', '分散'],
      category: '特殊',
      rating: 4.7,
      views: 178,
      likes: 43,
      thumbnail: 'https://via.placeholder.com/300x180',
      status: 'private'
    },
  ];

  // 根据选项卡和分类筛选战术
  const getFilteredStrategies = () => {
    let filtered = [...strategies];
    
    // 根据选项卡筛选
    switch (activeTab) {
      case '1': // 全部
        break;
      case '2': // 公开
        filtered = filtered.filter(s => s.status === 'public');
        break;
      case '3': // 团队
        filtered = filtered.filter(s => s.status === 'team-only');
        break;
      case '4': // 私人
        filtered = filtered.filter(s => s.status === 'private');
        break;
      default:
        break;
    }
    
    // 根据分类筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }
    
    return filtered;
  };

  // 查看战术详情
  const handleViewStrategy = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setDetailModalVisible(true);
  };

  // 提交创建战术表单
  const handleCreateSubmit = (values: any) => {
    console.log('创建新战术:', values);
    setCreateModalVisible(false);
    strategyForm.resetFields();
  };

  // 获取状态标签
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'public':
        return <Tag color="green">公开</Tag>;
      case 'team-only':
        return <Tag color="blue">团队</Tag>;
      case 'private':
        return <Tag color="gray">私人</Tag>;
      default:
        return null;
    }
  };

  return (
    <div className="strategy-library">
      <Title level={2}>战术库</Title>
      <Paragraph>管理和分享团队战术，提升比赛胜率。</Paragraph>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={16}>
          <Space>
            <Search placeholder="搜索战术" style={{ width: 200 }} />
            <Select 
              defaultValue="all" 
              style={{ width: 120 }} 
              onChange={value => setSelectedCategory(value)}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">全部分类</Option>
              <Option value="进攻">进攻</Option>
              <Option value="防守">防守</Option>
              <Option value="控制">控制</Option>
              <Option value="特殊">特殊</Option>
            </Select>
          </Space>
        </Col>
        <Col xs={24} md={8} style={{ textAlign: 'right' }}>
          <Button 
            type="primary" 
            icon={<FileAddOutlined />} 
            onClick={() => setCreateModalVisible(true)}
          >
            创建新战术
          </Button>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="全部战术" key="1" />
          <TabPane tab="公开战术" key="2" />
          <TabPane tab="团队战术" key="3" />
          <TabPane tab="私人战术" key="4" />
        </Tabs>

        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 4 }}
          dataSource={getFilteredStrategies()}
          renderItem={strategy => (
            <List.Item>
              <Card
                hoverable
                cover={<img alt={strategy.title} src={strategy.thumbnail} style={{ height: 180, objectFit: 'cover' }} />}
                actions={[
                  <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewStrategy(strategy)}>查看</Button>,
                  <Button type="text" icon={<StarOutlined />}>收藏</Button>,
                  <Button type="text" icon={<ShareAltOutlined />}>分享</Button>
                ]}
              >
                <div style={{ marginBottom: 8 }}>
                  {getStatusTag(strategy.status)}
                  <Tag color="orange">{strategy.category}</Tag>
                </div>
                <Card.Meta
                  title={strategy.title}
                  description={
                    <>
                      <div style={{ height: '40px', overflow: 'hidden', marginBottom: '8px' }}>
                        {strategy.description}
                      </div>
                      <Space direction="vertical" size={2} style={{ width: '100%' }}>
                        <div>
                          <Avatar src={strategy.authorAvatar} size="small" />
                          {' '}{strategy.author} · {strategy.lastUpdated}
                        </div>
                        <div>
                          <Rate disabled defaultValue={strategy.rating} style={{ fontSize: 12 }} />
                          <Text type="secondary" style={{ marginLeft: 8 }}>{strategy.rating}</Text>
                        </div>
                        <div>
                          <Space>
                            <span><EyeOutlined /> {strategy.views}</span>
                            <span><LikeOutlined /> {strategy.likes}</span>
                            {strategy.success !== undefined && (
                              <span>成功率: {strategy.success}%</span>
                            )}
                          </Space>
                        </div>
                      </Space>
                    </>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      </Card>

      {/* 创建新战术模态框 */}
      <Modal
        title="创建新战术"
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={strategyForm}
          layout="vertical"
          onFinish={handleCreateSubmit}
        >
          <Form.Item
            name="title"
            label="战术名称"
            rules={[{ required: true, message: '请输入战术名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="战术描述"
            rules={[{ required: true, message: '请输入战术描述' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="category"
            label="战术分类"
            rules={[{ required: true, message: '请选择战术分类' }]}
          >
            <Select>
              <Option value="进攻">进攻</Option>
              <Option value="防守">防守</Option>
              <Option value="控制">控制</Option>
              <Option value="特殊">特殊</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="tags"
            label="标签"
            rules={[{ required: true, message: '请添加至少一个标签' }]}
          >
            <Select mode="tags" placeholder="输入标签后按Enter">
              <Option value="速攻">速攻</Option>
              <Option value="突袭">突袭</Option>
              <Option value="防守">防守</Option>
              <Option value="反击">反击</Option>
              <Option value="资源控制">资源控制</Option>
              <Option value="游击">游击</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="content"
            label="战术内容"
            rules={[{ required: true, message: '请输入战术详细内容' }]}
          >
            <TextArea rows={6} />
          </Form.Item>
          <Form.Item
            name="status"
            label="发布状态"
            initialValue="private"
          >
            <Select>
              <Option value="public">公开（所有人可见）</Option>
              <Option value="team-only">团队（仅团队成员可见）</Option>
              <Option value="private">私人（仅自己可见）</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              创建战术
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 战术详情模态框 */}
      {selectedStrategy && (
        <Modal
          title={`${selectedStrategy.title} ${getStatusTag(selectedStrategy.status)}`}
          visible={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="share" icon={<ShareAltOutlined />}>分享</Button>,
            <Button key="download" icon={<DownloadOutlined />}>下载PDF</Button>,
            <Button key="edit" type="primary" icon={<BookOutlined />}>编辑战术</Button>
          ]}
          width={800}
        >
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <img 
              src={selectedStrategy.thumbnail} 
              alt={selectedStrategy.title} 
              style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <Space align="center">
              <Avatar src={selectedStrategy.authorAvatar} />
              <span>{selectedStrategy.author}</span>
              <span>|</span>
              <span>创建于 {selectedStrategy.creationDate}</span>
              <span>|</span>
              <span>更新于 {selectedStrategy.lastUpdated}</span>
              <span>|</span>
              <Rate disabled defaultValue={selectedStrategy.rating} style={{ fontSize: 12 }} />
              <span>{selectedStrategy.rating}</span>
            </Space>
          </div>
          <div style={{ marginBottom: 16 }}>
            {selectedStrategy.tags.map(tag => (
              <Tag key={tag}>{tag}</Tag>
            ))}
            <Tag color="orange">{selectedStrategy.category}</Tag>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Text strong>战术描述:</Text>
            <Paragraph>{selectedStrategy.description}</Paragraph>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Text strong>详细内容:</Text>
            <Paragraph>
              这里是战术的详细说明，包括队伍分工、战术要点、执行步骤和注意事项。
              由于篇幅限制，此处仅展示概要内容。完整战术文档包含图示、视频和互动地图。
            </Paragraph>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Text strong>数据统计:</Text>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="查看次数" value={selectedStrategy.views} prefix={<EyeOutlined />} />
              </Col>
              <Col span={8}>
                <Statistic title="点赞数" value={selectedStrategy.likes} prefix={<LikeOutlined />} />
              </Col>
              {selectedStrategy.success !== undefined && (
                <Col span={8}>
                  <Statistic title="成功率" value={`${selectedStrategy.success}%`} prefix={<StarOutlined />} />
                </Col>
              )}
            </Row>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StrategyLibrary;
