<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<meta name="theme-color" content="#0b0f14">
<title>模拟股市</title>
<style>
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{margin:0;background:#0b0f14;color:#e6edf3;font:14px/1.5 -apple-system,"PingFang SC",sans-serif}
button{font:inherit;color:inherit;background:none;border:0;padding:0}
input{font:inherit;color:#e6edf3;background:#0f151d;border:1px solid #1e2937;border-radius:8px;padding:9px;width:100%;outline:none}
.hd{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid #1e2937;position:sticky;top:0;background:#0b0f14;z-index:5}
.hd b{font-size:17px}
.hd small{display:block;color:#7d8b9c;font-size:11px;font-weight:400}
.pg{display:none;padding:12px 12px 76px}.pg.on{display:block}
.card{background:#141b24;border:1px solid #1e2937;border-radius:12px;padding:12px;margin-bottom:12px}
.r{color:#ff5252}.g{color:#00d09c}.s{color:#7d8b9c}
.m{font-variant-numeric:tabular-nums}
.w{display:flex;align-items:center;padding:10px 2px;border-bottom:1px solid #1a2432}
.w:last-child{border-bottom:0}
.w .l{flex:1;min-width:0}.w .n{font-size:15px}.w .c{font-size:11px;color:#7d8b9c}
.w .rt{text-align:right}.w .p{font-size:16px;font-weight:600}.w .pc{font-size:11px}
.btn{background:#e8b339;color:#1a1300;border-radius:8px;padding:9px 14px;font-weight:600;white-space:nowrap}
.btn.g2{background:#1a2432;color:#e6edf3;border:1px solid #1e2937}
.sr{display:flex;gap:8px;margin-bottom:12px}.sr input{flex:1}
.nav{position:fixed;left:0;right:0;bottom:0;display:flex;background:#0e141c;border-top:1px solid #1e2937;z-index:9}
.nav button{flex:1;padding:9px 0;font-size:11px;color:#7d8b9c}
.nav button.on{color:#e8b339}
#dt{position:fixed;inset:0;background:#0b0f14;z-index:20;transform:translateX(102%);transition:.2s;overflow:auto;padding-bottom:24px}
#dt.on{transform:none}
.dh{display:flex;align-items:center;gap:10px;padding:12px;border-bottom:1px solid #1e2937;position:sticky;top:0;background:#0b0f14;z-index:2}
.dh b{flex:1}.dh button{font-size:22px;color:#7d8b9c}
.q{padding:12px 16px}.qp{font-size:30px;font-weight:700}.qc{font-size:13px}
.qm{font-size:11px;color:#7d8b9c;margin-top:8px;display:flex;gap:12px;flex-wrap:wrap}
.tb{display:flex;gap:6px;padding:6px 12px}
.tb button{padding:5px 14px;border-radius:14px;background:#131b25;color:#7d8b9c;font-size:12px}
.tb button.on{background:#e8b339;color:#1a1300}
canvas{display:block;width:100%;height:230px}
.lv{display:flex;justify-content:space-between;font-size:12px;padding:4px 14px}
.lv span:nth-child(2){flex:1;text-align:right;margin-right:18px}
.f{padding:12px}.f .ln{display:flex;gap:8px;margin-bottom:8px}
.f .ln button{flex:1;background:#131b25;border:1px solid #1e2937;border-radius:8px;padding:8px;font-size:12px;color:#7d8b9c}
.acts{display:flex;gap:10px;margin-top:8px}
.acts button{flex:1;padding:12px;border-radius:10px;font-size:16px;font-weight:600}
.buy{background:#ff5252;color:#fff}.sell{background:#00d09c;color:#04241b}
.oh{font-size:13px;color:#7d8b9c;margin:12px 0 4px}
.od{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #1a2432;font-size:12px}
.od button{border:1px solid #1e2937;border-radius:6px;padding:3px 9px;font-size:11px;color:#7d8b9c}
.st{display:flex;justify-content:space-between;padding:6px 0;font-size:13px}
.st .k{color:#7d8b9c}
.big{font-size:26px;font-weight:700}
#ts{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#1e2834;padding:9px 16px;border-radius:9px;font-size:13px;opacity:0;transition:.2s;z-index:99;pointer-events:none;max-width:80vw;text-align:center}
#ts.on{opacity:1}
.ta{width:100%;height:90px;background:#0f151d;border:1px solid #1e2937;border-radius:8px;color:#e6edf3;padding:8px;font:12px monospace}
.note{font-size:11px;color:#7d8b9c;line-height:1.6}
.emp{text-align:center;color:#7d8b9c;padding:24px 0;font-size:13px}
</style>
</head>
<body>
<div class="hd"><b>模拟股市<small id="ck">v0.3 加载中…</small></b><button class="btn g2" id="rf">刷新</button></div>
<div class="pg on" id="p1"><div class="sr"><input id="q" placeholder="代码或名称，如 600519"><button class="btn" id="add">添加</button></div><div class="card" id="wl"></div></div>
<div class="pg" id="p2"><div class="card"><div class="oh">持仓</div><div id="pl"></div></div><div class="card"><div class="oh">委托</div><div id="ol"></div></div></div>
<div class="pg" id="p3"><div class="card"><div class="st"><span class="k">总资产</span><span class="big m" id="t1">--</span></div><div class="st"><span class="k">可用</span><span class="m" id="t2">--</span></div><div class="st"><span class="k">市值</span><span class="m" id="t3">--</span></div><div class="st"><span class="k">浮动盈亏</span><span class="m" id="t4">--</span></div></div><div class="card"><div class="oh">备份</div><textarea class="ta" id="bk"></textarea><div class="acts"><button class="btn g2" id="ex">导出</button><button class="btn" id="im">导入</button></div></div><div class="card note">T+1 · 买入100股整数倍 · 佣金万2.5（最低5元）· 卖出印花税0.05% · 过户费0.001%<br>行情延迟数秒，仅供学习，不构成投资建议。</div><button class="btn g2" id="rs" style="width:100%">重置账户</button></div>
<div class="nav"><button class="on" data-p="1">★ 自选</button><button data-p="2">▤ 持仓</button><button data-p="3">☰ 我的</button></div>
<div id="dt"><div class="dh"><button id="bk2">‹</button><b id="dn">--</b><button id="st">☆</button></div><div class="q"><div class="qp m" id="dp">--</div><div class="qc m" id="dc"></div><div class="qm" id="dm"></div></div><div class="tb"><button class="on" data-c="t">分时</button><button data-c="k">日K</button></div><canvas id="cv"></canvas><div id="lv"></div><div class="f"><div class="ln"><input id="ip" type="number" step="0.01" placeholder="价格"><input id="iq" type="number" step="100" placeholder="数量(股)"></div><div class="ln"><button data-s="100">100股</button><button data-s="500">500股</button><button data-s="1000">1000股</button><button data-s="max">全仓</button></div><div class="note" id="fi">手续费：--</div><div class="acts"><button class="buy" id="bb">买入</button><button class="sell" id="bs">卖出</button></div></div></div>
<div id="ts"></div>
<script>
window.onerror=function(m,s,l){
 var d=document.createElement('div');
 d.style.cssText='position:fixed;top:0;left:0;right:0;background:#c00;color:#fff;padding:8px;font-size:12px;z-index:999';
 d.textContent='错误：'+m+' 第'+l+'行';
 document.body.appendChild(d);
 return false;
};
</script>
<script>
var $=function(s){return document.querySelector(s)};
var $$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
var K='sim1';
var HOT={'600519':'贵州茅台','000858':'五粮液','601318':'中国平安','600036':'招商银行','000001':'平安银行','300750':'宁德时代','002594':'比亚迪','601899':'紫金矿业','300059':'东方财富','688981':'中芯国际'};
var S=ld(),Q={},cur=null,mode='t';
function td(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function ld(){try{var s=JSON.parse(localStorage.getItem(K));if(s&&typeof s.cash=='number'&&s.pos)return s}catch(e){}return{cash:1000000,pos:{},ord:[],day:td(),seq:1,watch:['600519','000001','300750']}}
function sv(){try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}}
function tm(){var d=new Date();return('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+':'+('0'+d.getSeconds()).slice(-2)}
function ts(m){var t=$('#ts');if(!t)return;t.textContent=m;t.classList.add('on');clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove('on')},2000)}
function rd(){var t=td();if(S.day!=t){for(var c in S.pos)S.pos[c].avail=S.pos[c].qty;S.day=t;sv()}}
function cls(n){return n>0?'r':n<0?'g':'s'}
function sg(n){return(n>0?'+':'')+n.toFixed(2)}
function tc(c){var p=c[0];if(p=='6'||p=='9'||p=='5')return'sh'+c;if(p=='4'||p=='8')return'bj'+c;return'sz'+c}
function sid(c){var p=c[0];return(p=='6'||p=='9'||p=='5'?'1.':'0.')+c}
function gq(cs){return new Promise(function(res,rej){
 var s=document.createElement('script');s.charset='gbk';s.src='https://qt.gtimg.cn/q='+cs.map(tc).join(',')+'&_='+Date.now();
 var done=false,t=setTimeout(function(){if(!done){done=true;try{s.remove()}catch(e){};rej('t')}},8000);
 s.onload=function(){
  if(done)return;done=true;clearTimeout(t);
  var o={};
  cs.forEach(function(c){
   var v=window['v_'+tc(c)];
   if(typeof v=='string'){
    var a=v.split('~');
    if(a.length>48){
     var bd=[],ak=[];
     for(var i=0;i<5;i++){bd.push({p:+a[9+i*2],v:+a[10+i*2]});ak.push({p:+a[19+i*2],v:+a[20+i*2]})}
     o[c]={c:a[2],n:a[1],p:+a[3],pre:+a[4],op:+a[5],vol:+a[6],chg:+a[31],pct:+a[32],hi:+a[33],lo:+a[34],amt:+a[37],up:+a[47],dn:+a[48],bd:bd,ak:ak};
    }
   }
   try{delete window['v_'+tc(c)]}catch(e){}
  });
  try{s.remove()}catch(e){}
  res(o);
 };
 s.onerror=function(){if(done)return;done=true;clearTimeout(t);try{s.remove()}catch(e){};rej('n')};
 document.head.appendChild(s);
})}
function fq(cs,force){
 var need=force?cs.slice():cs.filter(function(c){return !Q[c]||Date.now()-Q[c].t>3000});
 if(!need.length)return Promise.resolve(cs.map(function(c){return Q[c]&&Q[c].q}).filter(Boolean));
 return gq(need).then(function(o){
  for(var c in o)Q[c]={q:o[c],t:Date.now()};
  return cs.map(function(c){return Q[c]&&Q[c].q}).filter(Boolean);
 }).catch(function(){return cs.map(function(c){return Q[c]&&Q[c].q}).filter(Boolean)});
}
function jp(u){return new Promise(function(res,rej){
 var n='cb'+Math.random().toString(36).slice(2),s=document.createElement('script');
 var t=setTimeout(function(){cl();rej('t')},10000);
 function cl(){clearTimeout(t);try{s.remove()}catch(e){};try{delete window[n]}catch(e){}}
 window[n]=function(d){cl();res(d)};
 s.src=u+(u.indexOf('?')>-1?'&':'?')+'cb='+n;
 s.onerror=function(){cl();rej('n')};
 document.head.appendChild(s);
})}
function tr(c){return jp('https://push2his.eastmoney.com/api/qt/stock/trends2/get?secid='+sid(c)+'&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58&iscr=0&ndays=1&ut=fa5fd1943c7b386f172d6893dbfba10b').then(function(d){
 var dd=d&&d.data;
 return{pre:(dd&&(dd.preClose||dd.prePrice))||0,list:((dd&&dd.trends)||[]).map(function(x){var a=x.split(',');return{p:+a[2],v:+a[5],avg:+a[7]}}).filter(function(x){return x.p>0})};
})}
function kl(c){return jp('https://push2his.eastmoney.com/api/qt/stock/kline/get?secid='+sid(c)+'&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56&klt=101&fqt=1&end=20500101&lmt=120&ut=fa5fd1943c7b386f172d6893dbfba10b').then(function(d){
 return((d&&d.data&&d.data.klines)||[]).map(function(x){var a=x.split(',');return{d:a[0],o:+a[1],c:+a[2],h:+a[3],l:+a[4],v:+a[5]}});
})}
function rw(){
 rd();var b=$('#wl');b.innerHTML='<div class="emp">加载中…</div>';
 fq(S.watch,true).then(function(qs){
  var m={};qs.forEach(function(q){m[q.c]=q});
  b.innerHTML=S.watch.map(function(c){
   var q=m[c],cl=q?cls(q.chg):'s';
   return'<div class="w" data-c="'+c+'"><div class="l"><div class="n">'+(q?q.n:(HOT[c]||c))+'</div><div class="c">'+c+'</div></div><div class="rt"><div class="p m '+cl+'">'+(q?q.p.toFixed(2):'--')+'</div><div class="pc m '+cl+'">'+(q?sg(q.chg)+' '+sg(q.pct)+'%':'--')+'</div></div></div>';
  }).join('');
  $$('#wl .w').forEach(function(e){e.onclick=function(){od(e.getAttribute('data-c'))}});
 });
}
function od(c){
 cur=c;mode='t';$('#dt').classList.add('on');
 $('#dn').textContent=(HOT[c]||c)+' '+c;
 $('#st').textContent=S.watch.indexOf(c)>-1?'★':'☆';
 $('#ip').value='';
 $$('.tb button').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-c')=='t')});
 fq([c],true).then(function(qs){if(qs[0]){pq(qs[0]);$('#ip').value=qs[0].p.toFixed(2)}}).catch(function(){});
 dr();
}
function pq(q){
 $('#dn').textContent=q.n+' '+q.c;
 $('#dp').textContent=q.p.toFixed(2);$('#dp').className='qp m '+cls(q.chg);
 $('#dc').textContent=sg(q.chg)+'  '+sg(q.pct)+'%';$('#dc').className='qc m '+cls(q.chg);
 $('#dm').innerHTML='<span>今开 '+q.op.toFixed(2)+'</span><span>最高 '+q.hi.toFixed(2)+'</span><span>最低 '+q.lo.toFixed(2)+'</span><span>昨收 '+q.pre.toFixed(2)+'</span><span>额 '+(q.amt/10000).toFixed(2)+'亿</span>';
 var h='';
 for(var i=4;i>=0;i--)h+='<div class="lv"><span>卖'+(i+1)+'</span><span class="m s">'+(q.ak[i].p?q.ak[i].p.toFixed(2):'--')+'</span><span class="m s">'+q.ak[i].v+'</span></div>';
 h+='<div class="lv" style="border-top:1px solid #1e2937;border-bottom:1px solid #1e2937"><span>最新</span><span class="m">'+q.p.toFixed(2)+'</span><span class="m s">'+Math.round(q.vol/100)+'手</span></div>';
 for(var j=0;j<5;j++)h+='<div class="lv"><span>买'+(j+1)+'</span><span class="m s">'+(q.bd[j].p?q.bd[j].p.toFixed(2):'--')+'</span><span class="m s">'+q.bd[j].v+'</span></div>';
 $('#lv').innerHTML=h;
}
function dr(){
 if(!cur)return;
 if(mode=='t')tr(cur).then(function(d){dt($('#cv'),d.list,d.pre)}).catch(function(){});
 else kl(cur).then(function(d){dk($('#cv'),d)}).catch(function(){});
}
function cv2(c,h){
 var r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2.5);
 c.width=r.width*d;c.height=h*d;c.style.height=h+'px';
 var x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,r.width,h);
 return{x:x,w:r.width,h:h};
}
function dt(c,ls,pre){
 var o=cv2(c,230),x=o.x,w=o.w,h=o.h;
 if(!ls||!ls.length){x.fillStyle='#7d8b9c';x.font='12px sans-serif';x.fillText('暂无分时数据',12,30);return}
 if(!pre)pre=ls[0].p;
 var mx=pre,mn=pre;
 ls.forEach(function(v){mx=Math.max(mx,v.p,v.avg||v.p);mn=Math.min(mn,v.p,v.avg||v.p)});
 var pd=(mx-mn)*0.12||pre*0.01;mx+=pd;mn-=pd;
 var L=6,R=w-42,T=10,PH=h*0.64,VY=T+PH+8,VH=h-VY-12;
 function X(i){return L+(R-L)*i/Math.max(1,ls.length-1)}
 function Y(p){return T+PH-(p-mn)/(mx-mn)*PH}
 x.strokeStyle='#1a2432';x.fillStyle='#7d8b9c';x.font='10px sans-serif';x.textAlign='right';
 for(var i=0;i<=4;i++){var y=T+PH*i/4;x.beginPath();x.moveTo(L,y);x.lineTo(R,y);x.stroke();x.fillText((mx-(mx-mn)*i/4).toFixed(2),w-2,y+3)}
 x.setLineDash([3,3]);x.strokeStyle='#4a5868';x.beginPath();x.moveTo(L,Y(pre));x.lineTo(R,Y(pre));x.stroke();x.setLineDash([]);
 var vm=0;ls.forEach(function(v){if(v.v>vm)vm=v.v});vm=vm||1;
 var bw=Math.max(1,(R-L)/ls.length*0.7);
 ls.forEach(function(v,i){
  x.fillStyle=(v.p>=(i?ls[i-1].p:pre))?'rgba(255,82,82,.5)':'rgba(0,208,156,.5)';
  var vh=(v.v||0)/vm*VH;x.fillRect(X(i)-bw/2,VY+VH-vh,bw,vh);
 });
 x.strokeStyle='#e8b339';x.lineWidth=1;x.beginPath();
 ls.forEach(function(v,i){var y=Y(v.avg||v.p);i?x.lineTo(X(i),y):x.moveTo(X(i),y)});
 x.stroke();
 x.strokeStyle='#e6edf3';x.lineWidth=1.4;x.beginPath();
 ls.forEach(function(v,i){var y=Y(v.p);i?x.lineTo(X(i),y):x.moveTo(X(i),y)});
 x.stroke();
}
function dk(c,ds){
 var o=cv2(c,230),x=o.x,w=o.w,h=o.h;
 if(!ds||!ds.length){x.fillStyle='#7d8b9c';x.font='12px sans-serif';x.fillText('暂无K线',12,30);return}
 var mx=-1e9,mn=1e9;
 ds.forEach(function(v){mx=Math.max(mx,v.h);mn=Math.min(mn,v.l)});
 var pd=(mx-mn)*0.08||1;mx+=pd;mn-=pd;
 var L=6,R=w-42,T=10,PH=h*0.66,VY=T+PH+8,VH=h-VY-10,n=ds.length,cw=(R-L)/n;
 function Y(p){return T+PH-(p-mn)/(mx-mn)*PH}
 x.strokeStyle='#1a2432';x.fillStyle='#7d8b9c';x.font='10px sans-serif';x.textAlign='right';
 for(var i=0;i<=4;i++){var y=T+PH*i/4;x.beginPath();x.moveTo(L,y);x.lineTo(R,y);x.stroke();x.fillText((mx-(mx-mn)*i/4).toFixed(2),w-2,y+3)}
 ds.forEach(function(v,i){
  var up=v.c>=v.o,col=up?'#ff5252':'#00d09c',cx2=L+cw*i+cw/2,bw=Math.max(1,cw*0.6);
  x.strokeStyle=col;x.fillStyle=col;x.lineWidth=1;
  x.beginPath();x.moveTo(cx2,Y(v.h));x.lineTo(cx2,Y(v.l));x.stroke();
  var y1=Y(Math.max(v.o,v.c)),y2=Y(Math.min(v.o,v.c));
  if(up){x.fillStyle='#0b0f14';x.fillRect(cx2-bw/2,y1,bw,Math.max(1,y2-y1));x.strokeRect(cx2-bw/2,y1,bw,Math.max(1,y2-y1))}
  else x.fillRect(cx2-bw/2,y1,bw,Math.max(1,y2-y1));
 });
 var vm=0;ds.forEach(function(v){if(v.v>vm)vm=v.v});vm=vm||1;
 ds.forEach(function(v,i){
  x.fillStyle=(v.c>=v.o)?'rgba(255,82,82,.5)':'rgba(0,208,156,.5)';
  var vh=v.v/vm*VH;x.fillRect(L+cw*i+cw*0.2,VY+VH-vh,cw*0.6,vh);
 });
}
function fee(a,s){var c=Math.max(5,a*0.00025),st=s=='sell'?a*0.0005:0,tr2=a*0.00001;return{total:c+st+tr2,c:c,st:st}}
function fi(){
 var p=parseFloat($('#ip').value)||0,n=parseInt($('#iq').value)||0;
 if(!p||!n){$('#fi').textContent='手续费：--';return}
 var a=p*n,f=fee(a,'buy');
 $('#fi').textContent='金额 '+a.toFixed(2)+' · 佣金 '+f.c.toFixed(2)+' · 过户费 '+(a*0.00001).toFixed(3)+'（卖出另收印花税 '+(a*0.0005).toFixed(2)+'）';
}
function buy(side){
 if(!cur)return ts('先选股票');
 var q=Q[cur]&&Q[cur].q;if(!q)return ts('行情未就绪');
 var p=parseFloat($('#ip').value),n=parseInt($('#iq').value);
 if(!(p>0)||!(n>0))return ts('请填价格和数量');
 if(side=='buy'&&n%100)return ts('买入须100股整数倍');
 if(q.up&&p>q.up+0.001)return ts('超过涨停价 '+q.up);
 if(q.dn&&p<q.dn-0.001)return ts('低于跌停价 '+q.dn);
 if(side=='buy'){
  var a=p*n,f=fee(a,'buy'),est=a+f.total;
  if(est>S.cash)return ts('可用资金不足');
  S.cash-=est;
  var o={id:S.seq++,c:cur,n:q.n,side:side,p:p,q:n,st:'p',t:tm(),est:est};
  S.ord.unshift(o);
  var ak=q.ak.filter(function(x){return x.p>0})[0];
  if(ak&&p>=ak.p)fl(o,ak.p);
 }else{
  var pos=S.pos[cur];
  if(!pos)return ts('没有持仓');
  if(pos.avail<n)return ts('可卖不足（T+1）');
  pos.avail-=n;
  var o2={id:S.seq++,c:cur,n:q.n,side:side,p:p,q:n,st:'p',t:tm(),est:0};
  S.ord.unshift(o2);
  var bd=q.bd.filter(function(x){return x.p>0})[0];
  if(bd&&p<=bd.p)fl(o2,bd.p);
 }
 sv();ro();rp();rm();ts(side=='buy'?'买入已提交':'卖出已提交');
}
function fl(o,px){
 if(o.st!='p')return;
 var a=px*o.q;
 if(o.side=='buy'){
  var f=fee(a,'buy');S.cash+=o.est-a-f.total;
  var p=S.pos[o.c]||{c:o.c,n:o.n,qty:0,avail:0,cost:0};
  var nq=p.qty+o.q;p.cost=(p.cost*p.qty+a+f.total)/nq;p.qty=nq;p.n=o.n;S.pos[o.c]=p;
 }else{
  var f2=fee(a,'sell');S.cash+=a-f2.total;
  var p2=S.pos[o.c];if(p2){p2.qty-=o.q;if(p2.qty<=0)delete S.pos[o.c]}
 }
 o.st='f';o.fp=px;sv();
}
function ro(){
 var b=$('#ol');
 if(!S.ord.length){b.innerHTML='<div class="emp">暂无委托</div>';return}
 b.innerHTML=S.ord.slice(0,15).map(function(o){
  var st=o.st=='p'?'待成交':o.st=='f'?'已成交':'已撤单';
  return'<div class="od"><div>'+o.n+' <span class="'+(o.side=='buy'?'r':'g')+'">'+(o.side=='buy'?'买':'卖')+'</span> '+o.p.toFixed(2)+' × '+o.q+'<div class="s" style="font-size:11px">'+o.t+' · '+st+(o.fp?' @'+o.fp.toFixed(2):'')+'</div></div>'+(o.st=='p'?'<button data-i="'+o.id+'">撤单</button>':'')+'</div>';
 }).join('');
 $$('#ol button').forEach(function(b2){b2.onclick=function(){cx(+b2.getAttribute('data-i'))}});
}
function cx(id){
 var o=null;for(var i=0;i<S.ord.length;i++)if(S.ord[i].id==id)o=S.ord[i];
 if(!o||o.st!='p')return;
 o.st='c';
 if(o.side=='buy')S.cash+=o.est;
 else if(S.pos[o.c])S.pos[o.c].avail+=o.q;
 sv();ro();rp();rm();ts('已撤单');
}
function rp(){
 rd();var b=$('#pl'),cs=Object.keys(S.pos);
 if(!cs.length){b.innerHTML='<div class="emp">暂无持仓</div>';return}
 fq(cs,false).then(function(){
  b.innerHTML=cs.map(function(c){
   var p=S.pos[c],q=Q[c]&&Q[c].q,pr=q?q.p:0,mv=pr*p.qty,pnl=(pr-p.cost)*p.qty,pc=p.cost?(pr-p.cost)/p.cost*100:0;
   return'<div class="w" data-c="'+c+'"><div class="l"><div class="n">'+p.n+'</div><div class="c">'+c+' · 持仓'+p.qty+' 可用'+p.avail+'</div></div><div class="rt"><div class="p m '+cls(pnl)+'">'+pnl.toFixed(2)+'</div><div class="pc m '+cls(pnl)+'">'+sg(pc)+'% · 市值'+mv.toFixed(0)+'</div></div></div>';
  }).join('');
  $$('#pl .w').forEach(function(e){e.onclick=function(){od(e.getAttribute('data-c'))}});
 });
}
function rm(){
 var cs=Object.keys(S.pos);
 fq(cs,false).then(function(){
  var mv=0,pn=0;
  cs.forEach(function(c){var p=S.pos[c],q=Q[c]&&Q[c].q;if(q){mv+=q.p*p.qty;pn+=(q.p-p.cost)*p.qty}});
  $('#t1').textContent=(S.cash+mv).toFixed(2);
  $('#t2').textContent=S.cash.toFixed(2);
  $('#t3').textContent=mv.toFixed(2);
  $('#t4').textContent=sg(pn);$('#t4').className='m '+cls(pn);
 });
}
function go(n){
 $$('.pg').forEach(function(p){p.classList.toggle('on',p.id=='p'+n)});
 $$('.nav button').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-p')==n)});
 if(n==1)rw();if(n==2){rp();ro()}if(n==3)rm();
}
$$('.nav button').forEach(function(b){b.onclick=function(){go(+b.getAttribute('data-p'))}});
$('#rf').onclick=function(){go(+$$('.pg.on')[0].id.slice(1))};
$('#bk2').onclick=function(){$('#dt').classList.remove('on')};
$('#st').onclick=function(){
 if(!cur)return;
 var i=S.watch.indexOf(cur);
 if(i>-1)S.watch.splice(i,1);else S.watch.push(cur);
 sv();$('#st').textContent=i>-1?'☆':'★';ts(i>-1?'已移出自选':'已加入自选');rw();
};
$$('.tb button').forEach(function(b){b.onclick=function(){
 mode=b.getAttribute('data-c');
 $$('.tb button').forEach(function(x){x.classList.toggle('on',x==b)});
 dr();
}});
$('#bb').onclick=function(){buy('buy')};
$('#bs').onclick=function(){buy('sell')};
$$('.ln [data-s]').forEach(function(b){b.onclick=function(){
 var v=b.getAttribute('data-s');
 if(v=='max'){
  var p=parseFloat($('#ip').value)||(Q[cur]&&Q[cur].q&&Q[cur].q.p)||0;
  if(!p)return;
  $('#iq').value=S.pos[cur]?S.pos[cur].avail:Math.floor(S.cash/(p*100))*100;
 }else $('#iq').value=v;
 fi();
}});
$('#ip').oninput=fi;$('#iq').oninput=fi;
$('#add').onclick=function(){
 var v=$('#q').value.trim();if(!v)return;
 var code='';
 if(/^\d{6}$/.test(v))code=v;
 else{var ks=Object.keys(HOT);for(var i=0;i<ks.length;i++)if(HOT[ks[i]].indexOf(v)>-1){code=ks[i];break}}
 if(!code)return ts('没找到，请输入6位代码');
 if(S.watch.indexOf(code)<0)S.watch.push(code);
 $('#q').value='';sv();rw();ts('已添加 '+code);
};
$('#ex').onclick=function(){$('#bk').value=JSON.stringify(S);ts('已生成，长按复制')};
$('#im').onclick=function(){
 try{var o=JSON.parse($('#bk').value);if(typeof o.cash!='number'||!o.pos)throw 0;S=o;sv();rw();rm();ts('导入成功')}catch(e){ts('备份格式不对')}
};
$('#rs').onclick=function(){
 if(confirm('确定重置？持仓和记录会清空')){localStorage.removeItem(K);S=ld();sv();rw();rm();ts('已重置')}
};
setInterval(function(){var d=new Date();$('#ck').textContent=d.toLocaleString('zh-CN',{hour12:false})},1000);
setInterval(function(){
 if(!$('#dt').classList.contains('on')||!cur)return;
 fq([cur],true).then(function(qs){if(qs[0])pq(qs[0])}).catch(function(){});
},4000);
setInterval(function(){
 var pend=S.ord.filter(function(o){return o.st=='p'});
 if(!pend.length)return;
 var cs=[];pend.forEach(function(o){if(cs.indexOf(o.c)<0)cs.push(o.c)});
 fq(cs,true).then(function(){
  var ch=false;
  pend.forEach(function(o){
   var q=Q[o.c]&&Q[o.c].q;if(!q||!q.p)return;
   if(o.side=='buy'){var ak=q.ak.filter(function(x){return x.p>0})[0];if(ak&&o.p>=ak.p){fl(o,ak.p);ch=true}}
   else{var bd=q.bd.filter(function(x){return x.p>0})[0];if(bd&&o.p<=bd.p){fl(o,bd.p);ch=true}}
  });
  if(ch){ro();rp();rm()}
 }).catch(function(){});
},5000);
go(1);
</script>
</body>
</html>
