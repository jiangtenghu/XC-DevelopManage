import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Typography, 
  Card, 
  Input, 
  Modal, 
  Form, 
  Select,
  message,
  Tag
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;
const { confirm } = Modal;
const { TextArea } = Input;

// 模拟数据
const initialTestCases = [
  {
    id: '1',
    title: '登录功能测试',
    priority: 'high',
    status: 'active',
    type: 'functional',
    precondition: '系统已部署，数据库已初始化',
    steps: [
      '打开登录页面',
      '输入正确的用户名和密码',
      '点击登录按钮'
    ],
    expectedResult: '成功登录系统，跳转到首页',
    libraryName: '产品A测试用例库',
    creatorName: '张三',
    createdAt: '2025-04-01 10:00:00',
    updatedAt: '2025-04-15 14:30:00',
  },
  {
    id: '2',
    title: '注册功能测试',
    priority: 'medium',
    status: 'active',
    type: 'functional',
    precondition: '系统已部署，数据库已初始化',
    steps: [
      '打开注册页面',
      '输入用户信息',
      '点击注册按钮'
    ],
    expectedResult: '成功注册新用户，跳转到登录页面',
    libraryName: '产品A测试用例库',
    creatorName: '李四',
    createdAt: '2025-03-15 09:30:00',
    updatedAt: '2025-04-10 16:45:00',
  },
  {
    id: '3',
    title: '性能负载测试',
    priority: 'high',
    status: 'active',
    type: 'performance',
    precondition: '系统已部署，测试环境已准备',
    steps: [
      '使用JMeter创建测试计划',
      '设置100个并发用户',
      '执行测试计划',
      '收集测试结果'
    ],
    expectedResult: '系统响应时间小于2秒，CPU使用率小于80%',
    libraryName: '产品B测试用例库',
    creatorName: '王五',
    createdAt: '2025-02-20 11:20:00',
    updatedAt: '2025-04-05 10:15:00',
  },
];

const TestCase: React.FC = () => {
  const [testCases, setTestCases] = useState(initialTestCases);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingTestCaseId, setEditingTestCaseId] = useState<string | null>(null);

  useEffect(() => {
    // 在实际项目中，这里会从API获取数据
    document.title = '测试管理系统 - 测试用例';
  }, []);

  // 表格列定义
  const columns = [
    {
      title: '用例标题',
      dataIndex: 'title',
      key: 'title',
      sorter: (a: any, b: any) => a.title.localeCompare(b.title),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        let color = 'green';
        if (priority === 'high') {
          color = 'red';
        } else if (priority === 'medium') {
          color = 'orange';
        }
        return <Tag color={color}>{priority.toUpperCase()}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'green';
        if (status === 'inactive') {
          color = 'gray';
        } else if (status === 'deprecated') {
          color = 'red';
        }
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '所属用例库',
      dataIndex: 'libraryName',
      key: 'libraryName',
    },
    {
      title: '创建人',
      dataIndex: 'creatorName',
      key: 'creatorName',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      sorter: (a: any, b: any) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: string, record: any) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => showDeleteConfirm(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // 过滤数据
  const filteredTestCases = testCases.filter(
    (testCase) =>
      testCase.title.toLowerCase().includes(searchText.toLowerCase()) ||
      testCase.type.toLowerCase().includes(searchText.toLowerCase()) ||
      testCase.libraryName.toLowerCase().includes(searchText.toLowerCase())
  );

  // 显示新增/编辑模态框
  const showModal = (testCase?: any) => {
    if (testCase) {
      setEditingTestCaseId(testCase.id);
      form.setFieldsValue({
        title: testCase.title,
        priority: testCase.priority,
        status: testCase.status,
        type: testCase.type,
        precondition: testCase.precondition,
        steps: testCase.steps.join('\n'),
        expectedResult: testCase.expectedResult,
        libraryName: testCase.libraryName,
      });
    } else {
      setEditingTestCaseId(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // 处理编辑
  const handleEdit = (testCase: any) => {
    showModal(testCase);
  };

  // 处理模态框确认
  const handleOk = () => {
    form.validateFields().then((values) => {
      const formattedValues = {
        ...values,
        steps: values.steps.split('\n').filter((step: string) => step.trim() !== '')
      };
      
      if (editingTestCaseId) {
        // 编辑现有测试用例
        const updatedTestCases = testCases.map((tc) =>
          tc.id === editingTestCaseId
            ? {
                ...tc,
                ...formattedValues,
                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
              }
            : tc
        );
        setTestCases(updatedTestCases);
        message.success('测试用例更新成功');
      } else {
        // 创建新测试用例
        const newTestCase = {
          id: String(testCases.length + 1),
          ...formattedValues,
          creatorName: '当前用户',
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
        setTestCases([...testCases, newTestCase]);
        message.success('测试用例创建成功');
      }
      setIsModalVisible(false);
    });
  };

  // 处理模态框取消
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // 显示删除确认
  const showDeleteConfirm = (testCase: any) => {
    confirm({
      title: '确定要删除这个测试用例吗?',
      icon: <ExclamationCircleOutlined />,
      content: `测试用例标题: ${testCase.title}`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        handleDelete(testCase.id);
      },
    });
  };

  // 处理删除
  const handleDelete = (id: string) => {
    const updatedTestCases = testCases.filter((tc) => tc.id !== id);
    setTestCases(updatedTestCases);
    message.success('测试用例删除成功');
  };

  return (
    <div className="test-case">
      <Title level={2}>测试用例管理</Title>
      
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Input.Search
            placeholder="搜索测试用例"
            allowClear
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showModal()}
          >
            新建测试用例
          </Button>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={filteredTestCases} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingTestCaseId ? "编辑测试用例" : "新建测试用例"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        destroyOnClose
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="title"
            label="用例标题"
            rules={[{ required: true, message: '请输入用例标题' }]}
          >
            <Input placeholder="请输入用例标题" />
          </Form.Item>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="priority"
              label="优先级"
              rules={[{ required: true, message: '请选择优先级' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="请选择优先级">
                <Option value="high">高</Option>
                <Option value="medium">中</Option>
                <Option value="low">低</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="请选择状态">
                <Option value="active">活跃</Option>
                <Option value="inactive">非活跃</Option>
                <Option value="deprecated">已废弃</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="type"
              label="类型"
              rules={[{ required: true, message: '请选择类型' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="请选择类型">
                <Option value="functional">功能测试</Option>
                <Option value="performance">性能测试</Option>
                <Option value="security">安全测试</Option>
                <Option value="usability">可用性测试</Option>
                <Option value="compatibility">兼容性测试</Option>
              </Select>
            </Form.Item>
          </div>
          
          <Form.Item
            name="libraryName"
            label="所属用例库"
            rules={[{ required: true, message: '请选择所属用例库' }]}
          >
            <Select placeholder="请选择所属用例库">
              <Option value="产品A测试用例库">产品A测试用例库</Option>
              <Option value="产品B测试用例库">产品B测试用例库</Option>
              <Option value="安全测试用例库">安全测试用例库</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="precondition"
            label="前置条件"
          >
            <TextArea rows={2} placeholder="请输入前置条件" />
          </Form.Item>
          
          <Form.Item
            name="steps"
            label="测试步骤"
            rules={[{ required: true, message: '请输入测试步骤' }]}
          >
            <TextArea rows={4} placeholder="请输入测试步骤，每行一个步骤" />
          </Form.Item>
          
          <Form.Item
            name="expectedResult"
            label="预期结果"
            rules={[{ required: true, message: '请输入预期结果' }]}
          >
            <TextArea rows={2} placeholder="请输入预期结果" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TestCase;
