// 成交量 v3：保留真实成交 + 叠加背景量
(function(){
 function E(id){return document.getElementById(id)}
 function pct95(a){var b=a.slice().sort(function(x,y){return x-y});return Math.max(1,b[Math.floor(b.length*0.95)]||1)}
 var oldStep=window.stepMinute;
 window.stepMinute=function(){
  oldStep();
  for(var i=0;i<M.stocks.length;i++){
   var s=M.stocks[i],h=s.hist[s.hist.length-1];
   if(!h)continue;
   if(s.price>s.high)s.high=s.price;
   if(s.price<s.low)s.low=s.price;
   var was=s._wasSeal||0;
   if(was&&!s._seal)s._justBroke=true;else s._justBroke=false;
   s._wasSeal=s._seal;
   var prev=s.hist.length>1?s.hist[s.hist.length-2].p:s.prev;
   var chg=prev?Math.abs(s.price-prev)/prev:0;
   var base=s.volBase||120;
   var add=base*(0.5+chg*250);
   if(M.minute<=5)add*=4;
   if(M.minute>=236)add*=2;
   if(s._seal)add*=0.1;
   if(s._justBroke)add*=8;
   add=Math.min(add,base*10);
   var traded=h.v||0;
   s.vol+=add;
   h.v=traded+add;
   s.lastQty=Math.round(traded>base*20?traded:add);
  }
 };
 window.drawTrend=function(s){
  var c=E('cv');if(!c)return;
  var r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=r.width,h=230;
  c.width=w*d;c.height=h*d;c.style.height=h+'px';
  var x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,h);
  var ls=s.hist;
  if(!ls||ls.length<2){x.fillStyle='#7d8b9c';x.font='12px sans-serif';x.fillText('等待行情…',12,30);return}
  var pre=s.prev||ls[0].p,mx=pre,mn=pre;
  ls.forEach(function(v){if(v.p>mx)mx=v.p;if(v.p<mn)mn=v.p});
  var lim=Math.max(pre-s.dn,s.up-pre);
  var dev=Math.max(Math.abs(mx-pre),Math.abs(mn-pre));
  dev=Math.min(Math.max(dev*1.08,pre*0.005),lim);
  mx=pre+dev;mn=pre-dev;
  var L=6,R=w-64,T=8,PH=h*0.6,VY=T+PH+10,VH=h-VY-12;
  function X(i){var mm=ls[i].m!=null?ls[i].m:i;return L+(R-L)*mm/240}
  function Y(p){return T+PH-(p-mn)/(mx-mn)*PH}
  x.strokeStyle='#1a2432';x.font='9px sans-serif';x.textAlign='right';
  for(var i=0;i<=4;i++){
   var y=T+PH*i/4,val=mx-(mx-mn)*i/4,pct=(val-pre)/pre*100;
   x.beginPath();x.moveTo(L,y);x.lineTo(R,y);x.stroke();
   x.fillStyle='#5c6b7a';x.fillText(val.toFixed(2),w-32,y+3);
   x.fillStyle=pct>0.001?'#ff5252':pct<-0.001?'#00d09c':'#7d8b9c';
   x.fillText((pct>0?'+':'')+pct.toFixed(2)+'%',w-2,y+3);
  }
  x.setLineDash([3,3]);x.strokeStyle='#4a5868';x.beginPath();x.moveTo(L,Y(pre));x.lineTo(R,Y(pre));x.stroke();x.setLineDash([]);
  var vmax=pct95(ls.map(function(v){return v.v||0}));
  var bw=Math.max(1,(R-L)/240*0.7);
  ls.forEach(function(v,i){x.fillStyle=(v.p>=(i?ls[i-1].p:pre))?'rgba(255,82,82,.6)':'rgba(0,208,156,.6)';var vh=Math.min(v.v,vmax)/vmax*VH;x.fillRect(X(i)-bw/2,VY+VH-vh,bw,Math.max(1,vh))});
  var sp=0,sv=0,avg=[];
  ls.forEach(function(v){sp+=v.p*v.v;sv+=v.v;avg.push(sv?sp/sv:v.p)});
  x.strokeStyle='#e8b339';x.lineWidth=1;x.beginPath();avg.forEach(function(p,i){var yy=Y(p);i?x.lineTo(X(i),yy):x.moveTo(X(i),yy)});x.stroke();
  x.strokeStyle='#e6edf3';x.lineWidth=1.4;x.beginPath();ls.forEach(function(v,i){var yy=Y(v.p);i?x.lineTo(X(i),yy):x.moveTo(X(i),yy)});x.stroke();
  var last=ls[ls.length-1];x.fillStyle='#e6edf3';x.beginPath();x.arc(X(ls.length-1),Y(last.p),2.5,0,6.283);x.fill();
 };
 var oldRd=window.rd;
 window.rd=function(){
  oldRd();
  var s=getStock(sel);if(!s)return;
  var rows=document.querySelectorAll('#lv .lv');
  for(var i=0;i<rows.length;i++){
   if(rows[i].children[0]&&rows[i].children[0].textContent==='最新'){
    rows[i].children[2].textContent=(s.lastQty||0)+'手';break;
   }
  }
 };
})();
