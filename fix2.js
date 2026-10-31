/* fix2.js v8 —— 收盘结算 + 换日（分时渲染已统一到 flow.js，本文件不再画图） */
(function(){
 function r2(x){return Math.round(x*100)/100}
 function settleStay(){
  if(M.phase==='closed')return;
  var d=M.day,g=0;
  while(M.day===d&&M.minute<240&&g<3200){(window.__stepReal||window.stepMinute)();matchAll();g++}
  if(M.day!==d)return;
  for(var i=0;i<M.stocks.length;i++){
   var s=M.stocks[i];
   s.kline.push({d:d,o:s.open,h:s.high,l:s.low,c:s.price,v:s.vol});
   if(s.kline.length>120)s.kline.shift();
  }
  M.phase='closed';M.minute=240;
 }
 function startNext(){
  if(M.phase!=='closed')settleStay();
  M.day++;M.minute=0;M.phase='open';
  for(var i=0;i<M.stocks.length;i++){
   var s=M.stocks[i];
   s.prev=s.price;
   s.hist=[{p:s.price,v:0,m:0}];
   s.open=s.price;s.high=s.price;s.low=s.price;
   s.vol=0;s.amount=0;s.tempMove=0;
   s.up=r2(s.price*1.1);s.dn=r2(s.price*0.9);
  }
  if(window.onNewDay)window.onNewDay();
 }
 function bind(id,fn){var e=document.getElementById(id);if(e)e.onclick=fn}
 bind('btnEnd',function(){
  settleStay();running=false;
  var p=document.getElementById('btnPause');if(p)p.textContent='▶ 继续';
  rw();rp();rm();rd();ts('第'+M.day+'日已收盘 15:00');
 });
 bind('btnNext',function(){
  startNext();running=true;
  var p=document.getElementById('btnPause');if(p)p.textContent='⏸ 暂停';
  rw();rp();rm();rd();ts('已进入第'+M.day+'日');
 });
 bind('btnPause',function(){
  if(M.phase==='closed'){
   startNext();running=true;
   this.textContent='⏸ 暂停';ts('已进入第'+M.day+'日');
  }else{
   running=!running;
   this.textContent=running?'⏸ 暂停':'▶ 继续';
   ts(running?'已继续':'已暂停');
  }
 });
})();
