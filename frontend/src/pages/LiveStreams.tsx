import React, { useState } from 'react';
import { Card, Row, Col, Button, List, Avatar, Tag, Input, Select, Space, Typography, Statistic } from 'antd';
import { PlayCircleOutlined, EyeOutlined, TeamOutlined, StarOutlined, FilterOutlined, CalendarOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

interface Stream {
  id: string;
  title: string;
  broadcaster: string;
  platform: 'bilibili' | 'douyu' | 'huya' | 'youtube';
  viewers: number;
  status: 'live' | 'scheduled' | 'ended';
  thumbnail: string;
  scheduledTime?: string;
  tags: string[];
}

const LiveStreams: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  // 模拟直播数据
  const streams: Stream[] = [
    {
      id: '1',
      title: '宣传团队策略分享会',
      broadcaster: '李明',
      platform: 'bilibili',
      viewers: 2457,
      status: 'live',
      thumbnail: 'https://via.placeholder.com/300x180',
      tags: ['战术分析', '团队策略']
    },
    {
      id: '2',
      title: 'TSB战术进化论',
      broadcaster: '王静',
      platform: 'douyu',
      viewers: 1832,
      status: 'live',
      thumbnail: 'https://via.placeholder.com/300x180',
      tags: ['竞技比赛', '高端局']
    },
    {
      id: '3',
      title: '周末赛事预热',
      broadcaster: '张伟',
      platform: 'huya',
      viewers: 0,
      status: 'scheduled',
      scheduledTime: '2025-03-30 20:00',
      thumbnail: 'https://via.placeholder.com/300x180',
      tags: ['比赛预告', '选手采访']
    },
    {
      id: '4',
      title: '战术解析：防守反击体系',
      broadcaster: '刘洋',
      platform: 'bilibili',
      viewers: 0,
      status: 'ended',
      thumbnail: 'https://via.placeholder.com/300x180',
      tags: ['战术教学', '技巧分享']
    },
    {
      id: '5',
      title: '新版本战术适配分析',
      broadcaster: '赵芳',
      platform: 'youtube',
      viewers: 0,
      status: 'scheduled',
      scheduledTime: '2025-03-31 19:30',
      thumbnail: 'https://via.placeholder.com/300x180',
      tags: ['版本更新', '战术调整']
    },
  ];

  // 根据筛选条件过滤直播
  const filteredStreams = streams.filter(stream => {
    if (filter !== 'all' && stream.status !== filter) {
      return false;
    }
    
    if (searchText && !stream.title.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // 获取平台图标
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'bilibili':
        return '📺';
      case 'douyu':
        return '🐟';
      case 'huya':
        return '🐯';
      case 'youtube':
        return '📹';
      default:
        return '🎮';
    }
  };

  // 获取状态标签颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'red';
      case 'scheduled':
        return 'blue';
      case 'ended':
        return 'default';
      default:
        return 'default';
    }
  };

  // 获取状态标签文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'live':
        return '直播中';
      case 'scheduled':
        return '已安排';
      case 'ended':
        return '已结束';
      default:
        return status;
    }
  };

  // 统计数据
  const liveCount = streams.filter(s => s.status === 'live').length;
  const scheduledCount = streams.filter(s => s.status === 'scheduled').length;
  const totalViewers = streams.reduce((sum, stream) => sum + stream.viewers, 0);

  return (
    <div className="live-streams">
      <Title level={2}>直播管理</Title>
      <Paragraph>管理和监控宣传团队的直播活动。</Paragraph>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="当前直播"
              value={liveCount}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="计划直播"
              value={scheduledCount}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总观看人数"
              value={totalViewers}
              prefix={<EyeOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="直播列表"
        extra={
          <Button type="primary" icon={<PlayCircleOutlined />}>
            创建直播
          </Button>
        }
      >
        <Space style={{ marginBottom: 16 }}>
          <Search
            placeholder="搜索直播"
            allowClear
            onSearch={value => setSearchText(value)}
            style={{ width: 200 }}
          />
          <Select
            defaultValue="all"
            style={{ width: 120 }}
            onChange={value => setFilter(value)}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="all">全部</Option>
            <Option value="live">直播中</Option>
            <Option value="scheduled">已安排</Option>
            <Option value="ended">已结束</Option>
          </Select>
        </Space>

        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 4 }}
          dataSource={filteredStreams}
          renderItem={stream => (
            <List.Item>
              <Card
                hoverable
                cover={
                  <div style={{ position: 'relative' }}>
                    <img alt={stream.title} src={stream.thumbnail} style={{ height: 180, objectFit: 'cover' }} />
                    {stream.status === 'live' && (
                      <Tag color="red" style={{ position: 'absolute', top: 10, right: 10 }}>
                        LIVE
                      </Tag>
                    )}
                  </div>
                }
                actions={[
                  <Button type="text" icon={<EyeOutlined />}>查看</Button>,
                  <Button type="text" icon={<TeamOutlined />}>分享</Button>,
                  <Button type="text" icon={<StarOutlined />}>收藏</Button>
                ]}
              >
                <Card.Meta
                  title={stream.title}
                  description={
                    <>
                      <Space direction="vertical" size={2} style={{ width: '100%' }}>
                        <div>
                          <Avatar size="small" src="https://via.placeholder.com/32" />
                          {' '}{stream.broadcaster}
                        </div>
                        <div>
                          {getPlatformIcon(stream.platform)} {stream.platform.toUpperCase()}
                          {' · '}
                          <Tag color={getStatusColor(stream.status)}>
                            {getStatusText(stream.status)}
                          </Tag>
                        </div>
                        {stream.status === 'live' && (
                          <div>
                            <EyeOutlined /> {stream.viewers} 观众
                          </div>
                        )}
                        {stream.status === 'scheduled' && stream.scheduledTime && (
                          <div>
                            开始时间: {stream.scheduledTime}
                          </div>
                        )}
                        <div>
                          {stream.tags.map(tag => (
                            <Tag key={tag}>{tag}</Tag>
                          ))}
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
    </div>
  );
};

export default LiveStreams;
