/* flow.js v10 —— 只画资金博弈（数据由 ob.js 写入 s._fl，和价格同源） */
(function(){
 var cv=document.getElementById('cv');
 if(cv&&!document.getElementById('fcv')){
  var f=document.createElement('canvas');
  f.id='fcv';
  f.style.cssText='display:block;width:100%;height:104px;margin-top:2px';
  cv.parentNode.insertBefore(f,cv.nextSibling);
 }
 function drawFlow(s){
  var c=document.getElementById('fcv');if(!c||!s||!s._fl)return;
  var a=s._fl.hist;if(!a.length)return;
  var r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=r.width;
  if(!w)return;
  var hh=104;
  c.width=w*d;c.height=hh*d;c.style.height=hh+'px';
  var x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,hh);
  var L=6,Rr=w-54,T=12,B=hh-12,mx=1,i,k,v;
  var KS=['xl','l','m','s'];
  for(i=0;i<a.length;i++)for(k=0;k<4;k++){v=Math.abs(a[i][KS[k]]);if(v>mx)mx=v}
  function Y(t){return T+(B-T)*(0.5-t/(2*mx))}
  function X(j){return L+(Rr-L)*Math.min(240,(a[j].t!=null?a[j].t:j))/240}
  x.strokeStyle='#1e2937';x.beginPath();x.moveTo(L,Y(0));x.lineTo(Rr,Y(0));x.stroke();
  var cols={xl:'#ff5252',l:'#e8b339',m:'#6aa9ff',s:'#00d09c'};
  for(k=0;k<4;k++){
   var kk=KS[k],yy;x.strokeStyle=cols[kk];x.lineWidth=1;x.beginPath();
   for(i=0;i<a.length;i++){yy=Y(a[i][kk]);i?x.lineTo(X(i),yy):x.moveTo(X(i),yy)}
   x.stroke();
  }
  x.font='9px sans-serif';x.textAlign='left';
  x.fillStyle='#ff5252';x.fillText('超大',L,10);
  x.fillStyle='#e8b339';x.fillText('大',L+30,10);
  x.fillStyle='#6aa9ff';x.fillText('中',L+48,10);
  x.fillStyle='#00d09c';x.fillText('小',L+66,10);
  var last=a[a.length-1];x.textAlign='right';
  x.fillStyle='#ff5252';x.fillText((last.xl/1e8).toFixed(2),w-2,Y(last.xl)+3);
  x.fillStyle='#00d09c';x.fillText((last.s/1e8).toFixed(2),w-2,Y(last.s)+3);
 }
 var oldDr=window.dr;
 window.dr=function(){oldDr();drawFlow(getStock(sel))};
 setInterval(function(){var d=document.getElementById('dt');if(d&&d.classList.contains('on'))drawFlow(getStock(sel))},1000);
})();
