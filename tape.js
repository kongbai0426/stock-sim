/* tape.js v5 —— 明细：时间 / 价格 / 金额 */
(function(){
  var lv=document.getElementById('lv');if(!lv)return;
  var css=document.createElement('style');
  css.textContent=
   '.trh{display:flex;font-size:10px;color:#5c6b7a;padding:2px 12px;border-bottom:1px solid #16202b}'
   +'.trh span:first-child{width:42px}.trh span:nth-child(2){flex:1;text-align:right}'
   +'.trh span:nth-child(3){width:74px;text-align:right}'
   +'.tr{display:flex;font-size:11px;padding:2px 12px;line-height:18px;border-bottom:1px solid #101820}'
   +'.tr span:first-child{width:42px;color:#7d8b9c}'
   +'.tr span:nth-child(2){flex:1;text-align:right;font-variant-numeric:tabular-nums}'
   +'.tr span:nth-child(3){width:74px;text-align:right;font-variant-numeric:tabular-nums}';
  document.head.appendChild(css);
  var box=document.createElement('div');
  box.id='tpHolder';
  box.style.cssText='padding:0 0 6px';
  box.innerHTML='<div class="oh" style="padding:8px 12px 2px">明细</div>'
   +'<div class="trh"><span>时间</span><span>价格</span><span>金额</span></div>'
   +'<div id="tpList"></div>';
  lv.parentNode.insertBefore(box,lv.nextSibling);
  function E(i){return document.getElementById(i)}
  function amt(a){
    a=+a||0;
    if(a>=1e8)return (a/1e8).toFixed(2)+'亿';
    if(a>=1e4)return (a/1e4).toFixed(2)+'万';
    return a.toFixed(0);
  }
  function draw(){
    var s=getStock(sel);if(!s)return;
    var a=s._tp||[],h='',i,o,cl;
    for(i=0;i<a.length&&i<26;i++){
      o=a[i];cl=o.d>0?'r':'g';
      h+='<div class="tr"><span>'+fmtTime(o.m)+'</span>'
       +'<span class="'+cl+'">'+o.p.toFixed(2)+'</span>'
       +'<span class="'+cl+'">'+amt(o.a)+'</span></div>';
    }
    E('tpList').innerHTML=h||'<div class="emp">等待成交</div>';
  }
  var o=window.rd;window.rd=function(){if(o)o();draw()};
  setInterval(function(){var d=E('dt');if(d&&d.classList.contains('on'))draw()},1000);
})();
