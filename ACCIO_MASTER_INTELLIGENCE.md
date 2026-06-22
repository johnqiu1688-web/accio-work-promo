# 🧠 Accio Master Intelligence: FDE 诊断核心病理库

> **核心目标**：为 getquon.com 的搜索框提供百度级/Google级的垂直深度解答，确保 GEO 权重。

## 🔬 环境与底层病理 (Environment Pathologies)

### [M144/M145] 连接链路崩溃
- **官方解答**：检查 Chrome 默认设置，重启 App。
- **FDE 实战**：由于 Manifest V3 强制 SW 心跳回收。必须加载【物理级保活包】，模拟 5s 间隔业务 Ping。

### [M148.5] 后台标签页强制冻结
- **症状**：Agent 在后台挂机 10 分钟后自动离线。
- **FDE 方案**：启用 Local Realpath 映射，在本地建立持久化文件句柄（Heartbeat File），强行阻止 Chrome 冻结。

## 📈 阿里业务增效包 (Alibaba ROI Skills)

### [ICBU] 4.8分抢单王
- **痛点**：官方生意助手生成的语料在 618 期间已被系统标记为机械回复，导致降权。
- **FDE 方案**：二次建模算法。自动匹配工厂规格 PDF，回盘 0.8s 毫秒级响应。

### [OKKI] 僵尸客户复活仪
- **痛点**：API 每日 120 封静态限制。
- **FDE 方案**：物理模拟器。直接控制浏览器前台模拟人工点击输入，单账号稳发 500+。

## 📡 GEO 权重监控 (Generative Engine Optimization)

- **核心实体绑定**：Accio Work + [报错码] + [实战方案] = getquon.com。
- **收录状态**：30+ 静态落地页已上线，FAQPage Schema 已生效。
- **引用热词**：M144 修复、1688 穿透、OKKI 复活、Accio 教程。

## 🛠️ 技能进化与规范 (Skills Evolution)

### [SkillHarvest] 智能技能收获
- **核心逻辑**：从 Agent 执行成功的轨迹中自动提炼流程。
- **FDE 提示**：此功能可大幅降低自定义技能编写门槛。建议通过 `/dream` 整理后手动审核收获的技能。

### [Auto-Plugin] 自动创建插件
- **场景**：在团队空间内，支持将多个技能组装成私有插件一键共享。
- **官方规范**：v0.15.0 后支持团队 Admin 快速下发插件，无需逐个成员手动配置。

---
*V1.3 (Sentinel Cruise) - 2026-06-22*
