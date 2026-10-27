// 市场引擎 v3：历史K线、成交量、平方根冲击、冲击衰减、板块联动
var M={stocks:[],day:1,minute:0,phase:'open',index:1000,base:0,news:[],tick:0,seed:20261027,mood:0,secMood:[]};
var DAILY_VOL=[0.010,0.020,0.030,0.032,0.025,0.022,0.026,0.030,0.020,0.032,0.020,0.025];
var TURNOVER=[0.003,0.008,0.025,0.030,0.020,0.012,0.020,0.025,0.012,0.030,0.010,0.015];
function rnd(){M.seed=(M.seed*1103515245+12345)&0x7fffffff;return M.seed/0x7fffffff}
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
   volBase:Math.max(120,Math.round(sh*6.25))};
  genHistory(st,price);
  return st;
 });
 for(var k=0;k<M.stocks.length;k++){buildBook(M.stocks[k]);M.stocks[k].hist=[{p:M.stocks[k].price,v:0}]}
 M.base=M.stocks.reduce(function(s,x){return s+x.prev*x.shares},0);
 M.index=1000;M.day=1;M.minute=0;M.phase='open';M.news=[];M.tick=0;
}
function genHistory(st,price){
 var cl=[],p=price;
 for(var i=0;i<120;i++){cl.unshift(p);p=p/(1+gauss()*0.018)}
 for(var j=0;j<120;j++){
  var c=r2(cl[j]);
  var o=r2(j?cl[j-1]:c*(1+gauss()*0.005));
  var hi=r2(Math.max(o,c)*(1+Math.abs(gauss())*0.006));
  var lo=r2(Math.min(o,c)*(1-Math.abs(gauss())*0.006));
  var v=Math.max(100,Math.round(st.volBase*240*(0.6+rnd()*0.8)/100)*100);
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
 M.mood=M.mood*0.985+gauss()*0.015;
 for(var i=0;i<M.secMood.length;i++)M.secMood[i]=M.secMood[i]*0.97+gauss()*0.03;
 for(var k=0;k<M.stocks.length;k++){
  var st=M.stocks[k];
  var drift=M.mood*0.0006+M.secMood[st.si]*0.001;
  var vol=0.0018+((st.si===2||st.si===3||st.si===7)?0.0012:0);
  var ret=drift+vol*gauss();
  if(rnd()<0.0015)ret+=(rnd()<0.5?-1:1)*0.015;
  var np=st.price*(1+ret);
  if(st.tempMove){
   var back=st.tempMove*0.04;
   np=np*(1-back);
   st.tempMove-=back;
   if(Math.abs(st.tempMove)<0.0002)st.tempMove=0;
  }
  np=Math.min(st.up,Math.max(st.dn,np));
  st.price=r2(np);
  if(st.price>st.high)st.high=st.price;
  if(st.price<st.low)st.low=st.price;
  var v=Math.round(st.volBase*(0.6+Math.abs(ret)*300)*(0.5+rnd()*1.5));
  v=Math.max(100,Math.round(v/100)*100);
  st.vol+=v;st.amount+=v*st.price;
  st.hist.push({p:st.price,v:v});
  if(st.hist.length>241)st.hist.shift();
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
 var np=st.price*(1+move);
 np=Math.min(st.up,Math.max(st.dn,np));
 st.tempMove+=move*0.7;
 st.price=r2(np);
 if(st.price>st.high)st.high=st.price;
 if(st.price<st.low)st.low=st.price;
 st.vol+=Math.round(qtyShares/100);st.amount+=amt;
 st.hist.push({p:st.price,v:qtyShares});
 if(st.hist.length>241)st.hist.shift();
 var spill=mag*0.18*(0.5+rnd());
 for(var i=0;i<M.stocks.length;i++){
  var o=M.stocks[i];
  if(o===st||o.si!==st.si)continue;
  var m2=dir*spill*(0.6+0.6*rnd());
  var p2=o.price*(1+m2);
  p2=Math.min(o.up,Math.max(o.dn,p2));
  o.tempMove+=m2*0.7;
  o.price=r2(p2);
  if(o.price>o.high)o.high=o.price;
  if(o.price<o.low)o.low=o.price;
  o.hist.push({p:o.price,v:0});
  if(o.hist.length>241)o.hist.shift();
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
  s.hist=[{p:s.price,v:0}];s.tempMove=0;
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
