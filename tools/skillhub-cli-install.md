# Skillhub CLI 安装说明

**安装日期：** 2026-03-19  
**安装模式：** CLI Only（仅命令行工具）  
**状态：** ✅ 已完成

---

## 📋 安装信息

### 安装命令

```bash
curl -fsSL https://skillhub-1388575217.cos.ap-guangzhou.myqcloud.com/install/install.sh | bash -s -- --cli-only
```

### 安装位置

- **CLI 路径：** `/root/.local/bin/skillhub`
- **版本：** `skillhub 2026.3.18`

---

## 🔧 使用方法

### 1. 搜索技能

```bash
# 搜索关键词
skillhub search <关键词>

# 示例
skillhub search calendar
skillhub search weather
skillhub search email
```

### 2. 安装技能

```bash
# 安装指定技能到当前 workspace
skillhub install <技能名称>

# 示例
skillhub install ws-calendar
skillhub install calendar-manager
```

### 3. 查看已安装的技能

```bash
skillhub list
```

### 4. 升级技能

```bash
# 升级所有已安装的 skill
skillhub upgrade

# 升级指定技能
skillhub upgrade <技能名称>
```

### 5. 升级 CLI 自身

```bash
skillhub self-upgrade
```

---

## 📊 可用技能示例

### 日历管理类

| 技能名称 | 说明 | 版本 |
|----------|------|------|
| `ws-calendar` | 日程管理。创建日程、设置提醒、查看安排 | 1.0.0 |
| `calendar-scheduling` | 跨平台会议安排（Google/Outlook/CalDAV） | 0.9.1 |
| `calendar-manager` | 日历管理 - 读取日程、创建事件、设置提醒 | 1.1.0 |
| `calendar-hold-sync` | Google 日历同步到私有忙碌事件 | - |

---

## 🎯 典型使用场景

### 场景 1: 安装日历技能

```bash
# 1. 搜索日历相关技能
skillhub search calendar

# 2. 安装合适的技能
skillhub install ws-calendar

# 3. 验证安装
skillhub list
```

### 场景 2: 安装天气技能

```bash
# 搜索天气技能
skillhub search weather

# 安装
skillhub install weather-skill
```

---

## 🔄 与 OpenClaw 集成

### 重启 OpenClaw

安装 Skillhub CLI 后，建议重启 OpenClaw 以感知 Skillhub：

```bash
# 重启 OpenClaw Gateway
openclaw gateway restart
```

### 使用方式

重启后，OpenClaw 将：
- ✅ 自动感知 Skillhub
- ✅ 可使用 Skillhub 的加速能力
- ✅ 用户可通过自然语言安装技能

---

## 📝 注意事项

### 1. PATH 配置

确保 `/root/.local/bin` 在 PATH 中：

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### 2. 工作区

技能会安装到当前的 workspace 下：
- 当前工作区：`/home/admin/.openclaw/workspace-secretary`
- 技能安装位置：工作区下的技能目录

### 3. 网络要求

需要访问：
- `https://skillhub-1388575217.cos.ap-guangzhou.myqcloud.com` - 安装包
- Skill index JSON - 技能列表

---

## 🛠️ 故障排查

### 问题 1: skillhub 命令找不到

**解决方案：**
```bash
# 检查安装
ls -la /root/.local/bin/skillhub

# 添加到 PATH
export PATH="$HOME/.local/bin:$PATH"

# 验证
which skillhub
```

---

### 问题 2: 搜索失败

**解决方案：**
```bash
# 检查网络连接
curl -I https://skillhub-1388575217.cos.ap-guangzhou.myqcloud.com

# 使用详细模式
skillhub search calendar -v
```

---

### 问题 3: 安装失败

**解决方案：**
```bash
# 检查工作区权限
ls -la /home/admin/.openclaw/workspace-secretary/

# 确保有写入权限
chmod -R u+w /home/admin/.openclaw/workspace-secretary/
```

---

## 📚 相关文档

- **官方文档：** https://skillhub-1388575217.cos.ap-guangzhou.myqcloud.com/install/skillhub.md
- **安装脚本：** https://skillhub-1388575217.cos.ap-guangzhou.myqcloud.com/install/install.sh

---

## 📞 快速参考

```bash
# 搜索技能
skillhub search <关键词>

# 安装技能
skillhub install <技能名>

# 查看已安装
skillhub list

# 升级技能
skillhub upgrade

# 查看帮助
skillhub --help
```

---

_安装完成，Skillhub CLI 已就绪_
