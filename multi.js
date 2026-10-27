// 多周期K线补丁：分时/5/15/30/60分/日/周/月 + 均线数值
(function(){
 var tb=document.querySelector('.tabs2');
 var P=[['t','分时'],['m5','5分'],['m15','15分'],['m30','30分'],['m60','60分'],['k','日K'],['w','周K'],['m','月K']];
 if(tb){
  for(var i=0;i<P.length;i++){
   if(!tb.querySelector('[data-c="'+P[i][0]+'"]')){
    var nb=document.createElement('button');
    nb.className='ct';nb.setAttribute('data-c',P[i][0]);nb.textContent=P[i][1];
    tb.appendChild(nb);
   }
  }
  for(var j=0;j<P.length;j++){var el=tb.querySelector('[data-c="'+P[j][0]+'"]');if(el)tb.appendChild(el)}
  [].forEach.call(tb.querySelectorAll('.ct'),function(b){
   b.onclick=function(){
    mode=b.getAttribute('data-c');
    [].forEach.call(tb.querySelectorAll('.ct'),function(x){x.classList.toggle('on',x===b)});
    dr();
   };
  });
 }
 window.drawTrend=function(s){
  var c=document.getElementById('cv'),r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=r.width,h=230;
  c.width=w*d;c.height=h*d;c.style.height=h+'px';
  var x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,h);
  var ls=s.hist;
  if(!ls||ls.length<2){x.fillStyle='#7d8b9c';x.font='12px sans-serif';x.fillText('等待行情…',12,30);return}
  var pre=s.prev||ls[0].p,mx=pre,mn=pre;
  ls.forEach(function(v){if(v.p>mx)mx=v.p;if(v.p<mn)mn=v.p});
  var dev=Math.max(Math.abs(mx-pre),Math.abs(mn-pre))*1.1||pre*0.01;mx=pre+dev;mn=pre-dev;
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
  var vmax=1;ls.forEach(function(v){if(v.v>vmax)vmax=v.v});
  var bw=Math.max(1,(R-L)/240*0.7);
  ls.forEach(function(v,i){x.fillStyle=(v.p>=(i?ls[i-1].p:pre))?'rgba(255,82,82,.5)':'rgba(0,208,156,.5)';var vh=Math.min(v.v,vmax)/vmax*VH;x.fillRect(X(i)-bw/2,VY+VH-vh,bw,Math.max(1,vh))});
  var sp=0,sv=0,avg=[];
  ls.forEach(function(v){sp+=v.p*v.v;sv+=v.v;avg.push(sv?sp/sv:v.p)});
  x.strokeStyle='#e8b339';x.lineWidth=1;x.beginPath();avg.forEach(function(p,i){var yy=Y(p);i?x.lineTo(X(i),yy):x.moveTo(X(i),yy)});x.stroke();
  x.strokeStyle='#e6edf3';x.lineWidth=1.4;x.beginPath();ls.forEach(function(v,i){var yy=Y(v.p);i?x.lineTo(X(i),yy):x.moveTo(X(i),yy)});x.stroke();
  var last=ls[ls.length-1];x.fillStyle='#e6edf3';x.beginPath();x.arc(X(ls.length-1),Y(last.p),2.5,0,6.283);x.fill();
 };
 function rr(n){n=(n*1103515245+12345)&0x7fffffff;return((n>>>8)&0xffff)/65535}
 function getK60(s){
  if(s.k60&&s.k60.length)return s.k60;
  var out=[];
  for(var i=0;i<s.kline.length;i++){
   var b=s.kline[i],step=(b.c-b.o)/4,seed=(b.d+7)*97;
   for(var k=0;k<4;k++){
    var bo=b.o+step*k,bc=b.o+step*(k+1);
    var hi=Math.max(bo,bc)*(1+rr(seed+k)*0.004);
    var lo=Math.min(bo,bc)*(1-rr(seed+k+9)*0.004);
    out.push({d:b.d,t:k,o:bo,h:hi,l:lo,c:bc,v:(b.v||1)/4*(0.6+rr(seed+k+17)*0.8)});
   }
  }
  s.k60=out;
  return out;
 }
 function daily(s){
  var a=s.kline.slice();
  if(M&&M.day!=null){
   if(!a.length||a[a.length-1].d!==M.day)a.push({d:M.day,o:s.open,h:s.high,l:s.low,c:s.price,v:s.vol});
   else{var l=a[a.length-1];l.c=s.price;if(s.high>l.h)l.h=s.high;if(s.low<l.l)l.l=s.low;l.v=s.vol}
  }
  return a;
 }
 function live60(s){
  var a=getK60(s).slice();
  if(!M||M.minute==null)return a;
  var seg=Math.floor(M.minute/60),lo=seg*60,hi=lo+60,pts=[];
  for(var i=0;i<s.hist.length;i++){var h=s.hist[i];if(h.m>=lo&&h.m<hi)pts.push(h)}
  if(!pts.length)return a;
  var o=pts[0].p,c2=pts[pts.length-1].p,mx=o,mn=o,v=0;
  for(var j=0;j<pts.length;j++){if(pts[j].p>mx)mx=pts[j].p;if(pts[j].p<mn)mn=pts[j].p;v+=pts[j].v||0}
  var bar={d:M.day,t:seg,o:o,h:mx,l:mn,c:c2,v:v};
  if(a.length&&a[a.length-1].d===M.day)a[a.length-1]=bar;else a.push(bar);
  return a;
 }
 function sub(bars,per){
  var out=[];
  for(var i=0;i<bars.length;i++){
   var b=bars[i],step=(b.c-b.o)/per,seed=(b.d+1)*97+(b.t||0)*13;
   for(var k=0;k<per;k++){
    var bo=b.o+step*k+(k?(rr(seed+k)-0.5)*0.002*b.c:0);
    var bc=b.o+step*(k+1)+(k<per-1?(rr(seed+k+1)-0.5)*0.002*b.c:0);
    var hi=Math.max(bo,bc)*(1+rr(seed+k+7)*0.002);
    var lo=Math.min(bo,bc)*(1-rr(seed+k+13)*0.002);
    out.push({o:bo,h:hi,l:lo,c:bc,v:b.v/per*(0.6+rr(seed+k+21)*0.8)});
   }
  }
  return out;
 }
 function agg(ds,size){
  var out=[];
  for(var i=0;i<ds.length;i+=size){
   var g=ds.slice(i,i+size);if(!g.length)continue;
   var o=g[0].o,c=g[g.length-1].c,h=g[0].h,l=g[0].l,v=0;
   for(var j=0;j<g.length;j++){if(g[j].h>h)h=g[j].h;if(g[j].l<l)l=g[j].l;v+=g[j].v||0}
   out.push({o:o,h:h,l:l,c:c,v:v});
  }
  return out;
 }
 function drawBars(ds){
  var c=document.getElementById('cv'),r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=r.width,h=230;
  c.width=w*d;c.height=h*d;c.style.height=h+'px';
  var x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,h);
  if(!ds.length){x.fillStyle='#7d8b9c';x.font='12px sans-serif';x.fillText('暂无K线',12,30);return}
  var mx=-1e9,mn=1e9;
  ds.forEach(function(v){if(v.h>mx)mx=v.h;if(v.l<mn)mn=v.l});
  var pad=(mx-mn)*0.1||1;mx+=pad;mn-=pad;
  var L=6,R=w-56,T=24,PH=h*0.56,VY=T+PH+10,VH=h-VY-12,n=ds.length,cw=(R-L)/n;
  function Y(p){return T+PH-(p-mn)/(mx-mn)*PH}
  function X(i){return L+cw*i+cw/2}
  x.strokeStyle='#1a2432';x.fillStyle='#5c6b7a';x.font='9px sans-serif';x.textAlign='right';
  for(var i=0;i<=4;i++){var y=T+PH*i/4;x.beginPath();x.moveTo(L,y);x.lineTo(R,y);x.stroke();x.fillText((mx-(mx-mn)*i/4).toFixed(2),w-2,y+3)}
  ds.forEach(function(v,i){
   var up=v.c>=v.o,col=up?'#ff5252':'#00d09c',bw=Math.max(1,cw*0.6);
   x.strokeStyle=col;x.fillStyle=col;x.beginPath();x.moveTo(X(i),Y(v.h));x.lineTo(X(i),Y(v.l));x.stroke();
   var y1=Y(Math.max(v.o,v.c)),y2=Y(Math.min(v.o,v.c));
   if(up){x.fillStyle='#0b0f14';x.fillRect(X(i)-bw/2,y1,bw,Math.max(1,y2-y1));x.strokeRect(X(i)-bw/2,y1,bw,Math.max(1,y2-y1))}
   else x.fillRect(X(i)-bw/2,y1,bw,Math.max(1,y2-y1));
  });
  var vmax=1;ds.forEach(function(v){if(v.v>vmax)vmax=v.v});
  ds.forEach(function(v,i){var up=v.c>=v.o;x.fillStyle=up?'rgba(255,82,82,.45)':'rgba(0,208,156,.45)';var vh=Math.min(v.v,vmax)/vmax*VH;x.fillRect(L+cw*i+cw*0.2,VY+VH-vh,cw*0.6,Math.max(1,vh))});
  var ks=[5,10,30,60],cols=['#e8b339','#6aa9ff','#c06aff','#00d09c'],px=6;
  x.font='10px sans-serif';x.textAlign='left';
  for(var q=0;q<ks.length;q++){
   var k=ks[q],sum=0,arr=[];
   for(var i2=0;i2<ds.length;i2++){sum+=ds[i2].c;if(i2>=k)sum-=ds[i2-k].c;arr.push(i2>=k-1?sum/k:null)}
   x.strokeStyle=cols[q];x.lineWidth=1;x.beginPath();var st=false;
   for(var i3=0;i3<arr.length;i3++){if(arr[i3]==null)continue;var yy=Y(arr[i3]);if(!st){x.moveTo(X(i3),yy);st=true}else x.lineTo(X(i3),yy)}
   x.stroke();
   var lv=arr[arr.length-1],t2='MA'+k+' '+(lv?lv.toFixed(2):'--');
   x.fillStyle=cols[q];x.fillText(t2,px,12);px+=x.measureText(t2).width+12;
  }
 }
 window.dr=function(){
  var s=getStock(sel);if(!s)return;
  if(mode==='t'){drawTrend(s);return}
  var ds;
  if(mode==='m60')ds=live60(s);
  else if(mode==='m30')ds=sub(live60(s),2);
  else if(mode==='m15')ds=sub(live60(s),4);
  else if(mode==='m5')ds=sub(live60(s),12);
  else if(mode==='k')ds=daily(s);
  else if(mode==='w')ds=agg(daily(s),5);
  else if(mode==='m')ds=agg(daily(s),20);
  else ds=daily(s);
  drawBars(ds.slice(-200));
 };
})();
