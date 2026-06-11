/* ============================================================
   川渝之旅 · 无障碍查看
   把全部照片与视频按「地区 → 地点」分组，逐张列出。
   ============================================================ */
(function () {
  "use strict";

  var DATA = window.DATA || [];
  var listEl = document.getElementById("acc-list");
  var countEl = document.getElementById("acc-count");

  var REGION_ORDER = { "四川": 0, "重庆": 1 };

  // 统计
  var nPhoto = DATA.filter(function (d) { return d.type === "photo"; }).length;
  var nVideo = DATA.filter(function (d) { return d.type === "video"; }).length;
  countEl.textContent = nPhoto + " 张照片、" + nVideo + " 个视频";

  // 分组：region -> loc -> [items]，保留首次出现顺序
  var regions = [];           // 有序的 region 名
  var map = {};               // region -> { locOrder:[], locs:{ loc:[items] } }
  DATA.forEach(function (item) {
    if (!map[item.region]) { map[item.region] = { locOrder: [], locs: {} }; regions.push(item.region); }
    var g = map[item.region];
    if (!g.locs[item.loc]) { g.locs[item.loc] = []; g.locOrder.push(item.loc); }
    g.locs[item.loc].push(item);
  });
  function rorder(r) { return (r in REGION_ORDER) ? REGION_ORDER[r] : 9; }  // 注意 0 不能用 || 兜底
  regions.sort(function (a, b) { return rorder(a) - rorder(b); });

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var html = "";
  regions.forEach(function (region) {
    var g = map[region];
    html += '<h2 class="acc-region">' + esc(region) + "</h2>";

    g.locOrder.forEach(function (loc) {
      var items = g.locs[loc];
      var photos = items.filter(function (it) { return it.type === "photo"; });
      var videos = items.filter(function (it) { return it.type === "video"; });

      html += '<h3 class="acc-loc"><span>' + esc(loc) + "</span>" +
              '<span class="count">' + photos.length + " 张" +
              (videos.length ? " · " + videos.length + " 视频" : "") + "</span>" +
              (videos.length ? '<span class="vtag">含视频</span>' : "") + "</h3>";

      html += '<div class="acc-grid">';
      items.forEach(function (it) {
        if (it.type === "video") {
          html += '<figure class="acc-item">' +
                    '<video controls preload="metadata" src="' + esc(it.file) + '"></video>' +
                    '<figcaption><span class="t">' + esc(loc) + '</span><span>视频</span></figcaption>' +
                  "</figure>";
        } else {
          html += '<figure class="acc-item">' +
                    '<img loading="lazy" src="' + esc(it.file) + '" alt="' + esc(loc + "（" + region + "）") + '">' +
                    '<figcaption><span class="t">' + esc(loc) + '</span><span>照片</span></figcaption>' +
                  "</figure>";
        }
      });
      html += "</div>";
    });
  });

  listEl.innerHTML = html;
})();
