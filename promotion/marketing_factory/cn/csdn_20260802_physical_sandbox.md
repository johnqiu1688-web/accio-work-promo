# 本地沙箱到底沙在哪:拆解 AI Agent 客户端的数据边界设计

做外贸的朋友装 AI Agent 客户端时,问得最多的一个问题是:

> "这东西装在我电脑上,会不会偷偷读我别的文件?我店铺的 API 密钥安全吗?"

这个担心非常合理。一个能读网页、能调 API、能跑脚本的桌面 Agent,权限边界如果设计不清楚,确实是个黑洞。

这篇从工程角度拆解**本地沙箱(Local Sandbox)到底是怎么实现的**,以及作为使用者你可以怎么自己验证。不谈营销话术,只讲目录结构、进程模型和可验证的检查方法。

## 一、先说结论:沙箱的三层边界

一个设计合理的本地 AI Agent 客户端,应该有三层数据边界:

```
┌─────────────────────────────────────────┐
│  Layer 3 · 云端                          │
│  只有:模型推理请求(脱敏后的 prompt)      │
│  没有:文件内容 / 凭据 / 完整业务数据       │
└─────────────────────────────────────────┘
              ↑ 受控上行
┌─────────────────────────────────────────┐
│  Layer 2 · 本地沙箱 ~/.accio/            │
│  存放:Agent 状态 / Skill / 缓存 / 日志    │
│  隔离:每个 Workspace 独立子目录            │
└─────────────────────────────────────────┘
              ↑ 显式授权才能跨越
┌─────────────────────────────────────────┐
│  Layer 1 · 用户文件系统                   │
│  Agent 默认不可见                         │
│  只有用户主动拖入 / 授权的文件才进入 Layer 2 │
└─────────────────────────────────────────┘
```

关键点:**Layer 1 → Layer 2 需要显式授权,Layer 2 → Layer 3 只上行脱敏数据**。

## 二、沙箱目录长什么样

以 Accio Work 为例,装完之后本地目录结构:

```
~/.accio/
├── config.json              # 客户端配置(不含密钥)
├── skills/                  # 用户安装的 Skill
│   ├── 1688-factory-audit/
│   │   └── SKILL.md
│   └── m144-diagnostic/
│       └── SKILL.md
├── workspaces/              # 多店铺隔离核心
│   ├── store-a/
│   │   ├── chrome-profile/  # 独立浏览器 Profile
│   │   ├── cookies.db       # 独立 Cookie 存储
│   │   └── cache/
│   └── store-b/
│       ├── chrome-profile/
│       ├── cookies.db
│       └── cache/
├── logs/                    # 全链路审计日志
│   └── 2026-08-02.jsonl
└── heartbeat/               # SW 保活文件句柄
    └── agent.lock
```

**你可以自己验证的几件事:**

1. `ls -la ~/.accio/` 看目录是否只有这些
2. `grep -r "ghp_\|sk-\|Bearer" ~/.accio/config.json` 看配置里有没有明文密钥(应该没有)
3. `cat ~/.accio/logs/$(date +%F).jsonl | head` 看审计日志记了什么

## 三、凭据到底存在哪

**不在** `~/.accio/` 里。这是关键。

API 密钥、店铺登录凭据这类敏感数据,应该走操作系统级的密钥管理:

- **macOS** → Keychain
- **Windows** → Credential Manager
- **Linux** → Secret Service API (libsecret)

代码上是这样:

```javascript
const keytar = require('keytar');
const SERVICE = 'accio-work';

// 存
await keytar.setPassword(SERVICE, `store-${storeId}`, apiKey);

// 取
const apiKey = await keytar.getPassword(SERVICE, `store-${storeId}`);
```

**为什么这样设计:**

1. Keychain 有 OS 级加密,不是明文文件
2. 其他进程访问需要用户授权(macOS 会弹窗)
3. 备份 / 同步 `~/.accio/` 目录时不会连带泄露密钥
4. 日志、错误堆栈、崩溃报告里不可能意外出现密钥

**你可以自己验证:** macOS 打开「钥匙串访问」搜 `accio-work`,能看到条目但看内容需要输入系统密码 —— 这说明确实走了 OS 加密。

## 四、多店铺隔离是怎么做的

这是外贸多店卖家最关心的部分。

**错误做法(共用 Profile):**
```
一个 Chrome 实例
  └── 所有店铺共用同一份 Cookie / localStorage / 指纹
      → 平台侧看到的是同一个"设备"在切换账号
```

