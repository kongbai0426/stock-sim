/* flow.js v45 —— 只读引擎数据，不再篡改成交量与资金流 */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function hash(n){var x=Math.sin(n*12.9898)*43758.5453;return x-Math.floor(x);}
var cx=-1;

function ensureCanvas(){
 var cv=$('cv'); if(!cv) return null;
 var f=$('fcv');
 if(!f){
  f=document.createElement('canvas');
  f.id='fcv';
  f.style.cssText='display:block;width:100%;height:104px;margin-top:2px';
  if(cv.parentNode) cv.parentNode.insertBefore(f,cv.nextSibling);
 }
 return f;
}

/* 从历史的每分钟成交量推导四档累计净额（纯函数，多次调用结果一致） */
function calcFlow(s){
 var ls=(s&&s.hist)||[];
 var pre=(s&&s.prev)||(ls[0]&&ls[0].p)||1;
 var cum={xl:0,l:0,m:0,s:0},arr=[],prevP=pre,i;
 for(i=0;i<ls.length;i++){
  var it=ls[i],p=it.p||prevP,v=it.v||0;
  var amt=v*100*p;
  var dir=p>=prevP?1:-1;
  var j=(hash((s.si||0)*97+i*13+7)-0.5)*0.16;
  var w0=0.35+j,w1=0.30-j,w2=0.20+j*0.5,w3=0.15;
  var sum=w0+w1+w2+w3;
  cum.xl+=dir*amt*w0/sum;
  cum.l +=dir*amt*w1/sum;
  cum.m +=dir*amt*w2/sum;
  cum.s +=dir*amt*w3/sum;
  arr.push({t:(it.m!=null?it.m:i),xl:cum.xl,l:cum.l,m:cum.m,s:cum.s});
  prevP=p;
 }
 return arr;
}

function drawTrend(s){
 var c=$('cv'); if(!c||!s) return;
 var r=c.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2);
 var w=r.width||320,h=230;
 var W=Math.round(w*d),H=Math.round(h*d);
 if(c.width!==W||c.height!==H){c.width=W;c.height=H;}
 c.style.height=h+'px';
 var x=c.getContext('2d'); if(!x) return;
 x.setTransform(d,0,0,d,0,0); x.clearRect(0,0,w,h);
 var ls=s.hist||[];
 if(ls.length<2){x.fillStyle='#7d8b9c';x.font='12px sans-serif';x.fillText('等待行情…',12,30);return;}
 var pre=s.prev||ls[0].p||1;
 var hi=s.high||pre,lo=s.low||pre;
 if(hi<pre)hi=pre; if(lo>pre)lo=pre;
 var dev=Math.max(hi-pre,pre-lo); if(dev<pre*0.005)dev=pre*0.005;
 var mx=pre+dev,mn=pre-dev;
 var L=4,Rr=w-46,T=12,PH=h*0.62,VY=T+PH+10,VH=h-VY-14;
 var X=function(i){var mm=ls[i].m!=null?ls[i].m:i;return L+(Rr-L)*mm/240;};
 var Y=function(p){return T+PH-(p-mn)/(mx-mn)*PH;};
 var i;
 x.strokeStyle='#1a2432'; x.lineWidth=1;
 for(i=0;i<=4;i++){var y=T+PH*i/4;x.beginPath();x.moveTo(L,y);x.lineTo(Rr,y);x.stroke();}
 x.setLineDash([3,3]); x.strokeStyle='#4a5868';
 x.beginPath();x.moveTo(L,Y(pre));x.lineTo(Rr,Y(pre));x.stroke();
 x.setLineDash([]);
 var vmax=1;
 for(i=0;i<ls.length;i++){if((ls[i].v||0)>vmax)vmax=ls[i].v;}
 var bw=Math.max(1,(Rr-L)/240*0.66);
 for(i=0;i<ls.length;i++){
  var v=ls[i].v||0;
  var up=ls[i].p>=(i?ls[i-1].p:pre);
  x.fillStyle=up?'rgba(255,82,82,.62)':'rgba(0,208,156,.62)';
  var vh=v/vmax*VH;
  x.fillRect(X(i)-bw/2,VY+VH-vh,bw,Math.max(1,vh));
 }
 var sp=0,sv=0;
 x.strokeStyle='#e8b339'; x.lineWidth=1; x.beginPath();
 for(i=0;i<ls.length;i++){
  sp+=ls[i].p*(ls[i].v||0); sv+=(ls[i].v||0);
  var ap=sv?sp/sv:ls[i].p;
  if(i)x.lineTo(X(i),Y(ap)); else x.moveTo(X(i),Y(ap));
 }
 x.stroke();
 x.strokeStyle='#e6edf3'; x.lineWidth=1.4; x.beginPath();
 for(i=0;i<ls.length;i++){ if(i)x.lineTo(X(i),Y(ls[i].p)); else x.moveTo(X(i),Y(ls[i].p)); }
 x.stroke();
 x.font='9px sans-serif';
 for(i=0;i<=4;i++){
  var yy=T+PH*i/4;
  var val=mx-(mx-mn)*i/4;
  var pct=(val-pre)/pre*100;
  var col=pct>0.001?'#ff5252':(pct<-0.001?'#00d09c':'#7d8b9c');
  x.textAlign='left'; x.fillStyle='rgba(11,15,20,.85)';
  x.fillRect(w-44,yy-10,42,12);
  x.fillStyle=col; x.fillText(val.toFixed(2),w-42,yy+1);
  x.textAlign='right'; x.fillStyle='rgba(11,15,20,.85)';
  x.fillRect(w-44,yy-10,42,12);
  x.fillStyle=col; x.fillText((pct>0?'+':'')+pct.toFixed(2)+'%',w-3,yy+1);
 }
 x.textAlign='left'; x.fillStyle='#5c6b7a';
 x.fillText('09:30',L,h-3);
 x.textAlign='center'; x.fillText('11:30/13:00',(L+Rr)/2,h-3);
 x.textAlign='right'; x.fillText('15:00',Rr,h-3);
 if(cx>=0){
  var cxx=Math.max(L,Math.min(Rr,cx));
  var cm=Math.round((cxx-L)/(Rr-L)*240);
  var p2=ls[ls.length-1].p;
  for(i=0;i<ls.length;i++){var mm2=(ls[i].m!=null?ls[i].m:i);if(mm2>=cm){p2=ls[i].p;break;}}
  x.strokeStyle='#8899aa'; x.lineWidth=1; x.setLineDash([3,3]);
  x.beginPath();x.moveTo(cxx,T);x.lineTo(cxx,VY+VH);x.stroke();
  x.beginPath();x.moveTo(L,Y(p2));x.lineTo(Rr,Y(p2));x.stroke();
  x.setLineDash([]);
  var pc2=(p2-pre)/pre*100;
  x.font='10px sans-serif'; x.textAlign='left';
  var s1=(typeof fmtTime==='function'?fmtTime(cm):cm)+'  '+p2.toFixed(2)+'  '+(pc2>0?'+':'')+pc2.toFixed(2)+'%';
  var w3=x.measureText(s1).width;
  x.fillStyle='rgba(11,15,20,.9)'; x.fillRect(L+2,T+2,w3+6,13);
  x.fillStyle=pc2>0?'#ff5252':(pc2<0?'#00d09c':'#c9d4e0');
  x.fillText(s1,L+5,T+12);
 }
}

