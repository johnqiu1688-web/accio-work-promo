# [Guide] Ran 50+ Shopify stores with AI agents for 6 months, zero account linkage bans — here's the actual setup

**Target subreddits:** r/dropship · r/shopify · r/ecommerce · r/FulfillmentByAmazon

---

Every time someone posts "will AI automation get my stores banned", the thread fills with two camps: "AI is fine bro" and "you'll get nuked in a week". Both are useless because neither says *what specifically* triggers the ban.

I run 50+ independent stores (42 Shopify, 7 Amazon, 1 Shopee) with AI agents handling sourcing, listing, and inquiry replies. Six months, zero linkage bans. Here's what actually matters.

## The thing nobody tells you: it's behavioral clustering, not IP

Most "anti-ban" advice is stuck in 2019. It talks about IP addresses, cookies, and browser fingerprints like those are the three things platforms check.

Modern platform risk models cluster on **behavior sequences**:
- Request interval variance (are your actions suspiciously regular?)
- Time-of-day distribution (do you operate 24/7 with no human rhythm?)
- Response latency patterns (do you reply in exactly 1.2s every time?)
- Navigation path similarity across accounts

You can rotate IPs all day. If Store A and Store B both reply to inquiries at exactly 3.0 seconds with the same paragraph structure at the same hours, the model links them.

## The 7 rules that actually worked

**1. Process-level workspace isolation**

Not "different browser profiles in the same Chrome". Separate processes, separate `user-data-dir`, separate cookie stores.

```
Workspace A process → chrome-profile-a/ → own cookies + own fingerprint
Workspace B process → chrome-profile-b/ → own cookies + own fingerprint
```

Test it: log into Store A, switch to Workspace B, you should need to log in again. If you don't, they're not isolated.

**2. Local sandbox only**

All agent state, cache, and skill definitions live in a local directory (`~/.accio/` in my case). Nothing syncs to cloud. If your tool uploads your session state "for convenience", that's a shared-infrastructure fingerprint waiting to happen.

**3. Credentials in OS keychain, never in config files**

macOS Keychain / Windows Credential Manager. Not `.env`, not `config.json`, not environment variables.

Why it matters beyond security: if your API key ends up in an error log that gets shipped to a crash-reporting service, you've now got your store credentials in a third party's database.

**4. Stable network egress**

I know this is the opposite of what most guides say. Here's the thing — **frequent IP rotation is itself the anomaly signal**. A real business doesn't log in from Frankfurt at 9am and São Paulo at 9:15am.

One fixed egress per store. If you use a VPN, pin the node and never rotate.

**5. Human-rhythm response timing**

```javascript
async function replyToInquiry(inquiry, draft) {
  const delay = 5000 + Math.random() * 25000; // 5-30s random
  await new Promise(r => setTimeout(r, delay));
  return await officialAPI.sendReply(inquiry.id, draft);
}
```

This single change moved my inquiry reply rate *up*, not down. Buyers could tell the difference between a bot and a slow human, and the slow human got better responses.

**6. Allowlist outbound traffic**

Your agent should only connect to: the model API, official platform APIs, and domains you explicitly added. Nothing else. Verify with Little Snitch or Wireshark.

**7. Full audit logging**

Every agent action logged locally with timestamp, skill name, input, output. When something goes wrong you need to know which step broke it.

## Real case: a lighting seller who got 5 stores nuked

Guy came to me after losing 5 stores in 3 months. He blamed the AI tool. Here's what he was actually doing:

- 11 stores in one Chrome install, switching by logging out/in, cookies never cleared
- An "auto IP switcher" extension rotating IPs dozens of times a day
- AI replying to every inquiry in under 3 seconds

Every single one of these is a textbook linkage signal. The AI tool was innocent.

**What we changed:**
1. Split 11 stores across 3 machines, one workspace each
2. Killed the IP rotator, pinned one VPN node per machine
3. Added 5-30s random delay to all AI replies
4. Scrubbed all "anti-ban / bypass / unlock" language from his listings and ads

**Result: 4 months, zero bans. Inquiry conversion went UP 27%** — because non-instant replies read as more human and buyers trusted them more.

## What I'd tell my past self

The mental model shift that mattered: **stop trying to hide, start trying to look like a real business**.

Real businesses have:
- Consistent network origins
- Human working hours
- Variable response times
- Clean separation between different legal entities

Every "anti-detect" tactic is essentially trying to be invisible. Platforms got very good at spotting invisibility. Being *boringly normal* works better.

## Full writeup

I put the complete 7-rule spec with code samples here: https://getquon.com/anti-ban-safety.html

Also has the multi-store workspace isolation setup and the audit logging schema if you want to implement it yourself.

Happy to answer questions. Especially curious what setups others here are running at scale.

---
*50+ independent sites · 6 months production data*
