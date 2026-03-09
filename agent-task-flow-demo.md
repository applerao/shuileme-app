# Agent 任务分配流程演示

**演示时间：** 2026-03-06 21:57  
**演示任务：** 分析腾讯控股（0700.HK）投资价值

---

## 📋 完整流程

### 步骤 1: 接收任务 ✅

**输入：**
```
大圣爸爸："分析一下腾讯控股（0700.HK）的投资价值"
```

**处理：**
- 接收任务描述
- 记录任务时间
- 生成任务 ID

---

### 步骤 2: 分析任务类型 ✅

**分析结果：**

| 维度 | 判断 |
|------|------|
| **任务类型** | 投资分析 |
| **专业领域** | 股票/港股 |
| **复杂度** | 中等 |
| **预计耗时** | 5-10 分钟 |

**匹配规则：**
```
if 任务包含"分析"+"投资" → invest agent
if 任务包含"开发"+"代码" → dev agent
if 任务包含"写文章"+"公众号" → writer agent
else → main agent（万能小秘书）
```

**匹配结果：** `invest（价值投资者）`

---

### 步骤 3: 分配任务 ✅

**执行命令：**
```python
sessions_spawn(
    agentId="main",  # 当前使用 main agent 演示
    label="腾讯控股投资分析",
    mode="run",  # 一次性任务
    task="""
    作为价值投资专家，分析腾讯控股（0700.HK）的投资价值：
    1. 商业模式分析
    2. 财务数据分析
    3. 护城河评估
    4. 估值分析
    5. 投资建议
    """,
    timeoutSeconds=60
)
```

**返回结果：**
```json
{
  "status": "accepted",
  "childSessionKey": "agent:main:subagent:3acfce7d-d260-47c8-bb5b-db4f89a50886",
  "runId": "49e7a559-55ef-4727-89d2-d5af948df6ae",
  "mode": "run",
  "note": "auto-announces on completion"
}
```

---

### 步骤 4: 跟踪进度 ⏳

**监控方式：**

```bash
# 查看子 agent 列表
subagents list

# 查看特定 session 历史
sessions_history --session agent:main:subagent:xxx

# 查看活跃 sessions
sessions_list
```

**状态流转：**
```
pending → running → completed/failed
```

**当前状态：** `执行中...`

---

### 步骤 5: 接收结果 ⏳

**完成通知：**
- 子 agent 完成后自动推送结果
- 结果发送到主 session
- 万能小秘书汇总后汇报给大圣爸爸

**预期输出：**
```
📊 腾讯控股（0700.HK）投资分析报告

1. 商业模式分析
   - 公司如何赚钱
   - 目标客户
   - 竞争优势

2. 财务数据分析
   - ROE、毛利率
   - 现金流
   - 负债率

3. 护城河评估
   - 品牌优势
   - 网络效应
   - 转换成本

4. 估值分析
   - PE、PB
   - DCF 估值
   - 安全边际

5. 投资建议
   - 买入/持有/卖出
   - 目标价
   - 风险提示
```

---

### 步骤 6: 汇总汇报 ⏳

**万能小秘书汇报：**

```
大圣爸爸，任务已完成！

📊 任务：腾讯控股投资分析
👤 执行：invest（价值投资者）
⏱️ 耗时：X 分钟
📝 结果：已完成投资分析报告

核心结论：
- [投资评级]
- [目标价]
- [主要风险]

详细报告已保存到：
/workspace-invest/analysis/0700-腾讯控股 -2026-03-06.md
```

---

## 📊 任务分配矩阵

| 任务类型 | 分配 Agent | 示例 |
|---------|-----------|------|
| **软件开发** | dev（高级研究员） | "开发一个 API" |
| **投资分析** | invest（价值投资者） | "分析贵州茅台" |
| **内容创作** | writer（内容创作者） | "写篇公众号文章" |
| **日常事务** | main（万能小秘书） | "提醒我 xxx" |
| **角色扮演** | 角色库中的角色 | "扮演 Backend Developer" |

---

## 🛠️ 技术实现

### 任务分配逻辑

```python
def assign_task(task_description):
    # 1. 关键词匹配
    keywords = extract_keywords(task_description)
    
    # 2. 任务分类
    if any(k in keywords for k in ['开发', '代码', 'API', '系统']):
        agent = 'dev'
    elif any(k in keywords for k in ['投资', '股票', '分析', '财报']):
        agent = 'invest'
    elif any(k in keywords for k in ['文章', '公众号', '写作', '内容']):
        agent = 'writer'
    else:
        agent = 'main'
    
    # 3. 创建子任务
    result = sessions_spawn(
        agentId=agent,
        task=task_description,
        mode='run'
    )
    
    # 4. 跟踪进度
    track_progress(result['runId'])
    
    # 5. 汇总结果
    return summarize_result(result)
```

### 优先级队列

| 优先级 | 任务类型 | 响应时间 |
|--------|---------|---------|
| **P0** | 大圣爸爸直接指令 | 立即 |
| **P1** | 定时任务 | 准点执行 |
| **P2** | 常规任务 | 5 分钟内 |
| **P3** | 后台任务 | 30 分钟内 |

---

## 📝 任务记录模板

```markdown
## 任务：[任务名称]

**任务 ID:** [runId]
**分配时间:** YYYY-MM-DD HH:MM
**分配给:** [Agent 名称]
**优先级:** P0/P1/P2/P3
**截止时间:** YYYY-MM-DD HH:MM

### 任务描述
[详细描述]

### 执行过程
- [ ] 任务已分配
- [ ] 执行中
- [ ] 已完成

### 结果汇总
[完成任务后填写]

### 耗时统计
- 分配耗时：X 秒
- 执行耗时：X 分钟
- 总耗时：X 分钟
```

---

## ✅ 演示总结

### 已完成的步骤

| 步骤 | 状态 | 说明 |
|------|------|------|
| 1. 接收任务 | ✅ | 接收大圣爸爸指令 |
| 2. 分析任务 | ✅ | 识别为投资分析任务 |
| 3. 分配任务 | ✅ | 创建子 agent 任务 |
| 4. 跟踪进度 | ⏳ | 等待执行完成 |
| 5. 接收结果 | ⏳ | 等待自动推送 |
| 6. 汇总汇报 | ⏳ | 向大圣爸爸汇报 |

### 测试数据

- **任务 ID:** `49e7a559-55ef-4727-89d2-d5af948df6ae`
- **Session Key:** `agent:main:subagent:3acfce7d-d260-47c8-bb5b-db4f89a50886`
- **任务类型:** 投资分析
- **执行 Agent:** main（演示用）
- **超时设置:** 60 秒

---

**演示者：** 万能小秘书  
**演示时间:** 2026-03-06 21:57  
**状态:** 执行中...
