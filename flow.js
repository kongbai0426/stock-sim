/* flow.js v9 —— 游资/主力驱动行情
   单笔金额封顶 1.2 亿；全市场每天最多发动 3 只；同一只 4 天内不重复；
   已封涨停/跌停时不发动也不放量；推价同时推 lfair，避免被均值回归拉回成锯齿 */
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
  if(M._hotDay!==M.day){M._hotDay=M.day;M._hotN=0}
  var TSEL=sel?getStock(sel):null;
  for(var i=0;i<M.stocks.length;i++){
   var s=M.stocks[i],h=s.hist[s.hist.length-1];
   if(!h)continue;
   if(M.minute<=1||!s._fl)s._fl={xl:0,l:0,m:0,s:0,hist:[]};
   if(M.minute<=1)s._tp=[];
   if(!s._bh||M.minute<=1)s._bh={main:(R()<0.55?1:-1)*(0.08+R()*0.12),hotT:0,hotDir:1,hotQ:0};
   var bh=s._bh;
   var sealed=(s._seal===1||s._seal===-1)||s.price>=s.up||s.price<=s.dn;
   if(sealed)bh.hotT=0;
   var cool=(M.day-(s._hotDay||-99))<4;
   if(!bh.hotT&&!sealed&&!cool&&(M._hotN||0)<3&&R()<(M.minute>=210?0.10:0.012)){
    bh.hotT=2+Math.floor(R()*3);
    bh.hotDir=(bh.main>0?1:-1);
    bh.hotQ=Math.round(Math.min((s.volBase||200)*(3+R()*8),1.2e8/(s.price*100)));
    s._hotDay=M.day;M._hotN=(M._hotN||0)+1;
   }
   var hot=false,hq=0,baseV=h.v||0;
   if(bh.hotT>0&&!sealed){
    bh.hotT--;hot=true;
    hq=Math.round(bh.hotQ*(0.6+R()*0.6));
    s.vol+=hq;h.v=baseV+hq;
   }
   var cash=baseV*100*s.price;
   if(cash>0){
    var oneLot=s.price*100;
    var ticket=TICK>oneLot*1.15?TICK:oneLot*1.15;
    var N=Math.round(cash/ticket);
    if(N<3)N=3;if(N>300)N=300;
    var w=[],wsum=0,n,wt;
    for(n=0;n<N;n++){wt=Math.exp(gauss()*1.15);w.push(wt);wsum+=wt}
    var prev=s.hist.length>1?s.hist[s.hist.length-2].p:s.prev;
    var ret=prev?((s.price-prev)/prev):0;
    var ds=Math.max(-1,Math.min(1,ret*150));
    var tail=(M.minute>=210)?1.4:1;
    var sealK=(s._seal===1)?0.30:0;
    var acc={xl:0,l:0,m:0,s:0};
    for(n=0;n<N;n++){
     var amt=cash*w[n]/wsum;
     var lots=Math.round(amt/s.price/100);
     if(lots<1)lots=1;
     amt=lots*100*s.price;
     var b=amt>=1e6?'xl':amt>=2e5?'l':amt>=4e4?'m':'s';
     var q;
     if(b==='xl')q=0.5+bh.main*1.6*tail+ds*0.05+(R()-0.5)*0.10+sealK;
     else if(b==='l')q=0.5+bh.main*0.9*tail+ds*0.15+(R()-0.5)*0.40+sealK;
     else if(b==='m')q=0.5+ds*0.40+(R()-0.5)*0.25;
     else q=0.5+ds*0.55+(R()-0.5)*0.30;
     if(q<0.03)q=0.03;if(q>0.97)q=0.97;
     acc[b]+=amt*(2*q-1);
     if(s===TSEL){
      var pp=s.price;
      if(q>=0.5){pp=Math.round((s.price+0.01)*100)/100;if(pp>s.up)pp=s.up}
      else{pp=Math.round((s.price-0.01)*100)/100;if(pp<s.dn)pp=s.dn}
      if(!s._tp)s._tp=[];
      s._tp.unshift({m:M.minute,p:pp,q:lots,d:(q>=0.5?1:-1),a:amt});
      if(s._tp.length>60)s._tp.length=60;
     }
    }
    s._fl.xl+=acc.xl;s._fl.l+=acc.l;s._fl.m+=acc.m;s._fl.s+=acc.s;
   }
   if(hot&&!sealed){
    var amt2=hq*100*s.price;
    s._fl.xl+=amt2*(bh.hotDir>0?0.92:-0.92);
    if(s===TSEL){
     var pp2=s.price;
     if(bh.hotDir>0)pp2=Math.min(s.up,s.price+0.01);else pp2=Math.max(s.dn,s.price-0.01);
     if(!s._tp)s._tp=[];
     s._tp.unshift({m:M.minute,p:pp2,q:hq,d:bh.hotDir,a:amt2});
     if(s._tp.length>60)s._tp.length=60;
    }
    var push=bh.hotDir*Math.min(0.006,(0.0015+R()*0.003)*Math.min(2,hq/Math.max(1,(s.volBase||200)*6)));
    s.lf+=push;s.lfair+=push;
    var p2=Math.exp(s.lf);
    if(p2>s.up)p2=s.up;if(p2<s.dn)p2=s.dn;
    s.price=Math.round(p2*100)/100;s.lf=Math.log(s.price);
    if(s.price>s.high)s.high=s.price;
    if(s.price<s.low)s.low=s.price;
    h.p=s.price;
    if(s.price>=s.up)s._seal=1;
    if(window.buildBook)window.buildBook(s);
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
