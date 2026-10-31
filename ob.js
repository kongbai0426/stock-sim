/* ob.js v31 —— 真实化：小目标涨幅 + 硬边带 + 3% 强势日 */
(function(){
 var BS=1;
 function R(){return Math.random()}
 function c2(x){return Math.round(x*100)}
 function f2(c){return c/100}
 function cl(s,p){return f2(Math.max(c2(s.dn),Math.min(c2(s.up),c2(p))))}
 function baseQ(s){return (s.volBase||200)*100}
 function flowQ(s){return (s.volBase||200)*100*BS}
 function limit(s){
  var c=s.code||'',r=0.10;
  if(c.indexOf('300')===0||c.indexOf('301')===0||c.indexOf('688')===0||c.indexOf('689')===0)r=0.20;
  if(s.name&&s.name.indexOf('ST')>=0)r=0.05;
  var b=s.prev||s.price;
  s.up=Math.round(b*(100+r*100))/100;
  s.dn=Math.round(b*(100-r*100))/100;
 }
 function sealSync(s){
  if(s._seal===1){s.price=s.up;return}
  if(s._seal===-1){s.price=s.dn;return}
  if(c2(s.price)>=c2(s.up)){s._seal=1;s.price=s.up;if(!s._sealQty)s._sealQty=Math.round(baseQ(s)*(4+R()*10))}
  else if(c2(s.price)<=c2(s.dn)){s._seal=-1;s.price=s.dn;if(!s._sealQty)s._sealQty=Math.round(baseQ(s)*(4+R()*10))}
 }
 function dep(s){
  var b=baseQ(s),span=Math.max(1,c2(s.up)-c2(s.dn));
  var up=(c2(s.up)-c2(s.price))/span,dn=(c2(s.price)-c2(s.dn))/span;
  var thin=1-Math.max(up,dn)*0.7;if(thin<0.2)thin=0.2;
  var q=Math.round(b*(0.6+R()*0.9)*thin);
  if(q<100)q=100;
  return q;
 }
 window.buildBook=function(s){
  sealSync(s);
  var b=c2(s.price),bids=[],asks=[],i,p;
  if(s._seal===1){
   bids=[{p:s.up,q:s._sealQty}];
   for(i=1;i<=4;i++){p=Math.max(c2(s.dn),c2(s.up)-i);bids.push({p:f2(p),q:Math.round(baseQ(s)*(0.15+R()*0.35))})}
   s.book={bids:bids,asks:[]};s._ob=s.book;return;
  }
  if(s._seal===-1){
   asks=[{p:s.dn,q:s._sealQty}];
   for(i=1;i<=4;i++){p=Math.min(c2(s.up),c2(s.dn)+i);asks.push({p:f2(p),q:Math.round(baseQ(s)*(0.15+R()*0.35))})}
   s.book={bids:[],asks:asks};s._ob=s.book;return;
  }
  for(i=0;i<5;i++){
   bids.push({p:f2(Math.max(c2(s.dn),b-i)),q:dep(s)});
   asks.push({p:f2(Math.min(c2(s.up),b+1+i)),q:dep(s)});
  }
  s.book={bids:bids,asks:asks};s._ob=s.book;
 };
 function align(s){
  if(!s.book||s._seal)return;
  var ob=s.book,b=c2(s.price),p;
  ob.bids=ob.bids.filter(function(x){return c2(x.p)<=b});
  ob.asks=ob.asks.filter(function(x){return c2(x.p)>b});
  ob.bids.sort(function(x,y){return y.p-x.p});
  ob.asks.sort(function(x,y){return x.p-y.p});
  if(!ob.bids.length||c2(ob.bids[0].p)!==b)ob.bids.unshift({p:f2(b),q:dep(s)});
  if(!ob.asks.length||c2(ob.asks[0].p)!==b+1)ob.asks.unshift({p:f2(Math.min(c2(s.up),b+1)),q:dep(s)});
  while(ob.bids.length<5){
   p=c2(ob.bids[ob.bids.length-1].p)-1;
   if(p<c2(s.dn)||p>=c2(ob.bids[ob.bids.length-1].p))break;
   ob.bids.push({p:f2(p),q:dep(s)});
  }
  while(ob.asks.length<5){
   p=c2(ob.asks[ob.asks.length-1].p)+1;
   if(p>c2(s.up)||p<=c2(ob.asks[ob.asks.length-1].p))break;
   ob.asks.push({p:f2(p),q:dep(s)});
  }
  while(ob.bids.length>5)ob.bids.pop();
  while(ob.asks.length>5)ob.asks.pop();
  s._ob=ob;
 }
 function keepSeal(s){
  if(!s.book)return;
  if(s._seal===1){
   if(!s.book.bids.length||c2(s.book.bids[0].p)!==c2(s.up)){window.buildBook(s);return}
   s.book.asks=[];s.book.bids[0].q=s._sealQty;
  }else if(s._seal===-1){
   if(!s.book.asks.length||c2(s.book.asks[0].p)!==c2(s.dn)){window.buildBook(s);return}
   s.book.bids=[];s.book.asks[0].q=s._sealQty;
  }else{
   var ob=s.book,i,l,cap=Math.round(baseQ(s)*3),add=baseQ(s)*0.03;
   for(i=0;i<ob.asks.length;i++){l=ob.asks[i];l.q=Math.min(cap,l.q+Math.round(add*(0.2+R()*0.9)));if(l.q<100)l.q=100}
   for(i=0;i<ob.bids.length;i++){l=ob.bids[i];l.q=Math.min(cap,l.q+Math.round(add*(0.2+R()*0.9)));if(l.q<100)l.q=100}
  }
  s._ob=s.book;
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
    if(s._seal===-1&&c2(a.p)===c2(s.dn)){
     s._sealQty=(s._sealQty||0)-take;
     if(s._sealQty<=0){s._sealQty=0;s._seal=0;s.price=f2(c2(s.dn)+1);}
    }
    if(a.q<=0)ob.asks.shift();
   }else{
    if(s._seal===-1){s._sealQty=(s._sealQty||0)+left;left=0;break}
    if(!ob.bids.length){s.price=s.dn;s._seal=-1;s._sealQty=(s._sealQty||0)+left;left=0;break}
    a=ob.bids[0];take=Math.min(left,a.q);
    a.q-=take;left-=take;traded+=take;s.price=cl(s,a.p);
    if(s._seal===1&&c2(a.p)===c2(s.up)){
     s._sealQty=(s._sealQty||0)-take;
     if(s._sealQty<=0){s._sealQty=0;s._seal=0;s.price=f2(c2(s.up)-1);}
    }
    if(a.q<=0)ob.bids.shift();
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
 function yzPick(s){
  if(TV.t>0&&s.si===TV.si)return 1;
  var k=s.kline||[],i;
  for(i=Math.max(0,k.length-5);i<k.length;i++){
   var b=k[i];
   if(b&&b.o>0&&(b.c/b.o-1)>0.095)return 1;
  }
  return 0;
 }
 function flowTick(){
  if(M.phase!=='open')return;
  themeTick();
  for(var i=0;i<M.stocks.length;i++){
   var s=M.stocks[i];
   limit(s);
   if(!s.book){window.buildBook(s);}
   if(s._flDay!==M.day){
    s._flDay=M.day;s._fl={xl:0,l:0,m:0,s:0,hist:[]};s._tp=[];
    s._pb=[];s._ph=0;s._sq=0;s._px=null;s._vm=null;s._vk=1;s._dmp=0;
    s._seal=0;s._sealQty=0;
    s._hot=(R()<0.03)?1:0;
    window.buildBook(s);
   }
   if(s._px!=null){s.price=s._px;s.lf=Math.log(s.price);s.lfair=s.lf;}
   sealSync(s);
   var h=s.hist[s.hist.length-1];
   if(!h)continue;
   if(s._vm!==M.minute){s._vm=M.minute;h.v=0;}
   if(!s._mb)s._mb={ph:0,left:15+Math.floor(R()*26)};
   if(!s._yz)s._yz={on:0,t:0,dump:0};
   if(s.hist.length<2){s.hist.push({p:s.price,v:0,m:0});h=s.hist[s.hist.length-1]}
   var P=s._mb.ph,yz=s._yz;
   var vkP=[0.70,1.30,0.50,2.00,1.20][P];
   var tgt=[0.002,0.006,-0.004,0.015,-0.012][P];
   if(P===3&&M.minute>=215)tgt=0.020;
   if(P===4&&M.minute>=215)tgt=-0.016;
   if(yz.on)tgt=tgt*1.5;
   var dr=s.open?(s.price/s.open-1):0;
   var limPct=s.prev?(s.up/s.prev-1):0.10;
   var band=s._hot?(limPct+0.005):(Math.abs(tgt)+0.025);
   var dirK=(tgt-dr)*20;
   if(dr>band)dirK=-1.2;
   else if(dr<-band)dirK=1.2;
   if(yz.dump>0&&M.minute<=8)dirK-=0.5;
   if(P===0&&s._dmp>0){dirK=-0.7;s._dmp-=1/TK;}
   if(dirK>1.5)dirK=1.5;
   if(dirK<-1.5)dirK=-1.5;
   var yzB=yz.on?1:0;
   var base=flowQ(s)*vkP*(0.75+0.25*(s._vk||1));
   var amt=base*s.price/TK;
   var mAmt=amt*(0.05+R()*0.10)*dirK;
   var hAmt=0;
   var midAmt=amt*(0.04+R()*0.08)*(R()<0.5?1:-1);
   var xlP=0;
   if(P===3||yzB){xlP=mAmt*0.4;mAmt=mAmt*0.6;}
   else{midAmt+=mAmt;mAmt=0;}
   var aggr=mAmt+hAmt+midAmt*0.5;
   var rAmt=-(aggr+midAmt)*(0.85+R()*0.45);
   var q=Math.round(aggr/s.price/100)*100,traded=0;
   if(q>0)traded=sweep(s,1,q);else if(q<0)traded=sweep(s,-1,-q);
   sealSync(s);
   if(s._seal===1&&R()<0.05){
    var hit=Math.round(baseQ(s)*(0.03+R()*0.10));s._sealQty-=hit;
    if(s._sealQty<=0){s._seal=0;s._sealQty=0;s.price=f2(c2(s.up)-1);traded+=hit}
   }else if(s._seal===-1&&R()<0.05){
    var hit2=Math.round(baseQ(s)*(0.03+R()*0.10));s._sealQty-=hit2;
    if(s._sealQty<=0){s._seal=0;s._sealQty=0;s.price=f2(c2(s.dn)+1);traded+=hit2}
   }
   align(s);
   keepSeal(s);
   if(s._sq>0){pr(s,s._sp,s._sq,s._sd);s._sq=0}
   if(traded>0){s.vol+=traded/100;h.v=(h.v||0)+traded/100}
   if(s.price>s.high)s.high=s.price;
   if(s.price<s.low)s.low=s.price;
   s.lf=Math.log(s.price);
   h.p=s.price;
   s._fl.xl+=xlP;s._fl.l+=mAmt+hAmt;s._fl.m+=midAmt;s._fl.s+=rAmt;
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
   if(!s._mb)s._mb={ph:0,left:15+Math.floor(R()*26)};
   if(!s._yz)s._yz={on:0,t:0,dump:0};
   if(M.minute<=1){
    s._seal=0;s._sealQty=0;s._pb=[];s._dmp=0;
    s._mb.left--;
    if(s._mb.left<=0){
     var p=s._mb.ph;
     if(p===0)s._mb={ph:1,left:1+Math.floor(R()*2)};
     else if(p===1)s._mb={ph:2,left:1+Math.floor(R()*3)};
     else if(p===2)s._mb={ph:3,left:5+Math.floor(R()*8)};
     else if(p===3)s._mb={ph:4,left:8+Math.floor(R()*13)};
     else s._mb={ph:0,left:15+Math.floor(R()*26)};
    }
    if(s._yz.dump>0)s._yz.dump--;
   }
   if(!s._yz.on&&M.minute>5&&M.minute<232&&R()<(yzPick(s)?0.025:0.004)){
    s._yz.on=1;s._yz.t=3+Math.floor(R()*6);
   }
   if(s._yz.on){s._yz.t--;if(s._yz.t<=0){s._yz.on=0;s._yz.dump=1+(R()<0.5?1:0)}}
   if(s._mb.ph===0&&s._dmp<=0&&R()<0.03)s._dmp=1+Math.floor(R()*3);
   if(!s._pb)s._pb=[];
   var prevP=s._pb.length?s._pb[s._pb.length-1]:s.price;
   s._pb.push(s.price);if(s._pb.length>31)s._pb.shift();
   var mv=prevP?Math.abs(s.price-prevP)/prevP:0;
   s._vk=Math.min(4,Math.max(0.25,0.25+mv*250));
   s._ph=s._mb.ph;
  }
 }
 window.__ob=function(){flowTick();run()};
 var old=window.stepMinute,real=window.__stepReal;
 window.stepMinute=function(){old();flowTick();run()};
 if(real)window.__stepReal=function(){real();flowTick();run()};
})();
