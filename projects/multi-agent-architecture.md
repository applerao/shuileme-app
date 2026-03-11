# 🤖 多 Agent 协作系统架构设计

**项目名称：** 万能小秘书 - 多 Agent 协作系统  
**设计日期：** 2026-03-10  
**架构版本：** v1.0

---

## 🎯 系统定位

支持**人类用户**和**AI Agent**无缝接入的协作平台，参考 OpenClaw 架构，实现：
- 人类用户通过自然语言交互
- Agent 通过 API/插件接入
- 统一的任务调度和资源管理
- 77 个专业角色的按需调用

---

## 🏗️ 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        接入层 (Access Layer)                     │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   人类用户接入   │   Agent 接入     │   插件接入                   │
│   - Web Chat    │   - API         │   - KimiClaw 风格            │
│   - 钉钉/微信    │   - SDK         │   - 命令行安装               │
│   - 语音/视频    │   - WebSocket   │   - 自动注册                 │
└────────┬────────┴────────┬─────────┴────────────┬────────────────┘
         │                 │                      │
         ▼                 ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      路由层 (Routing Layer)                      │
├─────────────────────────────────────────────────────────────────┤
│  - 请求识别（人类 vs Agent）                                     │
│  - 意图理解                                                     │
│  - 任务分发                                                     │
│  - 权限验证                                                     │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    核心调度层 (Core Scheduler)                   │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   任务管理器     │   Agent 调度器   │   角色库管理                 │
│   - 任务队列     │   - Agent 注册   │   - 77 角色定义              │
│   - 优先级       │   - 负载均衡     │   - 角色激活                 │
│   - 超时控制     │   - 状态监控     │   - 能力映射                 │
└────────┬────────┴────────┬─────────┴────────────┬────────────────┘
         │                 │                      │
         ▼                 ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     执行层 (Execution Layer)                     │
├───────────────┬───────────────┬───────────────┬─────────────────┤
│  主 Agent      │  子 Agent 池    │  工具集        │  外部服务         │
│  (协调者)      │  (专业执行者)  │  (工具调用)    │  (API/数据库)     │
└───────────────┴───────────────┴───────────────┴─────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      存储层 (Storage Layer)                      │
├───────────────┬───────────────┬───────────────┬─────────────────┤
│  会话存储      │  任务存储      │  知识库        │  日志存储         │
│  (Sessions)    │  (Tasks)       │  (Memory)      │  (Logs)           │
└───────────────┴───────────────┴───────────────┴─────────────────┘
```

---

## 👥 接入层设计

### 1. 人类用户接入

#### 1.1 Web Chat
```javascript
// 前端 SDK 示例
const client = new WanNengSecretary({
  endpoint: 'https://api.wanneng-secretary.com',
  token: 'user_token_here'
});

// 发送消息
await client.send({
  type: 'text',
  content: '帮我分析这个项目的可行性'
});

// 接收流式响应
client.on('message', (msg) => {
  console.log(msg.content);
});
```

#### 1.2 钉钉/微信集成
```yaml
# 配置文件
channels:
  dingtalk:
    enabled: true
    clientId: "ding_xxx"
    clientSecret: "xxx"
  wechat:
    enabled: true
    appId: "wx_xxx"
    appSecret: "xxx"
```

#### 1.3 语音/视频
```python
# 语音输入处理
async def process_voice(audio_data):
    # 1. 语音转文字
    text = await stt_service.transcribe(audio_data)
    # 2. 发送到核心系统
    response = await core.process(text)
    # 3. 文字转语音返回
    audio = await tts_service.synthesize(response)
    return audio
```

---

### 2. Agent 接入

#### 2.1 Agent 注册协议

**注册接口：** `POST /api/v1/agents/register`

```json
{
  "agent_id": "dev-agent-001",
  "agent_name": "高级开发工程师",
  "capabilities": ["code_review", "architecture_design", "debugging"],
  "model": "qwen3.5-plus",
  "workspace": "/workspace/dev",
  "auth_token": "agent_secret_token",
  "webhook_url": "https://agent-server.com/webhook"
}
```

**响应：**
```json
{
  "status": "success",
  "agent_key": "ak_xxx",
  "endpoints": {
    "task_receive": "/api/v1/agents/dev-agent-001/tasks",
    "status_report": "/api/v1/agents/dev-agent-001/status"
  }
}
```

#### 2.2 Agent SDK

**Python SDK：**
```python
from wanneng_secretary import AgentClient

