/* ===== Accio Pioneer 全站统一统计 (getquon.com) =====
 * 用户拿到百度统计ID后,只需改下面这一行 BAIDU_ID,全站所有页面自动生效。
 * 获取ID: 登录 tongji.baidu.com → 新增网站 getquon.com → 复制 hm.js?后面那串ID
 */
var BAIDU_ID = ""; // ← 在此粘贴百度统计ID(形如 a1b2c3d4e5f6...),留空则统计不启用

(function () {
  // 1) 百度统计
  if (BAIDU_ID) {
    var hm = document.createElement("script");
    hm.src = "https://hm.baidu.com/hm.js?" + BAIDU_ID;
    var s0 = document.getElementsByTagName("script")[0];
    s0.parentNode.insertBefore(hm, s0);
  }
})();

// 2) 全站事件埋点: 上报百度统计 + 本地兜底
window._hmt = window._hmt || [];
window.ACCIO_ANALYTICS = true;
function trackEvent(category, action, label) {
  try {
    if (window._hmt) window._hmt.push(["_trackEvent", category, action, label || ""]);
    var k = "accio_events", arr = JSON.parse(localStorage.getItem(k) || "[]");
    arr.push({ t: new Date().toISOString(), p: location.pathname, c: category, a: action, l: label || "" });
    if (arr.length > 200) arr = arr.slice(-200);
    localStorage.setItem(k, JSON.stringify(arr));
  } catch (e) {}
}

// 3) 落地页/场景页自动埋点: 记录页面浏览(PV) + 部署按钮点击
(function () {
  // 页面浏览
  try { trackEvent("pageview", "view", location.pathname); } catch (e) {}
  // 点击 invite-center(部署/下载) 按钮 → 转化信号
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href*="invite-center"]');
    if (a) trackEvent("convert", "deploy_click", location.pathname);
    var dl = e.target.closest && e.target.closest('a[href$=".zip"], a[data-skill]');
    if (dl) trackEvent("convert", "skill_download", dl.getAttribute("data-skill") || dl.getAttribute("href") || "");
  });
})();

// 4) 控制台快捷查看本地统计: F12 输入 accioStats()
window.accioStats = function () {
  var arr = JSON.parse(localStorage.getItem("accio_events") || "[]");
  var by = function (a) { return arr.filter(function (e) { return e.a === a; }); };
  console.log("=== Accio 本地埋点 (总" + arr.length + "条) ===");
  console.log("搜索词:", by("search").map(function (e) { return e.l; }));
  console.log("零结果词:", by("zero_result").map(function (e) { return e.l; }));
  console.log("打开节点:", by("open").map(function (e) { return e.l; }));
  console.log("部署点击:", by("deploy_click").length, "次");
  console.table(arr);
  return arr;
};
