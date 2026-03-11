# 睡了么 - 数据统计模块

## 组件结构

```
slept-app/
├── components/
│   ├── StatsScreen.tsx        # 统计主页（主入口）
│   ├── SleepChart.tsx         # 睡眠图表组件
│   ├── DataCard.tsx           # 数据卡片组件
│   └── AchievementWall.tsx    # 成就徽章墙
└── styles/
    ├── theme.ts               # 主题配置（深夜蓝/星空紫）
    └── global.ts              # 全局样式
```

## 设计特点

### 🎨 主题配色
- **深夜蓝背景**: `#0B0F19` - 深邃的夜间氛围
- **星空紫渐变**: `#4A00E0` → `#8E2DE2` - 梦幻的渐变效果
- **数据卡片**: 圆角 16pt，渐变紫色背景
- **图表**: 渐变紫色系，视觉统一

### 📊 核心功能

#### StatsScreen（统计主页）
- ✅ 核心数据概览（平均入睡时间、睡眠时长、睡眠评分）
- ✅ 睡眠趋势图表（折线图 + 柱状图）
- ✅ 周对比分析（本周 vs 上周）
- ✅ 成就徽章墙
- ✅ 响应式布局
- ✅ 周/月切换

#### SleepChart（睡眠图表）
- 📈 睡眠时长柱状图（带渐变）
- 📉 睡眠质量评分折线图（贝塞尔曲线）
- 🎯 图例说明
- 📱 自适应宽度

#### DataCard（数据卡片）
- 🎨 渐变背景
- 📊 评分进度条
- 🔢 大数字显示
- 🎯 图标标识

#### AchievementWall（成就徽章墙）
- 🏆 8 种成就徽章（青铜/白银/黄金/铂金）
- 📊 总进度条
- 🔍 点击查看详情
- 🔒 锁定/解锁状态

## 依赖安装

```bash
# 图表库
npm install react-native-chart-kit react-native-svg

# 渐变支持
npx expo install expo-linear-gradient
```

## 使用示例

```tsx
import StatsScreen from './components/StatsScreen';

// 自定义数据
const customData = {
  avgSleepTime: '23:30',
  avgDuration: '8h 15m',
  sleepScore: 92,
  weeklyData: [
    { date: '周一', duration: 8.0, score: 90, deepSleep: 2.2 },
    // ... 更多数据
  ],
};

// 使用组件
<StatsScreen sleepData={customData} />
```

## 响应式支持

- 数据卡片自动计算宽度（3 列布局）
- 图表自适应屏幕宽度
- 成就徽章横向滚动
- 所有间距使用统一 spacing 系统

## 主题定制

修改 `styles/theme.ts` 中的配色方案：

```ts
export const colors = {
  primary: '#667eea',      // 主色调
  background: '#0B0F19',   // 背景色
  // ... 其他颜色
};
```

## 注意事项

1. 确保父组件提供足够的垂直空间（ScrollView）
2. 图表需要有效的数据数组
3. 渐变色需要 `expo-linear-gradient` 支持
4. 成就徽章支持点击交互
