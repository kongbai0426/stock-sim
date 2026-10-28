// 五档红绿对抗条：买盘 vs 卖盘
(function(){
 function E(id){return document.getElementById(id)}
 var oldRd=window.rd;
 window.rd=function(){
  oldRd();
  var s=getStock(sel);
  var lv=E('lv');
  if(!s||!s.book||!lv)return;
  var old=E('depthBar');
  if(old&&old.parentNode)old.parentNode.removeChild(old);
  var bq=0,aq=0;
  s.book.bids.forEach(function(l){bq+=l.q||0});
  s.book.asks.forEach(function(l){aq+=l.q||0});
  var tot=bq+aq||1;
  var bar=document.createElement('div');
  bar.id='depthBar';
  bar.style.cssText='display:flex;height:6px;margin:4px 14px;border-radius:3px;overflow:hidden;background:#1a2432';
  var r=document.createElement('div');
  r.style.cssText='width:'+(bq/tot*100)+'%;background:#ff5252';
  var g=document.createElement('div');
  g.style.cssText='flex:1;background:#00d09c';
  bar.appendChild(r);bar.appendChild(g);
  var rows=lv.querySelectorAll('.lv');
  for(var i=0;i<rows.length;i++){
   if(rows[i].children[0]&&rows[i].children[0].textContent==='最新'){
    lv.insertBefore(bar,rows[i]);
    break;
   }
  }
 };
})();
