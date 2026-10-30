/* ob.js v17 —— 盘口厚、量柱只记真实成交、逐笔含用户成交 */
(function(){
 var BS=4;
 function R(){return Math.random()}
 function c2(x){return Math.round(x*100)}
 function f2(c){return c/100}
 function cl(s,p){return f2(Math.max(c2(s.dn),Math.min(c2(s.up),c2(p))))}
 function baseQ(s){return (s.volBase||200)*100}
 function flowQ(s){return (s.volBase||200)*100*BS}
 function dep(s){
  var b=baseQ(s),span=Math.max(1,c2(s.up)-c2(s.dn));
  var up=(c2(s.up)-c2(s.price))/span,dn=(c2(s.price)-c2(s.dn))/span;
  var thin=1-Math.max(up,dn)*0.7;if(thin<0.2)thin=0.2;
  var q=Math.round(b*(0.6+R()*0.9)*thin);
  if(q<100)q=100;
  return q;
 }
 window.buildBook=function(s){
  if(c2(s.price)>=c2(s.up)){s._seal=1;if(!s._sealQty)s._sealQty=Math.round(baseQ(s)*(4+R()*10));s.price=s.up}
  if(c2(s.price)<=c2(s.dn)){s._seal=-1;if(!s._sealQty)s._sealQty=Math.round(baseQ(s)*(4+R()*10));s.price=s.dn}
  var b=c2(s.price),bids=[],asks=[],i;
  for(i=1;i<=5;i++){
   bids.push({p:f2(Math.max(c2(s.dn),b-i)),q:dep(s)});
   asks.push({p:f2(Math.min(c2(s.up),b+i)),q:dep(s)});
  }
  if(s._seal===1){asks=[];bids=[{p:s.up,q:s._sealQty}]}
  else if(s._seal===-1){bids=[];asks=[{p:s.dn,q:s._sealQty}]}
  s.book={bids:bids,asks:asks};s._ob=s.book;
 };
 function replenish(s){
  if(!s.book)return;
  if(s._seal){window.buildBook(s);return}
  var ob=s.book,b=c2(s.price),i,l;
  var cap=Math.round(baseQ(s)*3);
  ob.asks=ob.asks.filter(function(x){return c2(x.p)>b});
  ob.bids=ob.bids.filter(function(x){return c2(x.p)<b});
  ob.asks.sort(function(x,y){return x.p-y.p});
  ob.bids.sort(function(x,y){return y.p-x.p});
  while(ob.asks.length<5){
   var la=ob.asks.length?c2(ob.asks[ob.asks.length-1].p):b;
   var na=la+1;if(na>c2(s.up))break;
   ob.asks.push({p:f2(na),q:Math.round(dep(s)*0.8)});
  }
  while(ob.bids.length<5){
   var lb=ob.bids.length?c2(ob.bids[ob.bids.length-1].p):b;
   var nb=lb-1;if(nb<c2(s.dn))break;
   ob.bids.push({p:f2(nb),q:Math.round(dep(s)*0.8)});
  }
  var add=baseQ(s)*0.03;
  for(i=0;i<ob.asks.length;i++){l=ob.asks[i];l.q=Math.min(cap,l.q+Math.round(add*(0.2+R()*0.9)));if(l.q<100)l.q=100}
  for(i=0;i<ob.bids.length;i++){l=ob.bids[i];l.q=Math.min(cap,l.q+Math.round(add*(0.2+R()*0.9)));if(l.q<100)l.q=100}
  s._ob=ob;
 }
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
    a.q-=take;left-=take;traded+=take;s.price=cl(s,a.p);
    if(a.q<=0){ob.asks.shift();if(!ob.asks.length&&c2(s.price)<c2(s.up))ob.asks.push({p:f2(c2(s.price)+1),q:dep(s)})}
   }else{
    if(s._seal===-1){s._sealQty=(s._sealQty||0)+left;left=0;break}
    if(!ob.bids.length){s.price=s.dn;s._seal=-1;s._sealQty=(s._sealQty||0)+left;left=0;break}
    a=ob.bids[0];take=Math.min(left,a.q);
    a.q-=take;left-=take;traded+=take;s.price=cl(s,a.p);
    if(a.q<=0){ob.bids.shift();if(!ob.bids.length&&c2(s.price)>c2(s.dn))ob.bids.push({p:f2(c2(s.price)-1),q:dep(s)})}
   }
  }
  if(traded>0){s._sd=dir;s._sq=(s._sq||0)+traded;s._sp=s.price}
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
   var rem=o.qty-o.filled,take,h2;
   if(rem<=0)continue;
   if(o.side==='buy'){
    while(rem>0&&s.book.asks.length&&c2(s.book.asks[0].p)<=c2(o.price)){
     var a=s.book.asks[0];take=Math.min(rem,a.q);a.q-=take;rem-=take;
     fill(o,a.p,take);s.vol+=take/100;s.price=cl(s,a.p);
     h2=s.hist[s.hist.length-1];if(h2)h2.v=(h2.v||0)+take/100;
     pr(s,a.p,take,1);
     if(a.q<=0)s.book.asks.shift();
    }
    if(rem>0){addBook(s,'buy',o.price,rem);o._restQ=rem}
   }else{
    while(rem>0&&s.book.bids.length&&c2(s.book.bids[0].p)>=c2(o.price)){
     var b=s.book.bids[0];take=Math.min(rem,b.q);b.q-=take;rem-=take;
     fill(o,b.p,take);s.vol+=take/100;s.price=cl(s,b.p);
     h2=s.hist[s.hist.length-1];if(h2)h2.v=(h2.v||0)+take/100;
     pr(s,b.p,take,-1);
     if(b.q<=0)s.book.bids.shift();
    }
    if(rem>0){addBook(s,'sell',o.price,rem);o._restQ=rem}
   }
  }
 };
 var TK=10;
 var TV={day:-1,si:-1,t:0,pw:1};
 function themeTick(){
  if(TV.day===M.day)return;
  TV.day=M.day;
  TV.t--;
  if(TV.t<=0){
   TV.t=3+Math.floor(R()*5);
   TV.si=Math.floor(R()*SECTORS.length);
   TV.pw=1.2+R()*0.9;
  }
 }
 function flowTick(){
  if(M.phase!=='open')return;
  themeTick();
  for(var i=0;i<M.stocks.length;i++){
   var s=M.stocks[i];
   if(!s.book){window.buildBook(s);}
   if(s._flDay!==M.day){
    s._flDay=M.day;s._fl={xl:0,l:0,m:0,s:0,hist:[]};s._tp=[];
    s._pb=[];s._ph=0;s._sq=0;s._px=null;s._vm=null;
    window.buildBook(s);
   }
   if(s._px!=null){s.price=s._px;s.lf=Math.log(s.price);s.lfair=s.lf;}
   var h=s.hist[s.hist.length-1];
   if(!h)continue;
   if(s._vm!==M.minute){s._vm=M.minute;h.v=0;}
   if(!s._bh){s._bh={main:0,t:0,dir:1,pw:0.6+R()*0.9}}
   if(s._cm==null){s._cm=0.22+R()*0.16}
   if(s.hist.length<2){s.hist.push({p:s.price,v:0,m:0});h=s.hist[s.hist.length-1]}
   var th=(TV.t>0&&s.si===TV.si);
   var bh=s._bh,base=flowQ(s);
   var amt=base*s.price/TK;
   var damp=(s._ph===0)?0.55:1;
   var mAmt=amt*(0.04+R()*0.12)*bh.main*bh.pw*damp*(th?1.8:1);
   var hAmt=0,canHot=(s._seal!==1&&s._seal!==-1);
   if(bh.t>0){bh.t--;hAmt=amt*(0.10+R()*0.20)*bh.dir}
   else if(canHot&&(th||s._ph===1)&&R()<(th?0.30:(M.minute>=205?0.06:0.008))){
    bh.t=2+Math.floor(R()*3);bh.dir=(bh.main>0?1:-1);
    hAmt=amt*(0.15+R()*0.25)*bh.dir;
   }
   var midAmt=amt*(0.06+R()*0.09)*(R()<0.5?1:-1);
   var xlP=0,lP=mAmt;
   if(Math.abs(mAmt)>=1e5){xlP=mAmt*0.4;lP=mAmt*0.6}
   var aggr=mAmt+hAmt+midAmt*0.5;
   var rAmt=-(aggr+midAmt)*(0.85+R()*0.45);
   if(Math.random()<0.5){}
   var q=Math.round(aggr/s.price/100)*100,traded=0;
   if(q>0)traded=sweep(s,1,q);else if(q<0)traded=sweep(s,-1,-q);
   if(s._seal===1){
    var hit=Math.round(baseQ(s)*(0.02+R()*0.06));s._sealQty-=hit;
    if(s._sealQty<=0){s._seal=0;s._sealQty=0;s.price=f2(c2(s.up)-1);traded+=hit}
   }else if(s._seal===-1){
    var hit2=Math.round(baseQ(s)*(0.02+R()*0.06));s._sealQty-=hit2;
    if(s._sealQty<=0){s._seal=0;s._sealQty=0;s.price=f2(c2(s.dn)+1);traded+=hit2}
   }
   replenish(s);
   if(s._sq>0){pr(s,s._sp,s._sq,s._sd);s._sq=0}
   if(traded>0){s.vol+=traded/100;h.v=(h.v||0)+traded/100}
   if(s.price>s.high)s.high=s.price;
   if(s.price<s.low)s.low=s.price;
   s.lf=Math.log(s.price);
   h.p=s.price;
   s._cm+=(mAmt/s.price/baseQ(s))*1.1e-4;
   if(s._cm<0.08)s._cm=0.08;if(s._cm>0.88)s._cm=0.88;
   s._fl.xl+=xlP;s._fl.l+=lP+hAmt;s._fl.m+=midAmt;s._fl.s+=rAmt;
   var lh=s._fl.hist[s._fl.hist.length-1];
   if(lh&&lh.t===M.minute){lh.xl=s._fl.xl;lh.l=s._fl.l;lh.m=s._fl.m;lh.s=s._fl.s}
   else{s._fl.hist.push({xl:s._fl.xl,l:s._fl.l,m:s._fl.m,s:s._fl.s,t:M.minute});if(s._fl.hist.length>240)s._fl.hist.shift()}
   s._px=s.price;
  }
 }
 function run(){
  if(M._obMin===M.minute)return;
  M._obMin=M.minute;
  for(var i=0;i<M.stocks.length;i++){
   var s=M.stocks[i];
   if(M.minute<=1){s._seal=0;s._sealQty=0;s._pb=[]}
   if(!s._bh){s._bh={main:0,t:0,dir:1,pw:0.6+R()*0.9}}
   var bh=s._bh;
   if(!s._pb)s._pb=[];
   s._pb.push(s.price);if(s._pb.length>31)s._pb.shift();
   var rise=s._pb.length>20?((s.price-s._pb[0])/s._pb[0]):0;
   var th=(TV.t>0&&s.si===TV.si);
   var ph=th?1:(s._cm<0.30?0:(s._cm<0.62?1:2));
   var baseMain=ph===0?(0.30+R()*0.35):ph===1?(0.75+R()*0.45):-(0.55+R()*0.35);
   if(th)baseMain=(0.90+R()*0.45)*TV.pw;
   if(!th&&rise>0.025)baseMain=-(0.30+R()*0.30);
   if(!th&&rise<-0.03)baseMain=0.45+R()*0.35;
   bh.main=baseMain;s._ph=ph;
   bh.pw+=(R()-0.5)*0.30;
   if(bh.pw<0.25)bh.pw=0.25;if(bh.pw>1.8)bh.pw=1.8;
  }
 }
 var old=window.stepMinute,real=window.__stepReal;
 window.stepMinute=function(){old();flowTick();run()};
 if(real)window.__stepReal=function(){real();run()};
})();
