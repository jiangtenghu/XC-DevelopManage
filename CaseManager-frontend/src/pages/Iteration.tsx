import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Table, Button, Modal, Form, Input, Select, DatePicker, 
  Space, Popconfirm, message, Card, Tabs, Tag, Tooltip, 
  Typography, Row, Col, Statistic, Divider, Progress 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, 
  StopOutlined, FieldTimeOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { RootState } from '../store';
import { 
  fetchIterations, fetchIteration, createIteration, updateIteration, 
  deleteIteration, fetchProjectIterations, fetchIterationStats,
  Iteration as IterationType
} from '../store/slices/iterationSlice';
import { fetchProjects } from '../store/slices/projectSlice';
import { AppDispatch } from '../store';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Iteration: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    iterations, currentIteration, loading, 
    totalIterations, upcomingIterations 
  } = useSelector((state: RootState) => state.iteration);
  const { projects } = useSelector((state: RootState) => state.project);
  
  // 本地状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingIteration, setEditingIteration] = useState<IterationType | null>(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');

  // 获取迭代列表和项目列表
  useEffect(() => {
    dispatch(fetchProjects({}));
    
    if (activeTab === 'all') {
      dispatch(fetchIterations({ 
        page: currentPage, 
        limit: pageSize, 
        search: searchText,
        status: statusFilter || undefined,
        project: projectFilter || undefined
      }));
    } else if (activeTab === 'active') {
      dispatch(fetchIterationStats());
    } else if (activeTab === 'project' && projectFilter) {
      dispatch(fetchProjectIterations({ projectId: projectFilter }));
    }
  }, [dispatch, currentPage, pageSize, searchText, statusFilter, projectFilter, activeTab]);

  // 处理创建/编辑迭代
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      // 处理日期范围
      const dateRange = values.dateRange;
      const iterationData = {
        ...values,
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
      };
      
      delete iterationData.dateRange;
      
      try {
        if (editingIteration) {
          await dispatch(updateIteration({ id: editingIteration._id, iterationData })).unwrap();
          message.success('迭代更新成功');
        } else {
          await dispatch(createIteration(iterationData)).unwrap();
          message.success('迭代创建成功');
        }
        
        setIsModalVisible(false);
        form.resetFields();
        setEditingIteration(null);
        
        // 重新获取迭代列表以确保数据同步
        await dispatch(fetchIterations({ 
          page: currentPage, 
          limit: pageSize, 
          search: searchText,
          status: statusFilter || undefined,
          project: projectFilter || undefined
        }));
      } catch (apiError) {
        message.error(editingIteration ? '迭代更新失败' : '迭代创建失败');
        console.error('API调用失败:', apiError);
      }
    } catch (validationError) {
      message.error('请检查表单填写是否正确');
      console.error('表单验证失败:', validationError);
    }
  };

  // 处理取消
  const handleCancel = () => {
    setIsModalVisible(false);
    setIsViewModalVisible(false);
    form.resetFields();
    setEditingIteration(null);
  };

  // 打开创建迭代模态框
  const showCreateModal = () => {
    setEditingIteration(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 打开编辑迭代模态框
  const showEditModal = (iteration: IterationType) => {
    setEditingIteration(iteration);
    form.setFieldsValue({
      name: iteration.name,
      project: iteration.project,
      description: iteration.description,
      status: iteration.status,
      dateRange: [moment(iteration.startDate), moment(iteration.endDate)]
    });
    setIsModalVisible(true);
  };

  // 打开查看迭代详情模态框
  const showViewModal = (iteration: IterationType) => {
    dispatch(fetchIteration(iteration._id));
    setIsViewModalVisible(true);
  };

  // 处理删除迭代
  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteIteration(id)).unwrap();
      message.success('迭代删除成功');
      
      // 重新获取迭代列表以确保数据同步
      await dispatch(fetchIterations({ 
        page: currentPage, 
        limit: pageSize, 
        search: searchText,
        status: statusFilter || undefined,
        project: projectFilter || undefined
      }));
    } catch (error) {
      message.error('删除迭代失败');
    }
  };

  // 计算迭代进度
  const calculateProgress = (startDate: string, endDate: string) => {
    const start = moment(startDate);
    const end = moment(endDate);
    const now = moment();
    
    if (now.isBefore(start)) return 0;
    if (now.isAfter(end)) return 100;
    
    const totalDays = end.diff(start, 'days');
    const passedDays = now.diff(start, 'days');
    
    return Math.round((passedDays / totalDays) * 100);
  };

  // 获取项目名称
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p._id === projectId);
    return project ? project.name : '未知项目';
  };

  // 表格列定义
  const columns = [
    {
      title: '迭代名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: IterationType) => (
        <Button type="link" onClick={() => showViewModal(record)}>{text}</Button>
      )
    },
    {
      title: '所属项目',
      dataIndex: 'project',
      key: 'project',
      render: (projectId: string) => getProjectName(projectId)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = '';
        let icon = null;
        
        switch (status) {
          case 'planning':
            color = 'blue';
            icon = <CalendarOutlined />;
            break;
          case 'active':
            color = 'green';
            icon = <CheckCircleOutlined />;
            break;
          case 'completed':
            color = 'purple';
            icon = <ClockCircleOutlined />;
            break;
          case 'archived':
            color = 'gray';
            icon = <StopOutlined />;
            break;
          default:
            color = 'default';
        }
        
        return (
          <Tag color={color} icon={icon}>
            {status === 'planning' ? '规划中' : 
             status === 'active' ? '进行中' : 
             status === 'completed' ? '已完成' : '已归档'}
          </Tag>
        );
      }
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => moment(date).format('YYYY-MM-DD')
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => moment(date).format('YYYY-MM-DD')
    },
    {
      title: '进度',
      key: 'progress',
      render: (_: any, record: IterationType) => {
        const progress = calculateProgress(record.startDate, record.endDate);
        let strokeColor = '#52c41a';
        
        if (progress < 30) strokeColor = '#52c41a';
        else if (progress < 70) strokeColor = '#1890ff';
        else strokeColor = '#f5222d';
        
        return (
          <Tooltip title={`${progress}%`}>
            <Progress 
              percent={progress} 
              size="small" 
              strokeColor={strokeColor}
              style={{ width: 100 }}
            />
          </Tooltip>
        );
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: IterationType) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
          />
          <Popconfirm
            title="确定要删除这个迭代吗？"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 渲染活跃迭代卡片
  const renderActiveIterations = () => (
    <div>
      <Row gutter={[16, 16]}>
        {upcomingIterations.map((iteration: IterationType) => (
          <Col span={8} key={iteration._id}>
            <Card
              title={
                <Space>
                  <CalendarOutlined />
                  <span>{iteration.name}</span>
                </Space>
              }
              extra={
                <Button type="link" onClick={() => showViewModal(iteration)}>
                  详情
                </Button>
              }
              hoverable
            >
              <p><strong>项目：</strong>{getProjectName(iteration.project)}</p>
              <p>
                <Space>
                  <FieldTimeOutlined />
                  <span>{moment(iteration.startDate).format('YYYY-MM-DD')} 至 {moment(iteration.endDate).format('YYYY-MM-DD')}</span>
                </Space>
              </p>
              <p>
                <Progress 
                  percent={calculateProgress(iteration.startDate, iteration.endDate)} 
                  size="small"
                  format={percent => `${percent}%`}
                />
              </p>
              <p>{iteration.description || '无描述'}</p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );

  // 渲染迭代表格
  const renderIterationTable = () => (
    <Table 
      dataSource={iterations} 
      columns={columns} 
      rowKey="_id" 
      loading={loading}
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: totalIterations,
        onChange: (page, pageSize) => {
          setCurrentPage(page);
          if (pageSize) setPageSize(pageSize);
        }
      }}
    />
  );

  // 渲染迭代详情
  const renderIterationDetail = () => {
    if (!currentIteration) return null;
    
    const progress = calculateProgress(currentIteration.startDate, currentIteration.endDate);
    
    return (
      <div>
        <Title level={4}>{currentIteration.name}</Title>
        <Text type="secondary">所属项目: {getProjectName(currentIteration.project)}</Text>
        
        <Divider />
        
        <Row gutter={16}>
          <Col span={12}>
            <Text strong>状态: </Text>
            <Tag color={
              currentIteration.status === 'planning' ? 'blue' : 
              currentIteration.status === 'active' ? 'green' : 
              currentIteration.status === 'completed' ? 'purple' : 'gray'
            }>
              {currentIteration.status === 'planning' ? '规划中' : 
               currentIteration.status === 'active' ? '进行中' : 
               currentIteration.status === 'completed' ? '已完成' : '已归档'}
            </Tag>
          </Col>
          <Col span={12}>
            <Text strong>进度: </Text>
            <Progress 
              percent={progress} 
              size="small" 
              style={{ width: 100, display: 'inline-block', marginLeft: 8 }}
            />
          </Col>
        </Row>
        
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Text strong>开始日期: </Text>
            {moment(currentIteration.startDate).format('YYYY-MM-DD')}
          </Col>
          <Col span={12}>
            <Text strong>结束日期: </Text>
            {moment(currentIteration.endDate).format('YYYY-MM-DD')}
          </Col>
        </Row>
        
        <Divider />
        
        <Text strong>迭代描述:</Text>
        <p>{currentIteration.description || '无描述'}</p>
        
        <Divider />
        
        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic title="测试计划数" value={0} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="测试用例数" value={0} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="缺陷数" value={0} />
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Title level={2}>迭代管理</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showCreateModal}
        >
          创建迭代
        </Button>
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Input.Search
            placeholder="搜索迭代"
            allowClear
            onSearch={(value) => {
              setSearchText(value);
              setCurrentPage(1);
            }}
            style={{ width: 200 }}
          />
          
          <Select
            placeholder="项目筛选"
            allowClear
            style={{ width: 200 }}
            onChange={(value) => {
              setProjectFilter(value);
              setCurrentPage(1);
              if (value && activeTab !== 'project') {
                setActiveTab('project');
              }
            }}
          >
            {projects.map(project => (
              <Option key={project._id} value={project._id}>{project.name}</Option>
            ))}
          </Select>
          
          <Select
            placeholder="状态筛选"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <Option value="planning">规划中</Option>
            <Option value="active">进行中</Option>
            <Option value="completed">已完成</Option>
            <Option value="archived">已归档</Option>
          </Select>
        </Space>
      </div>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="所有迭代" key="all">
          {renderIterationTable()}
        </TabPane>
        <TabPane tab="活跃迭代" key="active">
          {renderActiveIterations()}
        </TabPane>
        {projectFilter && (
          <TabPane tab={`项目迭代: ${getProjectName(projectFilter)}`} key="project">
            {renderIterationTable()}
          </TabPane>
        )}
      </Tabs>
      
      {/* 创建/编辑迭代模态框 */}
      <Modal
        title={editingIteration ? '编辑迭代' : '创建迭代'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="迭代名称"
            rules={[{ required: true, message: '请输入迭代名称' }]}
          >
            <Input placeholder="输入迭代名称" />
          </Form.Item>
          
          <Form.Item
            name="project"
            label="所属项目"
            rules={[{ required: true, message: '请选择所属项目' }]}
          >
            <Select placeholder="选择所属项目">
              {projects.map(project => (
                <Option key={project._id} value={project._id}>{project.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="description"
            label="迭代描述"
          >
            <Input.TextArea rows={4} placeholder="输入迭代描述" />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="迭代状态"
            initialValue="planning"
          >
            <Select>
              <Option value="planning">规划中</Option>
              <Option value="active">进行中</Option>
              <Option value="completed">已完成</Option>
              <Option value="archived">已归档</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="dateRange"
            label="迭代日期"
            rules={[{ required: true, message: '请选择迭代日期范围' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 查看迭代详情模态框 */}
      <Modal
        title="迭代详情"
        open={isViewModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {renderIterationDetail()}
      </Modal>
    </div>
  );
};

export default Iteration;
