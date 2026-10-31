/* flow.js v13 —— 每分钟按真实成交量拆 6~12 笔（市值分档）；成交额=量柱=明细=资金 */
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
 function tier(s){
  var cap=(s.price||0)*(s.floatShares||s.shares||10),lo,hi;
  if(cap>=1000){lo=50000;hi=400000}
  else if(cap>=200){lo=20000;hi=150000}
  else if(cap>=50){lo=8000;hi=50000}
  else{lo=3000;hi=20000}
  var mn=(s.price||0)*100;
  if(lo<mn)lo=mn;
  if(hi<lo*1.5)hi=lo*1.8;
  return [lo,hi];
 }
 function gen(s,mt,d){
  var px=s.price||1,tot=mt*100*px,tt=tier(s),avg=(tt[0]+tt[1])/2;
  var n=Math.round(tot/avg);if(n<3)n=3;if(n>12)n=12;
  var ws=[],sum=0,i;
  for(i=0;i<n;i++){var w=0.55+R()*0.9;ws.push(w);sum+=w}
  var total=Math.round(mt*100/100)*100,left=total,arr=[];
  for(i=0;i<n;i++){
   var sh=Math.round(total*ws[i]/sum/100)*100;
   if(i===n-1)sh=left;
   if(sh>left)sh=left;
   if(sh<=0)continue;
   left-=sh;
   var p=Math.round((px+(R()-0.5)*0.02)*100)/100;
   arr.push({m:M.minute,p:p,q:Math.round(sh/100),d:d,a:sh*p,_g:1});
  }
  if(!arr.length)return;
  arr.reverse();
  s._ga=arr.concat(s._ga||[]);
  if(s._ga.length>40)s._ga.length=40;
  s._tp=s._ga.slice();
  for(i=0;i<arr.length;i++)s._fx[bk(arr[i].a)]+=d*arr[i].a;
 }
 function acc(){
  if(typeof M==='undefined'||M.phase!=='open')return;
  for(var i=0;i<M.stocks.length;i++){
   var s=M.stocks[i];
   if(!s._fl)s._fl={xl:0,l:0,m:0,s:0,hist:[]};
   if(s._fd!==M.day){s._fd=M.day;s._fx={xl:0,l:0,m:0,s:0};s._fl.hist=[];s._ga=[];s._vs=s.vol||0;s._vp=s.price;s._vm2=-1}
   if(s._vm2!==M.minute){
    s._vm2=M.minute;
    var mt=Math.max(0,(s.vol||0)-(s._vs||0));s._vs=s.vol||0;
    var h=s.hist&&s.hist[s.hist.length-1];
    if(h)h.v=mt;
    var d=(s.price>=(s._vp||s.price))?1:-1;s._vp=s.price;
    if(mt>0)gen(s,mt,d);
   }
   if(s._ga&&s._ga.length)s._tp=s._ga.slice();
   var F=s._fx,H=s._fl.hist,lt=H[H.length-1];
   s._fl.xl=F.xl;s._fl.l=F.l;s._fl.m=F.m;s._fl.s=F.s;
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
  var L=6,Rr=w-86,T=14,B=hh-10,mx=1;
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
  x.fillStyle='#ff5252';x.fillText((last.xl/1e8).toFixed(2),w-2,Y(last.xl)+3);
  x.fillStyle='#00d09c';x.fillText((last.s/1e8).toFixed(2),w-2,Y(last.s)+3);
 }
 var oldDr=window.dr;
 window.dr=function(){acc();if(oldDr)oldDr();drawFlow(getStock(sel))};
 setInterval(function(){var d=document.getElementById('dt');if(d&&d.classList.contains('on'))drawFlow(getStock(sel))},1000);
})();
