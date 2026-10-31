/* loop.js v4 —— 唯一时钟 + 涨跌幅闸门 + 指数更新 */
(function(){
 var HEAT_P3=0.030, HEAT_P1=0.010, HEAT_YZ=0.045, HEAT_SEC=0.020, HEAT_SMALL=0.015;
 function gov(){
  if(typeof M==='undefined'||M.phase!=='open')return;
  for(var i=0;i<M.stocks.length;i++){
   var s=M.stocks[i];
   if(!s.hist||!s.hist.length)continue;
   if(s._gDay!==M.day){
    s._gDay=M.day;
    var kl=s.kline||[],upN=0,j;
    for(j=kl.length-1;j>=0&&j>=kl.length-3;j--){var b=kl[j];if(b&&b.c>b.o)upN++;else break}
    var lim=s.prev?(s.up/s.prev-1):0.10;
    var ph=(s._ph!=null?s._ph:(s._mb?s._mb.ph:0));
    var heat=0;
    if(ph===3)heat+=HEAT_P3;
    else if(ph===1)heat+=HEAT_P1;
    if(s._yz&&s._yz.on)heat+=HEAT_YZ;
    if(s._yz&&s._yz.dump>0)heat-=0.020;
    if(M.secMood&&M.secMood[s.si]>0.15)heat+=HEAT_SEC;
    var capF=(s.price||0)*(s.floatShares||s.shares||10);
    if(capF<50)heat+=HEAT_SMALL;
    if(M.secMood&&M.secMood[s.si]>0.20&&capF<100)heat+=0.030;
    if(Math.random()<0.010)heat+=0.030;
    var cap=Math.min(lim*1.05,lim*0.35+heat);
    if(cap<lim*0.12)cap=lim*0.12;
    var beast=(heat>=0.075);
    var k1=beast?1.00:0.85, k2=beast?0.90:0.70, k3=beast?0.80:0.50, k4=beast?0.70:0.30;
    if(upN>=1)cap*=k1;
    if(upN>=2)cap*=k2;
    if(upN>=3)cap*=k3;
    if(upN>=4)cap*=k4;
    var ema=s._gEma||s.prev||s.price;
    if(s.prev)ema=ema*0.9+s.prev*0.1;
    s._gEma=ema;
    var dv=ema&&s.prev?(s.prev/ema-1):0;
    if(dv>0.18)cap=-lim*0.12;
    else if(dv<-0.18)cap=lim*0.12;
    s._gCap=cap;
   }
   var o=s.open||s.prev||s.price;
   if(!o)continue;
   var dr=s.price/o-1,cap=s._gCap;
   var lim2=s.prev?(s.up/s.prev-1):0.10;
   var hi=cap,lo=-Math.max(Math.abs(cap),lim2*0.5);
   var p=null;
   if(dr>hi)p=Math.round(o*(1+hi)*100)/100;
   else if(dr<lo)p=Math.round(o*(1+lo)*100)/100;
   if(p!=null&&p>0){
    s.price=p;s._px=p;s.lf=Math.log(p);
    s._seal=0;s._sealQty=0;
    if(dr>hi){if(s.high>p)s.high=p}
    else{if(s.low<p)s.low=p}
    var h=s.hist[s.hist.length-1];if(h)h.p=p;
   }
  }
 }
 function one(){
  if(window.__clock)window.__clock();
  else if(window.__engineStep)window.__engineStep();
  if(window.__mood)window.__mood();
  if(window.__ob)window.__ob();
  gov();
  if(window.__idxTick)window.__idxTick();
 }
 function realOne(){
  if(window.__engineStep)window.__engineStep();
  if(window.__mood)window.__mood();
  if(window.__ob)window.__ob();
  gov();
  if(window.__idxTick)window.__idxTick();
 }
 window.stepMinute=one;
 window.__stepReal=realOne;
})();
