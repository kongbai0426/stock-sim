// 大单金额：超大单 + 大单的累计净额
(function(){
 function E(id){return document.getElementById(id)}
 var f=E('fcv');
 if(f&&!E('bigCv')){
  var c=document.createElement('canvas');
  c.id='bigCv';
  c.style.cssText='display:block;width:100%;height:62px;margin-top:2px';
  f.parentNode.insertBefore(c,f.nextSibling);
 }
 function draw(s){
  var c=E('bigCv');if(!c||!s||!s._fl)return;
  var r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=r.width,h=62;
  c.width=w*d;c.height=h*d;c.style.height=h+'px';
  var x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,h);
  var a=s._fl.hist;if(!a.length)return;
  var L=6,R=w-54,T=10,B=h-10;
  var mx=1;
  a.forEach(function(p){var v=p.xl+p.l;if(Math.abs(v)>mx)mx=Math.abs(v)});
  function Y(v){return T+(B-T)*(0.5-v/(2*mx))}
  function X(i){return L+(R-L)*i/Math.max(1,a.length-1)}
  x.strokeStyle='#1e2937';x.beginPath();x.moveTo(L,Y(0));x.lineTo(R,Y(0));x.stroke();
  x.strokeStyle='#e8b339';x.lineWidth=1.2;x.beginPath();
  a.forEach(function(p,i){var v=p.xl+p.l,yy=Y(v);i?x.lineTo(X(i),yy):x.moveTo(X(i),yy)});
  x.stroke();
  var last=a[a.length-1],val=(last.xl+last.l)/1e8;
  x.fillStyle='#e8b339';x.font='9px sans-serif';x.textAlign='left';x.fillText('大单金额',L,9);
  x.textAlign='right';x.fillText((val>0?'+':'')+val.toFixed(2)+'亿',w-2,9);
 }
 var oldDr=window.dr;
 window.dr=function(){oldDr();draw(getStock(sel))};
 setInterval(function(){
  if(E('dt')&&E('dt').classList.contains('on'))draw(getStock(sel));
 },1000);
})();