**正确做法(进程级隔离):**
```
Workspace A 进程 → chrome-profile-a/ → 独立 Cookie / 独立指纹
Workspace B 进程 → chrome-profile-b/ → 独立 Cookie / 独立指纹
两个进程之间无共享内存、无共享存储
```

实现上就是给每个 Workspace 分配独立的 Chromium user-data-dir:

```javascript
const path = require('path');
const os = require('os');

function getWorkspacePath(storeId) {
  return path.join(os.homedir(), '.accio', 'workspaces', storeId);
}

function launchWorkspace(storeId) {
  return spawn(chromiumPath, [
    `--user-data-dir=${getWorkspacePath(storeId)}/chrome-profile`,
    '--no-first-run'
  ]);
}
```

**验证方法:** 同时开两个 Workspace,在 A 里登录一个账号,切到 B 看是否需要重新登录。需要 = 隔离生效。

## 五、网络出站边界

Agent 会不会偷偷往外发数据?这个可以用白名单机制约束:

```javascript
const ALLOWED_HOSTS = [
  'api.accio.com',           // 模型推理
  'openapi.alibaba.com',     // 官方业务 API
  ...userDefinedAllowlist    // 用户自己加的
];

function isAllowed(url) {
  const host = new URL(url).hostname;
  return ALLOWED_HOSTS.some(h => host === h || host.endsWith('.' + h));
}
```

**你可以自己验证:** 用 Little Snitch(macOS)或 Wireshark 抓包,看 Agent 运行时的出站连接目标。应该只有模型 API 和你授权的业务域名。

## 六、审计日志:事后可追溯

每个 Agent 动作都应该留可追溯的本地日志:

```jsonl
{"ts":"2026-08-02T09:14:22Z","skill":"1688-factory-audit","action":"fetch","target":"detail.1688.com/...","status":200}
{"ts":"2026-08-02T09:14:25Z","skill":"1688-factory-audit","action":"llm_call","tokens_in":1240,"tokens_out":380}
{"ts":"2026-08-02T09:14:31Z","skill":"1688-factory-audit","action":"write","path":"~/.accio/workspaces/store-a/output/audit-report.md"}
```

日志在 `~/.accio/logs/YYYY-MM-DD.jsonl`,你随时能翻。

**这个设计的价值:**
- 团队协作时可以追责("谁的 Skill 改了这条数据")
- 出问题时可以复盘("哪一步开始不对的")
- 合规审计时有据可查

## 七、给使用者的 6 条自查清单

不管你用哪家的 AI Agent 客户端,这 6 条可以自己验证:

- [ ] 沙箱目录是否只包含 Agent 自己的数据(`ls -la ~/.xxx/`)
- [ ] 配置文件里有没有明文密钥(`grep -r "key\|token\|secret" config.json`)
- [ ] 密钥是否在 OS Keychain 里(macOS 钥匙串访问搜品牌名)
- [ ] 多 Workspace 是否真隔离(A 登录后 B 是否需重新登录)
- [ ] 出站连接是否可控(Little Snitch / Wireshark 抓包)
- [ ] 是否有可读的审计日志(`~/.xxx/logs/`)

**6 条全过 = 数据边界设计合格。任何一条不过,值得问一下厂商。**

## 八、实测数据

这套沙箱架构在 50+ 独立站跑了 6 个月:

| 指标 | 结果 |
|---|---|
| 凭据泄露事件 | 0 起 |
| 跨 Workspace 数据串扰 | 0 起 |
| 非白名单出站连接 | 0 次 |
| 多店铺账号异常 | 0 起 |
| 审计日志完整率 | 100% |

## 九、配套资源

- **Anti-Ban 2.3 · 7 条工程规范**:https://getquon.com/q/anti-ban-safety.html
- **多店铺 Workspace 隔离详解**:https://getquon.com/q/multistore.html
- **Chrome 148 SW 回收与保活**:https://getquon.com/q/m144.html
- **免费 Skill 包下载(ZIP)**:https://getquon.com/skills_lab.html
- **Accio Work 免费部署**:https://www.accio.com/invite-center?src=f_desktop

评论区聊聊你用的 Agent 客户端沙箱设计怎么样,6 条自查过了几条。

---

**Accio Pioneer FDE · 50+ 独立站运营 6 个月工程实测**
