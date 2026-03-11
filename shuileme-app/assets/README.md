# 睡了么 App - 启动屏与图标资源

## 📱 App 图标 (App Icon)

### iOS
位置：`ios/shuileme/Images.xcassets/AppIcon.appiconset/`

需要准备的尺寸：
- 20x20 (@2x, @3x)
- 29x29 (@2x, @3x)
- 40x40 (@2x, @3x)
- 60x60 (@2x, @3x)
- 1024x1024 (App Store)

### Android
位置：`android/app/src/main/res/mipmap-*/`

需要准备的尺寸：
- mdpi: 48x48
- hdpi: 72x72
- xhdpi: 96x96
- xxhdpi: 144x144
- xxxhdpi: 192x192

## 🎨 设计规范

### 主色调
- 深夜蓝：#1a2332
- 星空紫：#6b4c9a
- 晨曦紫：#9b7ebd

### 图标设计建议
- 主题：月亮、星星、梦境元素
- 风格：简洁、现代、夜间模式友好
- 背景：使用深夜蓝渐变
- 前景：白色或星空紫的月亮/星星图案

## 🌅 启动屏 (Splash Screen)

### iOS
位置：`ios/shuileme/LaunchScreen.storyboard`

### Android
位置：`android/app/src/main/res/drawable/splash_screen.xml`

### 设计建议
- 背景色：#1a2332 (深夜蓝)
- Logo：居中显示 App 图标
- 文字："🌙 睡了么" + "记录你的每一个好梦"
- 动画：淡入效果

## 📝 占位文件

当前使用占位文本，实际开发时请替换为真实资源。
