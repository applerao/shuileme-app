# 睡眠打卡功能 (Sleep Check-in Feature)

"睡了么"App 的睡眠打卡功能模块，帮助用户记录和追踪睡眠习惯。

## 📁 文件结构

```
sleep-checkin/
├── HomeScreen.tsx      # 打卡主页面组件
├── CheckinButton.tsx   # 长按打卡按钮组件
├── SleepCalendar.tsx   # 本周打卡日历组件
├── styles.ts          # 全局样式和主题配置
├── types.ts           # TypeScript 类型定义
├── index.ts           # 模块导出文件
└── README.md          # 使用说明文档
```

## 🚀 功能特性

### 1. 打卡主页面 (HomeScreen)
- ✅ 显示今日打卡状态
- ✅ 睡前/起床打卡按钮
- ✅ 连续打卡天数统计
- ✅ 上次睡眠时间显示
- ✅ 平均入睡/起床时间
- ✅ 睡眠评分展示

### 2. 打卡交互 (CheckinButton)
- ✅ 长按 2 秒触发（防误触）
- ✅ 震动反馈
- ✅ 进度动画
- ✅ 成功动画
- ✅ 鼓励语显示

### 3. 数据展示 (SleepCalendar)
- ✅ 本周打卡日历
- ✅ 打卡完成率
- ✅ 视觉化打卡状态
- ✅ 今日标识

## 📦 安装依赖

确保已安装以下 React Native 依赖：

```bash
npm install react-native
# 或
yarn add react-native
```

## 💡 使用示例

### 基础使用

```tsx
import { HomeScreen } from './sleep-checkin';

// 在 App.tsx 中
export default function App() {
  return <HomeScreen />;
}
```

### 自定义配置

```tsx
import { HomeScreen, CheckinButton, SleepCalendar } from './sleep-checkin';

// 自定义打卡按钮
<CheckinButton
  type="bedtime"
  onPress={handleBedtimeCheckin}
  longPressDuration={2000}
  disabled={false}
/>

// 自定义日历
<SleepCalendar
  weeklyCheckins={[true, true, false, true, true, false, false]}
  showLegend={true}
/>
```

### 集成数据存储

```tsx
// 在 HomeScreen 中集成 AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

const loadSleepData = async () => {
  try {
    const data = await AsyncStorage.getItem('sleepData');
    if (data) {
      setSleepData(JSON.parse(data));
    }
  } catch (error) {
    console.error('加载睡眠数据失败:', error);
  }
};

const saveSleepData = async (data: SleepData) => {
  try {
    await AsyncStorage.setItem('sleepData', JSON.stringify(data));
  } catch (error) {
    console.error('保存睡眠数据失败:', error);
  }
};
```

## 🎨 主题定制

在 `styles.ts` 中修改主题颜色：

```ts
export const colors = {
  background: '#1a1a2e',    // 背景色
  card: '#16213e',          // 卡片色
  primary: '#3498db',       // 主色调
  success: '#4CAF50',       // 成功色
  // ... 其他颜色
};
```

## ⚙️ 配置选项

### CheckinButton Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | 'bedtime' \| 'wakeup' | - | 按钮类型 |
| onPress | () => void | - | 打卡完成回调 |
| disabled | boolean | false | 是否禁用 |
| longPressDuration | number | 2000 | 长按时长 (ms) |
| onLongPressStart | () => void | - | 长按开始回调 |
| onLongPressCancel | () => void | - | 长按取消回调 |
| onLongPressComplete | () => void | - | 长按完成回调 |

### SleepCalendar Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| weeklyCheckins | boolean[] | - | 本周打卡状态数组 |
| onDayPress | (index: number) => void | - | 日期点击回调 |
| showLegend | boolean | true | 显示图例 |

## 🔧 扩展功能

### 添加通知提醒

```tsx
import PushNotification from 'react-native-push-notification';

// 设置睡前提醒
PushNotification.localNotificationSchedule({
  title: '睡前打卡',
  message: '该准备休息啦！记得打卡哦~',
  date: new Date(Date.now() + 1000 * 60 * 60), // 1 小时后
  repeatType: 'day',
});
```

### 添加数据统计

```tsx
// 计算平均睡眠时间
const calculateAvgSleepTime = (records: SleepRecord[]): string => {
  if (records.length === 0) return '--:--';
  
  const totalMinutes = records.reduce((sum, record) => {
    const [hours, minutes] = record.bedtime.split(':').map(Number);
    return sum + hours * 60 + minutes;
  }, 0);
  
  const avgMinutes = Math.round(totalMinutes / records.length);
  const hours = Math.floor(avgMinutes / 60);
  const minutes = avgMinutes % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};
```

### 添加数据导出

```tsx
// 导出睡眠数据为 CSV
const exportSleepData = (records: SleepRecord[]) => {
  const csv = records.map(record => 
    `${record.date},${record.bedtime},${record.wakeupTime},${record.duration},${record.quality}`
  ).join('\n');
  
  const header = 'Date,Bedtime,Wakeup,Duration,Quality\n';
  return header + csv;
};
```

## 📱 平台兼容性

- ✅ iOS
- ✅ Android
- ✅ React Native Web (部分功能)

## 🐛 已知问题

1. 长按手势在部分 Android 设备上可能需要调整灵敏度
2. 震动反馈在 iOS 模拟器上不可用

## 📝 待开发功能

- [ ] 睡眠阶段分析
- [ ] 睡眠建议生成
- [ ] 数据图表展示
- [ ] 社交分享功能
- [ ] 睡眠目标设置
- [ ] 历史数据趋势

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交 Issue 和 Pull Request！
