// 市场引擎 v8：更稳的随机数 + 公允价带锚 + 波动率对齐历史
var M={stocks:[],day:1,minute:0,phase:'open',index:1000,base:0,news:[],tick:0,seed:20261027,mood:0,secMood:[]};
var ENGINE_VER='v8';
var DAILY_VOL=[0.010,0.020,0.030,0.032,0.025,0.022,0.026,0.030,0.020,0.032,0.020,0.025];
var TURNOVER=[0.003,0.008,0.025,0.030,0.020,0.012,0.020,0.025,0.012,0.030,0.010,0.015];
function rnd(){
 var x=M.seed;
 x^=x<<13;x>>>=0;
 x^=x>>>17;
 x^=x<<5;x>>>=0;
 M.seed=x;
 return x/4294967296;
}
function gauss(){var u=0,v=0;while(u===0)u=rnd();while(v===0)v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(6.283185307*v)}
function r2(x){return Math.round(x*100)/100}
function initMarket(){
 M.seed=20261027;M.mood=0;M.secMood=[];
 for(var i=0;i<SECTORS.length;i++)M.secMood.push(0);
 M.stocks=STOCKS.map(function(a){
  var price=a[3],sh=a[4],pe=SECTOR_PE[a[2]];
  var st={code:a[0],name:a[1],si:a[2],price:price,prev:price,open:price,high:price,low:price,vol:0,amount:0,
   shares:sh,floatShares:sh*0.72,pe:pe,eps:r2(price/pe),
   up:r2(price*1.1),dn:r2(price*0.9),baseCap:price*sh,tempMove:0,
   hist:[],kline:[],book:{bids:[],asks:[]},
   volBase:Math.max(220,Math.round(sh*4.5))};
  genHistory(st,price);
  st.lf=Math.log(st.price);
  st.lfair=st.lf;
  st.anchor=st.lf;
  return st;
 });
 for(var k=0;k<M.stocks.length;k++){buildBook(M.stocks[k]);M.stocks[k].hist=[{p:M.stocks[k].price,v:0,m:0}]}
 M.base=M.stocks.reduce(function(s,x){return s+x.prev*x.shares},0);
 M.index=1000;M.day=1;M.minute=0;M.phase='open';M.news=[];M.tick=0;
 document.title='模拟股市 '+ENGINE_VER;
}
function genHistory(st,price){
 var cl=[],p=price;
 for(var i=0;i<120;i++){cl.unshift(p);p=p/(1+gauss()*0.018)}
 for(var j=0;j<120;j++){
  var c=r2(cl[j]);
  var o=r2(j?cl[j-1]:c*(1+gauss()*0.005));
  var hi=r2(Math.max(o,c)*(1+Math.abs(gauss())*0.006));
  var lo=r2(Math.min(o,c)*(1-Math.abs(gauss())*0.006));
  var v=Math.max(1,Math.round(st.volBase*240*Math.exp(gauss()*0.35)*(0.55+rnd()*0.9)));
  st.kline.push({d:j-119,o:o,h:hi,l:lo,c:c,v:v});
 }
 st.price=r2(cl[119]);st.prev=st.price;st.open=st.price;st.high=st.price;st.low=st.price;
 st.up=r2(st.price*1.1);st.dn=r2(st.price*0.9);
}
function buildBook(st){
 var sp=Math.max(0.01,+(st.price*0.0006).toFixed(2)),b=[],a=[];
 for(var i=0;i<5;i++){
  b.push({p:r2(st.price-sp*(i+1)),q:100*Math.round(2+rnd()*20)});
  a.push({p:r2(st.price+sp*(i+1)),q:100*Math.round(2+rnd()*20)});
 }
 st.book={bids:b,asks:a};
}
function stepMinute(){
 if(M.phase!=='open')return;
 M.minute++;M.tick++;
 if(M.minute>240){closeDay();return}
 M.mood=M.mood*0.94+gauss()*0.02;
 for(var i=0;i<M.secMood.length;i++)M.secMood[i]=M.secMood[i]*0.93+gauss()*0.025;
 for(var k=0;k<M.stocks.length;k++){
  var st=M.stocks[k];
  st.lfair+=-0.002*(st.lfair-st.anchor)+M.mood*0.0002+M.secMood[st.si]*0.0004+0.0012*gauss();
  var dev=st.lf-st.lfair;
  var ret=-0.02*dev+0.0015*gauss();
  if(rnd()<0.001)ret+=(rnd()<0.5?-1:1)*0.012;
  st.lf+=ret;
  var np=Math.exp(st.lf);
  np=Math.min(st.up,Math.max(st.dn,np));
  st.price=r2(np);
  st.lf=Math.log(st.price);
  if(st.price>st.high)st.high=st.price;
  if(st.price<st.low)st.low=st.price;
  var us=1+1.2*Math.exp(-M.minute/25)+0.7*Math.exp(-(240-M.minute)/25);
  var bv=st.volBase*us*Math.exp(gauss()*0.45)*(0.45+Math.abs(ret)*260);
  if(rnd()<0.012)bv*=2+rnd()*4;
  var v=Math.max(1,Math.round(bv));
  st.vol+=v;st.amount+=v*st.price;
  st.hist.push({p:st.price,v:v,m:M.minute});
  buildBook(st);
 }
 var sum=0;
 for(var j=0;j<M.stocks.length;j++)sum+=M.stocks[j].price*M.stocks[j].shares;
 M.index=r2(1000*sum/M.base);
 maybeNews();
}
function applyImpact(code,side,qtyShares,px){
 var st=getStock(code);if(!st)return;
 var amt=px*qtyShares;
 var floatCap=st.price*st.floatShares*1e8;
 var adv=Math.max(1e7,floatCap*TURNOVER[st.si]);
 var ratio=amt/adv;
 var mag=DAILY_VOL[st.si]*0.7*Math.sqrt(ratio);
 if(mag>0.085)mag=0.085;
 var dir=side==='buy'?1:-1;
 var move=dir*mag*(0.8+0.4*rnd());
 st.lfair+=move*0.3;
 st.lf+=move;
 var np=Math.min(st.up,Math.max(st.dn,Math.exp(st.lf)));
 st.price=r2(np);st.lf=Math.log(st.price);
 if(st.price>st.high)st.high=st.price;
 if(st.price<st.low)st.low=st.price;
 st.vol+=Math.round(qtyShares/100);st.amount+=amt;
 var hv=Math.round(qtyShares/100);
 var last=st.hist[st.hist.length-1];
 if(last&&last.m===M.minute){last.p=st.price;last.v=(last.v||0)+hv}
 else{st.hist.push({p:st.price,v:hv,m:M.minute})}
 var spill=mag*0.18*(0.5+rnd());
 for(var i=0;i<M.stocks.length;i++){
  var o=M.stocks[i];
  if(o===st||o.si!==st.si)continue;
  var m2=dir*spill*(0.6+0.6*rnd());
  o.lfair+=m2*0.3;o.lf+=m2;
  var p2=Math.min(o.up,Math.max(o.dn,Math.exp(o.lf)));
  o.price=r2(p2);o.lf=Math.log(o.price);
  if(o.price>o.high)o.high=o.price;
  if(o.price<o.low)o.low=o.price;
  var lo=o.hist[o.hist.length-1];
  if(lo&&lo.m===M.minute){lo.p=o.price}
  else{o.hist.push({p:o.price,v:0,m:M.minute})}
  buildBook(o);
 }
 buildBook(st);
}
function closeDay(){
 M.phase='closed';
 for(var i=0;i<M.stocks.length;i++){
  var s=M.stocks[i];
  s.kline.push({d:M.day,o:s.open,h:s.high,l:s.low,c:s.price,v:s.vol});
  if(s.kline.length>120)s.kline.shift();
  s.prev=s.price;s.open=s.price;s.high=s.price;s.low=s.price;s.vol=0;s.amount=0;
  s.hist=[{p:s.price,v:0,m:0}];s.tempMove=0;
  s.up=r2(s.price*1.1);s.dn=r2(s.price*0.9);
 }
 M.day++;M.minute=0;M.phase='open';
 if(window.onNewDay)window.onNewDay();
}
var NEWS_GOOD=['政策利好落地','业绩预增','订单大增','行业景气回升','获大额中标'];
var NEWS_BAD=['监管收紧','业绩下滑','需求疲软','资金撤离','遭机构下调评级'];
function maybeNews(){
 if(rnd()>0.015)return;
 var si=Math.floor(rnd()*SECTORS.length),up=rnd()<0.55;
 var arr=up?NEWS_GOOD:NEWS_BAD;
 var txt=SECTORS[si]+'板块'+(up?'传来利好：':'出现压力：')+arr[Math.floor(rnd()*arr.length)];
 M.secMood[si]+=(up?1:-1)*0.012;
 M.news.unshift({day:M.day,time:fmtTime(M.minute),text:txt,up:up,si:si});
 if(M.news.length>60)M.news.pop();
}
function fmtTime(m){
 var t=9*60+30+m;
 if(t>11*60+30)t+=90;
 return('0'+Math.floor(t/60)).slice(-2)+':'+('0'+t%60).slice(-2);
}
function getStock(code){
 for(var i=0;i<M.stocks.length;i++)if(M.stocks[i].code===code)return M.stocks[i];
 return null;
}
function indexChange(){
 var cur=0,prev=0;
 for(var i=0;i<M.stocks.length;i++){cur+=M.stocks[i].price*M.stocks[i].shares;prev+=M.stocks[i].prev*M.stocks[i].shares}
 return prev?((cur-prev)/prev*100):0;
}
initMarket();
