// 持久订单簿：同价对冲、逐档吃穿、封单
(function(){
 function R(){return Math.random()}
 function r2(x){return Math.round(x*100)/100}
 function ensure(s){
  if(s._ob)return s._ob;
  var b=[],a=[],sp=Math.max(0.01,r2(s.price*0.0006));
  for(var i=0;i<5;i++){
   b.push({p:r2(s.price-sp*(i+1)),q:100*Math.round(2+R()*20)});
   a.push({p:r2(s.price+sp*(i+1)),q:100*Math.round(2+R()*20)});
  }
  s._ob={bids:b,asks:a};s.book=s._ob;return s._ob;
 }
 function add(s,side,p,q){
  var ob=ensure(s),arr=side==='buy'?ob.bids:ob.asks;
  for(var i=0;i<arr.length;i++)if(Math.abs(arr[i].p-p)<0.005){arr[i].q+=q;return}
  arr.push({p:p,q:q});
  arr.sort(side==='buy'?function(x,y){return y.p-x.p}:function(x,y){return x.p-y.p});
  if(arr.length>10)arr.length=10;
 }
 window.buildBook=function(s){
  var ob=ensure(s),sp=Math.max(0.01,r2(s.price*0.0006));
  ob.bids=ob.bids.filter(function(l){return l.p<s.price-0.001});
  ob.asks=ob.asks.filter(function(l){return l.p>s.price+0.001});
  while(ob.bids.length<5){ob.bids.push({p:r2(s.price-sp*(ob.bids.length+1)),q:100*Math.round(2+R()*20)})}
  while(ob.asks.length<5){ob.asks.push({p:r2(s.price+sp*(ob.asks.length+1)),q:100*Math.round(2+R()*20)})}
  ob.bids.sort(function(x,y){return y.p-x.p});
  ob.asks.sort(function(x,y){return x.p-y.p});
  ob.bids.forEach(function(l){l.q=Math.max(100,l.q+Math.round((R()-0.5)*l.q*0.06/100)*100)});
  ob.asks.forEach(function(l){l.q=Math.max(100,l.q+Math.round((R()-0.5)*l.q*0.06/100)*100)});
  s.book=ob;
 };
 function fillUsers(s,side,price,take){
  var need=take;
  for(var i=0;i<ACC.orders.length&&need>0;i++){
   var o=ACC.orders[i];
   if(o.status!=='pending'||o.code!==s.code||!o._restQ)continue;
   if(Math.abs(o.price-price)>0.005)continue;
   if((side==='buy'&&o.side!=='sell')||(side==='sell'&&o.side!=='buy'))continue;
   var can=Math.min(need,o.qty-o.filled,o._restQ);
   if(can<=0)continue;
   o._restQ-=can;need-=can;
   fill(o,price,can);
  }
 }
 function consume(s,side,qty){
  var ob=ensure(s),left=qty,arr=side==='buy'?ob.asks:ob.bids;
  while(left>0&&arr.length){
   var l=arr[0],take=Math.min(left,l.q);
   l.q-=take;left-=take;
   fillUsers(s,side,l.p,take);
   s.price=l.p;
   if(l.q<=0)arr.shift();
  }
  return qty-left;
 }
 window.matchAll=function(){
  for(var i=0;i<ACC.orders.length;i++){
   var o=ACC.orders[i];
   if(o.status!=='pending')continue;
   var s=getStock(o.code);if(!s)continue;
   var ob=ensure(s),rem=o.qty-o.filled;
   if(rem<=0)continue;
   if(o.side==='buy'){
    while(rem>0&&ob.asks.length&&ob.asks[0].p<=o.price+0.001){
     var l=ob.asks[0],take=Math.min(rem,l.q);
     l.q-=take;rem-=take;o._restQ=0;
     fill(o,l.p,take);
     if(l.q<=0)ob.asks.shift();
    }
    if(rem>0){add(s,'buy',o.price,rem);o._restQ=rem}
   }else{
    while(rem>0&&ob.bids.length&&ob.bids[0].p>=o.price-0.001){
     var l2=ob.bids[0],take2=Math.min(rem,l2.q);
     l2.q-=take2;rem-=take2;o._restQ=0;
     fill(o,l2.p,take2);
     if(l2.q<=0)ob.bids.shift();
    }
    if(rem>0){add(s,'sell',o.price,rem);o._restQ=rem}
   }
  }
 };
 var oldStep=window.stepMinute;
 window.stepMinute=function(){
  oldStep();
  for(var i=0;i<M.stocks.length;i++){
   var s=M.stocks[i],ob=ensure(s);
   var side=R()<0.5?'buy':'sell';
   consume(s,side,100*Math.round(1+R()*6));
   var sp=Math.max(0.01,r2(s.price*0.0006));
   if(R()<0.7)add(s,'buy',r2(s.price-sp),100*Math.round(1+R()*5));
   if(R()<0.7)add(s,'sell',r2(s.price+sp),100*Math.round(1+R()*5));
   if(ob.bids.length&&ob.bids[0].p>=s.up-0.001&&ob.bids[0].q>0){s.price=s.up;if(s.high<s.up)s.high=s.up}
   if(ob.asks.length&&ob.asks[0].p<=s.dn+0.001&&ob.asks[0].q>0){s.price=s.dn;if(s.low>s.dn)s.low=s.dn}
   var h=s.hist[s.hist.length-1];if(h)h.p=s.price;
   s.book=ob;
  }
 };
})();
