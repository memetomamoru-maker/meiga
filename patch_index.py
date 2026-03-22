#!/usr/bin/env python3
"""
meiga/index.html への変更パッチ
実行方法: python3 patch_index.py
"""
import re, sys, os

path = 'index.html'
if not os.path.exists(path):
    print(f"ERROR: {path} が見つかりません。meigaフォルダ内で実行してください")
    sys.exit(1)

with open(path, 'r', encoding='utf-8') as f:
    html = f.read()

changes = 0

# 1. lightbox額縁をマットブラックに統一
old1 = "background:linear-gradient(145deg,#c88830 0%,#7a4010 15%,#5a2a08 35%,#8a5820 50%,#5a2a08 65%,#7a4010 85%,#c88830 100%);\n  box-shadow:0 20px 60px rgba(0,0,0,.7),0 0 0 1px rgba(230,180,60,.5),inset 0 0 0 1px rgba(0,0,0,.4);"
new1 = "background:linear-gradient(to bottom,#2a2a2a 0%,#1a1a1a 20%,#141414 50%,#1a1a1a 80%,#2a2a2a 100%);\n  box-shadow:0 20px 60px rgba(0,0,0,.8),0 0 0 1px rgba(255,255,255,.08),inset 0 0 0 1px rgba(0,0,0,.5);"
if old1 in html:
    html = html.replace(old1, new1)
    changes += 1
    print("✅ lightbox額縁をマットブラックに変更")
else:
    print("⚠️  lightbox額縁の変更箇所が見つかりません（既に変更済みか構造が異なります）")

# 2. ピンチズームJSを追加
pinch_js = """
/* ピンチズーム for lightbox */
(function(){
  var lb=document.getElementById('lightbox');
  var img=document.getElementById('lb-img');
  if(!lb||!img)return;
  var scale=1,startDist=0,startScale=1;
  function dist(t){var dx=t[0].clientX-t[1].clientX,dy=t[0].clientY-t[1].clientY;return Math.sqrt(dx*dx+dy*dy);}
  lb.addEventListener('touchstart',function(e){
    if(e.touches.length===2){e.preventDefault();startDist=dist(e.touches);startScale=scale;}
  },{passive:false});
  lb.addEventListener('touchmove',function(e){
    if(e.touches.length===2){
      e.preventDefault();
      var d=dist(e.touches);
      scale=Math.min(Math.max(startScale*(d/startDist),1),4);
      img.style.transform='scale('+scale+')';
      img.style.transformOrigin='center center';
    }
  },{passive:false});
  lb.addEventListener('touchend',function(e){
    if(e.touches.length<2&&scale<1.05){scale=1;img.style.transform='scale(1)';}
  });
  var lbClose=document.getElementById('lb-close');
  if(lbClose)lbClose.addEventListener('click',function(){scale=1;img.style.transform='scale(1)';});
})();
"""

if 'touchstart' not in html:
    html = html.replace('</script>', pinch_js + '\n</script>', 1)
    changes += 1
    print("✅ ピンチズームJSを追加")
else:
    print("⚠️  ピンチズームJSは既に存在します")

with open(path, 'w', encoding='utf-8') as f:
    f.write(html)

print(f"\n完了: {changes}件の変更を適用しました")
print(f"ファイル: {path} ({len(html)} chars)")
