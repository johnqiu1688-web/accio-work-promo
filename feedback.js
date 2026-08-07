/* ===== Accio Pioneer 满意度采集组件 (getquon.com) =====
 * 服务于 Q3 北极星指标 ③ 用户满意度
 *
 * 两层采集:
 *   轻量层 - 页面底部「这页有用吗 👍👎」, 一次点击完成, 无跳转无登录
 *   重量层 - Skill ZIP 下载后「装上了吗?」, 直接对应 Skill 质量
 *
 * 依赖: analytics.js 的 trackEvent(). 无后端, 纯前端上报百度统计 + localStorage 兜底。
 * 用法: 在 </head> 前加 <script src="/feedback.js"></script> 即可, 自动注入。
 */
(function () {
  var LS_KEY = "accio_feedback";
  var VOTED_KEY = "accio_voted_pages";

  function save(rec) {
    try {
      var arr = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
      arr.push(rec);
      if (arr.length > 200) arr = arr.slice(-200);
      localStorage.setItem(LS_KEY, JSON.stringify(arr));
    } catch (e) {}
  }

  function hasVoted(path) {
    try {
      return (JSON.parse(localStorage.getItem(VOTED_KEY) || "[]")).indexOf(path) > -1;
    } catch (e) { return false; }
  }

  function markVoted(path) {
    try {
      var a = JSON.parse(localStorage.getItem(VOTED_KEY) || "[]");
      if (a.indexOf(path) === -1) { a.push(path); localStorage.setItem(VOTED_KEY, JSON.stringify(a)); }
    } catch (e) {}
  }

  function report(category, action, label) {
    try { if (window.trackEvent) window.trackEvent(category, action, label); } catch (e) {}
  }

  /* ---------- 样式 ---------- */
  var css = document.createElement("style");
  css.textContent =
    '.acc-fb{max-width:960px;margin:40px auto 24px;padding:20px 24px;border-radius:20px;' +
    'background:rgba(17,17,18,.85);border:1px solid rgba(255,255,255,.07);' +
    'display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap;' +
    'font-family:system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif}' +
    '.acc-fb-q{color:#a1a1aa;font-size:14px;font-weight:600}' +
    '.acc-fb-btns{display:flex;gap:10px}' +
    '.acc-fb-b{cursor:pointer;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);' +
    'color:#d4d4d8;font-size:14px;padding:8px 20px;border-radius:999px;transition:all .18s;' +
    'display:flex;align-items:center;gap:6px;font-family:inherit}' +
    '.acc-fb-b:hover{border-color:rgba(249,115,22,.5);background:rgba(249,115,22,.08);color:#fff;transform:translateY(-1px)}' +
    '.acc-fb-b.up:hover{border-color:rgba(16,185,129,.5);background:rgba(16,185,129,.08)}' +
    '.acc-fb-done{color:#10b981;font-size:14px;font-weight:600;display:flex;align-items:center;gap:8px}' +
    '.acc-fb-note{width:100%;text-align:center;color:#71717a;font-size:12px;margin-top:4px}' +
    '.acc-dl{position:fixed;right:20px;bottom:20px;z-index:9999;max-width:320px;padding:18px 20px;' +
    'border-radius:18px;background:rgba(10,10,11,.96);border:1px solid rgba(255,255,255,.1);' +
    'backdrop-filter:blur(20px);box-shadow:0 12px 40px rgba(0,0,0,.5);' +
    'font-family:system-ui,-apple-system,"PingFang SC",sans-serif;animation:accIn .3s ease}' +
    '@keyframes accIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}' +
    '.acc-dl-t{color:#fff;font-size:14px;font-weight:700;margin-bottom:4px}' +
    '.acc-dl-s{color:#a1a1aa;font-size:12px;line-height:1.5;margin-bottom:14px}' +
    '.acc-dl-btns{display:flex;gap:8px}' +
    '.acc-dl-b{flex:1;cursor:pointer;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);' +
    'color:#e4e4e7;font-size:13px;padding:9px 0;border-radius:10px;transition:all .18s;font-family:inherit}' +
    '.acc-dl-b:hover{background:rgba(249,115,22,.12);border-color:rgba(249,115,22,.5);color:#fff}' +
    '.acc-dl-x{position:absolute;top:10px;right:12px;cursor:pointer;color:#52525b;font-size:16px;' +
    'background:none;border:none;padding:2px 6px;line-height:1}' +
    '.acc-dl-x:hover{color:#a1a1aa}' +
    '@media(max-width:768px){.acc-fb{margin:28px 16px 20px;padding:16px;gap:12px}' +
    '.acc-dl{right:12px;left:12px;bottom:12px;max-width:none}}';
  document.head.appendChild(css);

  /* ---------- 轻量层: 页面底部有用吗 ---------- */
  function renderPageFeedback() {
    var path = location.pathname;
    var box = document.createElement("div");
    box.className = "acc-fb";

    if (hasVoted(path)) {
      box.innerHTML = '<div class="acc-fb-done">已收到你的反馈，谢谢</div>';
    } else {
      box.innerHTML =
        '<span class="acc-fb-q">这页对你有用吗？</span>' +
        '<div class="acc-fb-btns">' +
        '<button class="acc-fb-b up" data-v="up">有用</button>' +
        '<button class="acc-fb-b" data-v="down">没帮上</button>' +
        '</div>' +
        '<div class="acc-fb-note">一次点击即可，不用填任何东西</div>';

      box.addEventListener("click", function (e) {
        var b = e.target.closest("[data-v]");
        if (!b) return;
        var v = b.getAttribute("data-v");
        report("satisfaction", v === "up" ? "page_useful" : "page_not_useful", path);
        save({ t: new Date().toISOString(), type: "page", p: path, v: v });
        markVoted(path);
        box.innerHTML = v === "up"
          ? '<div class="acc-fb-done">收到，谢谢反馈</div>'
          : '<div class="acc-fb-done">收到，我们会继续改</div>';
      });
    }

    var anchor = document.querySelector("footer") || document.body;
    anchor.parentNode ? anchor.parentNode.insertBefore(box, anchor) : document.body.appendChild(box);
  }

  /* ---------- 重量层: ZIP 下载后追问 ---------- */
  function renderDownloadAsk(skill) {
    if (document.querySelector(".acc-dl")) return;
    var d = document.createElement("div");
    d.className = "acc-dl";
    d.innerHTML =
      '<button class="acc-dl-x" aria-label="关闭">&times;</button>' +
      '<div class="acc-dl-t">装上了吗？</div>' +
      '<div class="acc-dl-s">一句话反馈，帮我们判断这个 Skill 值不值得继续维护。</div>' +
      '<div class="acc-dl-btns">' +
      '<button class="acc-dl-b" data-r="ok">装上了</button>' +
      '<button class="acc-dl-b" data-r="fail">没装上</button>' +
      '</div>';
    document.body.appendChild(d);

    var timer = setTimeout(function () { d.remove(); }, 45000);

    d.addEventListener("click", function (e) {
      if (e.target.closest(".acc-dl-x")) { clearTimeout(timer); d.remove(); return; }
      var b = e.target.closest("[data-r]");
      if (!b) return;
      var r = b.getAttribute("data-r");
      report("satisfaction", r === "ok" ? "skill_install_ok" : "skill_install_fail", skill);
      save({ t: new Date().toISOString(), type: "skill", skill: skill, v: r });
      clearTimeout(timer);
      d.innerHTML = '<div class="acc-dl-t">' +
        (r === "ok" ? "太好了，谢谢反馈" : "抱歉，我们会排查") + '</div>' +
        '<div class="acc-dl-s">' +
        (r === "ok" ? "" : '可以到 <a href="https://github.com/johnqiu1688-web/accio-work-promo/issues" style="color:#f97316">GitHub Issue</a> 描述一下卡在哪一步。') +
        '</div>';
      setTimeout(function () { d.remove(); }, r === "ok" ? 1800 : 8000);
    });
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href$=".zip"]');
    if (!a) return;
    var skill = a.getAttribute("data-skill") ||
      (a.getAttribute("href") || "").split("/").pop().replace(".zip", "");
    setTimeout(function () { renderDownloadAsk(skill); }, 1200);
  });

  /* ---------- 初始化 ---------- */
  function init() {
    // 首页与验证页不放页面级反馈(首页是导航性质,不适合问"有没有用")
    var p = location.pathname;
    var skip = /baidu_verify|\/$|\/index(_cn|_en)?\.html$/i.test(p);
    if (!skip) renderPageFeedback();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }

  /* ---------- 控制台查看: accioFeedback() ---------- */
  window.accioFeedback = function () {
    var arr = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    var pg = arr.filter(function (x) { return x.type === "page"; });
    var up = pg.filter(function (x) { return x.v === "up"; }).length;
    console.log("=== Accio 满意度 (本地) ===");
    console.log("页面反馈:", pg.length, "条 | 有用率:",
      pg.length ? (up / pg.length * 100).toFixed(1) + "%" : "无数据");
    console.log("Skill 反馈:", arr.filter(function (x) { return x.type === "skill"; }).length, "条");
    console.table(arr);
    return arr;
  };
})();
