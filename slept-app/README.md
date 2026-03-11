# 睡了么 App - 用户登录注册模块

## 📱 项目结构

```
slept-app/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.tsx      # 登录页面
│   │   └── RegisterScreen.tsx   # 注册页面
│   ├── components/
│   │   ├── Button.tsx           # 按钮组件
│   │   ├── Input.tsx            # 输入框组件
│   │   └── Checkbox.tsx         # 复选框组件
│   ├── styles/
│   │   ├── theme.ts             # 主题配置（深夜蓝/星空紫）
│   │   ├── responsive.ts        # 响应式布局工具
│   │   └── animations.ts        # 动画工具
│   ├── utils/
│   │   └── validation.ts        # 表单验证逻辑
│   └── index.ts                 # 统一导出
└── README.md
```

## 🎨 设计主题

### 配色方案

- **主色调（深夜蓝）**: `#2C3E50`
- **辅助色（星空紫）**: `#8E44AD`
- **渐变背景**: 深蓝 `#1A1A2E` → 午夜蓝 `#16213E` → 星空紫 `#2D1B4E`
- **微信品牌色**: `#07C160`

### 设计理念

- 采用深夜蓝/星空紫主题，营造夜晚氛围
- 使用渐变背景增加视觉层次
- 半透明卡片和输入框，现代感十足
- 圆角设计，柔和友好

## 🚀 功能特性

### 登录页面 (LoginScreen.tsx)

- ✅ 手机号输入（+86 前缀）
- ✅ 密码输入（显示/隐藏切换）
- ✅ 实时表单验证
- ✅ 登录按钮（加载状态）
- ✅ 微信登录按钮
- ✅ 注册链接跳转
- ✅ 错误提示

### 注册页面 (RegisterScreen.tsx)

- ✅ 手机号输入
- ✅ 验证码输入（60 秒倒计时）
- ✅ 密码输入（显示/隐藏切换）
- ✅ 确认密码
- ✅ 用户协议勾选
- ✅ 注册按钮（加载状态）
- ✅ 登录链接跳转
- ✅ 完整的表单验证

## 📋 表单验证规则

### 手机号验证
- 必填
- 11 位中国大陆手机号
- 正则：`/^1[3-9]\d{9}$/`

### 密码验证
- 必填
- 长度 6-20 位
- 无特殊字符要求

### 验证码验证
- 必填
- 6 位数字
- 正则：`/^\d{6}$/`

### 确认密码验证
- 必填
- 必须与密码一致

### 用户协议验证
- 必须勾选

## 💻 使用示例

### 基础用法

```tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen, RegisterScreen } from './src';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login">
          {(props) => (
            <LoginScreen
              onLogin={async (phone, password) => {
                // 处理登录逻辑
                console.log('Login:', phone, password);
              }}
              onWechatLogin={async () => {
                // 处理微信登录
                console.log('Wechat login');
              }}
              onNavigateToRegister={() => {
                props.navigation.navigate('Register');
              }}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Register">
          {(props) => (
            <RegisterScreen
              onRegister={async (phone, code, password, confirmPassword) => {
                // 处理注册逻辑
                console.log('Register:', phone, code, password);
              }}
              onNavigateToLogin={() => {
                props.navigation.navigate('Login');
              }}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 使用独立组件

```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Input, Checkbox } from './src';

function CustomForm() {
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);

  return (
    <View>
      <Input
        label="手机号"
        placeholder="请输入手机号"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        maxLength={11}
      />
      
      <Checkbox
        checked={agreed}
        onChange={setAgreed}
        label="我已阅读并同意用户协议"
      />
      
      <Button
        title="提交"
        onPress={() => console.log('Submit')}
        variant="primary"
        size="large"
      />
    </View>
  );
}
```

## 🎭 组件 Props

### LoginScreen

| Prop | 类型 | 说明 |
|------|------|------|
| onLogin | `(phone, password) => Promise<void>` | 登录回调 |
| onWechatLogin | `() => Promise<void>` | 微信登录回调 |
| onNavigateToRegister | `() => void` | 跳转注册页回调 |

### RegisterScreen

| Prop | 类型 | 说明 |
|------|------|------|
| onRegister | `(phone, code, password, confirmPassword) => Promise<void>` | 注册回调 |
| onNavigateToLogin | `() => void` | 跳转登录页回调 |

### Button

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | `string` | - | 按钮文字 |
| onPress | `() => void` | - | 点击回调 |
| variant | `'primary' \| 'secondary' \| 'outline' \| 'ghost'` | `'primary'` | 按钮样式 |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 按钮尺寸 |
| disabled | `boolean` | `false` | 是否禁用 |
| loading | `boolean` | `false` | 加载状态 |
| icon | `ReactNode` | - | 图标 |

### Input

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| label | `string` | - | 标签文字 |
| placeholder | `string` | - | 占位文字 |
| value | `string` | - | 输入值 |
| onChangeText | `(text) => void` | - | 变化回调 |
| error | `string` | - | 错误信息 |
| secureTextEntry | `boolean` | `false` | 密码模式 |
| keyboardType | `KeyboardType` | `'default'` | 键盘类型 |
| maxLength | `number` | - | 最大长度 |
| editable | `boolean` | `true` | 是否可编辑 |

### Checkbox

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| checked | `boolean` | - | 是否选中 |
| onChange | `(checked) => void` | - | 变化回调 |
| label | `string` | - | 标签文字 |
| disabled | `boolean` | `false` | 是否禁用 |

## 🛠️ 依赖安装

```bash
# 核心依赖
npm install react-native expo-linear-gradient

# 导航（可选）
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
```

## 📱 响应式支持

- 自动适配不同屏幕尺寸
- 字体大小根据屏幕宽度缩放
- 输入框和按钮高度自适应
- 支持平板设备

## 🔒 安全建议

1. **密码加密**: 传输前使用 HTTPS，存储前使用 bcrypt 等哈希算法
2. **验证码**: 设置有效期（建议 5 分钟），限制发送频率
3. **防刷**: 添加图形验证码或滑块验证
4. **Token**: 登录成功后使用 JWT 等 Token 机制
5. **隐私**: 用户协议和隐私政策需要法务审核

## 🎨 自定义主题

编辑 `src/styles/theme.ts` 可以自定义颜色、间距、字体等：

```ts
export const colors = {
  primary: {
    main: '#YOUR_COLOR',
  },
  // ...
};
```

## 📝 待办事项

- [ ] 添加忘记密码功能
- [ ] 添加第三方登录（QQ、微博等）
- [ ] 添加生物识别登录（指纹、面容）
- [ ] 添加国际化支持
- [ ] 添加无障碍支持
- [ ] 添加单元测试

## 📄 License

MIT
