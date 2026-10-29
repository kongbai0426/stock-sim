/* ob.js v3 —— 订单驱动撮合 + 资金流数据源
   同时包住 stepMinute 和 __stepReal，保证「收盘结算快进」时撮合与资金流照样走。 */
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
 function pr(s,px,sh,d){
  if(sel!==s.code)return;
  if(!s._tp)s._tp=[];
  s._tp.unshift({m:M.minute,p:px,q:Math.max(1,Math.round(sh/100)),d:d,a:px*sh});
  if(s._tp.length>60)s._tp.length=60;
 }
 function sweep(s,dir,qty){
  var ob=s.book,left=qty,traded=0,a,take,n=0;
  while(left>0&&n++<200){
   if(dir>0){
    if(s._seal===1){s._sealQty=(s._sealQty||0)+left;left=0;break}
    if(!ob.asks.length){s.price=s.up;s._seal=1;s._sealQty=(s._sealQty||0)+left;left=0;break}
    a=ob.asks[0];take=Math.min(left,a.q);
    a.q-=take;left-=take;traded+=take;s.price=cl(s,a.p);pr(s,a.p,take,1);
    if(a.q<=0){ob.asks.shift();if(!ob.asks.length&&c2(s.price)<c2(s.up))ob.asks.push({p:f2(c2(s.price)+1),q:dep(s)})}
   }else{
    if(s._seal===-1){s._sealQty=(s._sealQty||0)+left;left=0;break}
    if(!ob.bids.length){s.price=s.dn;s._seal=-1;s._sealQty=(s._sealQty||0)+left;left=0;break}
    a=ob.bids[0];take=Math.min(left,a.q);
    a.q-=take;left-=take;traded+=take;s.price=cl(s,a.p);pr(s,a.p,take,-1);
    if(a.q<=0){ob.bids.shift();if(!ob.bids.length&&c2(s.price)>c2(s.dn))ob.bids.push({p:f2(c2(s.price)-1),q:dep(s)})}
   }
  }
  return traded;
 }
 function addBook(s,side,p,q){
  p=cl(s,p);
  var arr=side==='buy'?s.book.bids:s.book.asks,i;
  for(i=0;i<arr.length;i++)if(c2(arr[i].p)===c2(p)){arr[i].q+=q;return}
  arr.push({p:p,q:q});
  arr.sort(side==='buy'?function(x,y){return y.p-x.p}:function(x,y){return x.p-y.p});
 }
 window.matchAll=function(){
  for(var i=0;i<ACC.orders.length;i++){
   var o=ACC.orders[i];
   if(o.status!=='pending')continue;
   var s=getStock(o.code);if(!s||!s.book)continue;
   var rem=o.qty-o.filled,take;
   if(rem<=0)continue;
   if(o.side==='buy'){
    while(rem>0&&s.book.asks.length&&c2(s.book.asks[0].p)<=c2(o.price)){
     var a=s.book.asks[0];take=Math.min(rem,a.q);
     a.q-=take;rem-=take;fill(o,a.p,take);
     s.vol+=take/100;s.price=cl(s,a.p);
     if(a.q<=0)s.book.asks.shift();
    }
    if(rem>0){addBook(s,'buy',o.price,rem);o._restQ=rem}
   }else{
    while(rem>0&&s.book.bids.length&&c2(s.book.bids[0].p)>=c2(o.price)){
     var b=s.book.bids[0];take=Math.min(rem,b.q);
     b.q-=take;rem-=take;fill(o,b.p,take);
     s.vol+=take/100;s.price=cl(s,b.p);
     if(b.q<=0)s.book.bids.shift();
    }
    if(rem>0){addBook(s,'sell',o.price,rem);o._restQ=rem}
   }
  }
 };
 function run(){
  if(M._obMin===M.minute)return;
  M._obMin=M.minute;
  if(M._obDay!==M.day){M._obDay=M.day;M._obN=0}
  for(var i=0;i<M.stocks.length;i++){
   var s=M.stocks[i],h=s.hist[s.hist.length-1];
   if(!h)continue;
   if(M.minute<=1||!s._fl){s._seal=s._seal||0;s._sealQty=s._sealQty||0;s._fl={xl:0,l:0,m:0,s:0,hist:[]};s._tp=[]}
   if(M.minute<=1){s._seal=0;s._sealQty=0}
   if(!s._bh||M.minute<=1)s._bh={main:(R()<0.55?1:-1)*(0.25+R()*0.55),t:0,dir:1};
   var bh=s._bh;
   var prev=s.hist.length>1?s.hist[s.hist.length-2].p:s.prev;
   var ds=prev?Math.max(-1,Math.min(1,(s.price-prev)/prev*150)):0;
   var base=(s.volBase||200)*100;
   var rB=base*(0.30+R()*0.80)*(ds>0?1+ds*1.5:1-ds*0.5);
   var rS=base*(0.30+R()*0.80)*(ds<0?1-ds*1.5:1+ds*0.5);
   var mQ=base*bh.main*0.9;
   var hot=0,canHot=(s._seal!==1&&s._seal!==-1&&(M._obN||0)<4);
   if(bh.t>0){bh.t--;hot=base*bh.dir*(3+R()*6)}
   else if(canHot&&R()<(M.minute>=205?0.06:0.008)){
    bh.t=2+Math.floor(R()*3);bh.dir=(bh.main>0?1:-1);M._obN=(M._obN||0)+1;
    hot=base*bh.dir*(4+R()*8);
   }
   var mB=mQ>0?mQ:0,mS=mQ<0?-mQ:0,hB=hot>0?hot:0,hS=hot<0?-hot:0;
   var buy=mB+hB+rB,sell=mS+hS+rS,traded=0,p0=s.price;
   if(buy>sell)traded=sweep(s,1,Math.round((buy-sell)/100)*100);
   else if(sell>buy)traded=sweep(s,-1,Math.round((sell-buy)/100)*100);
   if(s._seal===1){
    var hit=Math.round(base*(0.15+R()*0.7));s._sealQty-=hit;
    if(s._sealQty<=0){s._seal=0;s._sealQty=0;s.price=f2(c2(s.up)-1);traded+=hit}
   }else if(s._seal===-1){
    var hit2=Math.round(base*(0.15+R()*0.7));s._sealQty-=hit2;
    if(s._sealQty<=0){s._seal=0;s._sealQty=0;s.price=f2(c2(s.dn)+1);traded+=hit2}
   }
   if(traded>0){s.vol+=traded/100;h.v=(h.v||0)+traded/100}
   if(s.price>s.high)s.high=s.price;
   if(s.price<s.low)s.low=s.price;
   s.lf=Math.log(s.price);h.p=s.price;
   var px=(s.price+p0)/2||s.price;
   s._fl.xl+=(mB-mS)*px;
   s._fl.l+=(hB-hS)*px;
   s._fl.m+=(rB*0.35-rS*0.35)*px;
   s._fl.s+=(rB*0.65-rS*0.65)*px;
   s._fl.hist.push({xl:s._fl.xl,l:s._fl.l,m:s._fl.m,s:s._fl.s,t:M.minute});
   if(s._fl.hist.length>240)s._fl.hist.shift();
   window.buildBook(s);
  }
 }
 var old=window.stepMinute,real=window.__stepReal;
 window.stepMinute=function(){old();run()};
 if(real)window.__stepReal=function(){real();run()};
})();
