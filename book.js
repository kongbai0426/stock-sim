// 持久订单簿 v2：0.01 元固定网格 + 逐档吃穿 + 成交量
(function(){
 function R(){return Math.random()}
 function c2(x){return Math.round(x*100)}
 function f2(c){return c/100}
 function ensure(s){
  if(s._ob)return s._ob;
  var b=c2(s.price),bd=[],ak=[];
  for(var i=1;i<=5;i++){bd.push({p:f2(b-i),q:100*Math.round(2+R()*20)});ak.push({p:f2(b+i),q:100*Math.round(2+R()*20)})}
  s._ob={bids:bd,asks:ak};s.book=s._ob;return s._ob;
 }
 function rebuild(s){
  var ob=ensure(s),b=c2(s.price),bm={},am={};
  ob.bids.forEach(function(l){bm[c2(l.p)]=l.q});
  ob.asks.forEach(function(l){am[c2(l.p)]=l.q});
  var bd=[],ak=[];
  for(var i=1;i<=5;i++){
   bd.push({p:f2(b-i),q:bm[b-i]!=null?bm[b-i]:100*Math.round(2+R()*20)});
   ak.push({p:f2(b+i),q:am[b+i]!=null?am[b+i]:100*Math.round(2+R()*20)});
  }
  bd.forEach(function(l){l.q=Math.max(100,l.q+100*Math.round((R()-0.5)*l.q*0.05/100))});
  ak.forEach(function(l){l.q=Math.max(100,l.q+100*Math.round((R()-0.5)*l.q*0.05/100))});
  ob.bids=bd;ob.asks=ak;s.book=ob;
 }
 window.buildBook=function(s){rebuild(s)};
 function add(s,side,p,q){
  var ob=ensure(s),arr=side==='buy'?ob.bids:ob.asks,pc=c2(p);
  for(var i=0;i<arr.length;i++)if(c2(arr[i].p)===pc){arr[i].q+=q;return}
  arr.push({p:f2(pc),q:q});
  arr.sort(side==='buy'?function(x,y){return y.p-x.p}:function(x,y){return x.p-y.p});
  if(arr.length>10)arr.length=10;
 }
 function fillUsers(s,side,price,take){
  var need=take;
  for(var i=0;i<ACC.orders.length&&need>0;i++){
   var o=ACC.orders[i];
   if(o.status!=='pending'||o.code!==s.code||!o._restQ)continue;
   if(c2(o.price)!==c2(price))continue;
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
   s.vol+=take/100;
   var h=s.hist[s.hist.length-1];
   if(h){h.p=l.p;h.v=(h.v||0)+take/100}
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
    while(rem>0&&ob.asks.length&&c2(ob.asks[0].p)<=c2(o.price)){
     var l=ob.asks[0],take=Math.min(rem,l.q);
     l.q-=take;rem-=take;o._restQ=0;
     fill(o,l.p,take);
     s.vol+=take/100;
     var h=s.hist[s.hist.length-1];if(h){h.p=l.p;h.v=(h.v||0)+take/100}
     s.price=l.p;
     if(l.q<=0)ob.asks.shift();
    }
    if(rem>0){add(s,'buy',o.price,rem);o._restQ=rem}
   }else{
    while(rem>0&&ob.bids.length&&c2(ob.bids[0].p)>=c2(o.price)){
     var l2=ob.bids[0],take2=Math.min(rem,l2.q);
     l2.q-=take2;rem-=take2;o._restQ=0;
     fill(o,l2.p,take2);
     s.vol+=take2/100;
     var h2=s.hist[s.hist.length-1];if(h2){h2.p=l2.p;h2.v=(h2.v||0)+take2/100}
     s.price=l2.p;
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
   consume(s,R()<0.5?'buy':'sell',100*Math.round(1+R()*5));
   var sp=0.01;
   if(R()<0.6)add(s,'buy',f2(c2(s.price)-1),100*Math.round(1+R()*4));
   if(R()<0.6)add(s,'sell',f2(c2(s.price)+1),100*Math.round(1+R()*4));
   if(ob.bids.length&&c2(ob.bids[0].p)>=c2(s.up)&&ob.bids[0].q>0){s.price=s.up;if(s.high<s.up)s.high=s.up}
   if(ob.asks.length&&c2(ob.asks[0].p)<=c2(s.dn)&&ob.asks[0].q>0){s.price=s.dn;if(s.low>s.dn)s.low=s.dn}
   var h=s.hist[s.hist.length-1];if(h&&c2(h.p)!==c2(s.price))h.p=s.price;
   s.book=ob;
  }
 };
 var css=document.createElement('style');
 css.textContent='.tabs2{display:block!important;overflow-x:auto;white-space:nowrap;-webkit-overflow-scrolling:touch;padding-bottom:4px}.tabs2 .ct{display:inline-block;margin-right:6px}';
 document.head.appendChild(css);
})();
