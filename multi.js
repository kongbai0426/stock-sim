// 多周期K线 v5：同屏160根 + 拖动 + 缩放 + 十字线读数
(function(){
 var N=160;
 var V={data:[],mas:[],end:0,count:N,cur:-1,bw:1,L:0,R:0,T:42,s:0,ph:0};
 function rr(n){n=(n*1103515245+12345)&0x7fffffff;return((n>>>8)&0xffff)/65535}
 function seedOf(s){var n=0;for(var i=0;i<s.code.length;i++)n=n*31+s.code.charCodeAt(i);return n||7}
 function dstr(d){
  var dt=new Date(2026,0,1);dt.setDate(dt.getDate()+d);
  var m=('0'+(dt.getMonth()+1)).slice(-2),dd=('0'+dt.getDate()).slice(-2);
  return dt.getFullYear()+'-'+m+'-'+dd;
 }
 function extDaily(s){
  if(s._ext)return s._ext;
  var base=s.kline.slice();
  if(!base.length){s._ext=base;return base}
  var old=[],p=base[0].o,seed=seedOf(s),firstD=(base[0].d||0);
  for(var j=0;j<3400;j++){
   var r=rr(seed+j*7+1),g=(r-0.5)*0.04;
   p=p/(1+g);
   var o=p*(1+(r-0.5)*0.006),c=p;
   old.push({d:firstD-3400+j,o:o,h:Math.max(o,c)*(1+r*0.007),l:Math.min(o,c)*(1-r*0.007),c:c,v:(base[0].v||1000)*(0.5+r)});
  }
  s._ext=old.concat(base);
  return s._ext;
 }
 function daily(s){
  var a=extDaily(s).slice();
  if(window.M&&M.day!=null){
   if(!a.length||a[a.length-1].d!==M.day)a.push({d:M.day,o:s.open,h:s.high,l:s.low,c:s.price,v:s.vol});
   else{var l=a[a.length-1];l.c=s.price;if(s.high>l.h)l.h=s.high;if(s.low<l.l)l.l=s.low;l.v=s.vol}
  }
  return a;
 }
 function getK60(s){
  if(s.k60&&s.k60.length)return s.k60;
  var out=[];
  for(var i=0;i<s.kline.length;i++){
   var b=s.kline[i],step=(b.c-b.o)/4,seed=(b.d+7)*97;
   for(var k=0;k<4;k++){
    var bo=b.o+step*k,bc=b.o+step*(k+1);
    out.push({d:b.d,t:k,o:bo,h:Math.max(bo,bc)*(1+rr(seed+k)*0.004),l:Math.min(bo,bc)*(1-rr(seed+k+9)*0.004),c:bc,v:(b.v||1)/4*(0.6+rr(seed+k+17)*0.8)});
   }
  }
  s.k60=out;return out;
 }
 function live60(s){
  var a=getK60(s).slice();
  if(!window.M||M.minute==null)return a;
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
    out.push({d:b.d,t:b.t,o:bo,h:Math.max(bo,bc)*(1+rr(seed+k+7)*0.002),l:Math.min(bo,bc)*(1-rr(seed+k+13)*0.002),c:bc,v:b.v/per*(0.6+rr(seed+k+21)*0.8)});
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
   out.push({d:g[0].d,o:o,h:h,l:l,c:c,v:v});
  }
  return out;
 }
 function maFull(ds,k){
  var out=[],sum=0;
  for(var i=0;i<ds.length;i++){sum+=ds[i].c;if(i>=k)sum-=ds[i-k].c;out.push(i>=k-1?sum/k:null)}
  return out;
 }
 function prepare(ds){
  V.data=ds;V.end=ds.length;V.cur=-1;
  if(V.count>ds.length)V.count=ds.length;
  V.mas=[];
  var ks=[5,10,30,60],cols=['#e8b339','#6aa9ff','#c06aff','#00d09c'];
  for(var i=0;i<ks.length;i++)V.mas.push({k:ks[i],c:cols[i],a:maFull(ds,ks[i])});
  render();
 }
 function cvEl(){return document.getElementById('cv')}
 function render(){
  var cv=cvEl();if(!cv)return;
  var r=cv.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=r.width,h=250;
  cv.width=w*d;cv.height=h*d;cv.style.height=h+'px';
  var x=cv.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,h);
  var ds=V.data;
  if(!ds.length){x.fillStyle='#7d8b9c';x.font='12px sans-serif';x.fillText('暂无K线',12,30);return}
  var cnt=Math.max(20,Math.min(V.count,ds.length));
  var end=Math.max(cnt,Math.min(V.end,ds.length));
  var st=Math.max(0,end-cnt),ed=end,vis=ds.slice(st,ed);
  var L=6,R=w-56,T=V.T,PH=h*0.55,VY=T+PH+8,VH=h-VY-10;
  var n=vis.length,cw=(R-L)/n;
  V.bw=cw;V.s=st;V.L=L;V.R=R;
  function Y(p){return T+PH-(p-mn)/(mx-mn)*PH}
  function X(i){return L+cw*i+cw/2}
  var mx=-1e9,mn=1e9;
  vis.forEach(function(v){if(v.h>mx)mx=v.h;if(v.l<mn)mn=v.l});
  var pad=(mx-mn)*0.1||1;mx+=pad;mn-=pad;
  x.strokeStyle='#1a2432';x.fillStyle='#5c6b7a';x.font='9px sans-serif';x.textAlign='right';
  for(var i=0;i<=4;i++){var y=T+PH*i/4;x.beginPath();x.moveTo(L,y);x.lineTo(R,y);x.stroke();x.fillText((mx-(mx-mn)*i/4).toFixed(2),w-2,y+3)}
  vis.forEach(function(v,i){
   var up=v.c>=v.o,col=up?'#ff5252':'#00d09c',bw=Math.max(1,cw*0.62);
   x.strokeStyle=col;x.fillStyle=col;x.beginPath();x.moveTo(X(i),Y(v.h));x.lineTo(X(i),Y(v.l));x.stroke();
   var y1=Y(Math.max(v.o,v.c)),y2=Y(Math.min(v.o,v.c));
   if(up){x.fillStyle='#0b0f14';x.fillRect(X(i)-bw/2,y1,bw,Math.max(1,y2-y1));x.strokeRect(X(i)-bw/2,y1,bw,Math.max(1,y2-y1))}
   else x.fillRect(X(i)-bw/2,y1,bw,Math.max(1,y2-y1));
  });
  var vmax=1;vis.forEach(function(v){if(v.v>vmax)vmax=v.v});
  vis.forEach(function(v,i){var up=v.c>=v.o;x.fillStyle=up?'rgba(255,82,82,.45)':'rgba(0,208,156,.45)';var vh=Math.min(v.v,vmax)/vmax*VH;x.fillRect(L+cw*i+cw*0.19,VY+VH-vh,cw*0.62,Math.max(1,vh))});
  V.mas.forEach(function(m){
   x.strokeStyle=m.c;x.lineWidth=1;x.beginPath();var started=false;
   for(var i=st;i<ed;i++){var v=m.a[i];if(v==null)continue;var xx=X(i-st),yy=Y(v);if(!started){x.moveTo(xx,yy);started=true}else x.lineTo(xx,yy)}
   x.stroke();
  });
  x.font='10px sans-serif';x.textAlign='left';var px=6;
  V.mas.forEach(function(m){
   var lv=null;for(var i=ed-1;i>=st;i--){if(m.a[i]!=null){lv=m.a[i];break}}
   var t='MA'+m.k+' '+(lv?lv.toFixed(2):'--');
   x.fillStyle=m.c;x.fillText(t,px,12);px+=x.measureText(t).width+12;
  });
  if(V.cur>=0&&V.cur<vis.length){
   var b=vis[V.cur],cx=X(V.cur);
   x.strokeStyle='#8899aa';x.setLineDash([4,4]);x.beginPath();x.moveTo(cx,T);x.lineTo(cx,VY+VH);x.stroke();x.setLineDash([]);
   var prevC=V.cur>0?vis[V.cur-1].c:b.o;
   var pc=prevC?((b.c-prevC)/prevC*100):0;
   x.fillStyle='#0b0f14';x.fillRect(4,20,Math.min(w-8,250),16);
   x.fillStyle='#c9d4e0';x.font='10px sans-serif';x.textAlign='left';
   var inf=dstr(b.d)+(b.t!=null?' '+['10:30','11:30','14:00','15:00'][b.t]:'');
   inf+='  开'+b.o.toFixed(2)+' 高'+b.h.toFixed(2)+' 低'+b.l.toFixed(2)+' 收'+b.c.toFixed(2);
   inf+='  '+(pc>0?'+':'')+pc.toFixed(2)+'%  量'+Math.round(b.v);
   x.fillText(inf,6,32);
   x.fillStyle=pc>0?'#ff5252':pc<0?'#00d09c':'#7d8b9c';
   x.fillRect(cx-30,VY+VH+2,60,14);
   x.fillStyle='#0b0f14';x.textAlign='center';x.font='9px sans-serif';x.fillText(dstr(b.d),cx,VY+VH+13);
  }
 }
 function hitIndex(clientX){
  var cv=cvEl(),r=cv.getBoundingClientRect(),x=clientX-r.left;
  var i=Math.floor((x-V.L)/(V.bw||1));
  return Math.max(0,Math.min(V.data.length-1,V.s+i));
 }
 function bind(){
  var cv=cvEl();if(!cv)return;
  cv.style.touchAction='none';
  var g=null;
  cv.addEventListener('touchstart',function(e){
   if(e.touches.length===1){
    var t=e.touches[0];
    g={mode:'pan',x:t.clientX,y:t.clientY,end:V.end,count:V.count};
    V.cur=hitIndex(t.clientX)-V.s;render();
   }else if(e.touches.length===2){
    var a=e.touches[0],b=e.touches[1];
    g={mode:'pinch',dist:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),count:V.count};
   }
   e.preventDefault();
  },{passive:false});
  cv.addEventListener('touchmove',function(e){
   if(!g)return;
   if(g.mode==='pan'&&e.touches.length===1){
    var t=e.touches[0],dx=t.clientX-g.x;
    V.end=Math.max(g.count,Math.min(V.data.length,g.end-Math.round(dx/(V.bw||1))));
    V.cur=-1;render();
   }else if(g.mode==='pinch'&&e.touches.length===2){
    var a=e.touches[0],b=e.touches[1],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
    V.count=Math.max(30,Math.min(400,Math.round(g.count*g.dist/d)));
    V.end=Math.max(V.count,Math.min(V.data.length,V.end));
    V.cur=-1;render();
   }
   e.preventDefault();
  },{passive:false});
  cv.addEventListener('touchend',function(e){g=null;e.preventDefault()},{passive:false});
  cv.addEventListener('mousedown',function(e){g={mode:'pan',x:e.clientX,y:e.clientY,end:V.end,count:V.count};V.cur=hitIndex(e.clientX)-V.s;render()});
  cv.addEventListener('mousemove',function(e){if(!g)return;var dx=e.clientX-g.x;V.end=Math.max(g.count,Math.min(V.data.length,g.end-Math.round(dx/(V.bw||1))));V.cur=-1;render()});
  cv.addEventListener('mouseup',function(){g=null});
  cv.addEventListener('wheel',function(e){e.preventDefault();V.count=Math.max(30,Math.min(400,V.count+(e.deltaY>0?10:-10)));V.end=Math.max(V.count,Math.min(V.data.length,V.end));render()},{passive:false});
 }
 function drawTrend(s){
  var cv=cvEl(),r=cv.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=r.width,h=250;
  cv.width=w*d;cv.height=h*d;cv.style.height=h+'px';
  var x=cv.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,h);
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
 }
 function show(kind,s){
  var a;
  if(kind==='m5')a=sub(live60(s),12);
  else if(kind==='m15')a=sub(live60(s),4);
  else if(kind==='m30')a=sub(live60(s),2);
  else if(kind==='m60')a=live60(s);
  else if(kind==='w')a=agg(daily(s),5);
  else if(kind==='m')a=agg(daily(s),20);
  else a=daily(s);
  prepare(a);
 }
 window.drawTrend=drawTrend;
 window.dr=function(){
  var s=getStock(sel);if(!s)return;
  if(mode==='t'){drawTrend(s);return}
  show(mode,s);
 };
 var tries=0;
 function setup(){
  var tb=document.querySelector('#dt .tabs2');
  if(!tb){if(tries++<20)setTimeout(setup,300);return}
  var P=[['t','分时'],['m5','5分'],['m15','15分'],['m30','30分'],['m60','60分'],['k','日K'],['w','周K'],['m','月K']];
  for(var i=0;i<P.length;i++){
   if(!tb.querySelector('[data-c="'+P[i][0]+'"]')){
    var nb=document.createElement('button');nb.className='ct';nb.setAttribute('data-c',P[i][0]);nb.textContent=P[i][1];tb.appendChild(nb);
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
  bind();
  document.title=(document.title||'模拟股市')+' M';
 }
 setup();
})();
