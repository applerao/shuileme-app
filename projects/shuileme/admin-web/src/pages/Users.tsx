import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Input, Select, Tag, Space, Modal, Form, message, Popconfirm, Badge } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ExportOutlined } from '@ant-design/icons';
import { userApi } from '../api';
import type { ColumnsType } from 'antd/es/table';

interface User {
  key: string;
  userId: string;
  username: string;
  phone: string;
  email: string;
  gender: string;
  age: number;
  registerTime: string;
  lastLoginTime: string;
  status: 'active' | 'inactive' | 'banned';
  totalCheckins: number;
  avgSleepTime: number;
}

const Users: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Mock data for demo
      const mockUsers: User[] = Array.from({ length: pageSize }, (_, i) => ({
        key: `${i + 1}`,
        userId: `U${10000 + (page - 1) * pageSize + i + 1}`,
        username: `user_${String(i + 1).padStart(3, '0')}`,
        phone: `13${Math.floor(Math.random() * 9)}****${Math.floor(Math.random() * 9000 + 1000)}`,
        email: `user${i + 1}@example.com`,
        gender: Math.random() > 0.5 ? '男' : '女',
        age: Math.floor(Math.random() * 40) + 18,
        registerTime: `2026-0${Math.floor(Math.random() * 3) + 1}-${Math.floor(Math.random() * 28) + 1} ${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60)}`,
        lastLoginTime: `2026-03-0${Math.floor(Math.random() * 7) + 1} ${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60)}`,
        status: Math.random() > 0.2 ? 'active' : Math.random() > 0.5 ? 'inactive' : 'banned',
        totalCheckins: Math.floor(Math.random() * 100),
        avgSleepTime: parseFloat((Math.random() * 4 + 5).toFixed(1)),
      }));
      
      setUsers(mockUsers);
      setTotal(12580);
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      phone: user.phone,
      email: user.email,
      status: user.status,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (userId: string) => {
    try {
      // API call would go here
      message.success('用户已删除');
      fetchUsers();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleUpdateStatus = async (userId: string, newStatus: 'active' | 'inactive' | 'banned') => {
    try {
      // API call would go here
      message.success('状态已更新');
      fetchUsers();
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      // API call would go here
      message.success(editingUser ? '用户信息已更新' : '用户已创建');
      setIsModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingUser(null);
  };

  const handleExport = () => {
    message.info('导出功能开发中...');
  };

  const columns: ColumnsType<User> = [
    {
      title: '用户 ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      ellipsis: true,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 60,
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      width: 60,
      sorter: (a, b) => a.age - b.age,
    },
    {
      title: '注册时间',
      dataIndex: 'registerTime',
      key: 'registerTime',
      width: 160,
      sorter: (a, b) => a.registerTime.localeCompare(b.registerTime),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginTime',
      key: 'lastLoginTime',
      width: 160,
    },
    {
      title: '打卡次数',
      dataIndex: 'totalCheckins',
      key: 'totalCheckins',
      width: 80,
      sorter: (a, b) => a.totalCheckins - b.totalCheckins,
    },
    {
      title: '平均睡眠',
      dataIndex: 'avgSleepTime',
      key: 'avgSleepTime',
      width: 80,
      render: (time: number) => `${time}h`,
      sorter: (a, b) => a.avgSleepTime - b.avgSleepTime,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          active: 'green',
          inactive: 'orange',
          banned: 'red',
        };
        const textMap: Record<string, string> = {
          active: '活跃',
          inactive: '未激活',
          banned: '已封禁',
        };
        return <Tag color={colorMap[status]}>{textMap[status]}</Tag>;
      },
      filters: [
        { text: '活跃', value: 'active' },
        { text: '未激活', value: 'inactive' },
        { text: '已封禁', value: 'banned' },
      ],
      onFilter: (value: any, record: User) => record.status === value,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该用户吗？"
            onConfirm={() => handleDelete(record.userId)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              size="small" 
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
    <div>
      <h1 style={{ marginBottom: 24 }}>用户管理</h1>
      
      <Card style={{ marginBottom: 16 }}>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索用户名/手机号"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
          />
          <Select
            value={statusFilter}
            onChange={handleStatusChange}
            style={{ width: 150 }}
            options={[
              { value: 'all', label: '全部状态' },
              { value: 'active', label: '活跃' },
              { value: 'inactive', label: '未激活' },
              { value: 'banned', label: '已封禁' },
            ]}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button icon={<PlusOutlined />} onClick={() => {
            setEditingUser(null);
            form.resetFields();
            setIsModalVisible(true);
          }}>
            新增用户
          </Button>
          <Button icon={<ExportOutlined />} onClick={handleExport}>
            导出
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="userId"
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            },
          }}
          scroll={{ x: 1500 }}
        />
      </Card>

      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1\d{10}$/, message: '请输入正确的手机号' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ type: 'email', message: '请输入正确的邮箱' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            initialValue="active"
          >
            <Select>
              <Select.Option value="active">活跃</Select.Option>
              <Select.Option value="inactive">未激活</Select.Option>
              <Select.Option value="banned">已封禁</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
