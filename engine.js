// 市场引擎：价格、板块、指数、新闻、盘口
var M={stocks:[],day:1,minute:0,phase:'open',index:1000,base:0,news:[],tick:0,seed:20261027,mood:0,secMood:[]};
function rnd(){M.seed=(M.seed*1103515245+12345)&0x7fffffff;return M.seed/0x7fffffff}
function gauss(){var u=0,v=0;while(u===0)u=rnd();while(v===0)v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(6.283185307*v)}
function initMarket(){
 M.seed=20261027;M.mood=0;M.secMood=[];
 for(var i=0;i<SECTORS.length;i++)M.secMood.push(0);
 M.stocks=STOCKS.map(function(a){
  var price=a[3],sh=a[4],pe=SECTOR_PE[a[2]];
  return{code:a[0],name:a[1],si:a[2],price:price,prev:price,open:price,high:price,low:price,vol:0,amount:0,
   shares:sh,floatShares:sh*0.72,pe:pe,eps:+(price/pe).toFixed(2),
   up:+(price*1.1).toFixed(2),dn:+(price*0.9).toFixed(2),baseCap:price*sh,
   hist:[price],kline:[],book:{bids:[],asks:[]},
   volBase:Math.max(200,Math.round(sh*1e8*0.004/price/240))};
 });
 M.stocks.forEach(buildBook);
 M.base=M.stocks.reduce(function(s,x){return s+x.baseCap},0);
 M.index=1000;M.day=1;M.minute=0;M.phase='open';M.news=[];M.tick=0;
}
function buildBook(st){
 var sp=Math.max(0.01,+(st.price*0.0006).toFixed(2)),b=[],a=[];
 for(var i=0;i<5;i++){
  b.push({p:+(st.price-sp*(i+1)).toFixed(2),q:100*Math.round(2+rnd()*20)});
  a.push({p:+(st.price+sp*(i+1)).toFixed(2),q:100*Math.round(2+rnd()*20)});
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
  np=Math.min(st.up,Math.max(st.dn,np));
  st.price=Math.round(np*100)/100;
  if(st.price>st.high)st.high=st.price;
  if(st.price<st.low)st.low=st.price;
  var v=Math.round(st.volBase*(0.6+Math.abs(ret)*300)*(0.5+rnd()*1.5));
  v=Math.max(100,Math.round(v/100)*100);
  st.vol+=v;st.amount+=v*st.price;
  st.hist.push(st.price);
  if(st.hist.length>241)st.hist.shift();
  buildBook(st);
 }
 var sum=0;
 for(var j=0;j<M.stocks.length;j++)sum+=M.stocks[j].price*M.stocks[j].shares;
 M.index=Math.round(1000*sum/M.base*100)/100;
 maybeNews();
}
function closeDay(){
 M.phase='closed';
 for(var i=0;i<M.stocks.length;i++){
  var s=M.stocks[i];
  s.kline.push({d:M.day,o:s.open,h:s.high,l:s.low,c:s.price,v:s.vol});
  if(s.kline.length>120)s.kline.shift();
  s.prev=s.price;s.open=s.price;s.high=s.price;s.low=s.price;s.vol=0;s.amount=0;s.hist=[s.price];
  s.up=Math.round(s.price*1.1*100)/100;
  s.dn=Math.round(s.price*0.9*100)/100;
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
 var cur=M.stocks.reduce(function(s,x){return s+x.price*x.shares},0);
 var prev=M.stocks.reduce(function(s,x){return s+x.prev*x.shares},0);
 return prev?((cur-prev)/prev*100):0;
}
initMarket();