# 初始化
agent = AgentClient(
    agent_id="dev-agent-001",
    agent_key="ak_xxx",
    server_url="https://api.wanneng-secretary.com"
)

# 接收任务
@agent.task_handler
async def handle_task(task):
    print(f"收到任务：{task.description}")
    
    # 执行任务
    result = await execute_task(task)
    
    # 返回结果
    return {
        "status": "completed",
        "result": result,
        "artifacts": ["file1.py", "report.md"]
    }

# 启动
await agent.start()
```

**Node.js SDK：**
```javascript
const { AgentClient } = require('@wanneng-secretary/sdk');

const agent = new AgentClient({
  agentId: 'dev-agent-001',
  agentKey: 'ak_xxx',
  serverUrl: 'https://api.wanneng-secretary.com'
});

agent.onTask(async (task) => {
  console.log('收到任务:', task.description);
  const result = await executeTask(task);
  return { status: 'completed', result };
});

await agent.start();
```

#### 2.3 WebSocket 实时通信

```javascript
// 建立连接
const ws = new WebSocket('wss://api.wanneng-secretary.com/agent/dev-agent-001');

ws.onopen = () => {
  console.log('连接已建立');
  // 发送心跳
  setInterval(() => ws.ping(), 30000);
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  switch (message.type) {
    case 'task_assigned':
      handleTask(message.payload);
      break;
    case 'status_request':
      reportStatus();
      break;
  }
};
```

---

### 3. 插件接入（KimiClaw 风格）

#### 3.1 插件包结构

```
wanneng-plugin-example/
├── package.json
├── plugin.json          # 插件元数据
├── src/
│   ├── index.js         # 入口文件
│   ├── commands/        # 命令定义
│   ├── handlers/        # 处理器
│   └── utils/           # 工具函数
├── skills/              # 技能定义
│   └── example-skill/
│       ├── SKILL.md
│       └── index.js
└── README.md
```

#### 3.2 插件元数据 (plugin.json)

```json
{
  "name": "wanneng-plugin-stock-analysis",
  "version": "1.0.0",
  "description": "股票分析插件",
  "author": "Your Name",
  "license": "MIT",
  "engines": {
    "wanneng-secretary": ">=1.0.0"
  },
  "commands": [
    {
      "name": "stock-query",
      "description": "查询股票信息",
      "handler": "./src/commands/stock-query.js"
    }
  ],
  "skills": [
    {
      "name": "stock-analysis",
      "description": "股票分析技能",
      "path": "./skills/stock-analysis"
    }
  ],
  "config": {
    "api_key": {
      "type": "string",
      "required": true,
      "description": "股票 API 密钥"
    }
  }
}
```

#### 3.3 命令行安装工具

**安装命令：**
```bash
# 从 npm 安装
wanneng plugin install wanneng-plugin-stock-analysis

# 从 GitHub 安装
wanneng plugin install github:username/wanneng-plugin-example

# 从本地安装
wanneng plugin install ./path/to/plugin

# 列出已安装插件
wanneng plugin list

# 更新插件
wanneng plugin update wanneng-plugin-stock-analysis

# 卸载插件
wanneng plugin uninstall wanneng-plugin-stock-analysis
```

**CLI 实现 (Node.js)：**
```javascript
#!/usr/bin/env node

const { Command } = require('commander');
const { installPlugin, listPlugins, uninstallPlugin } = require('./plugin-manager');

const program = new Command();

program
  .name('wanneng-plugin')
  .description('万能小秘书插件管理工具')
  .version('1.0.0');

program
  .command('install <plugin>')
  .description('安装插件')
  .option('-f, --force', '强制安装')
  .action(async (plugin, options) => {
    console.log(`正在安装插件：${plugin}`);
    await installPlugin(plugin, options);
    console.log('✅ 安装完成');
  });

program
  .command('list')
  .description('列出已安装插件')
  .action(() => {
    const plugins = listPlugins();
    plugins.forEach(p => console.log(`- ${p.name} v${p.version}`));
  });

program
  .command('uninstall <plugin>')
  .description('卸载插件')
  .action(async (plugin) => {
    await uninstallPlugin(plugin);
    console.log('✅ 卸载完成');
  });

program.parse();
```

#### 3.4 插件运行时

**插件加载器：**
```javascript
class PluginLoader {
  constructor() {
    this.plugins = new Map();
    this.commands = new Map();
    this.skills = new Map();
  }

