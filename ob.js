/* ob.js v56 —— 撮合量放大 5 倍 */
(function(){
 function R(){return Math.random()}
 function c2(x){return Math.round(x*100)}
 function f2(c){return c/100}
 function cl(s,p){return f2(Math.max(c2(s.dn),Math.min(c2(s.up),c2(p))))}
 function baseQ(s){return (s.volBase||200)*100}
 function capQ(s){return Math.round((s.floatShares||s.shares||1)*1e8*0.05)}
 function limit(s){
  var c=s.code||'',r=0.10;
  if(c.indexOf('300')===0||c.indexOf('301')===0||c.indexOf('688')===0||c.indexOf('689')===0)r=0.20;
  if(s.name&&s.name.indexOf('ST')>=0)r=0.05;
  var b=s.prev||s.price;
  s.up=Math.round(b*(100+r*100))/100;
  s.dn=Math.round(b*(100-r*100))/100;
 }
 function initDepth(s){
  var lo=c2(s.dn),hi=c2(s.up),n=hi-lo+1;
  s._d0=lo;s._dq=new Float32Array(n);s._hotIdx={};
  var ci=c2(s.price)-lo,i,k;
  var lv=[];
  try{ if(window.__lvlOf)lv=window.__lvlOf(s)||[]; }catch(e){}
  var hs={};
  for(k=0;k<lv.length;k++){
   var idx=c2(lv[k].p)-lo;
   if(idx>=0&&idx<n)hs[idx]=lv[k].side;
  }
  var bq=baseQ(s);
  for(i=0;i<n;i++){
   if(i===ci)continue;
   var d=Math.abs(i-ci);
   var q=Math.round(bq*(0.30+R()*0.50)*Math.pow(0.94,d));
   if(q<100)q=100;
   var side=hs[i];
   if(side==='up'&&i>ci){q=Math.round(Math.min(q*(3+R()*4),bq*4));s._hotIdx[i]=1;}
   else if(side==='dn'&&i<ci){q=Math.round(Math.min(q*(3+R()*4),bq*4));s._hotIdx[i]=1;}
   s._dq[i]= i<ci? q : -q;
  }
 }
 function syncBook(s){
  var d=s._dq;if(!d)return;
  var ci=c2(s.price)-s._d0,bids=[],asks=[],j;
  for(j=ci;j>=0&&bids.length<5;j--)if(d[j]>0)bids.push({p:f2(s._d0+j),q:Math.round(d[j])});
  for(j=ci+1;j<d.length&&asks.length<5;j++)if(d[j]<0)asks.push({p:f2(s._d0+j),q:Math.round(-d[j])});
  s.book={bids:bids,asks:asks};s._ob=s.book;
 }
 function norm(s){
  var d=s._dq;if(!d)return;
  var ci=c2(s.price)-s._d0,i;
  for(i=0;i<ci;i++)if(d[i]<0)d[i]=0;
  for(i=ci+1;i<d.length;i++)if(d[i]>0)d[i]=0;
 }
 function churn(s){
  var d=s._dq;if(!d)return;
  var ci=c2(s.price)-s._d0,bq=baseQ(s),k,j,add;
  for(k=1;k<=4;k++){
   j=ci+k;
   if(j<d.length){
    if(d[j]<0){add=Math.round(bq*0.012*(R()-0.35));d[j]=Math.min(0,d[j]+add);if(d[j]>-100)d[j]=-100;}
    else if(d[j]===0&&R()<0.25){d[j]=-Math.round(bq*(0.25+R()*0.45));}
   }
   j=ci-k;
   if(j>=0){
    if(d[j]>0){add=Math.round(bq*0.012*(R()-0.35));d[j]=Math.max(0,d[j]+add);if(d[j]<100&&d[j]>0)d[j]=100;}
    else if(d[j]===0&&R()<0.25){d[j]=Math.round(bq*(0.25+R()*0.45));}
   }
  }
  if(!s._hotIdx)return;
  for(k in s._hotIdx){
   if(!s._hotIdx.hasOwnProperty(k))continue;
   var idx=+k;
   if(Math.abs(idx-ci)>40)continue;
   if(R()<0.03){
    if(idx<ci&&d[idx]>0)d[idx]=Math.min(Math.round(d[idx]*(1.05+R()*0.25)),capQ(s));
    else if(idx>ci&&d[idx]<0)d[idx]=-Math.min(Math.round(-d[idx]*(1.05+R()*0.25)),capQ(s));
   }
  }
 }
 function sealSync(s){
  if(s._seal===1){s.price=s.up;return}
  if(s._seal===-1){s.price=s.dn;return}
  if(c2(s.price)>=c2(s.up)){s._seal=1;s.price=s.up;if(!s._sealQty)s._sealQty=Math.round(baseQ(s)*(4+R()*10))}
  else if(c2(s.price)<=c2(s.dn)){s._seal=-1;s.price=s.dn;if(!s._sealQty)s._sealQty=Math.round(baseQ(s)*(4+R()*10))}
 }
 function addFlow(s,amt,dir){
  if(!s._fl){s._fl={xl:0,l:0,m:0,s:0,hist:[]}}
  var a=amt*dir;
  if(amt>=1000000)s._fl.xl+=a;
  else if(amt>=200000)s._fl.l+=a;
  else if(amt>=40000)s._fl.m+=a;
  else s._fl.s+=a;
 }
 function sweep(s,dir,qty){
  var d=s._dq,left=qty,traded=0,n=0;
  if(dir>0){
   var ci=c2(s.price)-s._d0;
   while(left>0&&n++<6000){
    if(ci>=d.length-1)break;
    var v=d[ci+1];
    if(v===0){ci++;s.price=f2(s._d0+ci);continue}
    if(v>0){ci++;continue}
    var av=-v,take=Math.min(left,av);
    d[ci+1]=(v+take);left-=take;traded+=take;
    addFlow(s,take*f2(s._d0+ci+1),1);
    if(d[ci+1]>=0){d[ci+1]=0;s.price=f2(s._d0+ci+1);ci++;norm(s);}
   }
  }else{
   var ci2=c2(s.price)-s._d0;
   while(left>0&&n++<6000){
    if(ci2<=0)break;
    var v2=d[ci2-1];
    if(v2===0){ci2--;s.price=f2(s._d0+ci2);continue}
    if(v2<0){ci2--;continue}
    var av2=v2,take2=Math.min(left,av2);
    d[ci2-1]=(v2-take2);left-=take2;traded+=take2;
    addFlow(s,take2*f2(s._d0+ci2-1),-1);
    if(d[ci2-1]<=0){d[ci2-1]=0;s.price=f2(s._d0+ci2-1);ci2--;norm(s);}
   }
  }
  if(traded>0){s._sd=dir;s._sq=(s._sq||0)+traded;s._sp=s.price}
  return traded;
 }
 function addBook(s,side,p,q){
  p=cl(s,p);var d=s._dq;if(!d)return;
  var i=c2(p)-s._d0;if(i<0||i>=d.length)return;
  var lim=capQ(s);
  if(side==='buy')d[i]=Math.min(Math.max(d[i],0)+q,lim);
  else d[i]=-Math.min(Math.max(-d[i],0)+q,lim);
 }
 function pr(s,px,sh,d){
  if(sel!==s.code)return;
  if(!s._tp)s._tp=[];
  s._tp.unshift({m:M.minute,p:px,q:Math.max(1,Math.round(sh/100)),d:d,a:px*sh});
  if(s._tp.length>60)s._tp.length=60;
 }
 window.buildBook=function(s){
  if(!s._dq)initDepth(s);
  sealSync(s);syncBook(s);
 };
 window.matchAll=function(){
  for(var i=0;i<ACC.orders.length;i++){
   var o=ACC.orders[i];
   if(o.status!=='pending')continue;
   var s=getStock(o.code);if(!s||!s._dq)continue;
   var rem=o.qty-o.filled,take;
   if(rem<=0)continue;
   if(o.side==='buy'){
    while(rem>0){
     var ci=c2(s.price)-s._d0;
     if(ci>=s._dq.length-1)break;
     var v=s._dq[ci+1];
     if(v>=0)break;
     if(c2(f2(s._d0+ci+1))>c2(o.price))break;
     var av=-v;take=Math.min(rem,av);
     s._dq[ci+1]=(v+take);rem-=take;
     fill(o,f2(s._d0+ci+1),take);pr(s,f2(s._d0+ci+1),take,1);
     addFlow(s,take*f2(s._d0+ci+1),1);
     if(s._dq[ci+1]>=0){s._dq[ci+1]=0;s.price=f2(s._d0+ci+1);norm(s);}
    }
    if(rem>0){
     if(c2(o.price)>=c2(s.up)){s._seal=1;s._sealQty=Math.min((s._sealQty||0)+rem,capQ(s));s.price=s.up;}
     else addBook(s,'buy',Math.min(o.price,s.price),rem);
     o._restQ=rem;
    }
   }else{
    while(rem>0){
     var ci2=c2(s.price)-s._d0;
     if(ci2<=0)break;
     var v2=s._dq[ci2-1];
     if(v2<=0)break;
     if(c2(f2(s._d0+ci2-1))<c2(o.price))break;
     take=Math.min(rem,v2);
     s._dq[ci2-1]=(v2-take);rem-=take;
     fill(o,f2(s._d0+ci2-1),take);pr(s,f2(s._d0+ci2-1),take,-1);
     addFlow(s,take*f2(s._d0+ci2-1),-1);
     if(s._dq[ci2-1]<=0){s._dq[ci2-1]=0;s.price=f2(s._d0+ci2-1);norm(s);}
    }
    if(rem>0){
     if(c2(o.price)<=c2(s.dn)){s._seal=-1;s._sealQty=Math.min((s._sealQty||0)+rem,capQ(s));s.price=s.dn;}
     else addBook(s,'sell',Math.max(o.price,s.price),rem);
     o._restQ=rem;
    }
   }
  }
 };
 var TK=10;
 var TV={day:-1,si:-1,t:0,pw:1};
 function themeTick(){
  if(TV.day===M.day)return;
  TV.day=M.day;TV.t--;
  if(TV.t<=0){TV.t=3+Math.floor(R()*5);TV.si=Math.floor(R()*SECTORS.length);TV.pw=1.2+R()*0.9;}
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
  var UB=(window.UQ&&window.UQ.b)?window.UQ.b:null;
  var US=(window.UQ&&window.UQ.s)?window.UQ.s:null;
  var UQK=window.__UQK||0.02;
  for(var i=0;i<M.stocks.length;i++){
   var s=M.stocks[i];
   limit(s);
   if(s._flDay!==M.day||!s._dq){
    s._flDay=M.day;s._fl={xl:0,l:0,m:0,s:0,hist:[]};s._tp=[];
    s._pb=[];s._ph=0;s._sq=0;s._vk=1;s._dmp=0;
    s._seal=0;s._sealQty=0;s._hot=(R()<0.03)?1:0;
    s.vol=0;s.amount=0;
    s._dq=null;initDepth(s);
   }
   sealSync(s);norm(s);churn(s);
   var h=s.hist[s.hist.length-1];
   if(!h)continue;
   if(!s._mb)s._mb={ph:0,left:15+Math.floor(R()*26)};
   if(!s._yz)s._yz={on:0,t:0,dump:0};
   if(s.hist.length<2){s.hist.push({p:s.price,v:0,m:0});h=s.hist[s.hist.length-1]}
   if(s._pm!==M.minute){s._pm=M.minute;s._pulse=(R()<0.05)?(1.6+R()*2.6):1}
   var P=s._mb.ph,yz=s._yz;
   var vkP=[0.70,1.30,0.50,2.00,1.20][P];
   var tgt=[0.006,0.015,-0.008,0.030,-0.020][P];
   if(P===3&&M.minute>=215)tgt=0.038;
   if(P===4&&M.minute>=215)tgt=-0.028;
   if(yz.on)tgt=tgt*1.5;
   var dr=s.open?(s.price/s.open-1):0,limPct=s.prev?(s.up/s.prev-1):0.10;
   var band=s._hot?(limPct+0.005):(Math.abs(tgt)+0.025);
   var dirK=(tgt-dr)*20;
   if(dr>band)dirK=-1.2;else if(dr<-band)dirK=1.2;
   if(yz.dump>0&&M.minute<=8)dirK-=0.5;
   if(P===0&&s._dmp>0){dirK=-0.7;s._dmp-=1/TK;}
   if(s._jtm!==M.minute){
    s._jtm=M.minute;
    if(s._jpt>0){s._jpt--;}
    else if(M.minute>2&&M.minute<235&&R()<(s._hot||s._seal?0.022:0.008)){
     s._jpt=2+Math.floor(R()*4);s._jd=R()<0.58?1:-1;s._jm=0.5+R()*1.0;
    }
   }
   if(s._jpt>0){dirK+=s._jd*s._jm;}
   if(dirK>1.5)dirK=1.5;if(dirK<-1.5)dirK=-1.5;
   var q=Math.round(baseQ(s)*(dirK*0.1+(R()-0.5)*0.02)*(s._pulse||1));
   if(UB){q+=Math.round(((UB[i]||0)-(US[i]||0))*UQK);}
   var traded=0;
   if(q>0)traded=sweep(s,1,q);else if(q<0)traded=sweep(s,-1,-q);
   sealSync(s);
   if(s._seal===1&&R()<0.05){
    var hit=Math.round(baseQ(s)*(0.03+R()*0.10));s._sealQty-=hit;
    if(s._sealQty<=0){s._seal=0;s._sealQty=0;s.price=f2(c2(s.up)-1);traded+=hit}
   }else if(s._seal===-1&&R()<0.05){
    var hit2=Math.round(baseQ(s)*(0.03+R()*0.10));s._sealQty-=hit2;
    if(s._sealQty<=0){s._seal=0;s._sealQty=0;s.price=f2(c2(s.dn)+1);traded+=hit2}
   }
   norm(s);syncBook(s);
   if(s._sq>0){pr(s,s._sp,s._sq,s._sd);s._sq=0}
   if(traded>0){
    s.vol=(s.vol||0)+traded/100;
    s.amount=(s.amount||0)+traded*s.price;
    h.v=(h.v||0)+traded/100;
   }
   if(s.price>s.high)s.high=s.price;
   if(s.price<s.low)s.low=s.price;
   h.p=s.price;
   var lh=s._fl.hist[s._fl.hist.length-1];
   if(!(lh&&lh.t===M.minute)){s._fl.hist.push({xl:s._fl.xl,l:s._fl.l,m:s._fl.m,s:s._fl.s,t:M.minute});if(s._fl.hist.length>240)s._fl.hist.shift()}
   else{lh.xl=s._fl.xl;lh.l=s._fl.l;lh.m=s._fl.m;lh.s=s._fl.s}
  }
  if(window.UQ&&window.UQ.clear)window.UQ.clear();
 }
 function run(){
  if(M._obMin===M.minute)return;
  M._obMin=M.minute;
  for(var i=0;i<M.stocks.length;i++){
   var s=M.stocks[i];
   if(!s._mb)s._mb={ph:0,left:15+Math.floor(R()*26)};
   if(!s._yz)s._yz={on:0,t:0,dump:0};
   if(M.minute<=1){
    s._seal=0;s._sealQty=0;s._pb=[];s._dmp=0;s._mb.left--;
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
   if(!s._yz.on&&M.minute>5&&M.minute<232&&R()<(yzPick(s)?0.025:0.004)){s._yz.on=1;s._yz.t=3+Math.floor(R()*6);}
   if(s._yz.on){s._yz.t--;if(s._yz.t<=0){s._yz.on=0;s._yz.dump=1+(R()<0.5?1:0)}}
   if(s._mb.ph===0&&s._dmp<=0&&R()<0.03)s._dmp=1+Math.floor(R()*3);
   if(!s._pb)s._pb=[];
   var prevP=s._pb.length?s._pb[s._pb.length-1]:s.price;
   s._pb.push(s.price);if(s._pb.length>31)s._pb.shift();
   var mvv=prevP?Math.abs(s.price-prevP)/prevP:0;
   s._vk=Math.min(4,Math.max(0.25,0.25+mvv*250));
   s._ph=s._mb.ph;
  }
 }
 window.__ob=function(){flowTick();run()};
 var old=window.stepMinute,real=window.__stepReal;
 window.stepMinute=function(){old();flowTick();run()};
 if(real)window.__stepReal=function(){real();flowTick();run()};
})();
