# [Guide] Sourced 24 Shopify SKUs/day from 1688 with an AI Agent — my 3-prompt SOP (was doing 6/day manually)

**Not a promo, just what worked for me.** I run 50+ independent Shopify sites and used to spend ~4 hours per SKU on the 1688 sourcing loop. Last month I got that down to ~40 min per SKU using an AI Agent client called Accio Work. Here's the full SOP so you can replicate it, plus the mistakes I made.

## The old workflow (4h/SKU)

Every new hero product from Amazon/TikTok, I'd do:
- **90 min** image searching 1688 by eye, trying to find the actual source factory (not just resellers)
- **60 min** running the Chinese description through Google Translate → robot-sounding English
- **60 min** Photoshop main images / AI watermark removal / white background
- **30 min** manually filling Shopify: title, bullets, tags, alt text, categories

Do 20 SKUs = 80 hours. 40-hour week = **max 10 SKUs/week**. Ceiling hit.

## The new workflow (40 min/SKU)

Three prompts I feed to an Accio Skill I built. Copy-paste as-is:

**Prompt 1 · Search + filter candidates**
```
Search 1688 for similar products using this image. Filter candidates with rating ≥ 4.6, sales ≥ 500, supporting dropshipping. Output Top 10 table (store link / unit price / MOQ).
```

**Prompt 2 · Factory vs trading company**
```
Verify public business registry for these 10 suppliers: legal person's related companies, whether business scope includes manufacturing, insured employee count. Output Factory / Trading / Unclear three-tier judgment with rationale.
```
My "trading company disguised as factory" hit rate dropped from ~40% to ~8% after this step.

**Prompt 3 · English copy rewrite**
```
Rewrite this 1688 Chinese description into Shopify product page English copy: H1 title ≤ 70 chars, 5 Bullet Points highlighting core benefits, Description paragraph 300 words with long-tail keywords, in authentic American English.
```

## Real numbers from 6-month run

| Step | Manual | AI Agent | Speedup |
|---|---|---|---|
| Image search + compare | 90 min | 4 min | 22.5x |
| Factory verification | 25 min | 3 min | 8.3x |
| Translation + rewrite | 60 min | 5 min | 12x |
| Image processing | 60 min | 15 min | 4x |
| Listing | 30 min | 12 min | 2.5x |
| **Total** | **265 min** | **39 min** | **6.8x** |

Same one person, same 8000 RMB/month wage. Output: 540 SKUs (6 months) → 2160 SKUs. That's the whole point.

## 3 things I'd do differently

1. **Don't skip the factory verification step.** The first month I skipped it "for speed" and got burned twice by resellers marking up 15-20%.
2. **Don't reuse the same VPN/IP for multi-store.** Use per-store workspace isolation. I detail this here: https://getquon.com/anti-ban-safety.html
3. **Add 5-30s random delay to Agent replies.** Otherwise Shopify/Amazon spam detection will flag you within days.

## What Accio Work is (short version)

It's a local Chromium-based AI Agent client with Skill packaging. Runs in `~/.accio/` sandbox — no cloud upload of store API keys. Free personal tier gets you started. Not affiliated, just what I used.

Full write-up with all 3 prompts + Skill packaging: https://getquon.com/1688-to-shopify-en.html

Happy to answer questions. Especially interested in hearing what SOP other dropshippers here run.

---
*Posted from Accio Pioneer · 50+ independent sites · 492/1000 installs*
