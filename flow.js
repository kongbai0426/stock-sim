// 资金博弈：逐笔按金额分档，累计净流入
(function(){
 function R(){return Math.random()}
 var cv=document.getElementById('cv');
 if(cv&&!document.getElementById('fcv')){
  var f=document.createElement('canvas');
  f.id='fcv';
  f.style.cssText='display:block;width:100%;height:104px;margin-top:2px';
  cv.parentNode.insertBefore(f,cv.nextSibling);
 }
 var oldStep=window.stepMinute;
 window.stepMinute=function(){
  oldStep();
  for(var i=0;i<M.stocks.length;i++){
   var s=M.stocks[i],h=s.hist[s.hist.length-1];
   if(!h)continue;
   if(M.minute<=1||!s._fl)s._fl={xl:0,l:0,m:0,s:0,hist:[]};
   var prev=s.hist.length>1?s.hist[s.hist.length-2].p:s.prev;
   var shares=(h.v||0)*100;
   if(shares>0){
    var k=Math.max(1,Math.min(8,Math.round(shares/8000)));
    var dirBase=(s.price>=prev?1:-1);
    for(var j=0;j<k;j++){
     var sz=shares*(0.3+R()*1.2)/k;
     var amt=sz*s.price;
     var dir=dirBase*(R()<0.7?1:-1);
     var b=amt>=1e6?'xl':amt>=2e5?'l':amt>=4e4?'m':'s';
     s._fl[b]+=dir*amt;
    }
   }
   s._fl.hist.push({xl:s._fl.xl,l:s._fl.l,m:s._fl.m,s:s._fl.s});
   if(s._fl.hist.length>240)s._fl.hist.shift();
  }
 };
 function drawFlow(s){
  var c=document.getElementById('fcv');if(!c||!s||!s._fl)return;
  var r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=r.width,hh=104;
  c.width=w*d;c.height=hh*d;c.style.height=hh+'px';
  var x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,hh);
  var a=s._fl.hist;
  if(!a.length)return;
  var L=6,Rr=w-54,T=12,B=hh-12;
  var mx=1;
  a.forEach(function(p){['xl','l','m','s'].forEach(function(k){if(Math.abs(p[k])>mx)mx=Math.abs(p[k])})});
  function Y(v){return T+(B-T)*(0.5-v/(2*mx))}
  function X(i){return L+(Rr-L)*i/Math.max(1,a.length-1)}
  x.strokeStyle='#1e2937';x.beginPath();x.moveTo(L,Y(0));x.lineTo(Rr,Y(0));x.stroke();
  var cols={xl:'#ff5252',l:'#e8b339',m:'#6aa9ff',s:'#00d09c'};
  ['xl','l','m','s'].forEach(function(k){
   x.strokeStyle=cols[k];x.lineWidth=1;x.beginPath();
   a.forEach(function(p,i){var yy=Y(p[k]);i?x.lineTo(X(i),yy):x.moveTo(X(i),yy)});
   x.stroke();
  });
  x.font='9px sans-serif';x.textAlign='left';
  x.fillStyle='#ff5252';x.fillText('超大',L,10);
  x.fillStyle='#e8b339';x.fillText('大',L+30,10);
  x.fillStyle='#6aa9ff';x.fillText('中',L+48,10);
  x.fillStyle='#00d09c';x.fillText('小',L+66,10);
  var last=a[a.length-1];
  x.textAlign='right';
  x.fillStyle='#ff5252';x.fillText((last.xl/1e8).toFixed(2),w-2,Y(last.xl)+3);
  x.fillStyle='#00d09c';x.fillText((last.s/1e8).toFixed(2),w-2,Y(last.s)+3);
 }
 var oldDr=window.dr;
 window.dr=function(){
  oldDr();
  drawFlow(getStock(sel));
 };
 setInterval(function(){if(document.getElementById('dt').classList.contains('on'))drawFlow(getStock(sel))},1000);
})();
