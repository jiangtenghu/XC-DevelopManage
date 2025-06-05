import React, { useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Typography } from 'antd';
import { 
  FileOutlined, 
  CalendarOutlined, 
  BugOutlined, 
  CheckCircleOutlined 
} from '@ant-design/icons';

const { Title } = Typography;

// 模拟数据
const recentTestPlans = [
  {
    key: '1',
    name: '产品A功能测试计划',
    status: '进行中',
    progress: '75%',
    startDate: '2025-04-01',
    endDate: '2025-05-15',
  },
  {
    key: '2',
    name: '产品B性能测试计划',
    status: '未开始',
    progress: '0%',
    startDate: '2025-05-10',
    endDate: '2025-05-30',
  },
  {
    key: '3',
    name: '产品C安全测试计划',
    status: '已完成',
    progress: '100%',
    startDate: '2025-03-15',
    endDate: '2025-04-15',
  },
];

const columns = [
  {
    title: '计划名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: '进度',
    dataIndex: 'progress',
    key: 'progress',
  },
  {
    title: '开始日期',
    dataIndex: 'startDate',
    key: 'startDate',
  },
  {
    title: '结束日期',
    dataIndex: 'endDate',
    key: 'endDate',
  },
];

const Dashboard: React.FC = () => {
  useEffect(() => {
    // 在实际项目中，这里会从API获取数据
    document.title = '测试管理系统 - 首页';
  }, []);

  return (
    <div className="dashboard">
      <Title level={2}>测试概览</Title>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="测试用例总数"
              value={1258}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="测试计划数"
              value={15}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="未解决缺陷"
              value={42}
              prefix={<BugOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="测试通过率"
              value={85.7}
              precision={1}
              suffix="%"
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Title level={3}>最近测试计划</Title>
      <Table dataSource={recentTestPlans} columns={columns} />
    </div>
  );
};

export default Dashboard;
