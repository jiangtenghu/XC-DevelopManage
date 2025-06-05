import { Table, TableProps } from 'antd';
import { TablePaginationConfig } from 'antd/es/table';

interface DataTableProps<T> extends Omit<TableProps<T>, 'pagination'> {
  loading?: boolean;
  total?: number;
  pageSize?: number;
  current?: number;
  onPageChange?: (page: number, pageSize: number) => void;
}

function DataTable<T extends object = any>({
  loading,
  dataSource,
  columns,
  rowKey,
  total = 0,
  pageSize = 10,
  current = 1,
  onPageChange,
  ...rest
}: DataTableProps<T>) {
  const pagination: TablePaginationConfig | false = total
    ? {
        total,
        pageSize,
        current,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条记录`,
        onChange: onPageChange,
      }
    : false;

  return (
    <Table
      loading={loading}
      dataSource={dataSource}
      columns={columns}
      rowKey={rowKey}
      pagination={pagination}
      {...rest}
    />
  );
}

export default DataTable;
