var $=function(s){return document.querySelector(s)},$$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
var K='sim2',HOT={'600519':'贵州茅台','000858':'五粮液','000001':'平安银行','300750':'宁德时代','601318':'中国平安'};
var S=ld(),Q={},cur=null;
function td(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function ld(){try{var s=JSON.parse(localStorage.getItem(K));if(s&&s.pos)return s}catch(e){}return{cash:1000000,pos:{},day:td(),watch:['600519','000001','300750']}}
function sv(){try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}}
function ts(m){var t=$('#ts');t.textContent=m;t.classList.add('on');clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove('on')},2000)}
function cls(n){return n>0?'r':n<0?'g':'s'}
function sg(n){return(n>0?'+':'')+n.toFixed(2)}
function tc(c){var p=c[0];return(p=='6'||p=='9'||p=='5')?'sh'+c:(p=='4'||p=='8')?'bj'+c:'sz'+c}
function sid(c){var p=c[0];return(p=='6'||p=='9'||p=='5'?'1.':'0.')+c}
function gq(cs){if(!cs.length)return Promise.resolve({});return new Promise(function(res){
 var s=document.createElement('script');s.charset='gbk';s.src='https://qt.gtimg.cn/q='+cs.map(tc).join(',')+'&_='+Date.now();
 s.onload=function(){var o={};cs.forEach(function(c){var v=window['v_'+tc(c)];if(typeof v=='string'){var a=v.split('~');if(a.length>48){var bd=[],ak=[];for(var i=0;i<5;i++){bd.push({p:+a[9+i*2],v:+a[10+i*2]});ak.push({p:+a[19+i*2],v:+a[20+i*2]})}o[c]={c:a[2],n:a[1],p:+a[3],pre:+a[4],op:+a[5],vol:+a[6],chg:+a[31],pct:+a[32],hi:+a[33],lo:+a[34],amt:+a[37],bd:bd,ak:ak}}try{delete window['v_'+tc(c)]}catch(e){}});s.remove();res(o)};
 s.onerror=function(){s.remove();res({})};document.head.appendChild(s)})}
function fq(cs){return gq(cs).then(function(o){for(var c in o)Q[c]=o[c];return cs.map(function(c){return Q[c]}).filter(Boolean)})}
function jp(u){return new Promise(function(res){var n='cb'+Math.random().toString(36).slice(2),s=document.createElement('script');window[n]=function(d){try{s.remove()}catch(e){};try{delete window[n]}catch(e){};res(d)};s.src=u+'&cb='+n;document.head.appendChild(s)})}
function tr(c){return jp('https://push2his.eastmoney.com/api/qt/stock/trends2/get?secid='+sid(c)+'&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58&iscr=0&ndays=1&ut=fa5fd1943c7b386f172d6893dbfba10b').then(function(d){var dd=d&&d.data;return{pre:(dd&&(dd.preClose||dd.prePrice))||0,list:((dd&&dd.trends)||[]).map(function(x){var a=x.split(',');return{p:+a[2],v:+a[5]}}).filter(function(x){return x.p>0})}})}
function draw(ls,pre){
 var cv=$('#cv'),r=cv.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2.5),w=r.width,h=210;
 cv.width=w*d;cv.height=h*d;cv.style.height=h+'px';var x=cv.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,h);
 if(!ls||!ls.length){x.fillStyle='#7d8b9c';x.font='12px sans-serif';x.fillText('暂无分时数据',12,30);return}
 if(!pre)pre=ls[0].p;var mx=pre,mn=pre;ls.forEach(function(v){mx=Math.max(mx,v.p);mn=Math.min(mn,v.p)});
 var pd=(mx-mn)*0.15||pre*0.01;mx+=pd;mn-=pd;
 var L=6,R=w-40,T=10,PH=h*0.68,VY=T+PH+6,VH=h-VY-10;
 function X(i){return L+(R-L)*i/Math.max(1,ls.length-1)}function Y(p){return T+PH-(p-mn)/(mx-mn)*PH}
 x.strokeStyle='#1a2432';x.fillStyle='#7d8b9c';x.font='10px sans-serif';x.textAlign='right';
 for(var i=0;i<=3;i++){var y=T+PH*i/3;x.beginPath();x.moveTo(L,y);x.lineTo(R,y);x.stroke();x.fillText((mx-(mx-mn)*i/3).toFixed(2),w-2,y+3)}
 x.setLineDash([3,3]);x.strokeStyle='#4a5868';x.beginPath();x.moveTo(L,Y(pre));x.lineTo(R,Y(pre));x.stroke();x.setLineDash([]);
 var vm=0;ls.forEach(function(v){if(v.v>vm)vm=v.v});vm=vm||1;var bw=Math.max(1,(R-L)/ls.length*0.7);
 ls.forEach(function(v,i){x.fillStyle=(v.p>=(i?ls[i-1].p:pre))?'rgba(255,82,82,.5)':'rgba(0,208,156,.5)';var vh=(v.v||0)/vm*VH;x.fillRect(X(i)-bw/2,VY+VH-vh,bw,vh)});
 x.strokeStyle='#e6edf3';x.lineWidth=1.4;x.beginPath();ls.forEach(function(v,i){var y=Y(v.p);i?x.lineTo(X(i),y):x.moveTo(X(i),y)});x.stroke();
}
function rw(){var b=$('#wl');b.innerHTML='<div class="emp">加载中…</div>';
 fq(S.watch).then(function(qs){var m={};qs.forEach(function(q){m[q.c]=q});
  b.innerHTML=S.watch.map(function(c){var q=m[c],cl=q?cls(q.chg):'s';
   return'<div class="w" data-c="'+c+'"><div class="l"><div class="n">'+(q?q.n:(HOT[c]||c))+'</div><div class="cd">'+c+'</div></div><div class="rt"><div class="p m '+cl+'">'+(q?q.p.toFixed(2):'--')+'</div><div class="pc m '+cl+'">'+(q?sg(q.chg)+' '+sg(q.pct)+'%':'--')+'</div></div></div>'}).join('');
  $$('#wl .w').forEach(function(e){e.onclick=function(){od(e.getAttribute('data-c'))}})})}
