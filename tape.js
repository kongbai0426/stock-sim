/* tape.js —— 逐笔成交列表（数据来自 flow.js 记录的 s._tp，同一批成交） */
(function(){
  var lv=document.getElementById('lv');if(!lv)return;
  var css=document.createElement('style');
  css.textContent='.tr{display:flex;gap:6px;font-size:11px;padding:2px 0;border-bottom:1px solid #131b25}'
   +'.tr span:first-child{width:44px;color:#7d8b9c}'
   +'.tr span:nth-child(2){flex:1;text-align:right}'
   +'.tr span:nth-child(3){width:62px;text-align:right}'
   +'.tr .big{font-weight:700}';
  document.head.appendChild(css);
  var box=document.createElement('div');
  box.id='tpHolder';
  box.style.cssText='padding:0 14px 6px';
  box.innerHTML='<div class="oh" style="margin:8px 0 4px">逐笔成交</div><div id="tpList"></div>';
  lv.parentNode.insertBefore(box,lv.nextSibling);
  function E(i){return document.getElementById(i)}
  function draw(){
    var s=getStock(sel);if(!s)return;
    var a=s._tp||[],h='',i,o,cl;
    for(i=0;i<a.length&&i<14;i++){
      o=a[i];cl=o.d>0?'r':'g';
      h+='<div class="tr"><span>'+fmtTime(o.m)+'</span>'
       +'<span class="'+cl+(o.a>=1e6?' big':'')+'">'+o.p.toFixed(2)+'</span>'
       +'<span class="'+cl+'">'+o.q+'手</span></div>';
    }
    E('tpList').innerHTML=h||'<div class="emp">等待成交</div>';
  }
  var o=window.rd;window.rd=function(){if(o)o();draw()};
  setInterval(function(){var d=E('dt');if(d&&d.classList.contains('on'))draw()},1000);
})();
