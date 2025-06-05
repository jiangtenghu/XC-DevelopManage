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
  Badge
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
const initialDefects = [
  {
    id: '1',
    title: '登录页面用户名输入框无法输入特殊字符',
    severity: 'high',
    priority: 'high',
    status: 'open',
    type: 'functional',
    projectName: '产品A项目',
    iterationName: '迭代1',
    assigneeName: '张三',
    reporterName: '李四',
    description: '登录页面的用户名输入框无法输入@、#等特殊字符，导致使用邮箱作为用户名的用户无法登录。',
    stepsToReproduce: '1. 打开登录页面\n2. 在用户名输入框中输入包含@的邮箱地址\n3. 观察输入框的反应',
    expectedResult: '用户名输入框应该能够接受包含@等特殊字符的输入',
    actualResult: '用户名输入框会自动过滤掉@等特殊字符',
    createdAt: '2025-04-01 10:00:00',
    updatedAt: '2025-04-15 14:30:00',
  },
  {
    id: '2',
    title: '系统在高并发下响应缓慢',
    severity: 'medium',
    priority: 'medium',
    status: 'in_progress',
    type: 'performance',
    projectName: '产品B项目',
    iterationName: '迭代2',
    assigneeName: '王五',
    reporterName: '赵六',
    description: '系统在100个并发用户下响应时间超过3秒，不符合性能要求。',
    stepsToReproduce: '1. 使用JMeter创建100个并发用户的测试计划\n2. 执行测试计划\n3. 观察系统响应时间',
    expectedResult: '系统响应时间应该小于2秒',
    actualResult: '系统响应时间为3.5秒',
    createdAt: '2025-03-15 09:30:00',
    updatedAt: '2025-04-10 16:45:00',
  },
  {
    id: '3',
    title: '导出报表功能无法正常工作',
    severity: 'low',
    priority: 'low',
    status: 'closed',
    type: 'functional',
    projectName: '产品C项目',
    iterationName: '迭代3',
    assigneeName: '钱七',
    reporterName: '孙八',
    description: '点击导出报表按钮后，没有任何反应，也没有错误提示。',
    stepsToReproduce: '1. 进入报表页面\n2. 点击导出报表按钮',
    expectedResult: '系统应该生成并下载报表文件',
    actualResult: '没有任何反应，也没有错误提示',
    createdAt: '2025-02-20 11:20:00',
    updatedAt: '2025-04-05 10:15:00',
  },
];

