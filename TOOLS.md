# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

---

## 📧 邮件发送配置

**发送脚本：** `/root/bin/sendmail.sh`

**默认配置：**
- **发件人：** dason.rao@qq.com
- **收件人：** dason.rao@qq.com

**使用方法：**
```bash
# 基本用法
/root/bin/sendmail.sh "收件人" "主题" "正文"

# 示例
/root/bin/sendmail.sh "dason.rao@qq.com" "测试邮件" "这是一封测试邮件的内容"
```

**邮件礼仪：**
- 使用礼貌、正式的语言
- 标题简洁明了，概括核心内容
- 正文结构清晰：称呼 → 正文 → 结尾 → 署名
- 重要邮件发送前双重确认

**注意事项：**
- 编码使用 UTF-8，确保中文正常显示
- 敏感信息需加密或避免发送
- 重要邮件保留发送记录

**详细文档：** `email-management.md`

---

## 💻 代码空间

- **代码根目录：** `/home/admin/repo`
- **代码工作区：** `/home/admin/code`
- **SSH 密钥：** `/home/admin/.ssh/id_rsa`
- **GitHub 用户：** `applerao`

---

## 🎨 文生图配置

**脚本位置：** `/root/bin/text-to-image.sh`  
**模型：** 通义万相 2.0（阿里云 Wan2.6）  
**图片托管：** `gallery.lanxiongxiong.com/pics/`

**使用方法：**
```bash
# 生成图片
/root/bin/text-to-image.sh "一只可爱的猫咪坐在窗台上晒太阳"

# 输出
# 图片保存到 /home/admin/data/gallery-images/
# 返回远程 URL：https://gallery.lanxiongxiong.com/pics/xxx.png
```

**常用尺寸：**
| 用途 | 尺寸 |
|------|------|
| 公众号封面 | 900 × 383 px |
| 小红书封面 | 1242 × 1660 px |
| 正方形配图 | 1024 × 1024 px |

---

## 📈 股票数据

**脚本位置：** `/root/bin/stock-data.py`  
**数据源：** 阿里云 MCP 服务（`market-cmapi00065924`）

**使用方法：**
```bash
# A 股
/root/bin/stock-data.py a 600519

# 港股
/root/bin/stock-data.py hk 0700

# 美股
/root/bin/stock-data.py us AAPL
```

---

## 📱 微信公众号

**MCP 服务：** `wenyan-mcp`  
**配置文件：** `/root/.mcporter/mcporter.json`

**公众号凭据：**
- **AppID：** wx64420428f041f094
- **AppSecret：** 已配置

**可用主题：**
| 主题 | 风格 | 适用 |
|------|------|------|
| `default` | 经典简洁 | 通用 |
| `orangeheart` | 橙色温暖 | 情感类 |
| `lapis` | 蓝色商务 | 商业分析 |
| `rainbow` | 多彩活泼 | 轻松话题 |
| `pie` | 粉色柔和 | 生活类 |
| `maize` | 黄色明快 | 积极向上 |
| `purple` | 紫色优雅 | 深度思考 |
| `phycat` | 清新自然 | 旅行/自然 |

---

## 🎭 角色扮演

**角色库位置：** `role-library/`  
**角色总数：** 77 个

**分类：**
- engineering（7 个）
- design（7 个）
- marketing（8 个）
- product（3 个）
- project-management（5 个）
- testing（7 个）
- support（6 个）
- spatial-computing（6 个）
- specialized（7 个）
- strategy（3 个）

---

## 🤖 Agent 任务分配

**可用 Agents：**
| Agent | 专长 | 工作空间 |
|-------|------|---------|
| `main` | 综合协调 | workspace-secretary |
| `dev` | 软件开发 | workspace-dev |
| `writer` | 内容创作 | workspace-writer |
| `moneymaker` | 投资分析 | workspace-invest |

**任务分配文档：** `agent-task-manager.md`

---

Add whatever helps you do your job. This is your cheat sheet.

_最后更新：2026-03-09（迁移历史工作空间配置）_
