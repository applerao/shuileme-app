# 睡了么 App - 移动端应用

基于 React Native 的跨平台移动应用，支持 iOS 和 Android。

## 技术栈

- **框架:** React Native
- **语言:** TypeScript
- **导航:** React Navigation
- **状态管理:** Zustand
- **UI 组件:** 自定义 + 第三方

## 核心功能

| 功能 | 说明 |
|------|------|
| 登录注册 | 手机号 + 验证码、微信登录 |
| 睡眠记录 | 记录入睡/起床时间 |
| 打卡系统 | 每日睡眠打卡 |
| 监督功能 | 好友监督提醒 |
| 数据统计 | 睡眠趋势分析 |
| 成就系统 | 成就徽章 |

## 快速开始

```bash
# 安装依赖
npm install

# iOS
cd ios && pod install && cd ..
npm run ios

# Android
npm run android
```

## 项目结构

```
src/
├── screens/        # 页面
│   ├── LoginScreen.tsx
│   ├── HomeScreen.tsx
│   ├── StatsScreen.tsx
│   ├── SocialScreen.tsx
│   └── ProfileScreen.tsx
├── components/     # 组件
├── navigation/     # 导航配置
├── services/       # API 服务
├── store/          # 状态管理
├── theme/          # 主题样式
└── utils/          # 工具函数
```

## 构建发布

```bash
# iOS 构建
cd ios && xcodebuild ...

# Android 构建
cd android && ./gradlew assembleRelease
```

---

**支持平台:** iOS 12+, Android 8.0+  
**开发工具:** Xcode, Android Studio
