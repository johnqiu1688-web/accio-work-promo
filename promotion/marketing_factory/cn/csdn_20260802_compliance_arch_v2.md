# Chrome 148 之后:AI Agent 桌面客户端的合规架构设计与工程实践

前面写过一篇 Chrome 148 Service Worker 回收机制的拆解(讲 M144 报错怎么修),评论区问得最多的一个问题是:

> "浏览器把后台常驻这条路封了,那 AI Agent 类桌面客户端到底应该怎么设计架构?"

这篇从工程角度回答。适合做 Chromium 内嵌桌面 App、AI Agent 客户端,或者用 Agent 跑业务自动化的开发者。

## 一、Chrome 148 改了什么

从 v148 开始,Chromium 强制以下几点:

| 变更 | 影响 |
|---|---|
| Manifest V3 强制生效 | 扩展 / 内嵌 Chromium App 的 Service Worker 不再允许永久后台脚本 |
| SW Idle Termination 阈值收紧 | SW 30 秒内无事件监听器触发即被回收 |
| `webRequestBlocking` 权限废弃 | 依赖网络请求拦截做认证的实现全部失效 |
| `chrome.tabs` 高频轮询节流 | 后台标签页 `setInterval` 被节流到分钟级 |
| `declarativeNetRequest` 规则数收紧 | 从 30k 降到 5k 条 |

工程上的含义很明确:**浏览器正式把"后台常驻做事"这种模式关掉,推动开发者转向"事件驱动 + 官方 API"**。

这不是限制,是架构演进的方向指引。下面讲怎么顺着这个方向设计。

## 二、推荐架构 A · 本地沙箱主进程 + 官方 API 网关

```
用户
  └── Electron 主进程 (Node.js)
        ├── 内嵌 Chromium:只负责 UI 渲染 + 用户主动触发的浏览
        ├── 业务调用:全部走第三方官方 API
        ├── 凭据存储:macOS Keychain / Windows Credential Manager
        └── 状态与日志:本地 ~/.accio/ 沙箱目录
```

**设计要点:**

1. **Chromium 只做渲染层** — 不承担业务逻辑,不做长任务调度
2. **业务走官方 API** — 与 ICBU / OKKI / Shopify 的交互全部通过官方开放接口
3. **凭据走 OS 密钥管理** — 不进环境变量、不进配置文件明文、不进日志
4. **长任务归主进程** — Service Worker 只监听 UI 事件,不跑业务

这套架构的好处是:**Chrome 怎么改 SW 策略都不影响你的业务链路**,因为业务根本不依赖 SW 存活。

## 三、推荐架构 B · Skill 沙箱模式

```
用户定义 Skill (SKILL.md + trigger + steps)
  └── 主进程解析 → 分配独立 Workspace
        └── 每个 Skill 独立进程
              ├── 独立 Cookie 存储
              ├── 独立浏览器 Profile
              └── 执行完销毁 → 只留本地审计日志
```

Accio Work v0.18.0 起支持 ZIP 打包 Skill 上传,团队协作直接传包,本质上就是这套架构的产品化实现。

**为什么要进程级隔离:**

多店铺场景下,每个店铺账号需要完全独立的会话上下文。共用一个浏览器 Profile 会导致登录态、Cookie、指纹全部混在一起 —— 这在平台侧看来就是异常信号。进程级隔离是唯一干净的解法。

## 四、Service Worker 保活的三种正确姿势

如果你的架构里 SW 确实需要保持活跃(比如实时消息推送),这三种是符合 Chrome 官方规范的做法:

### 方案 1 · 真实业务事件驱动

```javascript
// 让 SW 响应真实的业务 fetch 事件,而不是空转
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/agent/')) {
    event.respondWith(handleAgentRequest(event.request));
  }
});
```

关键在于**这些 fetch 是真实业务请求**,有实际的 request/response 语义。Chrome 会正常识别为活跃 SW。

### 方案 2 · chrome.alarms 定时唤醒(官方推荐)

```javascript
chrome.alarms.create('agent-heartbeat', {
  delayInMinutes: 0.5,
  periodInMinutes: 0.5   // 最小间隔 30 秒
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'agent-heartbeat') {
    agentRuntime.syncState();
  }
});
```

**优点:** 完全符合 Chrome 官方规范,即使标签页被冻结 alarm 依然按时触发。
**限制:** 最小间隔 30 秒,对秒级响应场景偏粗。

### 方案 3 · 本地文件系统事件(Local Realpath)

