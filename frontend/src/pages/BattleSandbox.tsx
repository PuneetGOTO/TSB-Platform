import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stats } from '@react-three/drei';
import { Card, Tabs, Button, Select, Slider, Switch, Row, Col, Spin, Typography, Tag, Badge, Alert, Space } from 'antd';
import { LineChartOutlined, TeamOutlined, ThunderboltOutlined, AimOutlined } from '@ant-design/icons';
import BattleMap from '../components/battleSandbox/BattleMap';
import TeamBase from '../components/battleSandbox/TeamBase';
import HeatmapLayer from '../components/battleSandbox/HeatmapLayer';
import ResourceFlow from '../components/battleSandbox/ResourceFlow';
import StrategyPath from '../components/battleSandbox/StrategyPath';
import battleService, { BattleData } from '../services/battleService';
import { useAuth } from '../hooks/useAuth';
import { Vector3 } from 'three';

const { TabPane } = Tabs;
const { Option } = Select;
const { Title, Text } = Typography;

const BattleSandbox = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [battleData, setBattleData] = useState<BattleData | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showResources, setShowResources] = useState(true);
  const [showPaths, setShowPaths] = useState(true);
  const [timeSlider, setTimeSlider] = useState(100); // 100% means current time
  const [activeTab, setActiveTab] = useState('1');
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const eventUnsubscribeRef = useRef<(() => void) | null>(null);

  // Fetch battle data
  useEffect(() => {
    const fetchBattleData = async () => {
      try {
        setLoading(true);
        const data = await battleService.getLatestBattle();
        setBattleData(data);
        
        // Set user's team as selected by default if available
        if (user?.teamId && data.teams.some(team => team.id === user.teamId)) {
          setSelectedTeam(user.teamId);
        } else if (data.teams.length > 0) {
          setSelectedTeam(data.teams[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch battle data:', err);
        setError('Failed to load battle data. Please try again later.');
        
        // Use random data for development if API fails
        const randomData = battleService.generateRandomBattleData();
        setBattleData(randomData);
      } finally {
        setLoading(false);
      }
    };

    fetchBattleData();
    
    // Subscribe to real-time updates
    const unsubscribe = battleService.subscribeToBattleEvents((event) => {
      console.log('Battle event received:', event);
      
      // Refresh data when relevant events occur
      if (event.type === 'new-strategy' || event.type === 'battle-update') {
        fetchBattleData();
      }
    });
    
    eventUnsubscribeRef.current = unsubscribe;
    
    // Cleanup subscription on unmount
    return () => {
      if (eventUnsubscribeRef.current) {
        eventUnsubscribeRef.current();
      }
    };
  }, [user?.teamId]);

  // Filter strategies based on selected team
  const filteredStrategies = React.useMemo(() => {
    if (!battleData?.strategies) return [];
    
    if (selectedTeam) {
      return battleData.strategies.filter(strategy => strategy.teamId === selectedTeam);
    }
    
    return battleData.strategies;
  }, [battleData?.strategies, selectedTeam]);

  // Handle time slider change
  const handleTimeChange = (value: number) => {
    setTimeSlider(value);
    // Here we would fetch historical data based on the time slider value
  };

  // Toggle layers
  const toggleHeatmap = (checked: boolean) => {
    setShowHeatmap(checked);
  };
  
  const toggleResources = (checked: boolean) => {
    setShowResources(checked);
  };
  
  const togglePaths = (checked: boolean) => {
    setShowPaths(checked);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" tip="加载战争沙盘数据..." />
      </div>
    );
  }

  if (error && !battleData) {
    return (
      <Alert
        message="错误"
        description={error}
        type="error"
        showIcon
        style={{ maxWidth: '600px', margin: '100px auto' }}
      />
    );
  }

  return (
    <div className="battle-sandbox-container">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Space align="center">
            <Title level={2}>战争沙盘 - 实时战场态势</Title>
            {battleData && (
              <Tag color={battleData.status === 'active' ? 'green' : 'orange'}>
                {battleData.status === 'active' ? '实时' : '历史'}
              </Tag>
            )}
          </Space>
          <Text type="secondary">通过交互式 3D 沙盘了解实时战场状况、资源流动和战术部署</Text>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={18}>
          <Card 
            className="battle-map-container" 
            style={{ height: '70vh', padding: 0, overflow: 'hidden' }}
            bodyStyle={{ padding: 0, height: '100%' }}
            extra={
              <Select 
                placeholder="选择团队" 
                style={{ width: 150 }} 
                value={selectedTeam || undefined}
                onChange={setSelectedTeam}
                allowClear
              >
                {battleData?.teams.map(team => (
                  <Option key={team.id} value={team.id}>
                    <Badge color={team.color} text={team.name} />
                  </Option>
                ))}
              </Select>
            }
          >
            {viewMode === '3d' ? (
              <Canvas shadows camera={{ position: [0, 50, 0], fov: 50, near: 0.1, far: 1000 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} castShadow />
                <Suspense fallback={null}>
                  <BattleMap />
                  
                  {/* Team bases */}
                  {battleData?.teams.map((team) => (
                    <TeamBase 
                      key={team.id}
                      position={[team.position.x, 0, team.position.y]} 
                      color={team.color}
                      name={team.name}
                      resources={team.resources}
                      isSelected={team.id === selectedTeam}
                      onClick={() => setSelectedTeam(team.id === selectedTeam ? null : team.id)}
                    />
                  ))}
                  
                  {/* Dynamic layers based on toggle states */}
                  {showHeatmap && battleData?.heatmap && (
                    <HeatmapLayer data={battleData.heatmap} />
                  )}
                  
                  {showResources && battleData?.resources && (
                    <ResourceFlow data={battleData.resources} />
                  )}
                  
                  {showPaths && filteredStrategies.length > 0 && (
                    <StrategyPath 
                      data={{ strategies: filteredStrategies }} 
                      animation={{ speed: 0.5, trail: 0.7 }}
                    />
                  )}
                  
                  <Environment preset="city" />
                </Suspense>
                <OrbitControls 
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  maxPolarAngle={Math.PI / 2.2}
                  minDistance={10}
                  maxDistance={120}
                />
                
                {process.env.NODE_ENV === 'development' && <Stats />}
              </Canvas>
            ) : (
              <div className="2d-map" style={{ height: '100%', background: '#0a0a0a' }}>
                {/* 2D map implementation would go here */}
                <div style={{ padding: 20, color: 'white' }}>
                  2D 地图视图 (开发中)
                </div>
              </div>
            )}
            
            {/* Visualization controls overlay */}
            <Card 
              size="small" 
              style={{ 
                position: 'absolute', 
                top: 10, 
                right: 10, 
                width: 200,
                backgroundColor: 'rgba(255, 255, 255, 0.8)'
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>热力图</Text>
                  <Switch checked={showHeatmap} onChange={toggleHeatmap} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>资源流</Text>
                  <Switch checked={showResources} onChange={toggleResources} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>战术路径</Text>
                  <Switch checked={showPaths} onChange={togglePaths} />
                </div>
              </Space>
            </Card>
          </Card>
        </Col>
        
        <Col span={6}>
          <Card title="战场控制" style={{ height: '70vh', overflowY: 'auto' }}>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab={<span><TeamOutlined />团队</span>} key="1">
                <div style={{ marginBottom: 16 }}>
                  <label>选择团队:</label>
                  <Select 
                    style={{ width: '100%', marginTop: 8 }} 
                    value={selectedTeam || undefined}
                    onChange={setSelectedTeam}
                  >
                    {battleData?.teams.map((team) => (
                      <Option key={team.id} value={team.id}>
                        <Badge color={team.color} text={team.name} />
                      </Option>
                    ))}
                  </Select>
                </div>
                
                {selectedTeam && battleData?.teams && (
                  <div className="team-stats">
                    {battleData.teams
                      .filter(team => team.id === selectedTeam)
                      .map(team => (
                        <Card 
                          key={team.id}
                          size="small" 
                          title={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div style={{ 
                                width: 16, 
                                height: 16, 
                                backgroundColor: team.color,
                                marginRight: 8,
                                borderRadius: '50%'
                              }} />
                              {team.name}
                            </div>
                          }
                          style={{ 
                            marginBottom: 16,
                            borderLeft: `4px solid ${team.color}`
                          }}
                        >
                          <p>
                            <Text strong>战术得分:</Text> {team.tacticalScore}<br />
                            <Text strong>资源:</Text> {team.resources}<br />
                            <Text strong>位置:</Text> X: {team.position.x.toFixed(1)}, Y: {team.position.y.toFixed(1)}
                          </p>
                          <Button 
                            type="primary" 
                            size="small" 
                            block
                          >
                            查看详细战报
                          </Button>
                        </Card>
                      ))}
                    
                    <div style={{ marginTop: 16 }}>
                      <Button type="primary" block>
                        发布新战术
                      </Button>
                      <Button style={{ marginTop: 8 }} block>
                        联合作战请求
                      </Button>
                    </div>
                  </div>
                )}
              </TabPane>
              
              <TabPane tab={<span><ThunderboltOutlined />战术</span>} key="2">
                <div style={{ marginBottom: 16 }}>
                  {filteredStrategies.length > 0 ? (
                    filteredStrategies.map(strategy => {
                      const team = battleData?.teams.find(t => t.id === strategy.teamId);
                      return (
                        <Card 
                          key={strategy.id} 
                          size="small" 
                          title={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div style={{ 
                                width: 16, 
                                height: 16, 
                                backgroundColor: strategy.color,
                                marginRight: 8,
                                borderRadius: '50%'
                              }} />
                              {strategy.name}
                            </div>
                          }
                          style={{ 
                            marginBottom: 16,
                            borderLeft: `4px solid ${strategy.color}`
                          }}
                        >
                          <p>
                            <Text strong>团队:</Text> {team?.name || strategy.teamId}<br />
                            <Text strong>状态:</Text> {strategy.active ? '执行中' : '已完成'}<br />
                            <Text strong>成功率:</Text> {Math.round((strategy.success || 0) * 100)}%<br />
                            <Text strong>路径点:</Text> {strategy.path.length}
                          </p>
                        </Card>
                      );
                    })
                  ) : (
                    <Alert 
                      message="未找到战术" 
                      description={selectedTeam ? "所选团队没有活跃战术" : "暂无可用战术"} 
                      type="info" 
                      showIcon 
                    />
                  )}
                </div>
                
                <div style={{ marginTop: 24 }}>
                  <Button type="primary" block>
                    创建新战术
                  </Button>
                </div>
              </TabPane>
              
              <TabPane tab={<span><LineChartOutlined />分析</span>} key="3">
                <div style={{ marginBottom: 16 }}>
                  <label>战场时间:</label>
                  <Slider
                    min={0}
                    max={100}
                    value={timeSlider}
                    onChange={handleTimeChange}
                    marks={{
                      0: '开始',
                      25: '25%',
                      50: '50%',
                      75: '75%',
                      100: '当前'
                    }}
                  />
                </div>
                
                <Title level={5}>战场数据</Title>
                {battleData?.teams && (
                  <div>
                    <p>
                      <Text strong>战斗ID:</Text> {battleData.id}<br />
                      <Text strong>状态:</Text> {battleData.status === 'active' ? '进行中' : '已完成'}<br />
                      <Text strong>开始时间:</Text> {new Date(battleData.timestamp).toLocaleString()}<br />
                      <Text strong>参与团队:</Text> {battleData.teams.length}<br />
                    </p>
                    
                    <Title level={5} style={{ marginTop: 16 }}>团队排名</Title>
                    {battleData.teams.sort((a, b) => b.tacticalScore - a.tacticalScore).map((team, index) => (
                      <div key={team.id} style={{ 
                        padding: '8px', 
                        marginBottom: '8px', 
                        border: `1px solid ${team.color}`,
                        backgroundColor: `${team.color}22`,
                        borderRadius: '4px'
                      }}>
                        <Badge count={index + 1} style={{ backgroundColor: index === 0 ? '#gold' : '#999' }} />
                        <Text strong style={{ marginLeft: 8 }}>{team.name}</Text>
                        <div style={{ marginTop: 4 }}>
                          <Text>战术得分: {team.tacticalScore}</Text>
                          <Text style={{ float: 'right' }}>资源: {team.resources}</Text>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div style={{ marginTop: 16 }}>
                  <Button block>
                    导出战术回放
                  </Button>
                  <Button style={{ marginTop: 8 }} block>
                    生成战报
                  </Button>
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BattleSandbox;
