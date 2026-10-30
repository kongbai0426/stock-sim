// 收盘结算 + 分时纵轴（固定 昨收±涨跌停，只标 顶/零/底）
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
 window.__trend=function(s){
  var c=document.getElementById('cv');if(!c||!s)return;
  var r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=r.width||320,h=230;
  c.width=w*d;c.height=h*d;c.style.height=h+'px';
  var x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,h);
  var ls=s.hist;
  if(!ls||ls.length<2){x.fillStyle='#7d8b9c';x.font='12px sans-serif';x.fillText('等待行情…',12,30);return}
  var pre=s.prev||ls[0].p||1;
  var up=s.up||r2(pre*1.1),dn=s.dn||r2(pre*0.9);
  if(up<=pre)up=r2(pre*1.1);
  if(dn>=pre)dn=r2(pre*0.9);
  var mx=up,mn=dn;
  window._ax={pre:pre,up:up,dn:dn,mx:mx,mn:mn};
  var L=6,R=w-86,T=8,PH=h*0.6,VY=T+PH+10,VH=h-VY-12;
  function X(i){var mm=ls[i].m!=null?ls[i].m:i;return L+(R-L)*mm/240}
  function Y(p){return T+PH-(p-mn)/(mx-mn)*PH}
  for(var i=0;i<=4;i++){
   var y=T+PH*i/4,val=mx-(mx-mn)*i/4,pct=(val-pre)/pre*100;
   if(i===2)x.setLineDash([3,3]);
   x.strokeStyle=i===2?'#4a5868':(i===0?'#4a2323':(i===4?'#17392f':'#1a2432'));
   x.lineWidth=1;x.beginPath();x.moveTo(L,y);x.lineTo(R,y);x.stroke();
   if(i===2)x.setLineDash([]);
   if(i===0||i===2||i===4){
    x.textAlign='right';x.font='9px sans-serif';
    x.fillStyle=pct>0.001?'#ff5252':(pct<-0.001?'#00d09c':'#8b98a8');
    x.fillText(val.toFixed(2)+'  '+(pct>0?'+':'')+pct.toFixed(2)+'%',w-2,y+3);
   }
  }
  var vmax=1;ls.forEach(function(v){if(v.v>vmax)vmax=v.v});
  var bw=Math.max(1,(R-L)/240*0.7);
  ls.forEach(function(v,i){x.fillStyle=(v.p>=(i?ls[i-1].p:pre))?'rgba(255,82,82,.5)':'rgba(0,208,156,.5)';var vh=Math.min(v.v,vmax)/vmax*VH;x.fillRect(X(i)-bw/2,VY+VH-vh,bw,Math.max(1,vh))});
  var sp=0,sv=0,avg=[];
  ls.forEach(function(v){sp+=v.p*v.v;sv+=v.v;avg.push(sv?sp/sv:v.p)});
  x.strokeStyle='#e8b339';x.lineWidth=1;x.beginPath();
  avg.forEach(function(p,i){var yy=Y(p);i?x.lineTo(X(i),yy):x.moveTo(X(i),yy)});x.stroke();
  x.strokeStyle='#e6edf3';x.lineWidth=1.4;x.beginPath();
  ls.forEach(function(v,i){var yy=Y(v.p);i?x.lineTo(X(i),yy):x.moveTo(X(i),yy)});x.stroke();
  var last=ls[ls.length-1];
  x.fillStyle='#e6edf3';x.beginPath();x.arc(X(ls.length-1),Y(last.p),2.5,0,6.283);x.fill();
  x.font='9px sans-serif';x.textAlign='left';x.fillStyle='#e8b339';x.fillText('AX5',L+1,h-3);
 };
 window.drawTrend=window.__trend;
 setTimeout(function(){window.drawTrend=window.__trend},0);
 if(document.readyState==='complete')setTimeout(function(){window.drawTrend=window.__trend},0);
 else window.addEventListener('load',function(){window.drawTrend=window.__trend});
 setTimeout(function(){window.drawTrend=window.__trend},600);
 setInterval(function(){if(window.drawTrend!==window.__trend)window.drawTrend=window.__trend},1000);
})();