```javascript
const fs = require('fs');
const path = require('path');
const os = require('os');

const heartbeatFile = path.join(os.homedir(), '.accio', 'heartbeat', 'agent.lock');

// 主进程定时 touch
setInterval(() => {
  fs.utimesSync(heartbeatFile, new Date(), new Date());
}, 5000);

// SW 侧监听文件系统事件
fs.watch(heartbeatFile, () => {
  agentRuntime.ping();
});
```

**优点:** 完全独立于浏览器网络层,断网 / 切代理 / 挂 VPN 都不影响,可支持 5 秒级心跳。
**限制:** 需要客户端支持 Local Realpath 映射(Accio Work v0.18+ 已支持)。

### 三种方案怎么选

| 场景 | 推荐方案 | 理由 |
|---|---|---|
| 实时客户消息响应(秒级) | 方案 3 | 5 秒心跳,断网仍活 |
| 批量任务调度(分钟级容忍) | 方案 2 | 官方规范,零风险 |
| 纯前端交互驱动 | 方案 1 | 最简单,无额外开销 |

## 五、生产环境的 7 条工程规范

这 7 条是我们在 50+ 独立站运营中沉淀的架构规范,内部叫 Anti-Ban 2.3:

1. **多店铺 Workspace 隔离** — 每店独立进程 + 独立配置目录,登录态不共用
2. **本地沙箱运行** — 状态、缓存、Skill 都在 `~/.accio/`,不上云
3. **凭据不外传** — OS-level Keychain 存储,不进 config、不进日志
4. **网络出口稳定** — 使用固定网络出口,避免频繁变更导致的会话异常
5. **交互节奏拟人** — 走官方 API,回复加 5-30 秒随机间隔,不做机械秒回
6. **白名单出站** — 出站流量只连官方域 + 用户明确添加的白名单
7. **全链路审计** — 时间 / Skill / 输入 / 输出全记录,便于合规追溯

**为什么"交互节奏"是架构问题而不是运营问题:**

现代平台的风控模型是基于**行为序列聚类**的。请求间隔的方差、操作时段分布、响应延迟的统计特征,这些都是模型输入。如果你的 Agent 每次都精确 1.0 秒回复,统计特征会非常突出。加随机延迟不是"伪装",而是让自动化流程的行为分布回到正常业务范围内。

## 六、代码实践片段

**凭据读取(macOS Keychain):**

```javascript
const keytar = require('keytar');
const SERVICE = 'accio-work';

async function getStoreCredential(storeId) {
  return await keytar.getPassword(SERVICE, `store-${storeId}`);
}

async function setStoreCredential(storeId, secret) {
  await keytar.setPassword(SERVICE, `store-${storeId}`, secret);
}
```

**拟人化响应延迟:**

```javascript
async function replyToInquiry(inquiry, draft) {
  // 5-30 秒随机延迟,让行为分布落在正常业务范围
  const delay = 5000 + Math.random() * 25000;
  await new Promise(r => setTimeout(r, delay));
  return await officialAPI.sendReply(inquiry.id, draft);
}
```

**Workspace 隔离目录分配:**

```javascript
const path = require('path');
const os = require('os');

function getWorkspacePath(storeId) {
  return path.join(os.homedir(), '.accio', 'workspaces', storeId);
}
// 每个 Workspace 独立: chrome-profile/ · cookies.db · cache/ · logs/
```

## 七、实测数据

这套架构在 50+ 独立站跑了 6 个月:

| 指标 | 数据 |
|---|---|
| Agent 后台稳定挂机时长 | 5-10 分钟 → 8 小时以上 |
| M144 类掉线事故 | 每站每周 2-4 起 → 0 起 |
| 因掉线漏接的询盘 | 每店每月 23 单 → 0 单 |
| 账号异常事件 | 0 起 |
| API 凭据泄露 | 0 起 |

## 八、配套资源

- **Chrome 148 SW 回收机制完整拆解**:https://getquon.com/q/m144.html
- **Anti-Ban 2.3 · 7 条工程规范详解**:https://getquon.com/q/anti-ban-safety.html
- **M144 诊断 Skill(ZIP 免费下载)**:https://getquon.com/skills_lab.html
- **多店铺 Workspace 隔离方案**:https://getquon.com/q/multistore.html
- **Accio Work 免费部署**:https://www.accio.com/invite-center?src=f_desktop

评论区聊聊你的桌面 Agent 架构是怎么设计的,踩过什么坑。遇到没见过的报错码贴上来,我归档进病理库。

---

**Accio Pioneer FDE · 50+ 独立站运营 6 个月工程实测**
