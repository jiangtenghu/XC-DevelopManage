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
  Tag,
  Progress,
  DatePicker
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;
const { confirm } = Modal;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// 模拟数据
const initialTestPlans = [
  {
    id: '1',
    name: '产品A功能测试计划',
    projectName: '产品A项目',
    iterationName: '迭代1',
    status: 'in_progress',
    progress: 75,
    startDate: '2025-04-01',
    endDate: '2025-05-15',
    description: '产品A的功能测试计划，覆盖所有核心功能',
    creatorName: '张三',
    createdAt: '2025-03-25 10:00:00',
    updatedAt: '2025-04-10 14:30:00',
  },
  {
    id: '2',
    name: '产品B性能测试计划',
    projectName: '产品B项目',
    iterationName: '迭代2',
    status: 'not_started',
    progress: 0,
    startDate: '2025-05-10',
    endDate: '2025-05-30',
    description: '产品B的性能测试计划，包括负载测试和压力测试',
    creatorName: '李四',
    createdAt: '2025-04-15 09:30:00',
    updatedAt: '2025-04-15 09:30:00',
  },
  {
    id: '3',
    name: '安全测试计划',
    projectName: '产品C项目',
    iterationName: '迭代3',
    status: 'completed',
    progress: 100,
    startDate: '2025-03-15',
    endDate: '2025-04-15',
    description: '产品C的安全测试计划，包括渗透测试和安全审计',
    creatorName: '王五',
    createdAt: '2025-03-10 11:20:00',
    updatedAt: '2025-04-16 10:15:00',
  },
];

const TestPlan: React.FC = () => {
  const [testPlans, setTestPlans] = useState(initialTestPlans);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingTestPlanId, setEditingTestPlanId] = useState<string | null>(null);

  useEffect(() => {
    // 在实际项目中，这里会从API获取数据
    document.title = '测试管理系统 - 测试计划';
  }, []);

  // 表格列定义
  const columns = [
    {
      title: '计划名称',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    },
    {
      title: '所属项目',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: '所属迭代',
      dataIndex: 'iterationName',
      key: 'iterationName',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'blue';
        let text = '进行中';
        
        if (status === 'not_started') {
          color = 'orange';
          text = '未开始';
        } else if (status === 'completed') {
          color = 'green';
          text = '已完成';
        } else if (status === 'cancelled') {
          color = 'red';
          text = '已取消';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => <Progress percent={progress} size="small" />,
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      sorter: (a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      sorter: (a: any, b: any) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
    },
    {
      title: '创建人',
      dataIndex: 'creatorName',
      key: 'creatorName',
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
  const filteredTestPlans = testPlans.filter(
    (testPlan) =>
      testPlan.name.toLowerCase().includes(searchText.toLowerCase()) ||
      testPlan.projectName.toLowerCase().includes(searchText.toLowerCase()) ||
      testPlan.iterationName.toLowerCase().includes(searchText.toLowerCase())
  );

  // 显示新增/编辑模态框
  const showModal = (testPlan?: any) => {
    if (testPlan) {
      setEditingTestPlanId(testPlan.id);
      form.setFieldsValue({
        name: testPlan.name,
        projectName: testPlan.projectName,
        iterationName: testPlan.iterationName,
        status: testPlan.status,
        progress: testPlan.progress,
        dateRange: [moment(testPlan.startDate), moment(testPlan.endDate)],
        description: testPlan.description,
      });
    } else {
      setEditingTestPlanId(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // 处理编辑
  const handleEdit = (testPlan: any) => {
    showModal(testPlan);
  };

  // 处理模态框确认
  const handleOk = () => {
    form.validateFields().then((values) => {
      const formattedValues = {
        ...values,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
      };
      
      delete formattedValues.dateRange;
      
      if (editingTestPlanId) {
        // 编辑现有测试计划
        const updatedTestPlans = testPlans.map((tp) =>
          tp.id === editingTestPlanId
            ? {
                ...tp,
                ...formattedValues,
                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
              }
            : tp
        );
        setTestPlans(updatedTestPlans);
        message.success('测试计划更新成功');
      } else {
        // 创建新测试计划
        const newTestPlan = {
          id: String(testPlans.length + 1),
          ...formattedValues,
          creatorName: '当前用户',
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
        setTestPlans([...testPlans, newTestPlan]);
        message.success('测试计划创建成功');
      }
      setIsModalVisible(false);
    });
  };

  // 处理模态框取消
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // 显示删除确认
  const showDeleteConfirm = (testPlan: any) => {
    confirm({
      title: '确定要删除这个测试计划吗?',
      icon: <ExclamationCircleOutlined />,
      content: `测试计划名称: ${testPlan.name}`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        handleDelete(testPlan.id);
      },
    });
  };

  // 处理删除
  const handleDelete = (id: string) => {
    const updatedTestPlans = testPlans.filter((tp) => tp.id !== id);
    setTestPlans(updatedTestPlans);
    message.success('测试计划删除成功');
  };

  return (
    <div className="test-plan">
      <Title level={2}>测试计划管理</Title>
      
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Input.Search
            placeholder="搜索测试计划"
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
            新建测试计划
          </Button>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={filteredTestPlans} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingTestPlanId ? "编辑测试计划" : "新建测试计划"}
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
            name="name"
            label="计划名称"
            rules={[{ required: true, message: '请输入计划名称' }]}
          >
            <Input placeholder="请输入计划名称" />
          </Form.Item>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="projectName"
              label="所属项目"
              rules={[{ required: true, message: '请选择所属项目' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="请选择所属项目">
                <Option value="产品A项目">产品A项目</Option>
                <Option value="产品B项目">产品B项目</Option>
                <Option value="产品C项目">产品C项目</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="iterationName"
              label="所属迭代"
              rules={[{ required: true, message: '请选择所属迭代' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="请选择所属迭代">
                <Option value="迭代1">迭代1</Option>
                <Option value="迭代2">迭代2</Option>
                <Option value="迭代3">迭代3</Option>
              </Select>
            </Form.Item>
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="请选择状态">
                <Option value="not_started">未开始</Option>
                <Option value="in_progress">进行中</Option>
                <Option value="completed">已完成</Option>
                <Option value="cancelled">已取消</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="progress"
              label="进度"
              rules={[{ required: true, message: '请输入进度' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="请选择进度">
                <Option value={0}>0%</Option>
                <Option value={25}>25%</Option>
                <Option value={50}>50%</Option>
                <Option value={75}>75%</Option>
                <Option value={100}>100%</Option>
              </Select>
            </Form.Item>
          </div>
          
          <Form.Item
            name="dateRange"
            label="计划日期"
            rules={[{ required: true, message: '请选择计划日期' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="计划描述"
          >
            <TextArea rows={4} placeholder="请输入计划描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TestPlan;
