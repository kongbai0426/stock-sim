/* axis.js v4 —— 分时纵轴锁定 昨收±涨跌停；只标 最高/零轴/最低 三个数值 */
(function(){
 function r2(x){return Math.round(x*100)/100}
 window.drawTrend=function(s){
  var c=document.getElementById('cv');if(!c||!s)return;
  var rc=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=rc.width||320,h=230;
  c.width=w*d;c.height=h*d;c.style.height=h+'px';
  var x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,h);
  var ls=s.hist||[];
  if(ls.length<2){x.fillStyle='#7d8b9c';x.font='12px sans-serif';x.fillText('等待行情…',12,30);return}
  var pre=s.prev||ls[0].p||1;
  var up=s.up||r2(pre*1.1),dn=s.dn||r2(pre*0.9);
  if(up<=pre)up=r2(pre*1.1);
  if(dn>=pre)dn=r2(pre*0.9);
  var mx=up,mn=dn;
  window._ax={pre:pre,up:up,dn:dn,mx:mx,mn:mn};
  var L=6,R=w-86,T=12,PH=h*0.6,VY=T+PH+10,VH=h-VY-12;
  function X(i){var mm=(ls[i]&&ls[i].m!=null)?ls[i].m:i;return L+(R-L)*mm/240}
  function Y(p){return T+PH-(p-mn)/(mx-mn)*PH}
  for(var i=0;i<=4;i++){
   var y=T+PH*i/4;
   x.strokeStyle=i===2?'#2b3a4c':(i===0?'#4a2323':(i===4?'#17392f':'#1a2432'));
   x.lineWidth=1;x.beginPath();x.moveTo(L,y);x.lineTo(R,y);x.stroke();
  }
  function tag(i){
   var y=T+PH*i/4,val=mx-(mx-mn)*i/4,pct=(val-pre)/pre*100;
   var txt=val.toFixed(2)+'  '+(pct>0?'+':'')+pct.toFixed(2)+'%';
   x.font='9px sans-serif';x.textAlign='right';
   x.fillStyle=pct>0.001?'#ff5252':(pct<-0.001?'#00d09c':'#8b98a8');
   x.fillText(txt,w-2,y+3);
  }
  tag(0);tag(2);tag(4);
  var vmax=1;ls.forEach(function(v){if(v.v>vmax)vmax=v.v});
  var bw=Math.max(1,(R-L)/240*0.7);
  ls.forEach(function(v,i){
   x.fillStyle=(v.p>=(i?ls[i-1].p:pre))?'rgba(255,82,82,.5)':'rgba(0,208,156,.5)';
   var vh=Math.min(v.v,vmax)/vmax*VH;
   x.fillRect(X(i)-bw/2,VY+VH-vh,bw,Math.max(1,vh));
  });
  var sp=0,sv=0,avg=[];
  ls.forEach(function(v){sp+=v.p*v.v;sv+=v.v;avg.push(sv?sp/sv:v.p)});
  x.strokeStyle='#e8b339';x.lineWidth=1;x.beginPath();
  for(var a=0;a<avg.length;a++){var yy=Y(avg[a]);a?x.lineTo(X(a),yy):x.moveTo(X(a),yy)}
  x.stroke();
  x.strokeStyle='#e6edf3';x.lineWidth=1.4;x.beginPath();
  for(var b=0;b<ls.length;b++){var y2=Y(ls[b].p);b?x.lineTo(X(b),y2):x.moveTo(X(b),y2)}
  x.stroke();
  var last=ls[ls.length-1];
  x.fillStyle='#e6edf3';x.beginPath();x.arc(X(ls.length-1),Y(last.p),2.5,0,6.283);x.fill();
 };
})();
