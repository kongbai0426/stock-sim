<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>test</title></head>
<body style="background:#0b0f14;color:#eee;font:16px sans-serif;padding:20px">
<h2 id="s">脚本已运行 ✓</h2>
<div id="out" style="margin-top:12px">正在取行情…</div>
<script>
document.getElementById('s').textContent='脚本已运行 ✓ '+new Date().toLocaleTimeString();
var s=document.createElement('script');
s.charset='gbk';
s.src='https://qt.gtimg.cn/q=sh600519&_='+Date.now();
s.onload=function(){
  var v=window.v_sh600519;
  document.getElementById('out').textContent = v ? ('茅台：'+v.split('~')[1]+'  现价 '+v.split('~')[3]) : '没拿到数据';
};
s.onerror=function(){document.getElementById('out').textContent='行情接口被拦（网络问题）'};
document.head.appendChild(s);
</script>
</body></html>
