import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  BookOutlined,
  CalendarOutlined,
  BugOutlined,
  FileTextOutlined,
  SettingOutlined,
  ProjectOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const location = useLocation();

  // 根据当前路径确定选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return '1';
    if (path === '/project') return '2';
    if (path === '/iteration') return '3';
    if (path === '/case-library') return '4';
    if (path === '/test-case') return '5';
    if (path === '/test-plan') return '6';
    if (path === '/defect') return '7';
    if (path === '/test-report') return '8';
    if (path === '/settings') return '9';
    return '1';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', background: '#001529' }}>
        <div className="logo" style={{ width: 120, height: 31, margin: '16px 24px 16px 0', background: 'rgba(255, 255, 255, 0.3)' }} />
        <h1 style={{ color: 'white', margin: 0 }}>测试管理系统</h1>
      </Header>
      <Layout>
        <Sider 
          width={200} 
          collapsible 
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          style={{ background: colorBgContainer }}
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={[getSelectedKey()]}
            style={{ height: '100%', borderRight: 0 }}
          >
            <Menu.Item key="1" icon={<HomeOutlined />}>
              <Link to="/">首页</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<ProjectOutlined />}>
              <Link to="/project">项目管理</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<FieldTimeOutlined />}>
              <Link to="/iteration">迭代管理</Link>
            </Menu.Item>
            <Menu.Item key="4" icon={<BookOutlined />}>
              <Link to="/case-library">用例库</Link>
            </Menu.Item>
            <Menu.Item key="5" icon={<BookOutlined />}>
              <Link to="/test-case">测试用例</Link>
            </Menu.Item>
            <Menu.Item key="6" icon={<CalendarOutlined />}>
              <Link to="/test-plan">测试计划</Link>
            </Menu.Item>
            <Menu.Item key="7" icon={<BugOutlined />}>
              <Link to="/defect">缺陷管理</Link>
            </Menu.Item>
            <Menu.Item key="8" icon={<FileTextOutlined />}>
              <Link to="/test-report">测试报告</Link>
            </Menu.Item>
            <Menu.Item key="9" icon={<SettingOutlined />}>
              <Link to="/settings">系统设置</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content
            style={{
              padding: 24,
              margin: '16px 0',
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            测试管理系统 ©{new Date().getFullYear()} Created by Team
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
