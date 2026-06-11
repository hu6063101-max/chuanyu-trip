/* ============================================================
   川渝之旅 · 漂浮照片云引擎
   - 照片在屏幕中缓慢漂浮（requestAnimationFrame）
   - 点击某张：放大居中、其余淡出、底部显示拍摄地点
   - 再点 / 点背景 / Esc：取消聚焦
   - “随机”按钮：重新洗牌并重排
   ============================================================ */
(function () {
  "use strict";

  var universe = document.getElementById("universe");
  var captionEl = document.getElementById("caption");
  var loading = document.getElementById("loading-screen");
  var btnRandom = document.getElementById("btn-random");

  // 只把“照片”放进云里（视频在无障碍页展示）
  var ALL = (window.DATA || []).filter(function (d) { return d.type === "photo"; });

  var isMobile = window.matchMedia("(max-width: 768px)").matches;
  var photos = [];     // 当前云中的照片对象
  var focused = null;
  var rafId = null;

  function rand(min, max) { return min + Math.random() * (max - min); }
  function thumb(item) { return item.file.replace("images/", "images_cloud/"); }

  // 根据屏幕大小挑一批照片（手机少一些，保证流畅）
  function pickSubset() {
    var n = Math.min(ALL.length, isMobile ? 32 : 78);
    return ALL.slice().sort(function () { return Math.random() - 0.5; }).slice(0, n);
  }

  function buildCloud() {
    cancelFocus(true);
    universe.innerHTML = "";
    photos = [];
    var W = window.innerWidth, H = window.innerHeight;

    pickSubset().forEach(function (item, i) {
      var fig = document.createElement("figure");
      fig.className = "photo";

      var img = document.createElement("img");
      img.src = thumb(item);
      img.alt = item.loc;
      img.loading = "lazy";
      img.draggable = false;
      fig.appendChild(img);
      universe.appendChild(fig);

      var scale = rand(0.62, 1.12);
      var p = {
        el: fig, img: img, item: item,
        x: rand(0.06, 0.94) * W,
        y: rand(0.14, 0.9) * H,
        vx: rand(-0.16, 0.16) || 0.05,
        vy: rand(-0.13, 0.13) || 0.04,
        scale: scale,
        rot: rand(-7, 7)
      };
      fig.style.zIndex = String(Math.round(scale * 100));

      // 入场淡现
      fig.style.opacity = "0";
      setTimeout(function () { fig.style.transition = "opacity .9s ease"; fig.style.opacity = "1"; }, 40 * i);

      fig.addEventListener("click", function (e) { e.stopPropagation(); toggleFocus(p); });
      photos.push(p);
      place(p);
    });
  }

  function place(p) {
    if (p === focused) return;
    p.el.style.transform =
      "translate3d(" + p.x + "px," + p.y + "px,0) translate(-50%,-50%) scale(" +
      p.scale + ") rotate(" + p.rot + "deg)";
  }

  function tick() {
    var W = window.innerWidth, H = window.innerHeight, m = 70;
    for (var i = 0; i < photos.length; i++) {
      var p = photos[i];
      if (p === focused) continue;
      p.x += p.vx; p.y += p.vy;
      // 软边界回弹，照片始终留在屏内缓缓游动
      if (p.x < m && p.vx < 0) p.vx = -p.vx;
      if (p.x > W - m && p.vx > 0) p.vx = -p.vx;
      if (p.y < m + 40 && p.vy < 0) p.vy = -p.vy;
      if (p.y > H - m && p.vy > 0) p.vy = -p.vy;
      place(p);
    }
    rafId = requestAnimationFrame(tick);
  }

  /* ---------- 聚焦 ---------- */
  function toggleFocus(p) {
    if (focused === p) { cancelFocus(); return; }
    if (focused) cancelFocus(true);

    focused = p;
    universe.classList.add("has-focus");
    p.el.style.transform = "";          // 交给 CSS .focused 居中
    p.el.classList.add("focused");

    // 预载中等图，载完无缝替换（先用缩略图撑大，再变清晰）
    var big = new Image();
    big.onload = function () { if (focused === p) p.img.src = p.item.file; };
    big.src = p.item.file;

    captionEl.innerHTML =
      '<span class="cap-loc">' + p.item.loc + '</span>' +
      '<span class="cap-region">' + p.item.region + '</span>' +
      '<span class="cap-hint">点击任意处关闭</span>';
    captionEl.classList.add("show");
  }

  function cancelFocus(silent) {
    if (!focused) return;
    var p = focused;
    p.el.classList.remove("focused");
    p.img.src = thumb(p.item);          // 还原缩略图
    focused = null;
    universe.classList.remove("has-focus");
    place(p);
    if (!silent) captionEl.classList.remove("show");
    else captionEl.classList.remove("show");
  }

  /* ---------- 事件 ---------- */
  universe.addEventListener("click", function () { cancelFocus(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") cancelFocus(); });
  if (btnRandom) btnRandom.addEventListener("click", function () { buildCloud(); });

  // 旋转/缩放窗口时重排（防抖）
  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      isMobile = window.matchMedia("(max-width: 768px)").matches;
      buildCloud();
    }, 300);
  });

  /* ---------- 启动 ---------- */
  function start() {
    buildCloud();
    if (rafId) cancelAnimationFrame(rafId);
    tick();
    setTimeout(function () { if (loading) loading.classList.add("hide"); }, 700);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