function od(c){cur=c;$('#dt').classList.add('on');$('#ip').value='';
 fq([c]).then(function(qs){if(qs[0]){pq(qs[0]);$('#ip').value=qs[0].p.toFixed(2)}});
 tr(c).then(function(d){draw(d.list,d.pre)}).catch(function(){})}
function pq(q){$('#dn').textContent=q.n+' '+q.c;$('#dp').textContent=q.p.toFixed(2);$('#dp').className='qp m '+cls(q.chg);
 $('#dc').textContent=sg(q.chg)+'  '+sg(q.pct)+'%';$('#dc').className='qc m '+cls(q.chg);
 $('#dm').textContent='今开 '+q.op.toFixed(2)+' · 最高 '+q.hi.toFixed(2)+' · 最低 '+q.lo.toFixed(2)+' · 昨收 '+q.pre.toFixed(2);
 var h='';for(var i=4;i>=0;i--)h+='<div class="lv"><span>卖'+(i+1)+'</span><span class="m s">'+(q.ak[i].p?q.ak[i].p.toFixed(2):'--')+'</span><span class="m s">'+q.ak[i].v+'</span></div>';
 h+='<div class="lv" style="border-top:1px solid #1e2937;border-bottom:1px solid #1e2937"><span>最新</span><span class="m">'+q.p.toFixed(2)+'</span><span class="m s">'+Math.round(q.vol/100)+'手</span></div>';
 for(var j=0;j<5;j++)h+='<div class="lv"><span>买'+(j+1)+'</span><span class="m s">'+(q.bd[j].p?q.bd[j].p.toFixed(2):'--')+'</span><span class="m s">'+q.bd[j].v+'</span></div>';
 $('#lv').innerHTML=h}
