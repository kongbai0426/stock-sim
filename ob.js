/* ob.js —— 订单驱动撮合（替代 book.js + spread.js）
   每分钟按 主力/游资/散户 的主动买卖量吃盘口；卖盘吃光 → 价格逐档上移 → 顶到涨停 →
   剩余买单进入封单；封单被砸光则开板。盘口每分钟按深度模型补单，越靠近涨跌停越薄。 */
(function(){
 function R(){return Math.random()}
 function c2(x){return Math.round(x*100)}
 function f2(c){return c/100}
 function cl(s,p){return f2(Math.max(c2(s.dn),Math.min(c2(s.up),c2(p))))}
 function dep(s){
  var b=(s.volBase||200)*100,span=Math.max(1,c2(s.up)-c2(s.dn));
  var up=(c2(s.up)-c2(s.price))/span,dn=(c2(s.price)-c2(s.dn))/span;
  var thin=1-Math.max(up,dn)*0.75;if(thin<0.15)thin=0.15;
  return Math.max(100,Math.round(b*(0.5+R()*0.9)*thin));
 }
 window.buildBook=function(s){
  var b=c2(s.price),bids=[],asks=[],i;
  for(i=1;i<=5;i++){
   bids.push({p:f2(Math.max(c2(s.dn),b-i)),q:dep(s)});
   asks.push({p:f2(Math.min(c2(s.up),b+i)),q:dep(s)});
  }
  if(s._seal===1){asks=[];bids.unshift({p:s.up,q:s._sealQty||0})}
  else if(s._seal===-1){bids=[];asks.unshift({p:s.dn,q:s._sealQty||0})}
  s.book={bids:bids,asks:asks};s._ob=s.book;
 };
 function sweep(s,dir,qty){
  var ob=s.book,left=qty,traded=0,a,take;
  if(dir>0){
   while(left>0){
    if(s._seal===1){s._sealQty=(s._sealQty||0)+left;left=0;break}
    if(!ob.asks.length){s.price=s.up;s._seal=1;s._sealQty=(s._sealQty||0)+left;left=0;break}
    a=ob.asks[0];take=Math.min(left,a.q);
    a.q-=take;left-=take;traded+=take;s.price=cl(s,a.p);
    if(a.q<=0){ob.asks.shift();if(!ob.asks.length&&c2(s.price)<c2(s.up))ob.asks.push({p:f2(c2(s.price)+1),q:dep(s)})}
   }
  }else{
   while(left>0){
    if(s._seal===-1){s._sealQty=(s._sealQty||0)+left;left=0;break}
    if(!ob.bids.length){s.price=s.dn;s._seal=-1;s._sealQty=(s._sealQty||0)+left;left=0;break}
    a=ob.bids[0];take=Math.min(left,a.q);
    a.q-=take;left-=take;traded+=take;s.price=cl(s,a.p);
    if(a.q<=0){ob.bids.shift();if(!ob.bids.length&&c2(s.price)>c2(s.dn))ob.bids.push({p:f2(c2(s.price)-1),q:dep(s)})}
   }
  }
  return traded;
 }
 var old=window.stepMinute;
 window.stepMinute=function(){
  old();
  if(M._obMin===M.minute)return;
  M._obMin=M.minute;
  if(M._obDay!==M.day){M._obDay=M.day;M._obN=0}
  for(var i=0;i<M.stocks.length;i++){
   var s=M.stocks[i],h=s.hist[s.hist.length-1];
   if(!h)continue;
   if(M.minute<=1){s._seal=0;s._sealQty=0}
   if(!s._bh||M.minute<=1)s._bh={main:(R()<0.55?1:-1)*(0.25+R()*0.55),t:0,dir:1};
   var bh=s._bh;
   var prev=s.hist.length>1?s.hist[s.hist.length-2].p:s.prev;
   var ds=prev?Math.max(-1,Math.min(1,(s.price-prev)/prev*150)):0;
   var base=(s.volBase||200)*100;
   var retail=base*(0.30+R()*0.80);
   var mainQ=base*bh.main*0.9;
   var hot=0,canHot=(s._seal!==1&&s._seal!==-1&&(M._obN||0)<4);
   if(bh.t>0){bh.t--;hot=base*bh.dir*(3+R()*6)}
   else if(canHot&&R()<(M.minute>=205?0.06:0.008)){
    bh.t=2+Math.floor(R()*3);bh.dir=(bh.main>0?1:-1);M._obN=(M._obN||0)+1;
    hot=base*bh.dir*(4+R()*8);
   }
   var buy=retail*(ds>0?1+ds*1.5:1-ds*0.5)+(mainQ>0?mainQ:0)+(hot>0?hot:0);
   var sell=retail*(ds<0?1-ds*1.5:1+ds*0.5)+(mainQ<0?-mainQ:0)+(hot<0?-hot:0);
   var traded=0;
   if(buy>sell)traded=sweep(s,1,Math.round((buy-sell)/100)*100);
   else if(sell>buy)traded=sweep(s,-1,Math.round((sell-buy)/100)*100);
   if(s._seal===1){
    var hit=Math.round(base*(0.15+R()*0.7));
    s._sealQty-=hit;
    if(s._sealQty<=0){s._seal=0;s._sealQty=0;s.price=f2(c2(s.up)-1);traded+=hit}
   }else if(s._seal===-1){
    var hit2=Math.round(base*(0.15+R()*0.7));
    s._sealQty-=hit2;
    if(s._sealQty<=0){s._seal=0;s._sealQty=0;s.price=f2(c2(s.dn)+1);traded+=hit2}
   }
   if(traded>0){s.vol+=traded/100;h.v=(h.v||0)+traded/100}
   if(s.price>s.high)s.high=s.price;
   if(s.price<s.low)s.low=s.price;
   s.lf=Math.log(s.price);
   h.p=s.price;
   window.buildBook(s);
  }
 };
})();