  async loadPlugin(pluginPath) {
    const manifest = require(path.join(pluginPath, 'plugin.json'));
    const plugin = {
      manifest,
      path: pluginPath,
      commands: [],
      skills: []
    };

    // 加载命令
    for (const cmd of manifest.commands || []) {
      const handler = require(path.join(pluginPath, cmd.handler));
      this.commands.set(cmd.name, { handler, plugin: manifest.name });
      plugin.commands.push(cmd.name);
    }

    // 加载技能
    for (const skill of manifest.skills || []) {
      const skillPath = path.join(pluginPath, skill.path);
      this.skills.set(skill.name, { path: skillPath, plugin: manifest.name });
      plugin.skills.push(skill.name);
    }

    this.plugins.set(manifest.name, plugin);
    console.log(`✅ 插件已加载：${manifest.name}`);
  }

  async executeCommand(name, args) {
    const command = this.commands.get(name);
    if (!command) {
      throw new Error(`命令不存在：${name}`);
    }
    return await command.handler.execute(args);
  }
}
```

---

## 📋 核心调度层设计

### 1. 任务管理器

```python
class TaskManager:
    def __init__(self):
        self.task_queue = PriorityQueue()
        self.active_tasks = {}
        self.completed_tasks = []
    
    async def submit_task(self, task: Task) -> str:
        """提交任务"""
        task_id = generate_task_id()
        task.id = task_id
        task.status = 'pending'
        task.created_at = datetime.now()
        
        # 根据任务类型分配优先级
        priority = self.calculate_priority(task)
        
        # 加入队列
        await self.task_queue.put((priority, task))
        self.active_tasks[task_id] = task
        
        return task_id
    
    async def dispatch_task(self, agent_id: str) -> Optional[Task]:
        """分发任务给 Agent"""
        if self.task_queue.empty():
            return None
        
        _, task = await self.task_queue.get()
        task.assigned_to = agent_id
        task.status = 'running'
        task.started_at = datetime.now()
        
        return task
    
    def calculate_priority(self, task: Task) -> int:
        """计算任务优先级"""
        # 紧急任务 > 普通任务 > 后台任务
        if task.urgent:
            return 0
        elif task.user_waiting:
            return 1
        else:
            return 2
```

### 2. Agent 调度器

```python
class AgentScheduler:
    def __init__(self):
        self.agents = {}  # agent_id -> AgentInfo
        self.agent_status = {}  # agent_id -> status
        self.load_balancer = RoundRobinLB()
    
    def register_agent(self, agent: AgentInfo):
        """注册 Agent"""
        self.agents[agent.id] = agent
        self.agent_status[agent.id] = {
            'status': 'idle',
            'current_task': None,
            'last_heartbeat': datetime.now()
        }
    
    async def select_agent(self, task: Task) -> Optional[str]:
        """选择合适的 Agent"""
        # 根据任务所需能力筛选
        available_agents = [
            aid for aid, agent in self.agents.items()
            if self.can_handle(agent, task) 
            and self.agent_status[aid]['status'] == 'idle'
        ]
        
        if not available_agents:
            return None
        
        # 负载均衡选择
        return self.load_balancer.select(available_agents)
    
    def can_handle(self, agent: AgentInfo, task: Task) -> bool:
        """判断 Agent 是否能处理任务"""
        required_caps = set(task.required_capabilities)
        agent_caps = set(agent.capabilities)
        return required_caps.issubset(agent_caps)
```

### 3. 角色库管理

```python
class RoleLibrary:
    def __init__(self, library_path: str):
        self.library_path = library_path
        self.roles = {}  # role_name -> RoleDefinition
        self.active_roles = set()
    
    def load_roles(self):
        """加载所有角色定义"""
        for category in os.listdir(self.library_path):
            category_path = os.path.join(self.library_path, category)
            if not os.path.isdir(category_path):
                continue
            
            for file in os.listdir(category_path):
                if file.endswith('.md'):
                    role_def = self.parse_role_file(
                        os.path.join(category_path, file)
                    )
                    self.roles[role_def.name] = role_def
    
    def activate_role(self, role_name: str) -> RoleDefinition:
        """激活角色"""
        if role_name not in self.roles:
            raise ValueError(f"角色不存在：{role_name}")
        
        self.active_roles.add(role_name)
        return self.roles[role_name]
    
    def get_role_prompt(self, role_name: str) -> str:
        """获取角色提示词"""
        role = self.roles.get(role_name)
        if not role:
            raise ValueError(f"角色不存在：{role_name}")
        
        return role.system_prompt
