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
  Statistic,
  Row,
  Col,
  Divider,
  Progress,
  DatePicker
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ExclamationCircleOutlined,
  DownloadOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { confirm } = Modal;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// 模拟数据
const initialTestReports = [
  {
    id: '1',
    title: '产品A功能测试报告',
    projectName: '产品A项目',
    iterationName: '迭代1',
    testPlanName: '产品A功能测试计划',
    status: 'completed',
    startDate: '2025-04-01',
    endDate: '2025-04-15',
    summary: '本次测试覆盖了产品A的所有核心功能，共发现5个缺陷，其中3个高优先级缺陷已修复，2个低优先级缺陷已纳入下一迭代修复计划。',
    totalCases: 120,
    passedCases: 115,
    failedCases: 5,
    blockedCases: 0,
    passRate: 95.8,
    defectCount: {
      high: 3,
      medium: 1,
      low: 1
    },
    creatorName: '张三',
    createdAt: '2025-04-16 10:00:00',
    updatedAt: '2025-04-16 14:30:00',
  },
  {
    id: '2',
    title: '产品B性能测试报告',
    projectName: '产品B项目',
    iterationName: '迭代2',
    testPlanName: '产品B性能测试计划',
    status: 'in_progress',
    startDate: '2025-05-10',
    endDate: '2025-05-20',
    summary: '本次测试主要针对产品B的性能进行测试，包括负载测试和压力测试。目前已完成80%的测试用例，发现2个性能相关的缺陷。',
    totalCases: 50,
    passedCases: 40,
    failedCases: 2,
    blockedCases: 8,
    passRate: 80.0,
    defectCount: {
      high: 1,
      medium: 1,
      low: 0
    },
    creatorName: '李四',
    createdAt: '2025-05-10 09:30:00',
    updatedAt: '2025-05-15 16:45:00',
  },
  {
    id: '3',
    title: '产品C安全测试报告',
    projectName: '产品C项目',
    iterationName: '迭代3',
    testPlanName: '安全测试计划',
    status: 'draft',
    startDate: '2025-06-01',
    endDate: '2025-06-15',
    summary: '本次测试计划针对产品C的安全性进行全面测试，包括渗透测试和安全审计。报告尚未完成。',
    totalCases: 80,
    passedCases: 0,
    failedCases: 0,
    blockedCases: 80,
    passRate: 0,
    defectCount: {
      high: 0,
      medium: 0,
      low: 0
    },
    creatorName: '王五',
    createdAt: '2025-05-25 11:20:00',
    updatedAt: '2025-05-25 11:20:00',
  },
];

