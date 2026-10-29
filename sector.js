// 板块指数 v3：流通市值加权 + 成交量 + 领涨股 + 百分比轴
(function(){
 var on=false,cur=-1,mode='t',kcache={},kday=-1;
 function E(id){return document.getElementById(id)}
 function fw(st){return st.floatShares||st.shares}
 function sg(n){return(n>0?'+':'')+n.toFixed(2)}
 function base(si){var s=0;for(var i=0;i<M.stocks.length;i++){var st=M.stocks[i];if(si>=0&&st.si!==si)continue;s+=st.baseCap*(fw(st)/st.shares)}return s||1}
 function val(si,prev){var s=0;for(var i=0;i<M.stocks.length;i++){var st=M.stocks[i];if(si>=0&&st.si!==si)continue;s+=(prev?st.prev:st.price)*fw(st)}return 1000*s/base(si)}
 function trend(si){
  var i,m,list=[],w=[];
  for(i=0;i<M.stocks.length;i++){var st=M.stocks[i];if(si>=0&&st.si!==si)continue;list.push(st);w.push(fw(st))}
  if(!list.length)return [];
  var B=base(si),P=[],V=[];
  for(i=0;i<list.length;i++){
   var a=[],b=[],hs=list[i].hist||[];
   for(m=0;m<=240;m++){a.push(null);b.push(0)}
   for(var k=0;k<hs.length;k++){
    var h=hs[k],mm=(h.m==null?k:h.m);
    if(mm!==Math.floor(mm)||mm<0||mm>240)continue;
    a[mm]=h.p;b[mm]=h.v||0;
   }
   P.push(a);V.push(b);
  }
  var out=[];
  for(m=0;m<=M.minute&&m<=240;m++){
   var s=0,v=0;
   for(i=0;i<list.length;i++){
    var p=P[i][m];if(p==null)p=list[i].price;
    s+=p*w[i];v+=V[i][m];
   }
   out.push({p:1000*s/B,v:v,m:m});
  }
  return out;
 }
 function kl(si){
  if(kday!==M.day){kcache={};kday=M.day}
  if(kcache[si])return kcache[si];
  var out=[];
  for(var j=0;j<120;j++){
   var so=0,sh=0,sl=0,sc=0,sv=0,den=0;
   for(var i=0;i<M.stocks.length;i++){
    var st=M.stocks[i];if(si>=0&&st.si!==si)continue;
    var k=st.kline[j];if(!k)continue;
    var w=fw(st);den+=st.baseCap*(w/st.shares);
    so+=k.o*w;sh+=k.h*w;sl+=k.l*w;sc+=k.c*w;sv+=k.v;
   }
   if(!den)continue;
   out.push({o:1000*so/den,h:1000*sh/den,l:1000*sl/den,c:1000*sc/den,v:sv});
  }
  kcache[si]=out;
  return out;
 }
 function cv(hh){
  var c=E('idxCv'),r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=r.width;
  c.width=w*d;c.height=hh*d;c.style.height=hh+'px';
  var x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,hh);
  return{x:x,w:w,h:hh};
 }
 function drawTrend(arr,prev){
  var o=cv(220),x=o.x,w=o.w,h=o.h;
  if(arr.length<2){x.fillStyle='#7d8b9c';x.font='12px sans-serif';x.fillText('等待行情…',12,30);return}
  var mx=prev,mn=prev;
  arr.forEach(function(v){if(v.p>mx)mx=v.p;if(v.p<mn)mn=v.p});
  var dev=Math.max(Math.abs(mx-prev),Math.abs(mn-prev))*1.1||prev*0.005;
  mx=prev+dev;mn=prev-dev;
  var L=6,R=w-64,T=8,PH=h*0.6,VY=T+PH+10,VH=h-VY-12;
  function X(i){var mm=arr[i].m!=null?arr[i].m:i;return L+(R-L)*mm/240}
  function Y(p){return T+PH-(p-mn)/(mx-mn)*PH}
  x.strokeStyle='#1a2432';x.font='9px sans-serif';x.textAlign='right';
  for(var i=0;i<=4;i++){
   var y=T+PH*i/4,val=mx-(mx-mn)*i/4,pct=(val-prev)/prev*100;
   x.beginPath();x.moveTo(L,y);x.lineTo(R,y);x.stroke();
   x.fillStyle='#5c6b7a';x.fillText(val.toFixed(2),w-32,y+3);
   x.fillStyle=pct>0.001?'#ff5252':pct<-0.001?'#00d09c':'#7d8b9c';
   x.fillText((pct>0?'+':'')+pct.toFixed(2)+'%',w-2,y+3);
  }
  x.setLineDash([3,3]);x.strokeStyle='#4a5868';x.beginPath();x.moveTo(L,Y(prev));x.lineTo(R,Y(prev));x.stroke();x.setLineDash([]);
  var vmax=0;arr.forEach(function(v){if(v.v>vmax)vmax=v.v});vmax=vmax||1;
  var bw=Math.max(1,(R-L)/240*0.7);
  arr.forEach(function(v,i){x.fillStyle=(v.p>=(i?arr[i-1].p:prev))?'rgba(255,82,82,.5)':'rgba(0,208,156,.5)';var vh=Math.min(v.v,vmax)/vmax*VH;x.fillRect(X(i)-bw/2,VY+VH-vh,bw,Math.max(1,vh))});
  x.strokeStyle='#e8b339';x.lineWidth=1.5;x.beginPath();
  arr.forEach(function(v,i){var yy=Y(v.p);i?x.lineTo(X(i),yy):x.moveTo(X(i),yy)});
  x.stroke();
 }
 function drawK(ds){
  var o=cv(220),x=o.x,w=o.w,h=o.h;
  if(!ds.length){x.fillStyle='#7d8b9c';x.font='12px sans-serif';x.fillText('暂无K线，收盘后生成',12,30);return}
  var mx=-1e9,mn=1e9;
  ds.forEach(function(v){if(v.h>mx)mx=v.h;if(v.l<mn)mn=v.l});
  var pad=(mx-mn)*0.1||1;mx+=pad;mn-=pad;
  var L=6,R=w-64,T=8,PH=h*0.58,VY=T+PH+10,VH=h-VY-12,n=ds.length,cw=(R-L)/n;
  function Y(p){return T+PH-(p-mn)/(mx-mn)*PH}
  function X(i){return L+cw*i+cw/2}
  x.strokeStyle='#1a2432';x.fillStyle='#7d8b9c';x.font='9px sans-serif';x.textAlign='right';
  for(var i=0;i<=4;i++){var y=T+PH*i/4;x.beginPath();x.moveTo(L,y);x.lineTo(R,y);x.stroke();x.fillText((mx-(mx-mn)*i/4).toFixed(2),w-4,y+3)}
  ds.forEach(function(v,i){
   var up=v.c>=v.o,col=up?'#ff5252':'#00d09c',bw=Math.max(1,cw*0.6);
   x.strokeStyle=col;x.fillStyle=col;x.beginPath();x.moveTo(X(i),Y(v.h));x.lineTo(X(i),Y(v.l));x.stroke();
   var y1=Y(Math.max(v.o,v.c)),y2=Y(Math.min(v.o,v.c));
   if(up){x.fillStyle='#0b0f14';x.fillRect(X(i)-bw/2,y1,bw,Math.max(1,y2-y1));x.strokeRect(X(i)-bw/2,y1,bw,Math.max(1,y2-y1))}
   else x.fillRect(X(i)-bw/2,y1,bw,Math.max(1,y2-y1));
  });
  var vmax=0;ds.forEach(function(v){if(v.v>vmax)vmax=v.v});vmax=vmax||1;
  ds.forEach(function(v,i){var up=v.c>=v.o;x.fillStyle=up?'rgba(255,82,82,.45)':'rgba(0,208,156,.45)';var vh=Math.min(v.v,vmax)/vmax*VH;x.fillRect(L+cw*i+cw*0.2,VY+VH-vh,cw*0.6,Math.max(1,vh))});
  var mas=[{k:5,c:'#e8b339'},{k:10,c:'#6aa9ff'},{k:20,c:'#c06aff'}];
  mas.forEach(function(m){
   var sum=0,arr=[];
   for(var i=0;i<ds.length;i++){sum+=ds[i].c;if(i>=m.k)sum-=ds[i-m.k].c;arr.push(i>=m.k-1?sum/m.k:null)}
   x.strokeStyle=m.c;x.lineWidth=1;x.beginPath();var st=false;
   arr.forEach(function(v,i){if(v==null)return;var yy=Y(v);if(!st){x.moveTo(X(i),yy);st=true}else x.lineTo(X(i),yy)});
   x.stroke();
  });
  x.font='10px sans-serif';x.textAlign='left';
  x.fillStyle='#e8b339';x.fillText('MA5',L,12);
  x.fillStyle='#6aa9ff';x.fillText('MA10',L+34,12);
  x.fillStyle='#c06aff';x.fillText('MA20',L+74,12);
 }
 function cnt(si){var n=0;for(var i=0;i<M.stocks.length;i++)if(M.stocks[i].si===si)n++;return n}
 function leader(si){
  var best=null;
  for(var i=0;i<M.stocks.length;i++){
   var st=M.stocks[i];if(st.si!==si)continue;
   var q=st.prev?((st.price-st.prev)/st.prev*100):0;
   if(!best||q>best.q)best={n:st.name,q:q};
  }
  return best;
 }
 function render(){
  if(!on)return;
  var now=val(cur,false),prev=val(cur,true);
  var pc=prev?((now-prev)/prev*100):0;
  E('idxTitle').textContent=cur<0?'上证模拟指数':SECTORS[cur]+'指数';
  E('idxVal').textContent=now.toFixed(2)+'  '+(pc>0?'+':'')+pc.toFixed(2)+'%';
  E('idxVal').className='m '+(pc>0?'r':pc<0?'g':'s');
  E('secBack').style.display=cur<0?'none':'inline';
  if(mode==='t')drawTrend(trend(cur),prev);
  else drawK(kl(cur));
  var h='';
  if(cur<0){
   for(var i=0;i<SECTORS.length;i++){
    var n2=val(i,false),p2=val(i,true),q=p2?((n2-p2)/p2*100):0,cl=q>0?'r':q<0?'g':'s';
    var ld=leader(i);
    h+='<div class="w" data-s="'+i+'"><div class="l"><div class="n">'+SECTORS[i]+'</div><div class="cd">'+cnt(i)+'只 · 领涨 '+ld.n+' '+sg(ld.q)+'%</div></div><div class="rt"><div class="p m '+cl+'">'+n2.toFixed(2)+'</div><div class="pc m '+cl+'">'+(q>0?'+':'')+q.toFixed(2)+'%</div></div></div>';
   }
  }else{
   for(var i=0;i<M.stocks.length;i++){
    var st=M.stocks[i];if(st.si!==cur)continue;
    var q3=st.prev?((st.price-st.prev)/st.prev*100):0,cl3=q3>0?'r':q3<0?'g':'s';
    h+='<div class="w" data-c="'+st.code+'"><div class="l"><div class="n">'+st.name+'</div><div class="cd">'+st.code+'</div></div><div class="rt"><div class="p m '+cl3+'">'+st.price.toFixed(2)+'</div><div class="pc m '+cl3+'">'+sg(q3)+'%</div></div></div>';
   }
  }
  E('secList').innerHTML=h;
  [].forEach.call(document.querySelectorAll('#secList .w'),function(e){
   e.onclick=function(){
    var s=e.getAttribute('data-s');
    if(s!=null){cur=+s;render()}
    else{var c=e.getAttribute('data-c');if(typeof od==='function')od(c)}
   };
  });
 }
 function show(v){
  on=v;
  E('rankWrap').style.display=v?'none':'block';
  E('secWrap').style.display=v?'block':'none';
  E('tabRank').className=v?'':'on';
  E('tabSec').className=v?'on':'';
  if(v)render();
 }
 var cvEl=E('idxCv');
 var bar=document.createElement('div');
 bar.className='tabs2';
 bar.innerHTML='<button class="on" data-m="t">分时</button><button data-m="k">日K</button>';
 cvEl.parentNode.insertBefore(bar,cvEl);
 [].forEach.call(bar.querySelectorAll('button'),function(b){
  b.onclick=function(){
   mode=b.getAttribute('data-m');
   [].forEach.call(bar.querySelectorAll('button'),function(x){x.classList.toggle('on',x===b)});
   render();
  };
 });
 E('tabRank').onclick=function(){show(false)};
 E('tabSec').onclick=function(){show(true)};
 E('secBack').onclick=function(){cur=-1;render()};
 setInterval(function(){if(on)render()},1000);
})();