```

---

## 💾 存储层设计

### 1. 数据结构

**会话 (Sessions)：**
```json
{
  "session_id": "sess_xxx",
  "user_id": "user_xxx",
  "channel": "webchat",
  "created_at": "2026-03-10T10:00:00Z",
  "updated_at": "2026-03-10T10:30:00Z",
  "messages": [
    {
      "role": "user",
      "content": "帮我分析项目",
      "timestamp": "2026-03-10T10:00:00Z"
    },
    {
      "role": "assistant",
      "content": "好的，我来分析...",
      "timestamp": "2026-03-10T10:00:05Z"
    }
  ],
  "metadata": {
    "agent_id": "main",
    "model": "qwen3.5-plus"
  }
}
```

**任务 (Tasks)：**
```json
{
  "task_id": "task_xxx",
  "session_id": "sess_xxx",
  "type": "feasibility_analysis",
  "status": "completed",
  "priority": 1,
  "assigned_to": "agent:main:subagent:xxx",
  "created_at": "2026-03-10T10:00:00Z",
  "started_at": "2026-03-10T10:00:05Z",
  "completed_at": "2026-03-10T10:30:00Z",
  "result": {
    "status": "success",
    "artifacts": ["report.md"]
  }
}
```

---

## 🔐 安全与权限

### 1. 认证机制

```python
class AuthManager:
    def __init__(self):
        self.user_tokens = {}
        self.agent_keys = {}
    
    def verify_user(self, token: str) -> Optional[User]:
        """验证用户"""
        return self.user_tokens.get(token)
    
    def verify_agent(self, agent_key: str) -> Optional[Agent]:
        """验证 Agent"""
        return self.agent_keys.get(agent_key)
    
    def generate_token(self, user_id: str) -> str:
        """生成用户 Token"""
        token = generate_secure_token()
        self.user_tokens[token] = user_id
        return token
```

### 2. 权限控制

```python
class PermissionManager:
    PERMISSIONS = {
        'user': ['send_message', 'view_tasks', 'cancel_own_tasks'],
        'agent': ['receive_tasks', 'report_status', 'access_workspace'],
        'admin': ['manage_agents', 'view_all_tasks', 'system_config']
    }
    
    def check_permission(self, entity: Entity, action: str) -> bool:
        """检查权限"""
        allowed = self.PERMISSIONS.get(entity.role, [])
        return action in allowed
```

---

## 📊 监控与日志

### 1. 指标收集

```python
class MetricsCollector:
    def __init__(self):
        self.metrics = {
            'tasks_total': Counter('tasks_total', 'Total tasks'),
            'tasks_completed': Counter('tasks_completed', 'Completed tasks'),
            'agent_active': Gauge('agent_active', 'Active agents'),
            'task_duration': Histogram('task_duration', 'Task duration')
        }
    
    def record_task_start(self, task: Task):
        self.metrics['tasks_total'].inc()
    
    def record_task_complete(self, task: Task):
        self.metrics['tasks_completed'].inc()
        duration = (task.completed_at - task.started_at).total_seconds()
        self.metrics['task_duration'].observe(duration)
```

### 2. 日志格式

```json
{
  "timestamp": "2026-03-10T10:00:00Z",
  "level": "INFO",
  "service": "task-scheduler",
  "event": "task_assigned",
  "task_id": "task_xxx",
  "agent_id": "agent_xxx",
  "duration_ms": 150
}
```

---

## 🚀 部署架构

```
┌─────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                    │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   API Pod   │  │ Scheduler   │  │  Agent Pod  │     │
│  │   (x3)      │  │   Pod (x2)  │  │   (xN)      │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │              PostgreSQL (HA)                     │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │                Redis Cluster                     │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │              MinIO (Object Storage)              │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 实施路线图

| 阶段 | 时间 | 目标 |
|------|------|------|
| **Phase 1** | 第 1-2 周 | 核心调度层 + 人类用户接入 |
| **Phase 2** | 第 3-4 周 | Agent 接入 SDK + 插件系统 |
| **Phase 3** | 第 5-6 周 | 角色库管理 + 77 角色集成 |
| **Phase 4** | 第 7-8 周 | 监控 + 日志 + 部署 |
| **Phase 5** | 第 9-10 周 | 测试 + 优化 + 文档 |

---

**文档版本：** v1.0  
**创建日期：** 2026-03-10  
**维护者：** 万能小秘书
