# 📧 邮件管理标准操作

**更新日期：** 2026-03-06  
**邮箱账户：** dason.rao@qq.com（QQ 邮箱）

---

## 🎯 标准操作流程

### 1️⃣ 发送邮件（优先使用 mailbox CLI）

**标准方式：mailbox CLI**
```bash
mailbox email send \
    --to "收件人邮箱" \
    --subject "邮件主题" \
    --body "邮件正文"
```

**备选方式：sendmail.sh（自动回退）**
```bash
/root/bin/sendmail.sh "收件人邮箱" "邮件主题" "邮件正文"
```

**sendmail.sh 智能回退逻辑：**
1. 首先尝试 mailbox CLI
2. 如果失败，自动回退到 msmtp
3. 显示清晰的发送状态

---

### 2️⃣ 查看邮件

**查看最近邮件：**
```bash
# 查看最近 10 封
mailbox email list --limit 10

# 查看未读邮件
mailbox email list --unread-only --limit 20

# 强制从服务器获取（不使用缓存）
mailbox email list --limit 10 --live
```

**查看邮件详情：**
```bash
mailbox email show <email_id>
```

---

### 3️⃣ 管理邮件

**标记已读：**
```bash
mailbox email mark <email_id> --read --confirm
```

**删除邮件：**
```bash
mailbox email delete <email_id> --confirm
```

**搜索邮件：**
```bash
mailbox email search --query "关键词" --limit 20
```

**查看文件夹：**
```bash
mailbox email folders
```

---

### 4️⃣ 同步邮件

**手动同步：**
```bash
# 强制同步所有账户
mailbox sync force

# 查看同步状态
mailbox sync status
```

---

## 📁 配置文件位置

| 配置 | 路径 |
|------|------|
| **mailbox 认证** | `~/.config/mailbox/auth.json` |
| **mailbox 配置** | `~/.config/mailbox/config.toml` |
| **msmtp 配置** | `/root/.msmtprc` |
| **授权码文件** | `/root/.qq-password` |
| **发送脚本** | `/root/bin/sendmail.sh` |

---

## 🔐 认证信息

**邮箱账户：** dason.rao@qq.com  
**授权码：** `irelaqxpxttccjej`（存储在 `/root/.qq-password`）

**SMTP 配置：**
- 服务器：smtp.qq.com
- 端口：465
- TLS：启用

**IMAP 配置：**
- 服务器：imap.qq.com
- 端口：993
- TLS：启用

---

## ✅/❌ 功能状态

| 功能 | 状态 | 说明 |
|------|------|------|
| **发送邮件** | ✅ 正常 | mailbox CLI 优先，msmtp 备选 |
| **接收邮件** | ✅ 正常 | mailbox CLI |
| **查看收件箱** | ✅ 正常 | 支持缓存和实时模式 |
| **标记已读** | ✅ 正常 | mailbox CLI |
| **删除邮件** | ✅ 正常 | mailbox CLI |
| **搜索邮件** | ✅ 正常 | mailbox CLI |
| **同步邮件** | ✅ 正常 | mailbox CLI |

---

## 🛠️ 故障排查

**mailbox CLI 失败时：**
```bash
# 1. 检查认证配置
cat ~/.config/mailbox/auth.json

# 2. 强制同步测试
mailbox sync force --json

# 3. 查看邮箱账户列表
mailbox account list --json
```

**msmtp 失败时：**
```bash
# 1. 检查 msmtp 配置
cat /root/.msmtprc

# 2. 测试 SMTP 连接
echo "测试" | msmtp -v dason.rao@qq.com

# 3. 查看日志
cat ~/.msmtp.log
```

---

## 📝 使用示例

**示例 1：发送通知邮件**
```bash
/root/bin/sendmail.sh "dason.rao@qq.com" "API 健康检查完成" "服务运行正常，无需干预。"
```

**示例 2：查看未读邮件**
```bash
mailbox email list --unread-only --limit 5
```

**示例 3：清理已读邮件**
```bash
# 标记所有为已读
mailbox email mark --all --read --confirm
```

---

## 🎯 最佳实践

1. **发送优先 mailbox CLI** - 更好的错误处理和日志
2. **定期同步邮件** - 保持本地缓存最新
3. **使用缓存模式** - 减少 IMAP 请求，提高速度
4. **重要操作加 --confirm** - 避免误操作
5. **失败自动回退** - sendmail.sh 会自动尝试备选方案

---

**文档维护：** 每次配置变更后更新此文档
