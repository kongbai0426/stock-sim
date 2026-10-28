// 强制买一卖一相邻：价差 0.01，成交价落在盘口
(function(){
 function c2(x){return Math.round(x*100)}
 function f2(c){return c/100}
 var old=window.stepMinute;
 window.stepMinute=function(){
  old();
  for(var i=0;i<M.stocks.length;i++){
   var s=M.stocks[i],ob=s._ob||s.book;
   if(!ob)continue;
   ob.bids=ob.bids.slice().sort(function(a,b){return b.p-a.p});
   ob.asks=ob.asks.slice().sort(function(a,b){return a.p-b.p});
   var guard=0;
   while(ob.bids.length&&ob.asks.length&&c2(ob.bids[0].p)>=c2(ob.asks[0].p)&&guard++<20){
    var b=ob.bids[0],a=ob.asks[0],take=Math.min(b.q,a.q);
    b.q-=take;a.q-=take;
    s.price=a.p;
    if(b.q<=0)ob.bids.shift();
    if(a.q<=0)ob.asks.shift();
   }
   var base=c2(s.price);
   if(!ob.bids.length||c2(ob.bids[0].p)<=base-2)ob.bids.unshift({p:f2(base-1),q:5000});
   if(!ob.asks.length||c2(ob.asks[0].p)>=base+2)ob.asks.unshift({p:f2(base+1),q:5000});
   ob.bids=ob.bids.filter(function(l){return c2(l.p)>=c2(s.dn)}).slice(0,8);
   ob.asks=ob.asks.filter(function(l){return c2(l.p)<=c2(s.up)}).slice(0,8);
   s.book=ob;
  }
 };
})();