const Defect: React.FC = () => {
  const [defects, setDefects] = useState(initialDefects);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingDefectId, setEditingDefectId] = useState<string | null>(null);

  useEffect(() => {
    // 在实际项目中，这里会从API获取数据
    document.title = '测试管理系统 - 缺陷管理';
  }, []);

  // 表格列定义
  const columns = [
    {
      title: '缺陷标题',
      dataIndex: 'title',
      key: 'title',
      sorter: (a: any, b: any) => a.title.localeCompare(b.title),
      render: (text: string, record: any) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>
            ID: {record.id} | 项目: {record.projectName} | 迭代: {record.iterationName}
          </div>
        </div>
      ),
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => {
        let color = 'green';
        if (severity === 'high') {
          color = 'red';
        } else if (severity === 'medium') {
          color = 'orange';
        }
        return <Tag color={color}>{severity.toUpperCase()}</Tag>;
      },
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
        let text = '';
        let status_color = '';
        
        if (status === 'open') {
          text = '待解决';
          status_color = 'error';
        } else if (status === 'in_progress') {
          text = '解决中';
          status_color = 'processing';
        } else if (status === 'resolved') {
          text = '已解决';
          status_color = 'warning';
        } else if (status === 'closed') {
          text = '已关闭';
          status_color = 'success';
        }
        
        return <Badge status={status_color as any} text={text} />;
      },
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        let text = '功能缺陷';
        if (type === 'performance') {
          text = '性能缺陷';
        } else if (type === 'security') {
          text = '安全缺陷';
        } else if (type === 'usability') {
          text = '可用性缺陷';
        }
        return text;
      },
    },
    {
      title: '指派给',
      dataIndex: 'assigneeName',
      key: 'assigneeName',
    },
    {
      title: '报告人',
      dataIndex: 'reporterName',
      key: 'reporterName',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
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
  const filteredDefects = defects.filter(
    (defect) =>
      defect.title.toLowerCase().includes(searchText.toLowerCase()) ||
      defect.description.toLowerCase().includes(searchText.toLowerCase()) ||
      defect.projectName.toLowerCase().includes(searchText.toLowerCase()) ||
      defect.iterationName.toLowerCase().includes(searchText.toLowerCase())
  );

  // 显示新增/编辑模态框
  const showModal = (defect?: any) => {
    if (defect) {
      setEditingDefectId(defect.id);
      form.setFieldsValue({
        title: defect.title,
        severity: defect.severity,
        priority: defect.priority,
        status: defect.status,
        type: defect.type,
        projectName: defect.projectName,
        iterationName: defect.iterationName,
        assigneeName: defect.assigneeName,
        description: defect.description,
        stepsToReproduce: defect.stepsToReproduce,
        expectedResult: defect.expectedResult,
        actualResult: defect.actualResult,
      });
    } else {
      setEditingDefectId(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // 处理编辑
  const handleEdit = (defect: any) => {
    showModal(defect);
  };

  // 处理模态框确认
  const handleOk = () => {
    form.validateFields().then((values) => {
      if (editingDefectId) {
        // 编辑现有缺陷
        const updatedDefects = defects.map((d) =>
          d.id === editingDefectId
            ? {
                ...d,
                ...values,
                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
              }
            : d
        );
        setDefects(updatedDefects);
        message.success('缺陷更新成功');
      } else {
        // 创建新缺陷
        const newDefect = {
          id: String(defects.length + 1),
          ...values,
          reporterName: '当前用户',
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
        setDefects([...defects, newDefect]);
        message.success('缺陷创建成功');
      }
      setIsModalVisible(false);
    });
  };

  // 处理模态框取消
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // 显示删除确认
  const showDeleteConfirm = (defect: any) => {
    confirm({
      title: '确定要删除这个缺陷吗?',
      icon: <ExclamationCircleOutlined />,
      content: `缺陷标题: ${defect.title}`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        handleDelete(defect.id);
      },
    });
  };

  // 处理删除
  const handleDelete = (id: string) => {
    const updatedDefects = defects.filter((d) => d.id !== id);
    setDefects(updatedDefects);
    message.success('缺陷删除成功');
  };

  return (
    <div className="defect">
      <Title level={2}>缺陷管理</Title>
      
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Input.Search
            placeholder="搜索缺陷"
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
            新建缺陷
          </Button>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={filteredDefects} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingDefectId ? "编辑缺陷" : "新建缺陷"}
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
            label="缺陷标题"
            rules={[{ required: true, message: '请输入缺陷标题' }]}
          >
            <Input placeholder="请输入缺陷标题" />
          </Form.Item>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="severity"
              label="严重程度"
              rules={[{ required: true, message: '请选择严重程度' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="请选择严重程度">
                <Option value="high">高</Option>
                <Option value="medium">中</Option>
                <Option value="low">低</Option>
              </Select>
            </Form.Item>
            
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
                <Option value="open">待解决</Option>
                <Option value="in_progress">解决中</Option>
                <Option value="resolved">已解决</Option>
                <Option value="closed">已关闭</Option>
              </Select>
            </Form.Item>
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="type"
              label="类型"
              rules={[{ required: true, message: '请选择类型' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="请选择类型">
                <Option value="functional">功能缺陷</Option>
                <Option value="performance">性能缺陷</Option>
                <Option value="security">安全缺陷</Option>
                <Option value="usability">可用性缺陷</Option>
              </Select>
            </Form.Item>
            
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
          
          <Form.Item
            name="assigneeName"
            label="指派给"
            rules={[{ required: true, message: '请选择指派人' }]}
          >
            <Select placeholder="请选择指派人">
              <Option value="张三">张三</Option>
              <Option value="李四">李四</Option>
              <Option value="王五">王五</Option>
              <Option value="赵六">赵六</Option>
              <Option value="钱七">钱七</Option>
              <Option value="孙八">孙八</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="description"
            label="缺陷描述"
            rules={[{ required: true, message: '请输入缺陷描述' }]}
          >
            <TextArea rows={3} placeholder="请输入缺陷描述" />
          </Form.Item>
          
          <Form.Item
            name="stepsToReproduce"
            label="重现步骤"
            rules={[{ required: true, message: '请输入重现步骤' }]}
          >
            <TextArea rows={3} placeholder="请输入重现步骤" />
          </Form.Item>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="expectedResult"
              label="预期结果"
              rules={[{ required: true, message: '请输入预期结果' }]}
              style={{ flex: 1 }}
            >
              <TextArea rows={2} placeholder="请输入预期结果" />
            </Form.Item>
            
            <Form.Item
              name="actualResult"
              label="实际结果"
              rules={[{ required: true, message: '请输入实际结果' }]}
              style={{ flex: 1 }}
            >
              <TextArea rows={2} placeholder="请输入实际结果" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Defect;
