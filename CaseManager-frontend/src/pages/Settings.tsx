import React, { useState } from 'react';
import { 
  Typography, 
  Card, 
  Tabs, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Select, 
  Divider, 
  message, 
  Upload, 
  Space,
  Table,
  Tag,
  Popconfirm
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined, 
  TeamOutlined, 
  SettingOutlined, 
  CloudUploadOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UploadOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// 模拟用户数据
const initialUsers = [
  {
    id: '1',
    username: 'admin',
    name: '管理员',
    email: 'admin@example.com',
    role: 'admin',
    status: 'active',
  },
  {
    id: '2',
    username: 'zhangsan',
    name: '张三',
    email: 'zhangsan@example.com',
    role: 'tester',
    status: 'active',
  },
  {
    id: '3',
    username: 'lisi',
    name: '李四',
    email: 'lisi@example.com',
    role: 'developer',
    status: 'active',
  },
  {
    id: '4',
    username: 'wangwu',
    name: '王五',
    email: 'wangwu@example.com',
    role: 'tester',
    status: 'inactive',
  },
];

// 模拟角色数据
const initialRoles = [
  {
    id: '1',
    name: 'admin',
    displayName: '管理员',
    description: '系统管理员，拥有所有权限',
    permissions: ['read', 'write', 'delete', 'admin'],
  },
  {
    id: '2',
    name: 'tester',
    displayName: '测试人员',
    description: '测试人员，可以创建和执行测试',
    permissions: ['read', 'write'],
  },
  {
    id: '3',
    name: 'developer',
    displayName: '开发人员',
    description: '开发人员，可以查看测试结果和修复缺陷',
    permissions: ['read', 'write'],
  },
  {
    id: '4',
    name: 'viewer',
    displayName: '查看者',
    description: '只能查看，不能修改',
    permissions: ['read'],
  },
];

const Settings: React.FC = () => {
  const [users, setUsers] = useState(initialUsers);
  const [roles, setRoles] = useState(initialRoles);
  const [userForm] = Form.useForm();
  const [roleForm] = Form.useForm();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  // 系统设置表单初始值
  const [systemSettings, setSystemSettings] = useState({
    siteName: '测试管理系统',
    siteDescription: '一个全面的测试管理解决方案',
    emailNotifications: true,
    defaultLanguage: 'zh-CN',
    itemsPerPage: 10,
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24',
    timezone: 'Asia/Shanghai',
    allowRegistration: false,
    requireEmailVerification: true,
    sessionTimeout: 30,
  });

  // 处理系统设置表单提交
  const handleSystemSettingsSubmit = (values: any) => {
    setSystemSettings(values);
    message.success('系统设置已保存');
  };

  // 处理个人资料表单提交
  const handleProfileSubmit = (values: any) => {
    message.success('个人资料已更新');
  };

  // 处理密码修改表单提交
  const handlePasswordSubmit = (values: any) => {
    passwordForm.resetFields();
    message.success('密码已修改');
  };

  // 处理用户表单提交
  const handleUserSubmit = (values: any) => {
    if (editingUserId) {
      // 更新现有用户
      const updatedUsers = users.map(user => 
        user.id === editingUserId ? { ...user, ...values } : user
      );
      setUsers(updatedUsers);
      message.success('用户已更新');
    } else {
      // 创建新用户
      const newUser = {
        id: String(users.length + 1),
        ...values,
        status: 'active',
      };
      setUsers([...users, newUser]);
      message.success('用户已创建');
    }
    userForm.resetFields();
    setEditingUserId(null);
  };

  // 处理角色表单提交
  const handleRoleSubmit = (values: any) => {
    if (editingRoleId) {
      // 更新现有角色
      const updatedRoles = roles.map(role => 
        role.id === editingRoleId ? { ...role, ...values } : role
      );
      setRoles(updatedRoles);
      message.success('角色已更新');
    } else {
      // 创建新角色
      const newRole = {
        id: String(roles.length + 1),
        ...values,
        permissions: values.permissions || [],
      };
      setRoles([...roles, newRole]);
      message.success('角色已创建');
    }
    roleForm.resetFields();
    setEditingRoleId(null);
  };

  // 编辑用户
  const handleEditUser = (user: any) => {
    setEditingUserId(user.id);
    userForm.setFieldsValue({
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
  };

  // 删除用户
  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    message.success('用户已删除');
  };

  // 编辑角色
  const handleEditRole = (role: any) => {
    setEditingRoleId(role.id);
    roleForm.setFieldsValue({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      permissions: role.permissions,
    });
  };

  // 删除角色
  const handleDeleteRole = (roleId: string) => {
    const updatedRoles = roles.filter(role => role.id !== roleId);
    setRoles(updatedRoles);
    message.success('角色已删除');
  };

  // 上传组件属性
  const uploadProps: UploadProps = {
    name: 'file',
    action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 文件上传成功`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 文件上传失败`);
      }
    },
  };

  // 用户表格列定义
  const userColumns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        let color = 'blue';
        if (role === 'admin') {
          color = 'red';
        } else if (role === 'tester') {
          color = 'green';
        } else if (role === 'developer') {
          color = 'orange';
        }
        return <Tag color={color}>{role}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        return status === 'active' ? 
          <Tag color="green">启用</Tag> : 
          <Tag color="red">禁用</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEditUser(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 角色表格列定义
  const roleColumns = [
    {
      title: '角色名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '显示名称',
      dataIndex: 'displayName',
      key: 'displayName',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <>
          {permissions.map(permission => {
            let color = 'geekblue';
            if (permission === 'admin') {
              color = 'red';
            } else if (permission === 'write') {
              color = 'green';
            } else if (permission === 'delete') {
              color = 'orange';
            }
            return (
              <Tag color={color} key={permission}>
                {permission.toUpperCase()}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEditRole(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个角色吗?"
            onConfirm={() => handleDeleteRole(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="settings">
      <Title level={2}>系统设置</Title>
      
      <Tabs defaultActiveKey="1">
        <TabPane 
          tab={
            <span>
              <SettingOutlined />
              系统设置
            </span>
          } 
          key="1"
        >
          <Card>
            <Form
              layout="vertical"
              initialValues={systemSettings}
              onFinish={handleSystemSettingsSubmit}
            >
              <Title level={4}>基本设置</Title>
              <Form.Item
                name="siteName"
                label="系统名称"
                rules={[{ required: true, message: '请输入系统名称' }]}
              >
                <Input />
              </Form.Item>
              
              <Form.Item
                name="siteDescription"
                label="系统描述"
              >
                <Input.TextArea rows={3} />
              </Form.Item>
              
              <Divider />
              
              <Title level={4}>显示设置</Title>
              <Form.Item
                name="defaultLanguage"
                label="默认语言"
              >
                <Select>
                  <Option value="zh-CN">简体中文</Option>
                  <Option value="en-US">English (US)</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="itemsPerPage"
                label="每页显示条目数"
              >
                <Select>
                  <Option value={10}>10</Option>
                  <Option value={20}>20</Option>
                  <Option value={50}>50</Option>
                  <Option value={100}>100</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="dateFormat"
                label="日期格式"
              >
                <Select>
                  <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                  <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                  <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="timeFormat"
                label="时间格式"
              >
                <Select>
                  <Option value="24">24小时制</Option>
                  <Option value="12">12小时制</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="timezone"
                label="时区"
              >
                <Select>
                  <Option value="Asia/Shanghai">Asia/Shanghai (GMT+8)</Option>
                  <Option value="America/New_York">America/New_York (GMT-5)</Option>
                  <Option value="Europe/London">Europe/London (GMT+0)</Option>
                </Select>
              </Form.Item>
              
              <Divider />
              
              <Title level={4}>通知设置</Title>
              <Form.Item
                name="emailNotifications"
                label="启用邮件通知"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Divider />
              
              <Title level={4}>安全设置</Title>
              <Form.Item
                name="allowRegistration"
                label="允许用户注册"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name="requireEmailVerification"
                label="要求邮箱验证"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name="sessionTimeout"
                label="会话超时时间（分钟）"
              >
                <Select>
                  <Option value={15}>15分钟</Option>
                  <Option value={30}>30分钟</Option>
                  <Option value={60}>1小时</Option>
                  <Option value={120}>2小时</Option>
                  <Option value={240}>4小时</Option>
                  <Option value={480}>8小时</Option>
                </Select>
              </Form.Item>
              
              <Divider />
              
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <UserOutlined />
              用户管理
            </span>
          } 
          key="2"
        >
          <Card>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
              <Title level={4}>用户列表</Title>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingUserId(null);
                  userForm.resetFields();
                }}
              >
                添加用户
              </Button>
            </div>
            
            <Table 
              columns={userColumns} 
              dataSource={users}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
            
            <Divider />
            
            <Title level={4}>{editingUserId ? '编辑用户' : '添加用户'}</Title>
            <Form
              form={userForm}
              layout="vertical"
              onFinish={handleUserSubmit}
            >
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="用户名" />
              </Form.Item>
              
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="姓名" />
              </Form.Item>
              
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="邮箱" />
              </Form.Item>
              
              <Form.Item
                name="role"
                label="角色"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select placeholder="选择角色">
                  {roles.map(role => (
                    <Option key={role.name} value={role.name}>{role.displayName}</Option>
                  ))}
                </Select>
              </Form.Item>
              
              {editingUserId && (
                <Form.Item
                  name="status"
                  label="状态"
                  rules={[{ required: true, message: '请选择状态' }]}
                >
                  <Select placeholder="选择状态">
                    <Option value="active">启用</Option>
                    <Option value="inactive">禁用</Option>
                  </Select>
                </Form.Item>
              )}
              
              {!editingUserId && (
                <Form.Item
                  name="password"
                  label="密码"
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="密码" />
                </Form.Item>
              )}
              
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  {editingUserId ? '更新用户' : '创建用户'}
                </Button>
                {editingUserId && (
                  <Button 
                    style={{ marginLeft: 8 }} 
                    onClick={() => {
                      setEditingUserId(null);
                      userForm.resetFields();
                    }}
                  >
                    取消
                  </Button>
                )}
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <TeamOutlined />
              角色管理
            </span>
          } 
          key="3"
        >
          <Card>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
              <Title level={4}>角色列表</Title>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingRoleId(null);
                  roleForm.resetFields();
                }}
              >
                添加角色
              </Button>
            </div>
            
            <Table 
              columns={roleColumns} 
              dataSource={roles}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
            
            <Divider />
            
            <Title level={4}>{editingRoleId ? '编辑角色' : '添加角色'}</Title>
            <Form
              form={roleForm}
              layout="vertical"
              onFinish={handleRoleSubmit}
            >
              <Form.Item
                name="name"
                label="角色名"
                rules={[{ required: true, message: '请输入角色名' }]}
              >
                <Input placeholder="角色名（英文）" />
              </Form.Item>
              
              <Form.Item
                name="displayName"
                label="显示名称"
                rules={[{ required: true, message: '请输入显示名称' }]}
              >
                <Input placeholder="显示名称（中文）" />
              </Form.Item>
              
              <Form.Item
                name="description"
                label="描述"
              >
                <Input.TextArea rows={3} placeholder="角色描述" />
              </Form.Item>
              
              <Form.Item
                name="permissions"
                label="权限"
                rules={[{ required: true, message: '请选择权限' }]}
              >
                <Select mode="multiple" placeholder="选择权限">
                  <Option value="read">读取</Option>
                  <Option value="write">写入</Option>
                  <Option value="delete">删除</Option>
                  <Option value="admin">管理</Option>
                </Select>
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  {editingRoleId ? '更新角色' : '创建角色'}
                </Button>
                {editingRoleId && (
                  <Button 
                    style={{ marginLeft: 8 }} 
                    onClick={() => {
                      setEditingRoleId(null);
                      roleForm.resetFields();
                    }}
                  >
                    取消
                  </Button>
                )}
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <CloudUploadOutlined />
              备份与恢复
            </span>
          } 
          key="4"
        >
          <Card>
            <Title level={4}>数据备份</Title>
            <Paragraph>
              备份系统数据，包括用户、测试用例、测试计划、缺陷和测试报告等。
            </Paragraph>
            
            <Button type="primary" icon={<CloudUploadOutlined />} style={{ marginBottom: 16 }}>
              创建备份
            </Button>
            
            <Divider />
            
            <Title level={4}>数据恢复</Title>
            <Paragraph>
              从备份文件恢复系统数据。
            </Paragraph>
            
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>选择备份文件</Button>
            </Upload>
          </Card>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <UserOutlined />
              个人资料
            </span>
          } 
          key="5"
        >
          <Card>
            <Title level={4}>个人资料</Title>
            <Form
              form={profileForm}
              layout="vertical"
              initialValues={{
                username: 'admin',
                name: '管理员',
                email: 'admin@example.com',
                phone: '13800138000',
                department: '测试部',
                position: '测试经理',
              }}
              onFinish={handleProfileSubmit}
            >
              <Form.Item
                name="username"
                label="用户名"
              >
                <Input disabled />
              </Form.Item>
              
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input />
              </Form.Item>
              
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input />
              </Form.Item>
              
              <Form.Item
                name="phone"
                label="电话"
              >
                <Input />
              </Form.Item>
              
              <Form.Item
                name="department"
                label="部门"
              >
                <Input />
              </Form.Item>
              
              <Form.Item
                name="position"
                label="职位"
              >
                <Input />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  保存资料
                </Button>
              </Form.Item>
            </Form>
            
            <Divider />
            
            <Title level={4}>修改密码</Title>
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordSubmit}
            >
              <Form.Item
                name="currentPassword"
                label="当前密码"
                rules={[{ required: true, message: '请输入当前密码' }]}
              >
                <Input.Password />
              </Form.Item>
              
              <Form.Item
                name="newPassword"
                label="新密码"
                rules={[{ required: true, message: '请输入新密码' }]}
              >
                <Input.Password />
              </Form.Item>
              
              <Form.Item
                name="confirmPassword"
                label="确认新密码"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请确认新密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  修改密码
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Settings;
