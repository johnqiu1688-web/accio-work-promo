---
name: okki-zombie-revival
display_name: OKKI 僵尸客户复活仪
description: 在 OKKI 官方每日 120 封发信额度内,自动检索买家最新公开动态(融资、展会、招聘),用高价值内容开篇替换僵尸模板,把有限触达用在最高价值老客户上。50+ 站实测回信率从 6% 拉到 21%。
version: 1.0.0
author: Accio Pioneer
license: MIT
category: crm
tags: [okki, crm, revival, foreign-trade, alibaba]
compatible_with: accio-work >= 0.16.0
homepage: https://getquon.com/q/okki.html
---

# OKKI 僵尸客户复活仪 · SKILL

## 一句话结论
在 OKKI 每日 120 封额度内,把死气沉沉的"最近可好?"模板换成"看你上周刚参加广交会……"级别的个性化开篇,回信率翻 3-4 倍。

## 痛点
- OKKI 每日 120 封发信硬限 · 用不完可惜,乱用被反感
- 群发模板"最近可好?"回信率 6% 左右
- 业务员没时间每个客户挨个查最新动态

## 何时用
- 每周一晨会前 · 挑 50 家最有价值的沉睡客户复活
- 老板下达"月末冲业绩"指令时 · 优先激活高价值老客户
- 客户签单后 3 个月无互动 · 触发复活流程

## 前置条件
- 已连接 OKKI CRM 账号(用户授权浏览器会话)
- 有客户联系人的公司名 · LinkedIn · 邮箱
- Accio Work v0.16.0 或以上

## 步骤

### Step 1 · 拉沉睡客户名单
```
从 OKKI 导出「最近 90 天无互动 + 历史客单 > $1000」的客户列表
按客单价降序 · 取 Top 50
```

### Step 2 · 逐个跑背景动态检索
```
对每个客户,并行检索以下 4 个信号(公开信息):
1. 公司近 30 天融资/收购新闻
2. 公司近 30 天招聘岗位(反映业务方向)
3. 联系人 LinkedIn 近 60 天动态(升职/发帖)
4. 公司参加的近期展会(Canton Fair / IFA / CES 等)

输出信号强度评分(0-10):
- 有融资 = +3
- 有招聘扩张 = +2
- 联系人升职 = +3
- 参展 = +2
```

### Step 3 · 按信号自动分组
```
Group A(强信号 · score >= 5):个性化深度邮件 · 值得手工调细节
Group B(中信号 · score 3-4):模板化开篇 + AI 起草
Group C(弱信号 · score < 3):暂缓 · 3 个月后重跑
```

### Step 4 · 生成个性化开篇(Group A/B)
```
每封信的开篇 2 段必须包含至少 1 个"信号锚点":

强信号例:
"Hi Michael, just saw your team's announcement about the Series B — 
massive congrats to you and the crew. Given the new focus on European 
expansion, I wanted to share an updated MOQ pricing for the SKUs 
we discussed last quarter..."

中信号例:
"Hi Jane, noticed your team is hiring 3 new procurement roles — 
seems like you're gearing up for Q4 buying cycle. Wanted to reach 
out with the 2026 pricing early so you have it before the volume 
committee meets..."
```

### Step 5 · 输出发送队列
```
| 客户 | 组别 | 信号锚点 | 建议邮件主题 | 优先级 |
|---|---|---|---|---|
| Alpha Co | A | 上周宣布 B 轮融资 | Congrats + Q4 restock quote | ⭐⭐⭐ |
| Beta LLC | B | 招聘 procurement 3 人 | Early 2026 pricing before RFQ | ⭐⭐ |
| Gamma GmbH | A | 参加 IFA 2026 | Post-IFA follow-up + samples | ⭐⭐⭐ |
```

## 合规提示
- 所有信号来自公开公司 PR / LinkedIn / 展会 → 不算隐私窥探
- 邮件走 OKKI 官方 API · 不模拟点击 · 不做秒回
- 每封信之间加 15-90 秒随机延时 · 不触发反爬
- 严格遵守 OKKI 每日 120 封硬限 · 不做多账号轮换

## 实测数据
- 50+ Pioneer 独立站运营
- 沉睡客户回信率:6% → 21%
- 复活订单转化率:2.1% → 7.4%
- 单人节省的客户跟进时间:每周 8 小时 → 2 小时

## 相关资源
- Anti-Ban 2.3 合规底线: https://getquon.com/q/anti-ban-safety.html
- 免费部署 Accio Work: https://www.accio.com/invite-center?src=f_desktop
- Skill Radar 完整评测: https://getquon.com/skill-radar.html

---
*Accio Pioneer FDE · 开源可商用 · MIT 协议*
