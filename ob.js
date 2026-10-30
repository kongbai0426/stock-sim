/* ob.js v9 —— 订单驱动撮合 + 资金流 + 筹码 + 每 tick 刷新盘口
   盘口每秒微调一次挂单量（模拟 3 秒一档），早盘活跃度更高；价格仍按分钟撮合。 */
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
     var a=s.book.asks[0];take=Math.min(rem,a.q);a.q-=take;rem-=take;
     fill(o,a.p,take);s.vol+=take/100;s.price=cl(s,a.p);
     if(a.q<=0)s.book.asks.shift();
    }
    if(rem>0){addBook(s,'buy',o.price,rem);o._restQ=rem}
   }else{
    while(rem>0&&s.book.bids.length&&c2(s.book.bids[0].p)>=c2(o.price)){
     var b=s.book.bids[0];take=Math.min(rem,b.q);b.q-=take;rem-=take;
     fill(o,b.p,take);s.vol+=take/100;s.price=cl(s,b.p);
     if(b.q<=0)s.book.bids.shift();
    }
    if(rem>0){addBook(s,'sell',o.price,rem);o._restQ=rem}
   }
  }
 };
 function tickBook(){
  var s=sel?getStock(sel):null;
  if(!s||!s.book)return;
  var boost=(M.minute<30)?2.2:(M.minute>200?1.6:1),ob=s.book,i,l;
  for(i=0;i<ob.bids.length;i++){l=ob.bids[i];l.q=Math.max(100,Math.round(l.q*(0.80+R()*0.40*boost)))}
  for(i=0;i<ob.asks.length;i++){l=ob.asks[i];l.q=Math.max(100,Math.round(l.q*(0.80+R()*0.40*boost)))}
  if(R()<(M.minute<30?0.55:0.28)){
   var up=R()<0.5,lv=up?ob.asks[0]:ob.bids[0];
   if(lv){
    var sh=Math.round(1+R()*12)*10000;
    lv.q=Math.max(100,lv.q-sh*0.4);
    pr(s,lv.p,sh,up?1:-1);
   }
  }
 }
 function run(){
  if(M._obMin===M.minute)return;
  M._obMin=M.minute;
  if(M._obDay!==M.day){M._obDay=M.day;M._obN=0}
  for(var i=0;i<M.stocks.length;i++){
   var s=M.stocks[i],h=s.hist[s.hist.length-1];
   if(!h)continue;
   if(M.minute<=1||!s._fl){s._seal=s._seal||0;s._sealQty=s._sealQty||0;s._fl={xl:0,l:0,m:0,s:0,hist:[]};s._tp=[]}
   if(M.minute<=1){s._seal=0;s._sealQty=0;s._pb=[];s._mv=0}
   if(s._cm==null)s._cm=0.22+R()*0.16;
   if(!s._bh||M.minute<=1)s._bh={main:0,t:0,dir:1,pw:0.6+R()*0.9};
   var bh=s._bh;
   if(!s._pb)s._pb=[];
   s._pb.push(s.price);if(s._pb.length>31)s._pb.shift();
   var rise=s._pb.length>20?((s.price-s._pb[0])/s._pb[0]):0;
   var ph=s._cm<0.30?0:(s._cm<0.62?1:2);
   var baseMain=ph===0?(0.30+R()*0.35):ph===1?(0.75+R()*0.45):-(0.55+R()*0.35);
   if(rise>0.025)baseMain=-(0.30+R()*0.30);
   if(rise<-0.03)baseMain=0.45+R()*0.35;
   bh.main=baseMain;
   bh.pw+=(R()-0.5)*0.30;
   if(bh.pw<0.25)bh.pw=0.25;if(bh.pw>1.8)bh.pw=1.8;
   var base=(s.volBase||200)*100;
   var damp=(ph===0)?0.55:1;
   var vol=(h.v||0)*100,amt=vol*s.price;
   var mAmt=amt*(0.04+R()*0.12)*bh.main*bh.pw*damp;
   var hAmt=0,canHot=(s._seal!==1&&s._seal!==-1&&(M._obN||0)<4);
   if(bh.t>0){bh.t--;hAmt=amt*(0.10+R()*0.20)*bh.dir}
   else if(canHot&&ph===1&&R()<(M.minute>=205?0.06:0.008)){
    bh.t=2+Math.floor(R()*3);bh.dir=(bh.main>0?1:-1);M._obN=(M._obN||0)+1;
    hAmt=amt*(0.15+R()*0.25)*bh.dir;
   }
   var midAmt=amt*(0.06+R()*0.09)*(R()<0.5?1:-1);
   var xlP=0,lP=mAmt;
   if(Math.abs(mAmt)>=1e6){xlP=mAmt*0.4;lP=mAmt*0.6}
   var aggr=mAmt+hAmt+midAmt*0.5;
   var rAmt=-(aggr+midAmt)*(0.85+R()*0.45);
   var traded=0,p0=s.price;
   var q=Math.round(aggr/s.price/100)*100;
   if(q>0)traded=sweep(s,1,q);else if(q<0)traded=sweep(s,-1,-q);
   if(s._seal===1){
    var hit=Math.round((s.volBase||200)*(0.15+R()*0.7));s._sealQty-=hit;
    if(s._sealQty<=0){s._seal=0;s._sealQty=0;s.price=f2(c2(s.up)-1);traded+=hit}
   }else if(s._seal===-1){
    var hit2=Math.round((s.volBase||200)*(0.15+R()*0.7));s._sealQty-=hit2;
    if(s._sealQty<=0){s._seal=0;s._sealQty=0;s.price=f2(c2(s.dn)+1);traded+=hit2}
   }
   if(traded>0){s.vol+=traded/100;h.v=(h.v||0)+traded/100}
   if(s.price>s.high)s.high=s.price;
   if(s.price<s.low)s.low=s.price;
   s.lf=Math.log(s.price);h.p=s.price;
   s._cm+=(mAmt/s.price/base)*2.8e-4;
   if(s._cm<0.08)s._cm=0.08;if(s._cm>0.88)s._cm=0.88;如果(s._cm<0.08)s._cm=0.08;如果(s._cm>0.88)s._cm=0.88;
   s._fl.xl+=xlP;s._fl.l+=lP+hAmt;s._fl.m+=midAmt;s._fl.s+=rAmt;
   s._fl.hist.push({xl:s._fl.xl,l:s._fl.l,m:s._fl.m,s:s._fl.s,t:M.minute});
   if(s._fl.hist.length>240)s._fl.hist.shift();如果(s._flhist长度>240)则移动；
   window.buildBook(s);窗口.构建书籍(s);
  }
 }
 var old=window.stepMinute,real=window.__stepReal;
 window.stepMinute=function(){old();run();tickBook()};窗口.stepMinute=函数(){旧();运行();tickBook()};
 if(real)window.__stepReal=function(){real();run();tickBook()};如果(真实)窗口.__stepReal=函数(){真实();运行();tickBook()};
})();
