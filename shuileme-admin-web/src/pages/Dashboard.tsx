import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Table, Spin, Tag } from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardApi, userApi } from '../api';

const COLORS = ['#1890ff', '#13c2c2', '#52c41a', '#faad14', '#f5222d'];

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  todayCheckins: number;
  avgSleepTime: number;
  userGrowthData: any[];
  checkinTrendData: any[];
  sleepQualityData: any[];
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data for demo - replace with actual API calls
      const mockStats: DashboardStats = {
        totalUsers: 12580,
        activeUsers: 8936,
        todayCheckins: 3245,
        avgSleepTime: 7.5,
        userGrowthData: [
          { date: '03-01', users: 11200 },
          { date: '03-02', users: 11450 },
          { date: '03-03', users: 11680 },
          { date: '03-04', users: 11920 },
          { date: '03-05', users: 12150 },
          { date: '03-06', users: 12380 },
          { date: '03-07', users: 12580 },
        ],
        checkinTrendData: [
          { date: '03-01', checkins: 2890 },
          { date: '03-02', checkins: 3120 },
          { date: '03-03', checkins: 2950 },
          { date: '03-04', checkins: 3340 },
          { date: '03-05', checkins: 3180 },
          { date: '03-06', checkins: 3420 },
          { date: '03-07', checkins: 3245 },
        ],
        sleepQualityData: [
          { name: '优秀 (8h+)', value: 3520 },
          { name: '良好 (7-8h)', value: 4890 },
          { name: '一般 (6-7h)', value: 2840 },
          { name: '较差 (<6h)', value: 1330 },
        ],
      };

      const mockRecentUsers = [
        { key: '1', userId: 'U10001', username: 'user_001', phone: '138****1234', registerTime: '2026-03-07 10:23', status: 'active' },
        { key: '2', userId: 'U10002', username: 'user_002', phone: '139****5678', registerTime: '2026-03-07 09:15', status: 'active' },
        { key: '3', userId: 'U10003', username: 'user_003', phone: '136****9012', registerTime: '2026-03-06 22:45', status: 'active' },
        { key: '4', userId: 'U10004', username: 'user_004', phone: '137****3456', registerTime: '2026-03-06 18:30', status: 'inactive' },
        { key: '5', userId: 'U10005', username: 'user_005', phone: '135****7890', registerTime: '2026-03-06 15:20', status: 'active' },
      ];

      setStats(mockStats);
      setRecentUsers(mockRecentUsers);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const userColumns = [
    { title: '用户 ID', dataIndex: 'userId', key: 'userId' },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { title: '注册时间', dataIndex: 'registerTime', key: 'registerTime' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '活跃' : '未激活'}
        </Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="加载数据中..." />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>数据看板</h1>
      
      {/* 核心指标卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={stats?.totalUsers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={stats?.activeUsers || 0}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日打卡"
              value={stats?.todayCheckins || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均睡眠时长"
              value={stats?.avgSleepTime || 0}
              suffix="小时"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="用户增长趋势" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#1890ff" name="用户数" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="打卡趋势" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.checkinTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="checkins" fill="#13c2c2" name="打卡次数" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="睡眠质量分布" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.sleepQualityData}
                  cx="50%"
                  cy="50%"
                  labelLine
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats?.sleepQualityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="最近注册用户" style={{ height: 400 }}>
            <Table
              columns={userColumns}
              dataSource={recentUsers}
              pagination={false}
              size="small"
              scroll={{ y: 320 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
