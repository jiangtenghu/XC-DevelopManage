import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Table, Button, Modal, Form, Input, Select, DatePicker, 
  Space, Popconfirm, message, Card, Tabs, Tag, Tooltip, 
  Typography, Row, Col, Statistic, Divider 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  TeamOutlined, UserAddOutlined, UserDeleteOutlined,
  CheckCircleOutlined, ClockCircleOutlined, StopOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { RootState } from '../store';
import { 
  fetchProjects, fetchProject, createProject, updateProject, 
  deleteProject, addProjectMember, removeProjectMember, 
  updateMemberRole, fetchUserProjects, fetchProjectStats,
  Project as ProjectType
} from '../store/slices/projectSlice';
import { AppDispatch } from '../store';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Project: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    projects, currentProject, loading, 
    totalProjects, statusStats, recentProjects, upcomingDeadlines 
  } = useSelector((state: RootState) => state.project);
  
  // 本地状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isMemberModalVisible, setIsMemberModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectType | null>(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [memberForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');
  // 获取项目列表
  useEffect(() => {
    if (activeTab === 'all') {
      dispatch(fetchProjects({ 
        page: currentPage, 
        limit: pageSize, 
        search: searchText,
        status: statusFilter || undefined
      }));
    } else if (activeTab === 'my') {
      dispatch(fetchUserProjects());
    } else if (activeTab === 'stats') {
      dispatch(fetchProjectStats());
    }
  }, [dispatch, currentPage, pageSize, searchText, statusFilter, activeTab]);

  // 处理创建/编辑项目
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      // 处理日期范围
      const dateRange = values.dateRange;
      const projectData = {
        ...values,
        startDate: dateRange[0].format('YYYY-MM-DD'),
        plannedEndDate: dateRange[1].format('YYYY-MM-DD'),
      };
      
      delete projectData.dateRange;
      
      if (editingProject) {
        await dispatch(updateProject({ id: editingProject._id, projectData }));
        message.success('项目更新成功');
      } else {
        await dispatch(createProject(projectData));
        message.success('项目创建成功');
      }
      
      setIsModalVisible(false);
      form.resetFields();
      setEditingProject(null);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 处理取消
  const handleCancel = () => {
    setIsModalVisible(false);
    setIsViewModalVisible(false);
    setIsMemberModalVisible(false);
    form.resetFields();
    setEditingProject(null);
  };

  // 打开创建项目模态框
  const showCreateModal = () => {
    setEditingProject(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 打开编辑项目模态框
  const showEditModal = (project: ProjectType) => {
    setEditingProject(project);
    form.setFieldsValue({
      name: project.name,
      code: project.code,
      description: project.description,
      status: project.status,
      dateRange: [moment(project.startDate), moment(project.plannedEndDate)]
    });
    setIsModalVisible(true);
  };

  // 打开查看项目详情模态框
  const showViewModal = (project: ProjectType) => {
    dispatch(fetchProject(project._id));
    setIsViewModalVisible(true);
  };

  // 打开成员管理模态框
  const showMemberModal = (project: ProjectType) => {
    setEditingProject(project);
    setIsMemberModalVisible(true);
  };

  // 处理删除项目
  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteProject(id));
      message.success('项目删除成功');
    } catch (error) {
      message.error('删除项目失败');
    }
  };

  // 处理添加成员
  const handleAddMember = async () => {
    try {
      const values = await memberForm.validateFields();
      if (editingProject) {
        await dispatch(addProjectMember({ 
          id: editingProject._id, 
          userData: values 
        }));
        message.success('成员添加成功');
        memberForm.resetFields();

        // 刷新当前项目的成员列表
        if (editingProject) {
          const result = await dispatch(fetchProject(editingProject._id));
          if (result.payload) {
            setEditingProject(result.payload as ProjectType);
          }
        }
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 处理移除成员
  const handleRemoveMember = async (projectId: string, userId: string) => {
    try {
      await dispatch(removeProjectMember({ projectId, userId }));
      message.success('成员移除成功');
      
      // 刷新当前项目的成员列表
      if (editingProject) {
        const result = await dispatch(fetchProject(projectId));
        if (result.payload) {
          setEditingProject(result.payload as ProjectType);
        }
      }
    } catch (error) {
      message.error('移除成员失败');
    }
  };

  // 处理更新成员角色
  const handleUpdateRole = async (projectId: string, userId: string, role: string) => {
    try {
      await dispatch(updateMemberRole({ projectId, userId, role }));
      message.success('成员角色更新成功');
    } catch (error) {
      message.error('更新成员角色失败');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ProjectType) => (
        <Button type="link" onClick={() => showViewModal(record)}>{text}</Button>
      )
    },
    {
      title: '项目代码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = '';
        let icon = null;
        
        switch (status) {
          case 'active':
            color = 'green';
            icon = <CheckCircleOutlined />;
            break;
          case 'completed':
            color = 'blue';
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
            {status === 'active' ? '活跃' : status === 'completed' ? '已完成' : '已归档'}
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
      title: '计划结束日期',
      dataIndex: 'plannedEndDate',
      key: 'plannedEndDate',
      render: (date: string) => moment(date).format('YYYY-MM-DD')
    },
    {
      title: '项目经理',
      dataIndex: 'manager',
      key: 'manager',
      render: (manager: string) => (
        <Tooltip title="项目经理">
          <Tag icon={<TeamOutlined />} color="blue">
            {manager}
          </Tag>
        </Tooltip>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ProjectType) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
          />
          <Button 
            type="text" 
            icon={<TeamOutlined />} 
            onClick={() => showMemberModal(record)}
          />
          <Popconfirm
            title="确定要删除这个项目吗？"
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

  // 渲染项目统计信息
  const renderStats = () => (
    <div>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="总项目数" value={totalProjects} />
          </Card>
        </Col>
        <Col span={16}>
          <Card title="项目状态统计">
            {statusStats.map((stat: any) => (
              <Tag color={stat._id === 'active' ? 'green' : stat._id === 'completed' ? 'blue' : 'gray'} key={stat._id}>
                {stat._id === 'active' ? '活跃' : stat._id === 'completed' ? '已完成' : '已归档'}: {stat.count}
              </Tag>
            ))}
          </Card>
        </Col>
      </Row>
      
      <Divider orientation="left">最近创建的项目</Divider>
      <Table 
        dataSource={recentProjects} 
        columns={columns} 
        rowKey="_id" 
        pagination={false}
        size="small"
      />
      
      <Divider orientation="left">即将到期的项目</Divider>
      <Table 
        dataSource={upcomingDeadlines} 
        columns={columns} 
        rowKey="_id" 
        pagination={false}
        size="small"
      />
    </div>
  );

  // 渲染项目表格
  const renderProjectTable = () => (
    <Table 
      dataSource={projects} 
      columns={columns} 
      rowKey="_id" 
      loading={loading}
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: totalProjects,
        onChange: (page, pageSize) => {
          setCurrentPage(page);
          if (pageSize) setPageSize(pageSize);
        }
      }}
    />
  );

  // 渲染项目详情
  const renderProjectDetail = () => {
    if (!currentProject) return null;
    
    return (
      <div>
        <Title level={4}>{currentProject.name}</Title>
        <Text type="secondary">项目代码: {currentProject.code}</Text>
        
        <Divider />
        
        <Row gutter={16}>
          <Col span={12}>
            <Text strong>状态: </Text>
            <Tag color={
              currentProject.status === 'active' ? 'green' : 
              currentProject.status === 'completed' ? 'blue' : 'gray'
            }>
              {currentProject.status === 'active' ? '活跃' : 
               currentProject.status === 'completed' ? '已完成' : '已归档'}
            </Tag>
          </Col>
          <Col span={12}>
            <Text strong>项目经理: </Text>
            {currentProject.manager}
          </Col>
        </Row>
        
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Text strong>开始日期: </Text>
            {moment(currentProject.startDate).format('YYYY-MM-DD')}
          </Col>
          <Col span={12}>
            <Text strong>计划结束日期: </Text>
            {moment(currentProject.plannedEndDate).format('YYYY-MM-DD')}
          </Col>
        </Row>
        
        {currentProject.actualEndDate && (
          <Row style={{ marginTop: 16 }}>
            <Col span={24}>
              <Text strong>实际结束日期: </Text>
              {moment(currentProject.actualEndDate).format('YYYY-MM-DD')}
            </Col>
          </Row>
        )}
        
        <Divider />
        
        <Text strong>项目描述:</Text>
        <p>{currentProject.description || '无描述'}</p>
        
        <Divider />
        
        <Title level={5}>项目成员</Title>
        <Table 
          dataSource={currentProject.members} 
          rowKey={(record) => record.user}
          pagination={false}
          columns={[
            {
              title: '用户',
              dataIndex: 'user',
              key: 'user',
            },
            {
              title: '角色',
              dataIndex: 'role',
              key: 'role',
              render: (role: string) => (
                <Tag color={
                  role === 'manager' ? 'red' : 
                  role === 'developer' ? 'green' : 
                  role === 'tester' ? 'blue' : 'default'
                }>
                  {role === 'manager' ? '项目经理' : 
                   role === 'developer' ? '开发人员' : 
                   role === 'tester' ? '测试人员' : '观察者'}
                </Tag>
              )
            },
            {
              title: '加入时间',
              dataIndex: 'joinedAt',
              key: 'joinedAt',
              render: (date: string) => moment(date).format('YYYY-MM-DD')
            }
          ]}
        />
      </div>
    );
  };

  // 渲染成员管理
  const renderMemberManagement = () => {
    if (!editingProject) return null;
    
    return (
      <div>
        <Title level={4}>项目成员管理 - {editingProject.name}</Title>
        
        <Form form={memberForm} layout="inline" onFinish={handleAddMember}>
          <Form.Item
            name="user"
            label="用户ID"
            rules={[{ required: true, message: '请输入用户ID' }]}
          >
            <Input placeholder="输入用户ID" />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="角色"
            initialValue="observer"
          >
            <Select style={{ width: 120 }}>
              <Option value="manager">项目经理</Option>
              <Option value="developer">开发人员</Option>
              <Option value="tester">测试人员</Option>
              <Option value="observer">观察者</Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<UserAddOutlined />}>
              添加成员
            </Button>
          </Form.Item>
        </Form>
        
        <Divider />
        
        <Table 
          dataSource={editingProject.members} 
          rowKey={(record) => record.user}
          columns={[
            {
              title: '用户',
              dataIndex: 'user',
              key: 'user',
            },
            {
              title: '角色',
              dataIndex: 'role',
              key: 'role',
              render: (role: string, record: any) => (
                <Select 
                  defaultValue={role} 
                  style={{ width: 120 }}
                  onChange={(value) => handleUpdateRole(editingProject._id, record.user, value)}
                >
                  <Option value="manager">项目经理</Option>
                  <Option value="developer">开发人员</Option>
                  <Option value="tester">测试人员</Option>
                  <Option value="observer">观察者</Option>
                </Select>
              )
            },
            {
              title: '加入时间',
              dataIndex: 'joinedAt',
              key: 'joinedAt',
              render: (date: string) => moment(date).format('YYYY-MM-DD')
            },
            {
              title: '操作',
              key: 'action',
              render: (_: any, record: any) => (
                <Popconfirm
                  title="确定要移除这个成员吗？"
                  onConfirm={() => handleRemoveMember(editingProject._id, record.user)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="text" danger icon={<UserDeleteOutlined />}>
                    移除
                  </Button>
                </Popconfirm>
              )
            }
          ]}
        />
      </div>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Title level={2}>项目管理</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showCreateModal}
        >
          创建项目
        </Button>
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Input.Search
            placeholder="搜索项目"
            allowClear
            onSearch={(value) => {
              setSearchText(value);
              setCurrentPage(1);
            }}
            style={{ width: 200 }}
          />
          
          <Select
            placeholder="状态筛选"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <Option value="active">活跃</Option>
            <Option value="completed">已完成</Option>
            <Option value="archived">已归档</Option>
          </Select>
        </Space>
      </div>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="所有项目" key="all">
          {renderProjectTable()}
        </TabPane>
        <TabPane tab="我的项目" key="my">
          {renderProjectTable()}
        </TabPane>
        <TabPane tab="项目统计" key="stats">
          {renderStats()}
        </TabPane>
      </Tabs>
      
      {/* 创建/编辑项目模态框 */}
      <Modal
        title={editingProject ? '编辑项目' : '创建项目'}
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
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="输入项目名称" />
          </Form.Item>
          
          <Form.Item
            name="code"
            label="项目代码"
            rules={[{ required: true, message: '请输入项目代码' }]}
          >
            <Input placeholder="输入项目代码" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="项目描述"
          >
            <Input.TextArea rows={4} placeholder="输入项目描述" />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="项目状态"
            initialValue="active"
          >
            <Select>
              <Option value="active">活跃</Option>
              <Option value="completed">已完成</Option>
              <Option value="archived">已归档</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="dateRange"
            label="项目日期"
            rules={[{ required: true, message: '请选择项目日期范围' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 查看项目详情模态框 */}
      <Modal
        title="项目详情"
        open={isViewModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {renderProjectDetail()}
      </Modal>
      
      {/* 成员管理模态框 */}
      <Modal
        title="成员管理"
        open={isMemberModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {renderMemberManagement()}
      </Modal>
    </div>
  );
};

export default Project;
