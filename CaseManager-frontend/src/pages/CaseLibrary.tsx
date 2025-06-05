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
  message
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;
const { confirm } = Modal;

// 模拟数据
const initialLibraries = [
  {
    id: '1',
    name: '产品A测试用例库',
    code: 'PROD-A',
    description: '产品A的功能测试用例集合',
    isPublic: true,
    creatorName: '张三',
    createdAt: '2025-04-01 10:00:00',
    updatedAt: '2025-04-15 14:30:00',
  },
  {
    id: '2',
    name: '产品B测试用例库',
    code: 'PROD-B',
    description: '产品B的功能和性能测试用例集合',
    isPublic: true,
    creatorName: '李四',
    createdAt: '2025-03-15 09:30:00',
    updatedAt: '2025-04-10 16:45:00',
  },
  {
    id: '3',
    name: '安全测试用例库',
    code: 'SEC-TEST',
    description: '通用安全测试用例集合',
    isPublic: false,
    creatorName: '王五',
    createdAt: '2025-02-20 11:20:00',
    updatedAt: '2025-04-05 10:15:00',
  },
];

const CaseLibrary: React.FC = () => {
  const [libraries, setLibraries] = useState(initialLibraries);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingLibraryId, setEditingLibraryId] = useState<string | null>(null);

  useEffect(() => {
    // 在实际项目中，这里会从API获取数据
    document.title = '测试管理系统 - 用例库';
  }, []);

  // 表格列定义
  const columns = [
    {
      title: '用例库名称',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    },
    {
      title: '编号',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '公开性',
      dataIndex: 'isPublic',
      key: 'isPublic',
      render: (isPublic: boolean) => (isPublic ? '公开' : '私密'),
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
      render: (text: string, record: any) => (
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
  const filteredLibraries = libraries.filter(
    (library) =>
      library.name.toLowerCase().includes(searchText.toLowerCase()) ||
      library.code.toLowerCase().includes(searchText.toLowerCase()) ||
      library.description.toLowerCase().includes(searchText.toLowerCase())
  );

  // 显示新增/编辑模态框
  const showModal = (library?: any) => {
    if (library) {
      setEditingLibraryId(library.id);
      form.setFieldsValue({
        name: library.name,
        code: library.code,
        description: library.description,
        isPublic: library.isPublic,
      });
    } else {
      setEditingLibraryId(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // 处理编辑
  const handleEdit = (library: any) => {
    showModal(library);
  };

  // 处理模态框确认
  const handleOk = () => {
    form.validateFields().then((values) => {
      if (editingLibraryId) {
        // 编辑现有用例库
        const updatedLibraries = libraries.map((lib) =>
          lib.id === editingLibraryId
            ? {
                ...lib,
                ...values,
                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
              }
            : lib
        );
        setLibraries(updatedLibraries);
        message.success('用例库更新成功');
      } else {
        // 创建新用例库
        const newLibrary = {
          id: String(libraries.length + 1),
          ...values,
          creatorName: '当前用户',
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
        setLibraries([...libraries, newLibrary]);
        message.success('用例库创建成功');
      }
      setIsModalVisible(false);
    });
  };

  // 处理模态框取消
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // 显示删除确认
  const showDeleteConfirm = (library: any) => {
    confirm({
      title: '确定要删除这个用例库吗?',
      icon: <ExclamationCircleOutlined />,
      content: `用例库名称: ${library.name}`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        handleDelete(library.id);
      },
    });
  };

  // 处理删除
  const handleDelete = (id: string) => {
    const updatedLibraries = libraries.filter((lib) => lib.id !== id);
    setLibraries(updatedLibraries);
    message.success('用例库删除成功');
  };

  return (
    <div className="case-library">
      <Title level={2}>测试用例库</Title>
      
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Input.Search
            placeholder="搜索用例库"
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
            新建用例库
          </Button>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={filteredLibraries} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingLibraryId ? "编辑用例库" : "新建用例库"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="用例库名称"
            rules={[{ required: true, message: '请输入用例库名称' }]}
          >
            <Input placeholder="请输入用例库名称" />
          </Form.Item>
          <Form.Item
            name="code"
            label="编号"
            rules={[{ required: true, message: '请输入编号' }]}
          >
            <Input placeholder="请输入编号" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={4} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item
            name="isPublic"
            label="公开性"
            initialValue={true}
          >
            <Select>
              <Option value={true}>公开</Option>
              <Option value={false}>私密</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CaseLibrary;
