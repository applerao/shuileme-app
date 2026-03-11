# 🌙 睡了么 (ShuiLeMe)

一款专注于睡眠追踪和改善的移动应用

## 📱 项目信息

- **名称**: 睡了么 (ShuiLeMe)
- **框架**: React Native 0.73
- **语言**: TypeScript
- **包名**: com.shuileme.app

## 🎨 主题色

- **深夜蓝**: `#1a2332` - 主背景色
- **星空紫**: `#6b4c9a` - 主强调色
- **晨曦紫**: `#9b7ebd` - 次强调色
- **夜空黑**: `#0f141f` - 深色背景

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- React Native CLI
- Xcode (iOS 开发)
- Android Studio (Android 开发)

### 安装依赖

```bash
cd shuileme-app
npm install
# 或
yarn install
```

### iOS 运行

```bash
cd ios
pod install
cd ..
npm run ios
```

### Android 运行

```bash
npm run android
```

### 启动 Metro Bundler

```bash
npm start
```

## 📁 项目结构

```
shuileme-app/
├── src/
│   ├── components/     # 公共组件
│   ├── screens/        # 页面组件
│   │   ├── HomeScreen.tsx      # 首页
│   │   ├── StatsScreen.tsx     # 统计页
│   │   ├── SocialScreen.tsx    # 社交页
│   │   └── ProfileScreen.tsx   # 个人页
│   ├── navigation/     # 导航配置
│   ├── store/          # Redux 状态管理
│   ├── theme/          # 主题配置
│   └── utils/          # 工具函数
├── assets/             # 静态资源
├── ios/                # iOS 原生代码
├── android/            # Android 原生代码
├── App.tsx             # App 入口
├── package.json
├── tsconfig.json
└── README.md
```

## 🧭 导航结构

应用采用底部 Tab 导航，包含 4 个主要页面:

1. **首页** 🌙 - 睡眠记录入口和今日状态
2. **统计** 📊 - 睡眠数据分析和趋势
3. **社交** 👥 - 好友动态和睡眠挑战
4. **我的** 👤 - 个人设置和成就

## 🛠️ 技术栈

- **状态管理**: Redux Toolkit
- **导航**: React Navigation 6
- **UI 组件**: React Native 原生组件
- **图标**: react-native-vector-icons
- **类型系统**: TypeScript 5.3+

## 📝 开发规范

### 路径别名

```typescript
import { colors } from '@theme';
import HomeScreen from '@screens/HomeScreen';
import { store } from '@store';
```

### 代码检查

```bash
npm run lint
npm run type-check
```

## 🎯 待开发功能

- [ ] 睡眠记录功能
- [ ] 数据统计图表
- [ ] 社交分享功能
- [ ] 用户认证系统
- [ ] 睡眠提醒功能
- [ ] 成就系统

## 📄 License

MIT

---

**🌙 睡了么 - 记录你的每一个好梦**