const TestReport: React.FC = () => {
  const [testReports, setTestReports] = useState(initialTestReports);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  useEffect(() => {
    // 在实际项目中，这里会从API获取数据
    document.title = '测试管理系统 - 测试报告';
  }, []);

  // 表格列定义
  const columns = [
    {
      title: '报告标题',
      dataIndex: 'title',
      key: 'title',
      sorter: (a: any, b: any) => a.title.localeCompare(b.title),
      render: (text: string, record: any) => (
        <a onClick={() => showDetailModal(record)}>{text}</a>
      ),
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
      title: '关联测试计划',
      dataIndex: 'testPlanName',
      key: 'testPlanName',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'blue';
        let text = '进行中';
        
        if (status === 'draft') {
          color = 'orange';
          text = '草稿';
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
      title: '通过率',
      dataIndex: 'passRate',
      key: 'passRate',
      render: (passRate: number) => {
        let color = 'green';
        if (passRate < 60) {
          color = 'red';
        } else if (passRate < 80) {
          color = 'orange';
        }
        return <Progress percent={passRate} size="small" strokeColor={color} />;
      },
      sorter: (a: any, b: any) => a.passRate - b.passRate,
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
            icon={<DownloadOutlined />} 
            onClick={() => handleExport(record)}
          >
            导出
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
  const filteredTestReports = testReports.filter(
    (report) =>
      report.title.toLowerCase().includes(searchText.toLowerCase()) ||
      report.projectName.toLowerCase().includes(searchText.toLowerCase()) ||
      report.iterationName.toLowerCase().includes(searchText.toLowerCase()) ||
      report.testPlanName.toLowerCase().includes(searchText.toLowerCase())
  );

  // 显示新增/编辑模态框
  const showModal = (report?: any) => {
    if (report) {
      setEditingReportId(report.id);
      form.setFieldsValue({
        title: report.title,
        projectName: report.projectName,
        iterationName: report.iterationName,
        testPlanName: report.testPlanName,
        status: report.status,
        dateRange: [moment(report.startDate), moment(report.endDate)],
        summary: report.summary,
        totalCases: report.totalCases,
        passedCases: report.passedCases,
        failedCases: report.failedCases,
        blockedCases: report.blockedCases,
        highDefects: report.defectCount.high,
        mediumDefects: report.defectCount.medium,
        lowDefects: report.defectCount.low,
      });
    } else {
      setEditingReportId(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // 显示详情模态框
  const showDetailModal = (report: any) => {
    setSelectedReport(report);
    setIsDetailModalVisible(true);
  };

  // 处理编辑
  const handleEdit = (report: any) => {
    showModal(report);
  };

  // 处理导出
  const handleExport = (report: any) => {
    message.success(`测试报告 "${report.title}" 导出成功`);
  };

  // 处理模态框确认
  const handleOk = () => {
    form.validateFields().then((values) => {
      const passRate = (values.passedCases / values.totalCases) * 100;
      
      const formattedValues = {
        ...values,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        passRate: parseFloat(passRate.toFixed(1)),
        defectCount: {
          high: values.highDefects,
          medium: values.mediumDefects,
          low: values.lowDefects,
        }
      };
      
      delete formattedValues.dateRange;
      delete formattedValues.highDefects;
      delete formattedValues.mediumDefects;
      delete formattedValues.lowDefects;
      
      if (editingReportId) {
        // 编辑现有测试报告
        const updatedTestReports = testReports.map((r) =>
          r.id === editingReportId
            ? {
                ...r,
                ...formattedValues,
                updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
              }
            : r
        );
        setTestReports(updatedTestReports);
        message.success('测试报告更新成功');
      } else {
        // 创建新测试报告
        const newTestReport = {
          id: String(testReports.length + 1),
          ...formattedValues,
          creatorName: '当前用户',
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
        setTestReports([...testReports, newTestReport]);
        message.success('测试报告创建成功');
      }
      setIsModalVisible(false);
    });
  };

  // 处理模态框取消
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // 处理详情模态框取消
  const handleDetailCancel = () => {
    setIsDetailModalVisible(false);
    setSelectedReport(null);
  };

  // 显示删除确认
  const showDeleteConfirm = (report: any) => {
    confirm({
      title: '确定要删除这个测试报告吗?',
      icon: <ExclamationCircleOutlined />,
      content: `测试报告标题: ${report.title}`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        handleDelete(report.id);
      },
    });
  };

  // 处理删除
  const handleDelete = (id: string) => {
    const updatedTestReports = testReports.filter((r) => r.id !== id);
    setTestReports(updatedTestReports);
    message.success('测试报告删除成功');
  };

  return (
    <div className="test-report">
      <Title level={2}>测试报告</Title>
      
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Input.Search
            placeholder="搜索测试报告"
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
            新建测试报告
          </Button>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={filteredTestReports} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingReportId ? "编辑测试报告" : "新建测试报告"}
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
            label="报告标题"
            rules={[{ required: true, message: '请输入报告标题' }]}
          >
            <Input placeholder="请输入报告标题" />
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
              name="testPlanName"
              label="关联测试计划"
              rules={[{ required: true, message: '请选择关联测试计划' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="请选择关联测试计划">
                <Option value="产品A功能测试计划">产品A功能测试计划</Option>
                <Option value="产品B性能测试计划">产品B性能测试计划</Option>
                <Option value="安全测试计划">安全测试计划</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="请选择状态">
                <Option value="draft">草稿</Option>
                <Option value="in_progress">进行中</Option>
                <Option value="completed">已完成</Option>
                <Option value="cancelled">已取消</Option>
              </Select>
            </Form.Item>
          </div>
          
          <Form.Item
            name="dateRange"
            label="测试日期"
            rules={[{ required: true, message: '请选择测试日期' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="summary"
            label="测试总结"
            rules={[{ required: true, message: '请输入测试总结' }]}
          >
            <TextArea rows={4} placeholder="请输入测试总结" />
          </Form.Item>
          
          <Divider>测试结果统计</Divider>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="totalCases"
              label="总用例数"
              rules={[{ required: true, message: '请输入总用例数' }]}
              style={{ flex: 1 }}
            >
              <Input type="number" min={0} />
            </Form.Item>
            
            <Form.Item
              name="passedCases"
              label="通过用例数"
              rules={[{ required: true, message: '请输入通过用例数' }]}
              style={{ flex: 1 }}
            >
              <Input type="number" min={0} />
            </Form.Item>
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="failedCases"
              label="失败用例数"
              rules={[{ required: true, message: '请输入失败用例数' }]}
              style={{ flex: 1 }}
            >
              <Input type="number" min={0} />
            </Form.Item>
            
            <Form.Item
              name="blockedCases"
              label="阻塞用例数"
              rules={[{ required: true, message: '请输入阻塞用例数' }]}
              style={{ flex: 1 }}
            >
              <Input type="number" min={0} />
            </Form.Item>
          </div>
          
          <Divider>缺陷统计</Divider>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="highDefects"
              label="高优先级缺陷数"
              rules={[{ required: true, message: '请输入高优先级缺陷数' }]}
              style={{ flex: 1 }}
            >
              <Input type="number" min={0} />
            </Form.Item>
            
            <Form.Item
              name="mediumDefects"
              label="中优先级缺陷数"
              rules={[{ required: true, message: '请输入中优先级缺陷数' }]}
              style={{ flex: 1 }}
            >
              <Input type="number" min={0} />
            </Form.Item>
            
            <Form.Item
              name="lowDefects"
              label="低优先级缺陷数"
              rules={[{ required: true, message: '请输入低优先级缺陷数' }]}
              style={{ flex: 1 }}
            >
              <Input type="number" min={0} />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        title="测试报告详情"
        open={isDetailModalVisible}
        onCancel={handleDetailCancel}
        footer={[
          <Button key="export" type="primary" icon={<DownloadOutlined />} onClick={() => handleExport(selectedReport)}>
            导出报告
          </Button>,
          <Button key="close" onClick={handleDetailCancel}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedReport && (
          <div>
            <Title level={3}>{selectedReport.title}</Title>
            <div style={{ marginBottom: 16 }}>
              <Tag color="blue">{selectedReport.projectName}</Tag>
              <Tag color="purple">{selectedReport.iterationName}</Tag>
              <Tag color="cyan">{selectedReport.testPlanName}</Tag>
              {selectedReport.status === 'draft' && <Tag color="orange">草稿</Tag>}
              {selectedReport.status === 'in_progress' && <Tag color="blue">进行中</Tag>}
              {selectedReport.status === 'completed' && <Tag color="green">已完成</Tag>}
              {selectedReport.status === 'cancelled' && <Tag color="red">已取消</Tag>}
            </div>
            
            <Paragraph>
              <strong>测试时间：</strong> {selectedReport.startDate} 至 {selectedReport.endDate}
            </Paragraph>
            
            <Paragraph>
              <strong>创建人：</strong> {selectedReport.creatorName}
            </Paragraph>
            
            <Paragraph>
              <strong>创建时间：</strong> {selectedReport.createdAt}
            </Paragraph>
            
            <Paragraph>
              <strong>更新时间：</strong> {selectedReport.updatedAt}
            </Paragraph>
            
            <Divider>测试总结</Divider>
            
            <Paragraph>{selectedReport.summary}</Paragraph>
            
            <Divider>测试结果统计</Divider>
            
            <Row gutter={16}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="总用例数"
                    value={selectedReport.totalCases}
                    prefix={<FileTextOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="通过用例数"
                    value={selectedReport.passedCases}
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="失败用例数"
                    value={selectedReport.failedCases}
                    valueStyle={{ color: '#cf1322' }}
                    prefix={<CloseCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="阻塞用例数"
                    value={selectedReport.blockedCases}
                    valueStyle={{ color: '#faad14' }}
                    prefix={<WarningOutlined />}
                  />
                </Card>
              </Col>
            </Row>
            
            <div style={{ marginTop: 16 }}>
              <Statistic
                title="通过率"
                value={selectedReport.passRate}
                suffix="%"
                precision={1}
              />
              <Progress
                percent={selectedReport.passRate}
                status={selectedReport.passRate >= 90 ? 'success' : (selectedReport.passRate >= 60 ? 'normal' : 'exception')}
              />
            </div>
            
            <Divider>缺陷统计</Divider>
            
            <Row gutter={16}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="高优先级缺陷"
                    value={selectedReport.defectCount.high}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="中优先级缺陷"
                    value={selectedReport.defectCount.medium}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="低优先级缺陷"
                    value={selectedReport.defectCount.low}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TestReport;
