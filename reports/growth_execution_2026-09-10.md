# getquon.com 结果指标增长执行记录 · 2026-09-10

> 目标不变：提高 DAU、Skill 下载与满意度样本，而不是继续堆页面数量。

## 一、最新结果复测

百度统计区间：2026-08-12 至 2026-09-10（最近 30 天）。

| 指标 | 09-04 基线 | 09-10 当前 | 差值 | 变化率 |
|---|---:|---:|---:|---:|
| PV | 320 | 340 | +20 | +6.25% |
| UV | 156 | 164 | +8 | +5.13% |
| IP | 155 | 162 | +7 | +4.52% |
| DAU（UV/30） | 5.20 | 5.47 | +0.27 | +5.13% |

近 7 天 UV：6、3、1、5、8、9、0，合计 32，日均 4.57。当前增长存在，但不足以接近 DAU 30 的目标。

## 二、来源与落地页

### 来源域名（30 天）

- Bing 系：100 UV（cn.bing.com 83、www.bing.com 16、bing.com 1）
- 直接访问：39 UV
- CSDN：18 UV（link.csdn.net 15、blog.csdn.net 3）
- Google：3 UV
- 知乎：2 UV
- GitHub：2 UV

### 高流量落地页

1. `/guide.html`：26 UV
2. 根路径：25 UV
3. `/q/credits.html`：13 UV
4. `/q/skills.html`：13 UV
5. `/skills.html`：11 UV
6. `/q/login.html`：9 UV
7. `/q/browser-connect.html`：8 UV

## 三、诊断结论

站内 40 个长尾页面此前已经有统一转化模块，但两张最高流量入口存在断点：

- `guide.html` 没有 Skill ZIP 入口，也没有 feedback.js。
- 根路径首页的两个 Skill 按钮跳转 Skills Lab，而非直接下载；同时未加载下载后反馈组件。
- `skills.html` 有下载按钮，却未加载 feedback.js，安装成功/失败无法形成反馈样本。

因此本轮不新增内容，直接修复现有高流量页面的下载与反馈漏斗。

## 四、已上线改动

### 4.1 guide.html

- 新增 3 个真实 ZIP 直下：M144 诊断、1688 工厂尽调、OKKI 僵尸客户复活。
- 每个链接加入 `data-skill` 与 `convert / skill_download` 埋点。
- 加载 `feedback.js`：页面底部满意度投票；下载后追问是否安装成功。
- 增加 Skills Lab 与搜索中心导航埋点。

### 4.2 skills.html

- 加载 `feedback.js`。
- 动态下载链接加入 `data-skill=s.id`，使安装反馈准确归因到具体 Skill。

### 4.3 首页

- 两张 Skill 卡由“跳转 Skills Lab”改为真实 ZIP 直接下载。
- 加入 `data-skill`、下载埋点与 `feedback.js`。
- 移除无法验证的 `480 pioneer members`、`2.4k/1.5k Downloads`、`5.0/4.9` 星级与 `ROI +45%`。
- 替换为可验证事实：MIT 许可证、ZIP 体积、无需注册、实际用途。

### 4.4 SEO 同步

- sitemap 中根路径、guide.html、skills.html 的 lastmod 更新为 2026-09-10。

## 五、提交与验收

- guide/skills 漏斗提交：`0fdbbcb`
- 首页直下与可信度修复：`e54c705`
- 两次提交均已推送至 `origin/main`，本地 HEAD 与远端一致。
- 线上验收：guide.html、skills.html、首页、sitemap 均返回 200。
- guide.html 线上存在 feedback.js ×1、data-skill ×3、真实 ZIP ×3。
- skills.html 线上存在 feedback.js ×1、动态 data-skill ×1。
- 首页线上存在 feedback.js ×1、data-skill ×2、真实 ZIP ×2；不可验证数字已清零。

## 六、仍受权限阻塞的诊断

- Google Search Console：当前登录账号没有 getquon.com URL-prefix 或 Domain 属性权限，Performance 与索引数据不可读。
- Bing Webmaster Tools：当前 Chrome 未登录 Microsoft 账户，关键词、排名、索引数据不可读。
- 百度统计“分析”权限：仍阻塞 Skill 下载与满意度事件读取。

## 七、复测标准

下一次有效复测应至少间隔 7 天，重点比较：

1. guide.html 与首页 UV 是否稳定；
2. Skill ZIP 下载事件是否出现；
3. 页面满意度及安装成功/失败样本是否出现；
4. 30 天 UV 与 DAU 是否高于本次 164 / 5.47；
5. Bing 来源是否继续高于本次 100 UV。

在事件分析权限未开通前，只能验证流量，无法验证下载和满意度结果。