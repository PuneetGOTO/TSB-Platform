import React, { useState } from 'react';
import { Card, Row, Col, Button, List, Typography, Select, Space, Badge, Tabs, Modal, Upload, Form, Input } from 'antd';
import { 
  ArrowsAltOutlined, 
  CloudUploadOutlined, 
  MobileOutlined, 
  EyeOutlined, 
  PlusOutlined, 
  TeamOutlined,
  QrcodeOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface ARScene {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  creator: string;
  creationDate: string;
  status: 'active' | 'draft' | 'archived';
  views: number;
  usageCount: number;
}

const ARExperience: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [selectedScene, setSelectedScene] = useState<ARScene | null>(null);
  const [uploadForm] = Form.useForm();
  
  // 示例数据
  const arScenes: ARScene[] = [
    {
      id: '1',
      title: '战场地形模型',
      description: '真实还原比赛地图的3D地形模型，包含地形高低、障碍物分布。',
      thumbnail: 'https://via.placeholder.com/300x180',
      category: '战术分析',
      creator: '王静',
      creationDate: '2025-02-15',
      status: 'active',
      views: 325,
      usageCount: 42
    },
    {
      id: '2',
      title: '选手角色模型',
      description: '可交互的选手角色3D模型，可展示专属武器和装备。',
      thumbnail: 'https://via.placeholder.com/300x180',
      category: '人物展示',
      creator: '李明',
      creationDate: '2025-03-01',
      status: 'active',
      views: 287,
      usageCount: 36
    },
    {
      id: '3',
      title: '战术走位示意图',
      description: '动态展示团队战术走位，包含箭头、路径和时间线。',
      thumbnail: 'https://via.placeholder.com/300x180',
      category: '战术分析',
      creator: '张伟',
      creationDate: '2025-03-10',
      status: 'draft',
      views: 126,
      usageCount: 18
    },
    {
      id: '4',
      title: '装备互动模型',
      description: '可旋转、缩放的武器装备3D模型，含详细参数解析。',
      thumbnail: 'https://via.placeholder.com/300x180',
      category: '装备展示',
      creator: '刘洋',
      creationDate: '2025-03-20',
      status: 'active',
      views: 205,
      usageCount: 28
    },
  ];

  // 根据选项卡筛选场景
  const getFilteredScenes = () => {
    switch (activeTab) {
      case '1': // 全部
        return arScenes;
      case '2': // 战术分析
        return arScenes.filter(scene => scene.category === '战术分析');
      case '3': // 人物展示
        return arScenes.filter(scene => scene.category === '人物展示');
      case '4': // 装备展示
        return arScenes.filter(scene => scene.category === '装备展示');
      default:
        return arScenes;
    }
  };

  // 预览AR场景
  const handlePreview = (scene: ARScene) => {
    setSelectedScene(scene);
    setPreviewModalVisible(true);
  };

  // 提交上传表单
  const handleUploadSubmit = (values: any) => {
    console.log('上传新AR场景:', values);
    setUploadModalVisible(false);
    uploadForm.resetFields();
  };

  return (
    <div className="ar-experience">
      <Title level={2}>AR 体验管理</Title>
      <Paragraph>管理和创建增强现实体验内容，支持战术分析、选手展示和装备展示。</Paragraph>

      <Card
        title="AR 场景库"
        extra={
          <Button 
            type="primary" 
            icon={<CloudUploadOutlined />} 
            onClick={() => setUploadModalVisible(true)}
          >
            上传新场景
          </Button>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="全部场景" key="1" />
          <TabPane tab="战术分析" key="2" />
          <TabPane tab="人物展示" key="3" />
          <TabPane tab="装备展示" key="4" />
        </Tabs>

        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
          dataSource={getFilteredScenes()}
          renderItem={scene => (
            <List.Item>
              <Badge.Ribbon 
                text={scene.status === 'draft' ? '草稿' : scene.status === 'archived' ? '已归档' : null} 
                color={scene.status === 'draft' ? 'blue' : 'default'}
                style={{ display: scene.status === 'active' ? 'none' : 'block' }}
              >
                <Card
                  hoverable
                  cover={<img alt={scene.title} src={scene.thumbnail} style={{ height: 180, objectFit: 'cover' }} />}
                  actions={[
                    <Button type="text" icon={<EyeOutlined />} onClick={() => handlePreview(scene)}>预览</Button>,
                    <Button type="text" icon={<MobileOutlined />}>使用</Button>,
                    <Button type="text" icon={<QrcodeOutlined />}>分享</Button>
                  ]}
                >
                  <Card.Meta
                    title={scene.title}
                    description={
                      <>
                        <div style={{ height: '40px', overflow: 'hidden', marginBottom: '8px' }}>
                          {scene.description}
                        </div>
                        <Space direction="vertical" size={2} style={{ width: '100%' }}>
                          <div>创建者: {scene.creator}</div>
                          <div>创建日期: {scene.creationDate}</div>
                          <div>查看: {scene.views} | 使用: {scene.usageCount}</div>
                        </Space>
                      </>
                    }
                  />
                </Card>
              </Badge.Ribbon>
            </List.Item>
          )}
        />
      </Card>

      {/* 上传新AR场景模态框 */}
      <Modal
        title="上传新AR场景"
        visible={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={uploadForm}
          layout="vertical"
          onFinish={handleUploadSubmit}
        >
          <Form.Item
            name="title"
            label="场景标题"
            rules={[{ required: true, message: '请输入场景标题' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="场景描述"
            rules={[{ required: true, message: '请输入场景描述' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="category"
            label="场景类别"
            rules={[{ required: true, message: '请选择场景类别' }]}
          >
            <Select>
              <Option value="战术分析">战术分析</Option>
              <Option value="人物展示">人物展示</Option>
              <Option value="装备展示">装备展示</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="model"
            label="3D模型上传"
            rules={[{ required: true, message: '请上传3D模型文件' }]}
          >
            <Upload.Dragger multiple={false}>
              <p className="ant-upload-drag-icon">
                <CloudUploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">支持GLB、GLTF格式的3D模型文件</p>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item
            name="thumbnail"
            label="缩略图上传"
            rules={[{ required: true, message: '请上传缩略图' }]}
          >
            <Upload.Dragger multiple={false}>
              <p className="ant-upload-drag-icon">
                <PlusOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
              <p className="ant-upload-hint">建议尺寸: 300×180px, JPG或PNG格式</p>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item
            name="status"
            label="发布状态"
            initialValue="draft"
          >
            <Select>
              <Option value="active">立即发布</Option>
              <Option value="draft">保存为草稿</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              上传场景
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* AR场景预览模态框 */}
      {selectedScene && (
        <Modal
          title={`预览: ${selectedScene.title}`}
          visible={previewModalVisible}
          onCancel={() => setPreviewModalVisible(false)}
          footer={[
            <Button key="qrcode" icon={<QrcodeOutlined />}>生成二维码</Button>,
            <Button key="share" icon={<TeamOutlined />}>分享链接</Button>,
            <Button key="view" type="primary" icon={<ArrowsAltOutlined />}>全屏查看</Button>
          ]}
          width={800}
        >
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <img 
              src={selectedScene.thumbnail} 
              alt={selectedScene.title} 
              style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
            />
          </div>
          <div>
            <p><strong>描述:</strong> {selectedScene.description}</p>
            <p><strong>类别:</strong> {selectedScene.category}</p>
            <p><strong>创建者:</strong> {selectedScene.creator}</p>
            <p><strong>创建日期:</strong> {selectedScene.creationDate}</p>
            <p><strong>使用次数:</strong> {selectedScene.usageCount}</p>
            <p>
              <strong>使用方法:</strong> 使用移动设备扫描二维码或直接在移动设备上打开分享链接，
              在AR环境中可以旋转、缩放模型，查看详细信息。
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ARExperience;
