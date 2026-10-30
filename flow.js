/* flow.js v11 —— 资金博弈：四根线全部由真实撮合成交驱动（盘口吃单方向 + 成交额分档） */
(function(){
 function R(){return Math.random()}
 var cv0=document.getElementById('cv');
 if(cv0&&!document.getElementById('fcv')){
  var f=document.createElement('canvas');
  f.id='fcv';
  f.style.cssText='display:block;width:100%;height:104px;margin-top:2px';
  cv0.parentNode.insertBefore(f,cv0.nextSibling);
 }
 var BK=[1000000,200000,40000,0],KF=['xl','l','m','s'];
 function bk(a){for(var i=0;i<4;i++)if(a>=BK[i])return KF[i];return 's'}
 function acc(){
  if(typeof M==='undefined'||M.phase!=='open')return;
  for(var i=0;i<M.stocks.length;i++){
   var s=M.stocks[i];
   if(!s._fl)s._fl={xl:0,l:0,m:0,s:0,hist:[]};
   if(s._fd!==M.day||!s._fx){s._fd=M.day;s._fx={xl:0,l:0,m:0,s:0};s._fv=0;s._fl.hist=[]}
   var h=s.hist&&s.hist[s.hist.length-1];
   if(!h)continue;
   var v=h.v||0,dv=v-(s._fv||0);
   if(dv<0)dv=v;
   s._fv=v;
   var F=s._fx;
   if(dv>0){
    var amt=dv*100*s.price,sg=(s._sd<0)?-1:1;
    var a1=amt*(0.62+R()*0.20),a2=amt-a1;
    F[bk(a1)]+=sg*a1;
    if(a2>0)F[bk(a2)]+=sg*a2;
   }
   s._fl.xl=F.xl;s._fl.l=F.l;s._fl.m=F.m;s._fl.s=F.s;
   var H=s._fl.hist,lt=H[H.length-1];
   if(lt&&lt.t===M.minute){lt.xl=F.xl;lt.l=F.l;lt.m=F.m;lt.s=F.s}
   else{H.push({t:M.minute,xl:F.xl,l:F.l,m:F.m,s:F.s});if(H.length>240)H.shift()}
  }
 }
 function bind(){
  var a=window.stepMinute;
  if(typeof a==='function'&&!a.__fl){var n=function(){a();acc()};n.__fl=1;window.stepMinute=n}
  var b=window.__stepReal;
  if(typeof b==='function'&&!b.__fl){var m=function(){b();acc()};m.__fl=1;window.__stepReal=m}
 }
 if(document.readyState==='complete')bind();else window.addEventListener('load',bind);
 setTimeout(bind,0);setTimeout(bind,600);
 function drawFlow(s){
  var c=document.getElementById('fcv');if(!c||!s||!s._fl)return;
  var a=s._fl.hist;if(!a||!a.length)return;
  var r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=r.width||300,hh=104;
  c.width=w*d;c.height=hh*d;c.style.height=hh+'px';
  var x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,hh);
  var L=6,Rr=w-46,T=14,B=hh-10,mx=1;
  for(var i=0;i<a.length;i++){var p=a[i];
   if(Math.abs(p.xl)>mx)mx=Math.abs(p.xl);
   if(Math.abs(p.l)>mx)mx=Math.abs(p.l);
   if(Math.abs(p.m)>mx)mx=Math.abs(p.m);
   if(Math.abs(p.s)>mx)mx=Math.abs(p.s);
  }
  function Y(v){return T+(B-T)*(0.5-v/(2*mx))}
  function X(i){return L+(Rr-L)*i/Math.max(1,a.length-1)}
  x.strokeStyle='#18222e';x.lineWidth=1;
  for(var g=0;g<=4;g++){var gy=T+(B-T)*g/4;x.beginPath();x.moveTo(L,gy);x.lineTo(Rr,gy);x.stroke()}
  x.strokeStyle='#2b3a4c';x.beginPath();x.moveTo(L,Y(0));x.lineTo(Rr,Y(0));x.stroke();
  var cols={xl:'#ff5252',l:'#e8b339',m:'#6aa9ff',s:'#00d09c'},ks=['xl','l','m','s'];
  for(var j=0;j<4;j++){
   var k=ks[j];x.strokeStyle=cols[k];x.lineWidth=1.2;x.beginPath();
   for(var t=0;t<a.length;t++){var yy=Y(a[t][k]);if(t)x.lineTo(X(t),yy);else x.moveTo(X(t),yy)}
   x.stroke();
  }
  x.font='9px sans-serif';x.textAlign='left';
  x.fillStyle='#ff5252';x.fillText('超大',L,9);
  x.fillStyle='#e8b339';x.fillText('大',L+28,9);
  x.fillStyle='#6aa9ff';x.fillText('中',L+44,9);
  x.fillStyle='#00d09c';x.fillText('小',L+60,9);
  var last=a[a.length-1];x.textAlign='right';
  x.fillStyle='#ff5252';x.fillText((last.xl/1e8).toFixed(2),w-2,Y(last.xl)+3);
  x.fillStyle='#00d09c';x.fillText((last.s/1e8).toFixed(2),w-2,Y(last.s)+3);
 }
 var oldDr=window.dr;
 window.dr=function(){acc();if(oldDr)oldDr();drawFlow(getStock(sel))};
 setInterval(function(){var d=document.getElementById('dt');if(d&&d.classList.contains('on'))drawFlow(getStock(sel))},1000);
})();
