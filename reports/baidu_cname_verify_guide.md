# 📋 百度站长 · 裸域重加 + CNAME 验证 手动操作卡

> 之前 `https://www.getquon.com` 走 www 子域, 百度不给 CNAME 验证 · 现在改加裸域 `https://getquon.com` 就能走 CNAME 一次过

## 一、为什么必须重加"裸域"

**之前失败的记录**:
- 站点 `https://www.getquon.com` 走文件 / HTML 标签验证 · **每次都因 GitHub Pages 到百度爬虫链路不稳失败**
- www 子域百度**不开 CNAME 验证选项**
- 试了 3 次都卡在"无法连接到您网站的服务器"

**换裸域的好处**:
- 百度对裸域 `https://getquon.com` **开放 CNAME 验证**
- CNAME 直接查 DNS 记录 · 不走 HTTP 爬虫链路
- 你 DNS 在阿里云 · 百度查阿里云 DNS 几乎无延迟

## 二、你的操作(5 分钟走完)

### Step 1 · 添加"裸域"站点

1. 打开:https://ziyuan.baidu.com/site/index
2. 右上角点"+ 添加网站"
3. 输入 **`https://getquon.com`** (**不带 www 是关键**)
4. 网站类型选"其他"
5. 点"下一步"

### Step 2 · 选择 CNAME 验证方式

1. 弹出验证方式,3 个 tab:
   - 文件验证 ❌ (走 HTTP 会失败)
   - HTML 标签验证 ❌ (同上)
   - **CNAME 验证 ✅** (选这个)
2. 页面显示需要在 DNS 加一条 CNAME 记录:

```
主机记录: xxxxxxxx (百度会给一串, 类似 codeva-xxx 或 ziyuan-xxx)
记录类型: CNAME
记录值:  ziyuan.baidu.com
TTL:     10 分钟
```

**你把主机记录那串复制,给我发一下** · 我把它写进操作卡下面

### Step 3 · 阿里云 DNS 添加 CNAME 记录

1. 打开:https://dns.console.aliyun.com/#/dns/domain/getquon.com/dns
2. 点右上"添加记录"
3. 填:
   - **记录类型**:CNAME
   - **主机记录**:百度给的那串(比如 `codeva-abc123`,**别加 `.getquon.com`**)
   - **记录值**:`ziyuan.baidu.com` (百度告诉你的)
   - **TTL**:10 分钟
4. 保存

### Step 4 · 回百度站长点"完成验证"

1. 回到 https://ziyuan.baidu.com/site/index
2. 找刚添加的 getquon.com 裸域站点
3. 点"完成验证"
4. **如果 CNAME 已生效(通常 1-5 分钟),验证立即通过**

## 三、验证通过后我立刻做的事

**Step 5(我来)**:通知我"通过了",我立刻:
1. 提交 47 条 sitemap URL 到百度批量收录
2. 提交 D 方案 3 篇稿件 URL(D1 知乎 / D2 CSDN / D3 CSDN)+ 主站 4 个深度页 URL 到普通收录
3. 挂 sitemap 自动提交(每次 git push 后自动增量提交)

## 四、如果 CNAME 添加失败怎么办

**常见坑 1** · 主机记录带了 `.getquon.com`
- 错:主机记录 = `codeva-abc123.getquon.com`
- 对:主机记录 = `codeva-abc123` (阿里云会自动补域名)

**常见坑 2** · TTL 设太长
- 阿里云默认可能是 10 分钟 · 保持
- 如果设 24 小时,百度会等到 TTL 到期才查

**常见坑 3** · 阿里云 DNS 生效延迟
- 一般 1-5 分钟
- 超过 15 分钟还没通过,清一次浏览器缓存重点

## 五、CNAME 验证的额外好处

- **不影响你 www 主站**:只加一条子域 CNAME,和 `www.getquon.com` 及 `getquon.com` 完全独立
- **可随时删掉**:验证过后可以立即删掉这条 CNAME,百度不会撤销验证状态
- **一次验证 = 长期可用**:未来所有 URL 提交 / Sitemap 提交都能走这个站点

## 六、我需要你反馈的信息

**执行完 Step 1-2 后,把这 2 个信息发我**:

1. 百度给你的主机记录字符串: `_______________`
2. 百度给你的目标 CNAME 值: `_______________` (通常就是 `ziyuan.baidu.com`)

我立刻:
1. 更新这个操作卡的 Step 3 里放你的实际字符串
2. 等你 Step 3 加完 CNAME 后,派 browser 子代理验证 CNAME 是否生效
3. 生效立即通知你去 Step 4 点"完成验证"

---
*Accio Pioneer FDE · P2A 操作卡 · 2026-07-09*
