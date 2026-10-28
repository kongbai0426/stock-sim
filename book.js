// 订单簿 v4：涨停/跌停状态机 + 封单 + 开板爆量
(function(){
 function R(){return Math.random()}
 function c2(x){return Math.round(x*100)}
 function f2(c){return c/100}
 function cl(s,p){var c=c2(p);return f2(Math.max(c2(s.dn),Math.min(c2(s.up),c)))}
 function ensure(s){
  if(s._ob)return s._ob;
  var b=c2(s.price),bd=[],ak=[];
  for(var i=1;i<=5;i++){
   bd.push({p:f2(Math.max(c2(s.dn),b-i)),q:1000*Math.round(3+R()*30)});
   ak.push({p:f2(Math.min(c2(s.up),b+i)),q:1000*Math.round(3+R()*30)});
  }
  s._ob={bids:bd,asks:ak};s._seal=0;s._sealQty=0;s.book=s._ob;return s._ob;
 }
 function merge(arr,side){
  var m={},o=[];
  for(var i=0;i<arr.length;i++){var k=c2(arr[i].p);m[k]=(m[k]||0)+arr[i].q}
  for(var k2 in m)o.push({p:f2(+k2),q:m[k2]});
  o.sort(side==='buy'?function(x,y){return y.p-x.p}:function(x,y){return x.p-y.p});
  return o.slice(0,8);
 }
 function rebuild(s){
  var ob=ensure(s),b=c2(cl(s,s.price)),bd=[],ak=[];
  for(var i=1;i<=5;i++){
   bd.push({p:f2(Math.max(c2(s.dn),b-i)),q:1000*Math.round(3+R()*30)});
   ak.push({p:f2(Math.min(c2(s.up),b+i)),q:1000*Math.round(3+R()*30)});
  }
  ob.bids=merge(bd,'buy');ob.asks=merge(ak,'sell');
  ob.bids=ob.bids.filter(function(l){return c2(l.p)>=c2(s.dn)});
  ob.asks=ob.asks.filter(function(l){return c2(l.p)<=c2(s.up)});
  if(s._seal===1){
   ob.asks=[];
   var found=false;
   for(var j=0;j<ob.bids.length;j++)if(c2(ob.bids[j].p)===c2(s.up)){ob.bids[j].q=s._sealQty;found=true}
   if(!found)ob.bids.unshift({p:s.up,q:s._sealQty});
   ob.bids.sort(function(x,y){return y.p-x.p});
  }else if(s._seal===-1){
   ob.bids=[];
   var f2d=false;
   for(var k3=0;k3<ob.asks.length;k3++)if(c2(ob.asks[k3].p)===c2(s.dn)){ob.asks[k3].q=s._sealQty;f2d=true}
   if(!f2d)ob.asks.unshift({p:s.dn,q:s._sealQty});
   ob.asks.sort(function(x,y){return x.p-y.p});
  }
  s.book=ob;
 }
 window.buildBook=function(s){rebuild(s)};
 function add(s,side,p,q){
  p=cl(s,p);var ob=ensure(s),arr=side==='buy'?ob.bids:ob.asks,pc=c2(p);
  for(var i=0;i<arr.length;i++)if(c2(arr[i].p)===pc){arr[i].q+=q;break}
  if(i>=arr.length){arr.push({p:p,q:q})}
  arr.sort(side==='buy'?function(x,y){return y.p-x.p}:function(x,y){return x.p-y.p});
  if(arr.length>9)arr.length=9;
  if(side==='buy'&&pc===c2(s.up)&&s._seal===1)s._sealQty+=q;
  if(side==='sell'&&pc===c2(s.dn)&&s._seal===-1)s._sealQty+=q;
  s.book=ob;
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
   s.price=cl(s,l.p);s.vol+=take/100;
   var h=s.hist[s.hist.length-1];
   if(h){h.p=s.price;h.v=(h.v||0)+take/100}
   if(l.q<=0)arr.shift();
  }
  if(c2(s.price)>=c2(s.up)){s._seal=1;s._sealQty=500000*Math.round(2+R()*8);s.price=s.up;ob.asks=[]}
  if(c2(s.price)<=c2(s.dn)){s._seal=-1;s._sealQty=500000*Math.round(2+R()*8);s.price=s.dn;ob.bids=[]}
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
     s.price=cl(s,l.p);s.vol+=take/100;
     var h=s.hist[s.hist.length-1];if(h){h.p=s.price;h.v=(h.v||0)+take/100}
     if(l.q<=0)ob.asks.shift();
    }
    if(rem>0){add(s,'buy',o.price,rem);o._restQ=rem}
   }else{
    while(rem>0&&ob.bids.length&&c2(ob.bids[0].p)>=c2(o.price)){
     var l2=ob.bids[0],take2=Math.min(rem,l2.q);
     l2.q-=take2;rem-=take2;o._restQ=0;
     fill(o,l2.p,take2);
     s.price=cl(s,l2.p);s.vol+=take2/100;
     var h2=s.hist[s.hist.length-1];if(h2){h2.p=s.price;h2.v=(h2.v||0)+take2/100}
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
   if(M.minute<=1){s._seal=0;s._sealQty=0}
   var h=s.hist[s.hist.length-1];
   if(s._seal===1){
    s.price=s.up;ob.asks=[];
    var lv=null;
    for(var j=0;j<ob.bids.length;j++)if(c2(ob.bids[j].p)===c2(s.up)){lv=ob.bids[j];break}
    if(!lv){lv={p:s.up,q:s._sealQty};ob.bids.unshift(lv)}
    lv.q=s._sealQty;
    var sell=1000*Math.round(1+R()*8),take=Math.min(sell,s._sealQty);
    if(take>0){
     s._sealQty-=take;lv.q=s._sealQty;
     fillUsers(s,'sell',s.up,take);
     s.vol+=take/100;
     if(h){h.p=s.up;h.v=take/100}
    }
    if(s._sealQty<=0){
     s._seal=0;s.price=f2(c2(s.up)-1);
     var burst=500000*Math.round(1+R()*4);
     s.vol+=burst/100;
     if(h){h.p=s.price;h.v=burst/100}
    }else if(h){h.p=s.up;h.v=Math.max(1,take/100)}
   }else if(s._seal===-1){
    s.price=s.dn;ob.bids=[];
    var lv2=null;
    for(var k=0;k<ob.asks.length;k++)if(c2(ob.asks[k].p)===c2(s.dn)){lv2=ob.asks[k];break}
    if(!lv2){lv2={p:s.dn,q:s._sealQty};ob.asks.unshift(lv2)}
    lv2.q=s._sealQty;
    var buy=1000*Math.round(1+R()*8),take2=Math.min(buy,s._sealQty);
    if(take2>0){
     s._sealQty-=take2;lv2.q=s._sealQty;
     fillUsers(s,'buy',s.dn,take2);
     s.vol+=take2/100;
     if(h){h.p=s.dn;h.v=take2/100}
    }
    if(s._sealQty<=0){
     s._seal=0;s.price=f2(c2(s.dn)+1);
     var burst2=500000*Math.round(1+R()*4);
     s.vol+=burst2/100;
     if(h){h.p=s.price;h.v=burst2/100}
    }else if(h){h.p=s.dn;h.v=Math.max(1,take2/100)}
   }else{
    consume(s,R()<0.5?'buy':'sell',1000*Math.round(1+R()*6));
    if(R()<0.6)add(s,'buy',f2(c2(s.price)-1),1000*Math.round(1+R()*6));
    if(R()<0.6)add(s,'sell',f2(c2(s.price)+1),1000*Math.round(1+R()*6));
    if(h)h.p=s.price;
   }
   s.book=ob;
  }
 };
 var css=document.createElement('style');
 css.textContent='.tabs2{display:block!important;overflow-x:auto;white-space:nowrap;-webkit-overflow-scrolling:touch;padding-bottom:4px}.tabs2 .ct{display:inline-block;margin-right:6px}';
 document.head.appendChild(css);
})();