function fee(a,s){var c=Math.max(5,a*0.00025),st=s=='sell'?a*0.0005:0,tr=a*0.00001;return c+st+tr}
function fi(){var p=parseFloat($('#ip').value)||0,n=parseInt($('#iq').value)||0;if(!p||!n){$('#fi').textContent='手续费：--';return}$('#fi').textContent='金额 '+(p*n).toFixed(2)+' · 佣金 '+Math.max(5,p*n*0.00025).toFixed(2)+' · 卖出另收印花税 '+(p*n*0.0005).toFixed(2)}
function trade(side){
 if(!cur)return ts('先选股票');var q=Q[cur];if(!q)return ts('行情未就绪');
 var n=parseInt($('#iq').value),p=parseFloat($('#ip').value);
 if(!(p>0)||!(n>0))return ts('填价格和数量');if(side=='buy'&&n%100)return ts('买入须100股整数倍');
 if(side=='buy'){var ak=q.ak.filter(function(x){return x.p>0})[0];if(!ak)return ts('无卖盘');if(p<ak.p)return ts('价格低于卖一，暂不成交');
  var px=ak.p,a=px*n,f=fee(a,'buy');if(a+f>S.cash)return ts('资金不足');
  S.cash-=a+f;var pos=S.pos[cur]||{c:cur,n:q.n,qty:0,avail:0,cost:0};var nq=pos.qty+n;pos.cost=(pos.cost*pos.qty+a+f)/nq;pos.qty=nq;pos.n=q.n;S.pos[cur]=pos;ts('买入成交 '+px.toFixed(2)+'×'+n)}
 else{var pos=S.pos[cur];if(!pos)return ts('无持仓');if(pos.avail<n)return ts('可卖不足(T+1)');
  var bd=q.bd.filter(function(x){return x.p>0})[0];if(!bd)return ts('无买盘');if(p>bd.p)return ts('价格高于买一，暂不成交');
  var px=bd.p,a=px*n;S.cash+=a-fee(a,'sell');pos.qty-=n;pos.avail-=n;if(pos.qty<=0)delete S.pos[cur];ts('卖出成交 '+px.toFixed(2)+'×'+n)}
 sv();rp();rm()}
function rp(){var b=$('#pl'),cs=Object.keys(S.pos);if(!cs.length){b.innerHTML='<div class="emp">暂无持仓</div>';return}
 fq(cs).then(function(){b.innerHTML=cs.map(function(c){var p=S.pos[c],q=Q[c]||{p:0},pr=q.p||0,pnl=(pr-p.cost)*p.qty,pc=p.cost?(pr-p.cost)/p.cost*100:0;
  return'<div class="w"><div class="l"><div class="n">'+p.n+'</div><div class="cd">'+c+' · 持仓'+p.qty+' 可用'+p.avail+'</div></div><div class="rt"><div class="p m '+cls(pnl)+'">'+pnl.toFixed(2)+'</div><div class="pc m '+cls(pnl)+'">'+sg(pc)+'%</div></div></div>'}).join('')})}
function rm(){var cs=Object.keys(S.pos);fq(cs).then(function(){var mv=0,pn=0;cs.forEach(function(c){var p=S.pos[c],q=Q[c];if(q){mv+=q.p*p.qty;pn+=(q.p-p.cost)*p.qty}});
 $('#t1').textContent=(S.cash+mv).toFixed(2);$('#t2').textContent=S.cash.toFixed(2);$('#t3').textContent=mv.toFixed(2);$('#t4').textContent=sg(pn);$('#t4').className='m '+cls(pn)})}
function go(n){$$('.pg').forEach(function(p){p.classList.toggle('on',p.id=='p'+n)});$$('.nav button').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-p')==n)});if(n=='1')rw();if(n=='2')rp();if(n=='3')rm()}
$$('.nav button').forEach(function(b){b.onclick=function(){go(b.getAttribute('data-p'))}});
$('#bk').onclick=function(){$('#dt').classList.remove('on')};
$('#add').onclick=function(){var v=$('#q').value.trim();if(!/^\d{6}$/.test(v))return ts('请输入6位代码');if(S.watch.indexOf(v)<0)S.watch.push(v);$('#q').value='';sv();rw();ts('已添加')};
$('#bb').onclick=function(){trade('buy')};$('#bs').onclick=function(){trade('sell')};
$('#ip').oninput=fi;$('#iq').oninput=fi;
setInterval(function(){var d=new Date();$('#ck').textContent=d.toLocaleString('zh-CN',{hour12:false})},1000);
setInterval(function(){if(!$('#dt').classList.contains('on')||!cur)return;fq([cur]).then(function(qs){if(qs[0])pq(qs[0])})},5000);
go('1');
