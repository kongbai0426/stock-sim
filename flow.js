/* flow.js v36 —— 量成簇 + 不再截成一样高 */
(function(){
 function R(){return Math.random()}
 var cx=-1;
 var cv0=document.getElementById('cv');
 if(cv0&&!document.getElementById('fcv')){
  var f=document.createElement('canvas');
  f.id='fcv';
  f.style.cssText='display:block;width:100%;height:104px;margin-top:2px';
  cv0.parentNode.insertBefore(f,cv0.nextSibling);
 }
 var BK=[1000000,200000,40000,0],KF=['xl','l','m','s'];
 function bk(a){for(var i=0;i<4;i++)if(a>=BK[i])return KF[i];return 's'}
 function pushT(s,px,q,dir,m0){
  if(!s._tp)s._tp=[];
  s._tp.unshift({m:m0,p:px,q:q,d:dir,a:q*100*px});
  if(s._tp.length>60)s._tp.length=60;
 }
 function acc(){
  if(typeof M==='undefined'||M.phase!=='open')return;
  for(var i=0;i<M.stocks.length;i++){
   var s=M.stocks[i];
   if(!s._fl)s._fl={xl:0,l:0,m:0,s:0,hist:[]};
   if(s._fd!==M.day){
    s._fd=M.day;s._fx={xl:0,l:0,m:0,s:0};s._ga=[];
    s._vv=0;s._va=0;s._vm2=-1;s._macc=0;s._lp=s.price;
    s._mhi=s.price;s._mlo=s.price;s._vt=Math.pow(R(),2.2);s._tp=[];
    s._act=1;s._actc=0;s._actm=-1;
   }
   var h=s.hist&&s.hist[s.hist.length-1];
   if(!h)continue;
   var px=s.price||1;
   if(px>s._mhi)s._mhi=px;
   if(px<s._mlo)s._mlo=px;
   if(s._vm2!==M.minute){
    s._vm2=M.minute;s._macc=0;s._mhi=px;s._mlo=px;
    s._vt=Math.pow(R(),2.2);
   }
   var vb=s.volBase||1000;
   if(s._actm!==M.minute){
    s._actm=M.minute;
    if(!s._actc||s._actc<=0){s._actc=3+Math.floor(R()*7);s._act=0.35+Math.pow(R(),1.7)*2.2;}
    s._actc--;
   }
   var amp=s._mlo>0?(s._mhi-s._mlo)/s._mlo:0;
   var prof=1+1.15*Math.exp(-M.minute/22)+0.55*Math.exp(-(240-M.minute)/22);
   var tail=Math.pow(R(),2.0);
   var vMin=vb*prof*(0.06+s._act*tail*(0.5+Math.min(amp*900,2.6))*(0.7+R()*0.6));
   var vSec=vMin/60;
   if(vSec<0.2)vSec=0.2;
   var dir=(px>=(s._lp||px))?1:-1;
   s._macc+=vSec;
   s._vv+=vSec;
   s._va+=vSec*100*px;
   h.v=Math.max(1,Math.round(s._macc));
   s.vol=Math.round(s._vv);
   s.amount=Math.round(s._va);
   s._lp=px;
   if(s.code===sel){
    var n=1+(R()<0.55?1:0)+(R()<0.18?1:0);
    var per=Math.max(1,Math.round(vSec*100/n));
    for(var k=0;k<n;k++){
     var qq=Math.max(1,Math.round(per/100));
     pushT(s,Math.round(px*100)/100,qq,dir,M.minute);
     s._fx[bk(qq*100*px)]+=dir*(qq*100*px);
    }
   }
  }
 }
 function myTrend(s){
  var c=document.getElementById('cv');if(!c||!s)return;
  var r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=r.width||320,h=230;
  var W=Math.round(w*d),H2=Math.round(h*d);
  if(c.width!==W||c.height!==H2){c.width=W;c.height=H2;}
  c.style.height=h+'px';
  var x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,h);
  var ls=s.hist||[];
  if(ls.length<2){x.fillStyle='#7d8b9c';x.font='12px sans-serif';x.fillText('等待行情…',12,30);return}
  var pre=s.prev||ls[0].p||1,hi=s.high||pre,lo=s.low||pre;
  if(hi<pre)hi=pre;
  if(lo>pre)lo=pre;
  var dev=Math.max(hi-pre,pre-lo);
  if(dev<pre*0.005)dev=pre*0.005;
  var mx=pre+dev,mn=pre-dev;
  var L=4,Rr=w-2,T=12,PH=h*0.6,VY=T+PH+10,VH=h-VY-14;
  function X(i){var mm=ls[i].m!=null?ls[i].m:i;return L+(Rr-L)*mm/240}
  function Y(p){return T+PH-(p-mn)/(mx-mn)*PH}
  for(var i=0;i<=4;i++){
   var y=T+PH*i/4;
   if(i===2)x.setLineDash([3,3]);
   x.strokeStyle=i===2?'#4a5868':(i===0?'#4a2323':(i===4?'#17392f':'#1a2432'));
   x.lineWidth=1;x.beginPath();x.moveTo(L,y);x.lineTo(Rr,y);x.stroke();
   if(i===2)x.setLineDash([]);
   if(i===0||i===2||i===4){
    var val=mx-(mx-mn)*i/4,pct=(val-pre)/pre*100;
    var col=pct>0.001?'#ff5252':(pct<-0.001?'#00d09c':'#8b98a8');
    var t1=val.toFixed(2),t2=(pct>0?'+':'')+pct.toFixed(2)+'%';
    x.font='10px sans-serif';
    x.textAlign='left';var w1=x.measureText(t1).width;
    x.fillStyle='rgba(11,15,20,.85)';x.fillRect(L,y-10,w1+4,12);
    x.fillStyle=col;x.fillText(t1,L+1,y+2);
    x.textAlign='right';var w2=x.measureText(t2).width;
    x.fillStyle='rgba(11,15,20,.85)';x.fillRect(w-4-w2,y-10,w2+4,12);
    x.fillStyle=col;x.fillText(t2,w-2,y+2);
   }
  }
  var _va=ls.map(function(v){return v.v||0}).sort(function(a,b){return a-b});
  var vmax=Math.max(1,_va[Math.floor(_va.length*0.98)]||1);
  var bw=(Rr-L)/240*0.62;
  if(bw<1)bw=1;
  ls.forEach(function(v,i){x.fillStyle=(v.p>=(i?ls[i-1].p:pre))?'rgba(255,82,82,.62)':'rgba(0,208,156,.62)';var vh=Math.min(v.v,vmax)/vmax*VH;x.fillRect(X(i)-bw/2,VY+VH-vh,bw,Math.max(1,vh))});
  var sp=0,sv=0,avg=[];
  ls.forEach(function(v){sp+=v.p*v.v;sv+=v.v;avg.push(sv?sp/sv:v.p)});
  x.strokeStyle='#e8b339';x.lineWidth=1;x.beginPath();
  avg.forEach(function(p,i){var yy=Y(p);i?x.lineTo(X(i),yy):x.moveTo(X(i),yy)});x.stroke();
  x.strokeStyle='#e6edf3';x.lineWidth=1.4;x.beginPath();
  ls.forEach(function(v,i){var yy=Y(v.p);i?x.lineTo(X(i),yy):x.moveTo(X(i),yy)});x.stroke();
  var last=ls[ls.length-1];
  x.fillStyle='#e6edf3';x.beginPath();x.arc(X(ls.length-1),Y(last.p),2.5,0,6.283);x.fill();
  x.font='9px sans-serif';x.fillStyle='#5c6b7a';
  var tl=[0,120,240];
  for(var g2=0;g2<3;g2++){
   var mm3=tl[g2],xx=L+(Rr-L)*mm3/240;
   var ss=(typeof fmtTime==='function'?fmtTime(mm3):'');
   if(g2===0){x.textAlign='left';x.fillText(ss,L,h-3);}
   else if(g2===2){x.textAlign='right';x.fillText(ss,Rr,h-3);}
   else{x.textAlign='center';x.fillText(ss,xx,h-3);}
  }
  if(cx>=0){
   var cxx=Math.max(L,Math.min(Rr,cx));
   var cm=Math.max(0,Math.min(240,Math.round((cxx-L)/(Rr-L)*240)));
   var p2=null,i2,mm2;
   for(i2=0;i2<ls.length;i2++){mm2=(ls[i2].m!=null?ls[i2].m:i2);if(mm2>=cm){p2=ls[i2].p;break}}
   if(p2==null)p2=ls[ls.length-1].p;
   x.strokeStyle='#8899aa';x.lineWidth=1;x.setLineDash([3,3]);
   x.beginPath();x.moveTo(cxx,T);x.lineTo(cxx,VY+VH);x.stroke();
   x.beginPath();x.moveTo(L,Y(p2));x.lineTo(Rr,Y(p2));x.stroke();
   x.setLineDash([]);
   var pc2=(p2-pre)/pre*100;
   x.font='10px sans-serif';x.textAlign='left';
   var s1=(typeof fmtTime==='function'?fmtTime(cm):cm+'')+'  '+p2.toFixed(2)+'  '+(pc2>0?'+':'')+pc2.toFixed(2)+'%';
   var w3=x.measureText(s1).width;
   x.fillStyle='rgba(11,15,20,.88)';x.fillRect(L+2,T+2,w3+6,13);
   x.fillStyle=pc2>0?'#ff5252':(pc2<0?'#00d09c':'#c9d4e0');
   x.fillText(s1,L+5,T+12);
  }
 }
 function drawFlow(s){
  var c=document.getElementById('fcv');if(!c||!s||!s._fl)return;
  var a=s._fl.hist;if(!a||!a.length)return;
  var r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=r.width||300,hh=104;
  var W=Math.round(w*d),H2=Math.round(hh*d);
  if(c.width!==W||c.height!==H2){c.width=W;c.height=H2;}
  c.style.height=hh+'px';
  var x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,hh);
  var L=4,Rr=w-2,T=14,B=hh-10,mx=1;
  for(var i=0;i<a.length;i++){var p=a[i];
   if(Math.abs(p.xl)>mx)mx=Math.abs(p.xl);
   if(Math.abs(p.l)>mx)mx=Math.abs(p.l);
   if(Math.abs(p.m)>mx)mx=Math.abs(p.m);
   if(Math.abs(p.s)>mx)mx=Math.abs(p.s);
  }
  function Y(v){return T+(B-T)*(0.5-v/(2*mx))}
  function X(i){var t=a[i].t||0;return L+(Rr-L)*t/240}
  x.strokeStyle='#18222e';x.lineWidth=1;
  for(var g=0;g<=4;g++){var gy=T+(B-T)*g/4;x.beginPath();x.moveTo(L,gy);x.lineTo(Rr,gy);x.stroke()}
  x.strokeStyle='#2b3a4c';x.beginPath();x.moveTo(L,Y(0));x.lineTo(Rr,Y(0));x.stroke();
  var cols={xl:'#ff5252',l:'#e8b339',m:'#6aa9ff',s:'#00d09c'},ks=['xl','l','m','s'];
  for(var j=0;j<4;j++){
   var k=ks[j];x.strokeStyle=cols[k];x.lineWidth=1.2;x.beginPath();
   for(var t2=0;t2<a.length;t2++){var yy=Y(a[t2][k]);if(t2)x.lineTo(X(t2),yy);else x.moveTo(X(t2),yy)}
   x.stroke();
  }
  x.font='9px sans-serif';x.textAlign='left';
  x.fillStyle='#ff5252';x.fillText('超大',L,9);
  x.fillStyle='#e8b339';x.fillText('大',L+28,9);
  x.fillStyle='#6aa9ff';x.fillText('中',L+44,9);
  x.fillStyle='#00d09c';x.fillText('小',L+60,9);
  var last=a[a.length-1];x.textAlign='right';
  x.fillStyle='#ff5252';x.fillText((last.xl/1e8).toFixed(2),w-1,Y(last.xl)+3);
  x.fillStyle='#00d09c';x.fillText((last.s/1e8).toFixed(2),w-1,Y(last.s)+3);
 }
 window.__flowStep=acc;
 window.drawTrend=myTrend;
 setInterval(function(){if(window.drawTrend!==myTrend)window.drawTrend=myTrend},1000);
 var oldDr=window.dr;
 window.dr=function(){
  if(oldDr)oldDr();
  var s=getStock(sel);
  if(!s)return;
  if(typeof mode==='undefined'||mode==='t')myTrend(s);
  drawFlow(s);
 };
 setInterval(acc,1000);
 (function attach(){
  var c=document.getElementById('cv');if(!c||c.__cx)return;
  c.__cx=1;
  function on(e){if(typeof mode!=='undefined'&&mode!=='t')return;var t=e.touches&&e.touches[0];if(!t)return;var r=c.getBoundingClientRect();cx=t.clientX-r.left;myTrend(getStock(sel));}
  c.addEventListener('touchstart',function(e){if(e.touches.length===1)on(e)},{passive:true});
  c.addEventListener('touchmove',function(e){if(cx>=0&&e.touches.length===1)on(e)},{passive:true});
  c.addEventListener('touchend',function(){if(cx>=0){cx=-1;myTrend(getStock(sel))}},{passive:true});
  c.addEventListener('touchcancel',function(){if(cx>=0){cx=-1;myTrend(getStock(sel))}},{passive:true});
 })();
})();
