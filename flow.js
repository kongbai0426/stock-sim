/* flow.js v5 —— 资金博弈：逐笔金额重尾分布拆单，再按单笔金额分档
   分档：小<4万 中4~20万 大20~100万 超大≥100万
   每分钟：按平均单笔金额估笔数 → 对数正态抽权重 → 归一到当分钟成交额 → 量化成整手 → 分档 */
(function(){
 var TICK=12000;
 var R=function(){return Math.random()};
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
   var cash=(h.v||0)*100*s.price;
   if(cash>0){
    var oneLot=s.price*100;
    var ticket=TICK>oneLot*1.15?TICK:oneLot*1.15;
    var N=Math.round(cash/ticket);
    if(N<3)N=3;if(N>400)N=400;
    var w=[],wsum=0,n,wt;
    for(n=0;n<N;n++){wt=Math.exp(gauss()*1.15);w.push(wt);wsum+=wt}
    var prev=s.hist.length>1?s.hist[s.hist.length-2].p:s.prev;
    var ret=prev?((s.price-prev)/prev):0;
    var bias=Math.max(-0.15,Math.min(0.15,ret*100));
    var acc={xl:0,l:0,m:0,s:0};
    for(n=0;n<N;n++){
     var amt=cash*w[n]/wsum;
     var lots=Math.round(amt/s.price/100);
     if(lots<1)lots=1;
     amt=lots*100*s.price;
     var q=0.5+bias+(R()-0.5)*0.35;
     if(q<0.05)q=0.05;if(q>0.95)q=0.95;
     var b=amt>=1e6?'xl':amt>=2e5?'l':amt>=4e4?'m':'s';
     acc[b]+=amt*(2*q-1);
    }
    s._fl.xl+=acc.xl;s._fl.l+=acc.l;s._fl.m+=acc.m;s._fl.s+=acc.s;
   }
   s._fl.hist.push({xl:s._fl.xl,l:s._fl.l,m:s._fl.m,s:s._fl.s,t:M.minute});
   if(s._fl.hist.length>240)s._fl.hist.shift();
  }
 };
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
