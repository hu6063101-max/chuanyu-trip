# 川渝之旅

四川 · 重庆 旅行影像相册。一个会漂浮的照片云：照片在屏幕中缓缓游动，点击任意一张即可放大并显示**拍摄地点**。

在线浏览：<https://hu6063101-max.github.io/chuanyu-trip/>

## 功能

- **首页**：159 张照片组成漂浮照片云，点击聚焦放大、显示拍摄地点；「随机」按钮重新排布。
- **无障碍查看**：按「地区 → 地点」逐张列出全部 159 张照片与 4 个视频，方便慢慢看。
- 纯中文，暖调暗色风，无外部 CDN 依赖（国内/微信打开稳定）。

## 结构

```
index.html / accessible.html   首页（照片云）/ 无障碍页
css/style.css                  样式
js/cloud.js                    漂浮云引擎
js/accessible.js               无障碍列表
js/data.js                     媒体数据（地点 / 区域 / 类型，自动生成）
images_cloud/                  云用缩略图（520px）
images/                        查看用中等图（1280px）
videos/                        视频
process_media.py               媒体处理脚本（Pillow，可重跑）
```

## 本地运行

```bash
python -m http.server 5600
# 打开 http://localhost:5600
```

照片均为本人拍摄。页面已设 `noindex`，不会被搜索引擎收录。
