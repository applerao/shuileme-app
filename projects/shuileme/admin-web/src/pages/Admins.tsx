import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Input, Select, Tag, Space, Modal, Form, message, Popconfirm, Switch } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SafetyOutlined } from '@ant-design/icons';
import { adminApi } from '../api';
import type { ColumnsType } from 'antd/es/table';

interface Admin {
  key: string;
  adminId: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: 'super_admin' | 'admin' | 'operator';
  permissions: string[];
  status: 'active' | 'inactive';
  createTime: string;
  lastLoginTime: string;
  createdBy: string;
}

const Admins: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAdmins();
  }, [roleFilter]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      // Mock data for demo
      const mockAdmins: Admin[] = [
        {
          key: '1',
          adminId: 'A0001',
          username: 'admin',
          name: '超级管理员',
          email: 'admin@shuileme.com',
          phone: '13800138000',
          role: 'super_admin',
          permissions: ['all'],
          status: 'active',
          createTime: '2025-01-01 00:00',
          lastLoginTime: '2026-03-07 12:30',
          createdBy: '-',
        },
        {
          key: '2',
          adminId: 'A0002',
          username: 'operator1',
          name: '运营专员 1',
          email: 'op1@shuileme.com',
          phone: '13900139000',
          role: 'operator',
          permissions: ['user_view', 'data_view'],
          status: 'active',
          createTime: '2025-06-15 10:00',
          lastLoginTime: '2026-03-07 09:15',
          createdBy: 'admin',
        },
        {
          key: '3',
          adminId: 'A0003',
          username: 'admin2',
          name: '管理员 2',
          email: 'admin2@shuileme.com',
          phone: '13700137000',
          role: 'admin',
          permissions: ['user_manage', 'data_view', 'content_manage'],
          status: 'active',
          createTime: '2025-08-20 14:30',
          lastLoginTime: '2026-03-06 18:45',
          createdBy: 'admin',
        },
        {
          key: '4',
          adminId: 'A0004',
          username: 'operator2',
          name: '运营专员 2',
          email: 'op2@shuileme.com',
          phone: '13600136000',
          role: 'operator',
          permissions: ['user_view', 'data_view'],
          status: 'inactive',
          createTime: '2025-10-10 09:00',
          lastLoginTime: '2026-02-28 16:20',
          createdBy: 'admin',
        },
      ];
      
      setAdmins(mockAdmins);
    } catch (error) {
      message.error('获取管理员列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchAdmins();
  };

  const handleRoleChange = (value: string) => {
    setRoleFilter(value);
  };

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    form.setFieldsValue({
      username: admin.username,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
      status: admin.status,
      permissions: admin.permissions,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (adminId: string) => {
    try {
      if (adminId === 'A0001') {
        message.warning('超级管理员不能删除');
        return;
      }
      // API call would go here
      message.success('管理员已删除');
      fetchAdmins();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleStatusChange = async (adminId: string, newStatus: 'active' | 'inactive') => {
    try {
      if (adminId === 'A0001') {
        message.warning('超级管理员状态不能修改');
        return;
      }
      // API call would go here
      message.success('状态已更新');
      fetchAdmins();
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      // API call would go here
      message.success(editingAdmin ? '管理员信息已更新' : '管理员已创建');
      setIsModalVisible(false);
      form.resetFields();
      fetchAdmins();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingAdmin(null);
  };

  const roleColorMap: Record<string, string> = {
    super_admin: 'red',
    admin: 'blue',
    operator: 'green',
  };

  const roleTextMap: Record<string, string> = {
    super_admin: '超级管理员',
    admin: '管理员',
    operator: '运营专员',
  };

  const permissionTextMap: Record<string, string> = {
    all: '全部权限',
    user_view: '用户查看',
    user_manage: '用户管理',
    data_view: '数据查看',
    content_manage: '内容管理',
  };

  const columns: ColumnsType<Admin> = [
    {
      title: '管理员 ID',
      dataIndex: 'adminId',
      key: 'adminId',
      width: 100,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      ellipsis: true,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: string) => (
        <Tag color={roleColorMap[role]}>
          {roleTextMap[role]}
        </Tag>
      ),
      filters: [
        { text: '超级管理员', value: 'super_admin' },
        { text: '管理员', value: 'admin' },
        { text: '运营专员', value: 'operator' },
      ],
      onFilter: (value: any, record: Admin) => record.role === value,
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      key: 'permissions',
      width: 200,
      render: (permissions: string[]) => (
        <Space size="small" direction="vertical" style={{ maxWidth: 200 }}>
          {permissions.slice(0, 3).map((perm) => (
            <Tag key={perm} color="default">
              {permissionTextMap[perm] || perm}
            </Tag>
          ))}
          {permissions.length > 3 && (
            <Tag color="default">+{permissions.length - 3}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string, record: Admin) => (
        <Switch
          checked={status === 'active'}
          onChange={(checked) => handleStatusChange(record.adminId, checked ? 'active' : 'inactive')}
          disabled={record.adminId === 'A0001'}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginTime',
      key: 'lastLoginTime',
      width: 160,
    },
    {
      title: '创建人',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
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
          {record.adminId !== 'A0001' && (
            <Popconfirm
              title="确定要删除该管理员吗？"
              onConfirm={() => handleDelete(record.adminId)}
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
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>管理员管理</h1>
      
      <Card style={{ marginBottom: 16 }}>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索管理员用户名/姓名"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
          />
          <Select
            value={roleFilter}
            onChange={handleRoleChange}
            style={{ width: 150 }}
            options={[
              { value: 'all', label: '全部角色' },
              { value: 'super_admin', label: '超级管理员' },
              { value: 'admin', label: '管理员' },
              { value: 'operator', label: '运营专员' },
            ]}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => {
              setEditingAdmin(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            新增管理员
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={admins}
          loading={loading}
          rowKey="adminId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          scroll={{ x: 1500 }}
        />
      </Card>

      <Modal
        title={editingAdmin ? '编辑管理员' : '新增管理员'}
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
            <Input disabled={!!editingAdmin} />
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
              { type: 'email', message: '请输入正确的邮箱' }
            ]}
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
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select>
              <Select.Option value="super_admin">超级管理员</Select.Option>
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="operator">运营专员</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            initialValue="active"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
          <Form.Item
            name="permissions"
            label="权限"
          >
            <Select mode="multiple" allowClear>
              <Select.Option value="user_view">用户查看</Select.Option>
              <Select.Option value="user_manage">用户管理</Select.Option>
              <Select.Option value="data_view">数据查看</Select.Option>
              <Select.Option value="content_manage">内容管理</Select.Option>
              <Select.Option value="admin_manage">管理员管理</Select.Option>
              <Select.Option value="all">全部权限</Select.Option>
            </Select>
          </Form.Item>
          {!editingAdmin && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Admins;
