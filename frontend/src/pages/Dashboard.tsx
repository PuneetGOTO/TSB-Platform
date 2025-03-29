import React from 'react';
import { Card, Row, Col, Statistic, Progress, List, Typography, Divider } from 'antd';
import { TeamOutlined, TrophyOutlined, RiseOutlined, BarChartOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Dashboard: React.FC = () => {
  // 示例数据
  const teamStats = [
    { title: '团队总数', value: 24, icon: <TeamOutlined /> },
    { title: '月度比赛', value: 8, icon: <TrophyOutlined /> },
    { title: '宣传覆盖率', value: '76%', icon: <RiseOutlined /> },
    { title: '活跃战术', value: 42, icon: <BarChartOutlined /> }
  ];

  const recentActivities = [
    { title: '月度竞赛策略更新', time: '今天 14:30', team: 'Team Alpha' },
    { title: 'AR 体验场景设计完成', time: '昨天 18:45', team: 'Team Bravo' },
    { title: '社区反馈分析报告', time: '3 天前', team: 'Team Charlie' },
    { title: '直播观众数据统计', time: '1 周前', team: 'Team Delta' }
  ];

  // 活动完成度
  const campaigns = [
    { name: '季度宣传活动', percent: 75 },
    { name: '社区交流计划', percent: 60 },
    { name: '新战术研发', percent: 45 },
    { name: '赛事转播准备', percent: 90 }
  ];

  return (
    <div className="dashboard">
      <Title level={2}>宣传团队管理仪表盘</Title>
      <Paragraph>欢迎回来！以下是您团队的最新数据和活动。</Paragraph>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {teamStats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic 
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="活动完成度" style={{ marginBottom: '24px' }}>
            {campaigns.map((campaign, index) => (
              <div key={index} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{campaign.name}</span>
                  <span>{campaign.percent}%</span>
                </div>
                <Progress percent={campaign.percent} status={campaign.percent >= 80 ? 'success' : 'active'} />
              </div>
            ))}
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="最近活动" style={{ marginBottom: '24px' }}>
            <List
              itemLayout="horizontal"
              dataSource={recentActivities}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={`${item.time} - ${item.team}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
      
      <Divider />
      
      <Row>
        <Col xs={24}>
          <Card title="即将到来的活动" style={{ marginBottom: '24px' }}>
            <p>下周五: 全体团队战术策略分享会议</p>
            <p>下下周一: 季度宣传成果汇报</p>
            <p>下个月: 跨团队合作赛事安排</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
