# -*- coding: utf-8 -*-
"""
川渝之旅 媒体处理脚本
从 C:\\Users\\29335\\Desktop\\川渝之旅\\{区域}\\{地点}\\*.jpg|*.mp4
生成：
  images_cloud/  云用缩略图（最长边 640px, q78）
  images/        查看用中等图（最长边 1600px, q85）
  videos/        视频（原样复制）
  js/data.js     window.DATA = [...]（含地点/区域/类型）
"""
import os, shutil, json, sys
from PIL import Image, ImageOps

SRC = r"C:\Users\29335\Desktop\川渝之旅"
OUT = os.path.dirname(os.path.abspath(__file__))

DIR_CLOUD = os.path.join(OUT, "images_cloud")
DIR_FULL  = os.path.join(OUT, "images")
DIR_VID   = os.path.join(OUT, "videos")
DIR_JS    = os.path.join(OUT, "js")
for d in (DIR_CLOUD, DIR_FULL, DIR_VID, DIR_JS):
    os.makedirs(d, exist_ok=True)

# 区域排序：四川在前、重庆在后
REGION_ORDER = {"四川": 0, "重庆": 1}

photos = []   # (region, loc, src_path)
videos = []   # (region, loc, src_path)

for region in sorted(os.listdir(SRC), key=lambda r: REGION_ORDER.get(r, 99)):
    rpath = os.path.join(SRC, region)
    if not os.path.isdir(rpath):
        continue
    for loc in sorted(os.listdir(rpath)):
        lpath = os.path.join(rpath, loc)
        if not os.path.isdir(lpath):
            continue
        for fn in sorted(os.listdir(lpath)):
            fpath = os.path.join(lpath, fn)
            if not os.path.isfile(fpath):
                continue
            ext = fn.lower().rsplit(".", 1)[-1]
            if ext in ("jpg", "jpeg", "png", "webp"):
                photos.append((region, loc, fpath))
            elif ext in ("mp4", "mov", "webm"):
                videos.append((region, loc, fpath))

print(f"发现照片 {len(photos)} 张，视频 {len(videos)} 个")

def fit(img, longest):
    w, h = img.size
    if max(w, h) <= longest:
        return img
    s = longest / max(w, h)
    return img.resize((round(w * s), round(h * s)), Image.LANCZOS)

DATA = []
for i, (region, loc, fpath) in enumerate(photos, 1):
    pid = f"p{i:03d}"
    try:
        img = Image.open(fpath)
        img = ImageOps.exif_transpose(img)      # 修正手机照片方向
        img = img.convert("RGB")
    except Exception as e:
        print(f"  跳过（打不开）{fpath}: {e}")
        continue
    fit(img, 1280).save(os.path.join(DIR_FULL,  pid + ".jpg"), "JPEG", quality=80, optimize=True)
    fit(img, 520 ).save(os.path.join(DIR_CLOUD, pid + ".jpg"), "JPEG", quality=74, optimize=True)
    DATA.append({"id": pid, "file": f"images/{pid}.jpg", "loc": loc, "region": region, "type": "photo"})

for j, (region, loc, fpath) in enumerate(videos, 1):
    vid = f"v{j}"
    dst = os.path.join(DIR_VID, vid + ".mp4")
    shutil.copyfile(fpath, dst)
    DATA.append({"id": vid, "file": f"videos/{vid}.mp4", "loc": loc, "region": region, "type": "video"})

# 写 data.js
with open(os.path.join(DIR_JS, "data.js"), "w", encoding="utf-8") as f:
    f.write("/* 川渝之旅 媒体数据，由 process_media.py 自动生成 */\n")
    f.write("window.DATA = ")
    json.dump(DATA, f, ensure_ascii=False, indent=2)
    f.write(";\n")

# 体积统计
def folder_mb(d):
    return round(sum(os.path.getsize(os.path.join(d, x)) for x in os.listdir(d)) / 1048576, 1)

print(f"\n完成：")
print(f"  images_cloud/ {len(os.listdir(DIR_CLOUD))} 张, {folder_mb(DIR_CLOUD)} MB")
print(f"  images/       {len(os.listdir(DIR_FULL))} 张, {folder_mb(DIR_FULL)} MB")
print(f"  videos/       {len(os.listdir(DIR_VID))} 个, {folder_mb(DIR_VID)} MB")
print(f"  数据条目 {len(DATA)} 条 -> js/data.js")
# 地点清单
locs = {}
for d in DATA:
    locs.setdefault(d["region"], {}).setdefault(d["loc"], 0)
    locs[d["region"]][d["loc"]] += 1
for region, ls in locs.items():
    print(f"  {region}: " + ", ".join(f"{k}({v})" for k, v in ls.items()))
