# 睡了么 - 社交监督功能组件

> Social Supervision Feature Components for "睡了么" App

## 📦 组件列表

### 1. SocialScreen (社交主页)
**文件**: `SocialScreen.tsx`

社交监督功能的主页面，包含：
- ✅ 我监督的人（头像列表，横向滚动）
- ✅ 监督我的人（头像 + 在线状态）
- ✅ 互动消息流（带未读标记）
- ✅ 邀请好友按钮
- ✅ 扫码添加悬浮按钮

**使用示例**:
```tsx
import { SocialScreen } from './index';

// 在导航中使用
<SocialScreen />
```

---

### 2. AddSupervisorScreen (添加监督者页面)
**文件**: `AddSupervisorScreen.tsx`

用于添加新的监督者，包含：
- ✅ 搜索用户功能
- ✅ 扫码添加入口
- ✅ 发送监督请求
- ✅ 搜索结果展示
- ✅ 温馨提示

**使用示例**:
```tsx
import { AddSupervisorScreen } from './index';

// 在导航栈中
<Stack.Screen name="AddSupervisor" component={AddSupervisorScreen} />
```

---

### 3. SupervisorList (监督者列表组件)
**文件**: `SupervisorList.tsx`

可复用的监督者列表组件，支持：
- ✅ 自定义头像渲染
- ✅ 在线状态显示
- ✅ 消息按钮
- ✅ 删除功能（可选）
- ✅ 点击回调

**Props**:
```typescript
interface SupervisorListProps {
  supervisors: Supervisor[];
  renderAvatar?: (avatar: string, isOnline: boolean, size?: number) => React.ReactNode;
  onSupervisorPress?: (supervisor: Supervisor) => void;
  onRemove?: (supervisor: Supervisor) => void;
  showRemoveButton?: boolean;
}
```

**使用示例**:
```tsx
import { SupervisorList } from './index';

<SupervisorList 
  supervisors={supervisors}
  onSupervisorPress={(supervisor) => console.log(supervisor)}
  showRemoveButton={true}
/>
```

---

## 🎨 设计规范

### 主题色 - 深夜蓝/星空紫

```
背景色：#0D0D1A (深夜黑蓝)
卡片色：#1A1A2E (深蓝灰)
主色调：#7B68EE (Medium Slate Blue - 星空紫)
强调色：#4B3F72 (深紫灰)
在线状态：#4ECDC4 (青绿色)
通知红点：#FF6B6B (珊瑚红)
```

### 视觉规范

- **头像**: 圆形显示，带紫色边框 (#7B68EE)
- **在线状态**: 右下角绿色圆点指示器
- **消息通知**: 红色圆点徽章显示未读数
- **卡片**: 圆角 16px，带边框和阴影
- **按钮**: 圆角 20-25px，渐变紫色背景

### 交互规范

- 所有可点击元素有 activeOpacity 反馈
- 悬浮按钮带阴影和发光效果
- 未读消息有高亮背景
- 加载状态有动画提示

---

## 📁 文件结构

```
workspace-secretary/
├── SocialScreen.tsx              # 社交主页组件
├── AddSupervisorScreen.tsx       # 添加监督者页面
├── SupervisorList.tsx            # 监督者列表组件
├── index.ts                      # 统一导出
├── README.md                     # 使用说明
└── styles/
    ├── SocialScreen.styles.ts    # 社交主页样式
    ├── AddSupervisorScreen.styles.ts  # 添加页面样式
    ├── SupervisorList.styles.ts  # 列表组件样式
    └── theme.ts                  # 主题配置
```

---

## 🔧 依赖要求

```json
{
  "dependencies": {
    "react": ">=18.0.0",
    "react-native": ">=0.70.0",
    "@expo/vector-icons": ">=13.0.0"
  }
}
```

---

## 💡 使用建议

1. **导航集成**: 将组件集成到 React Navigation 中
2. **状态管理**: 使用 Redux/Context 管理监督关系数据
3. **API 对接**: 替换 mock 数据为真实 API 调用
4. **扫码功能**: 集成 expo-camera 或 react-native-vision-camera
5. **推送通知**: 集成推送用于监督提醒

---

## 🌟 特色功能

- 🌙 深夜主题设计，护眼舒适
- 💜 星空紫配色，符合睡眠应用调性
- 📱 响应式布局，适配不同屏幕
- ♿ 无障碍设计，支持辅助功能
- 🎯 组件化设计，易于复用和扩展

---

**版本**: 1.0.0  
**创建时间**: 2026-03-07  
**设计主题**: 深夜蓝/星空紫
