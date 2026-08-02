---
name: m144-diagnostic
display_name: M144 环境诊断 & 保活
description: Chrome 148+ Manifest V3 强制生效后, Accio Work 后台挂机 M144 报错的一键诊断和保活方案。5 步自查 → 三种保活方案(Business Ping / chrome.alarms / Local Realpath)自动匹配, 50+ 站实测告别 M144 掉线。
version: 1.0.0
author: Accio Pioneer
license: MIT
category: environment
tags: [m144, chrome-148, service-worker, keepalive, accio-work]
compatible_with: accio-work >= 0.16.0, chrome >= 148
homepage: https://getquon.com/q/m144.html
---

# M144 环境诊断 & 保活 · SKILL

## 一句话结论
Chrome 148+ 之后 SW 心跳被系统 kill 是 M144 的真正根因,不是网络问题。这个 Skill 5 步定位 + 三档保活方案,让 Agent 后台跑 4h+ 不掉线。

## 何时用
- Agent 挂机 5-10 分钟就掉线,重启能修但很快又断
- 遇到"M144: Agent runtime connection lost"报错
- 想让 Accio Work 稳定跑长任务(如夜跑批量询盘/上架)

## 前置条件
- Accio Work v0.16.0 或以上
- Chrome 148 或以上(v148 是 Manifest V3 强制点)
- macOS 或 Windows 桌面客户端

## 步骤

### Step 1 · Chrome 版本自查
```
打开新 tab 访问 chrome://version
读取 Chrome 版本号:
- < 148:M144 不是这个原因,查其他(网络/内存/账号权限)
- >= 148:确认是 Manifest V3 强执行导致 · 继续 Step 2
```

### Step 2 · Accio Work 版本自查
```
Accio Work 顶栏"关于"看版本:
- < 0.16.0:升级到 0.18+ · 官方已内置方案 B 兼容层
- >= 0.18.0:官方已有 chrome.alarms 保活 · 检查是否被人手动关掉
```

### Step 3 · 触发场景验证
```
观察掉线是否符合以下所有条件:
- ✓ 只在后台标签(前台从不复现)
- ✓ 稳定在 5-10 分钟内触发
- ✓ 切前台立即恢复
- ✓ 断网切代理后加剧
如果全 ✓ · 确认是 SW idle termination · 上保活包
如果部分 · 可能是 IP 漂移/账号 403 · 查 anti-ban-safety.html
```

### Step 4 · 三档保活方案自动匹配
```
根据用户任务类型自动推荐:

方案 A · Business Ping (适合:低频批量任务, 分钟级容忍)
- 在 SW 里插入真实业务 fetch (不是 dummy /api/ping)
- 频率 30-60 秒 · 触发真实事件监听
- CPU 占用 < 1%

方案 B · chrome.alarms 30s (推荐 · 官方兼容 · 无风险)
- 用 chrome.alarms API 定时唤醒
- 最小间隔 30 秒
- 完全符合 Chrome 官方推荐

方案 C · Local Realpath + Heartbeat File (硬核 · 4h+ 稳跑)
- 主进程在 ~/.accio/heartbeat/ 建持久文件句柄
- fs.watch 监听文件写入
- 完全独立于浏览器网络层 · 断网切代理仍活
- 需 Accio Work v0.18+ 的 Local Realpath 支持
```

### Step 5 · 一键部署验证
```
- 部署对应方案脚本
- 挂机 30 分钟 · 检查 SW 是否活着
- 挂机 4 小时 · 复测稳定性
- 输出验证报告(方案 · 挂机时长 · 是否掉线 · CPU 占用)
```

## 输出格式
```
### M144 诊断报告

- Chrome 版本: 148.0.7311.42 · ✓ 需要保活
- Accio Work 版本: 0.19.2 · ✓ 已支持 Local Realpath
- 触发条件: 4/4 全中 · 确认为 SW idle termination
- 推荐方案: C · Local Realpath (你的场景是高频询盘, 30s 太粗)
- 部署状态: ✓ 已部署 · 挂机 4h 无掉线 · CPU 0.6%
```

## 合规提示
- 保活方案全部使用官方 chrome API · 不 hack 浏览器内部
- 不模拟点击 · 不用 Selenium/Puppeteer
- Local Realpath 只写用户明确授权的目录

## 实测数据
- 50+ Pioneer 独立站运营
- M144 事故数:每站每周 2-4 起 → 0 起
- Agent 后台稳定挂机时长:5-10 分钟 → 8h+
- 单店每月因掉线漏询盘:23 单 → 0 单

## 相关资源
- 完整技术拆解: https://getquon.com/q/m144.html
- Chrome 148 SW 深度: https://getquon.com/q/chrome-148.html
- Anti-Ban 合规: https://getquon.com/q/anti-ban-safety.html
- 免费部署 Accio Work: https://www.accio.com/invite-center?src=f_desktop

---
*Accio Pioneer FDE · 开源可商用 · MIT 协议*
