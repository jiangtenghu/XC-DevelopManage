import React from 'react';
import { Typography, Space } from 'antd';

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  extra?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, extra }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <Title level={2}>{title}</Title>
      {extra && <Space>{extra}</Space>}
    </div>
  );
};

export default PageHeader;
