/* ============================================================
   川渝之旅 · 背景音乐
   - 右上角圆形按钮，点击切换播放/暂停
   - 进入页面尝试自动播放（多数浏览器会拦截，点一下按钮即可播放）
   ============================================================ */
(function () {
  "use strict";

  var btn = document.getElementById("btn-music");
  var audio = document.getElementById("bgm");
  if (!btn || !audio) return;

  audio.volume = 0.5;

  function setPlaying(on) {
    btn.classList.toggle("playing", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.setAttribute("aria-label", on ? "暂停背景音乐" : "播放背景音乐");
  }

  btn.addEventListener("click", function () {
    if (audio.paused) {
      audio.play().then(function () { setPlaying(true); }).catch(function () {});
    } else {
      audio.pause();
      setPlaying(false);
    }
  });

  var p = audio.play();
  if (p && p.catch) {
    p.then(function () { setPlaying(true); }).catch(function () { setPlaying(false); });
  }
})();