function drawFlow(s){
 var f=ensureCanvas(); if(!f||!s) return;
 var a=calcFlow(s); if(!a.length) return;
 var r=f.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2);
 var w=r.width||300,hh=104;
 var W=Math.round(w*d),H=Math.round(hh*d);
 if(f.width!==W||f.height!==H){f.width=W;f.height=H;}
 f.style.height=hh+'px';
 var x=f.getContext('2d'); if(!x) return;
 x.setTransform(d,0,0,d,0,0); x.clearRect(0,0,w,hh);
 var L=4,Rr=w-46,T=14,B=hh-10,mx=1,i;
 for(i=0;i<a.length;i++){
  var p=a[i];
  if(Math.abs(p.xl)>mx)mx=Math.abs(p.xl);
  if(Math.abs(p.l)>mx)mx=Math.abs(p.l);
  if(Math.abs(p.m)>mx)mx=Math.abs(p.m);
  if(Math.abs(p.s)>mx)mx=Math.abs(p.s);
 }
 var X=function(i){return L+(Rr-L)*(a[i].t||0)/240;};
 var Y=function(v){return T+(B-T)*(0.5-v/(2*mx));};
 x.strokeStyle='#18222e'; x.lineWidth=1;
 for(i=0;i<=4;i++){var gy=T+(B-T)*i/4;x.beginPath();x.moveTo(L,gy);x.lineTo(Rr,gy);x.stroke();}
 x.strokeStyle='#2b3a4c';
 x.beginPath();x.moveTo(L,Y(0));x.lineTo(Rr,Y(0));x.stroke();
 var cols={xl:'#ff5252',l:'#e8b339',m:'#6aa9ff',s:'#00d09c'};
 var ks=['xl','l','m','s'];
 for(var j=0;j<4;j++){
  var k=ks[j];
  x.strokeStyle=cols[k]; x.lineWidth=1.2; x.beginPath();
  for(i=0;i<a.length;i++){ if(i)x.lineTo(X(i),Y(a[i][k])); else x.moveTo(X(i),Y(a[i][k])); }
  x.stroke();
 }
 x.font='9px sans-serif'; x.textAlign='left';
 x.fillStyle='#ff5252'; x.fillText('超大',L,9);
 x.fillStyle='#e8b339'; x.fillText('大',L+30,9);
 x.fillStyle='#6aa9ff'; x.fillText('中',L+46,9);
 x.fillStyle='#00d09c'; x.fillText('小',L+62,9);
 var last=a[a.length-1];
 x.textAlign='right';
 x.fillStyle='#ff5252'; x.fillText((last.xl/1e8).toFixed(2),w-2,Y(last.xl)+3);
 x.fillStyle='#00d09c'; x.fillText((last.s/1e8).toFixed(2),w-2,Y(last.s)+3);
 x.textAlign='left'; x.fillStyle='#5c6b7a';
 x.fillText('资金博弈(亿)',L,9);
}

window.drawTrend=function(s){ drawTrend(s); drawFlow(s); };
window.drawFlow=drawFlow;
window.calcFlow=calcFlow;

(function attach(){
 var c=$('cv'); if(!c||c.__flowT) return;
 c.__flowT=1;
 function pos(e){var t=e.touches&&e.touches[0]; if(!t) return -1; var r=c.getBoundingClientRect(); return t.clientX-r.left;}
 c.addEventListener('touchstart',function(e){ if(e.touches.length!==1)return; if(typeof mode!=='undefined'&&mode!=='t')return; cx=pos(e); if(window.drawTrend)window.drawTrend(getStock(sel)); },{passive:true});
 c.addEventListener('touchmove',function(e){ if(e.touches.length!==1)return; if(typeof mode!=='undefined'&&mode!=='t')return; cx=pos(e); if(window.drawTrend)window.drawTrend(getStock(sel)); },{passive:true});
 c.addEventListener('touchend',function(){ if(cx>=0){cx=-1; if(window.drawTrend)window.drawTrend(getStock(sel));} },{passive:true});
})();
})();
