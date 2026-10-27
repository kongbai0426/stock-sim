var W=loadW(),sel=null,mode='t',boardUp=true;
function loadW(){try{var a=JSON.parse(localStorage.getItem('sim_watch'));if(a&&a.length)return a}catch(e){}return['600519','000001','300750','601318','600036','002594']}
function saveW(){try{localStorage.setItem('sim_watch',JSON.stringify(W))}catch(e){}}
function E(id){return document.getElementById(id)}
function cls(n){return n>0?'r':n<0?'g':'s'}
function sg(n){return(n>0?'+':'')+n.toFixed(2)}
function ts(m){var t=E('ts');t.textContent=m;t.classList.add('on');clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove('on')},1800)}
function pctOf(s){return s.prev?((s.price-s.prev)/s.prev*100):0}
function rw(){
 var h='';
 W.forEach(function(c){var s=getStock(c);if(!s)return;var p=pctOf(s);
  h+='<div class="w" data-c="'+c+'"><div class="l"><div class="n">'+s.name+'</div><div class="cd">'+c+' · '+SECTORS[s.si]+'</div></div><div class="rt"><div class="p m '+cls(p)+'">'+s.price.toFixed(2)+'</div><div class="pc m '+cls(p)+'">'+sg(p)+'%</div></div></div>'});
 E('wl').innerHTML=h||'<div class="emp">暂无自选</div>';
 [].forEach.call(document.querySelectorAll('#wl .w'),function(e){e.onclick=function(){od(e.getAttribute('data-c'))}});
}
function rb(){
 var a=M.stocks.slice().sort(function(x,y){return pctOf(y)-pctOf(x)});
 if(!boardUp)a.reverse();
 var h='';
 a.slice(0,30).forEach(function(s){var p=pctOf(s);
  h+='<div class="w" data-c="'+s.code+'"><div class="l"><div class="n">'+s.name+'</div><div class="cd">'+s.code+' · '+SECTORS[s.si]+'</div></div><div class="rt"><div class="p m '+cls(p)+'">'+s.price.toFixed(2)+'</div><div class="pc m '+cls(p)+'">'+sg(p)+'%</div></div></div>'});
 E('bl').innerHTML=h;
 [].forEach.call(document.querySelectorAll('#bl .w'),function(e){e.onclick=function(){od(e.getAttribute('data-c'))}});
}
function rp(){
 var keys=Object.keys(ACC.pos),h='';
 if(!keys.length)h='<div class="emp">暂无持仓</div>';
 keys.forEach(function(c){var s=getStock(c),p=ACC.pos[c];if(!s)return;
  var pnl=(s.price*100-p.costC)*p.qty/100,pc=p.costC?((s.price*100-p.costC)/p.costC*100):0;
  h+='<div class="w" data-c="'+c+'"><div class="l"><div class="n">'+p.name+'</div><div class="cd">'+c+' · 持仓'+p.qty+' 可用'+p.avail+'</div></div><div class="rt"><div class="p m '+cls(pnl)+'">'+pnl.toFixed(2)+'</div><div class="pc m '+cls(pnl)+'">'+sg(pc)+'%</div></div></div>'});
 E('pl').innerHTML=h;
 [].forEach.call(document.querySelectorAll('#pl .w'),function(e){e.onclick=function(){od(e.getAttribute('data-c'))}});
 var oh='';
 ACC.orders.slice(0,20).forEach(function(o){
  var st=o.status==='filled'?'已成交':o.status==='cancelled'?'已撤单':(o.filled>0?'部分成交':'待成交');
  oh+='<div class="od"><div>'+o.name+' <span class="'+(o.side==='buy'?'r':'g')+'">'+(o.side==='buy'?'买':'卖')+'</span> '+o.price.toFixed(2)+'×'+o.qty+'<div class="s" style="font-size:11px">'+o.time+' · '+st+' '+o.filled+'股</div></div>'+(o.status==='pending'?'<button data-i="'+o.id+'">撤单</button>':'')+'</div>'});
 E('ol').innerHTML=oh||'<div class="emp">暂无委托</div>';
 [].forEach.call(document.querySelectorAll('#ol button'),function(b){b.onclick=function(){if(cancelOrder(+b.getAttribute('data-i'))){ts('已撤单');rp();rm()}}});
}
function rm(){
 var eq=equityC(),pnl=eq-100000000;
 E('t1').textContent=money(eq);E('t2').textContent=money(ACC.cashC);
 E('t3').textContent=money(ACC.frozenC);E('t4').textContent=money(pnl);
 E('t4').className='m '+cls(pnl);
}
function od(c){
 sel=c;mode='t';E('dt').classList.add('on');
 [].forEach.call(document.querySelectorAll('.ct'),function(b){b.classList.toggle('on',b.getAttribute('data-c')==='t')});
 var s=getStock(c);if(!s)return;
 var ask=s.book.asks[0]?s.book.asks[0].p:s.price;
 E('ip').value=ask.toFixed(2);E('iq').value='1';
 rd();dr();
}
function rd(){
 var s=getStock(sel);if(!s)return;var p=pctOf(s);
 E('dn').textContent=s.name+' '+s.code;
 E('dp').textContent=s.price.toFixed(2);E('dp').className='qp m '+cls(p);
 E('dc').textContent=sg(p)+'%';E('dc').className='qc m '+cls(p);
 E('dm').textContent='今开 '+s.open.toFixed(2)+'  最高 '+s.high.toFixed(2)+'  最低 '+s.low.toFixed(2)+'  昨收 '+s.prev.toFixed(2);
 var h='';
 for(var i=4;i>=0;i--){var a=s.book.asks[i];h+='<div class="lv"><span>卖'+(i+1)+'</span><span class="m s">'+(a?a.p.toFixed(2):'--')+'</span><span class="m s">'+(a?a.q:'')+'</span></div>'}
 h+='<div class="lv" style="border-top:1px solid #1e2937;border-bottom:1px solid #1e2937"><span>最新</span><span class="m">'+s.price.toFixed(2)+'</span><span class="m s">'+s.vol+'手</span></div>';
 for(var j=0;j<5;j++){var b=s.book.bids[j];h+='<div class="lv"><span>买'+(j+1)+'</span><span class="m s">'+(b?b.p.toFixed(2):'--')+'</span><span class="m s">'+(b?b.q:'')+'</span></div>'}
 E('lv').innerHTML=h;
 var px=parseFloat(E('ip').value)||s.price;
 var lots=Math.floor(ACC.cashC/(px*10000));
 E('fi').textContent='可用 '+money(ACC.cashC)+' · 最多可买 '+(lots>0?lots:0)+' 手 · 1手=100股';
}
function cv2(hh){
 var c=E('cv'),r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=r.width;
 c.width=w*d;c.height=hh*d;c.style.height=hh+'px';
 var x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,hh);
 return{x:x,w:w,h:hh};
}
function drawTrend(s){
 var o=cv2(230),x=o.x,w=o.w,h=o.h,ls=s.hist;
 if(ls.length<2){x.fillStyle='#7d8b9c';x.font='12px sans-serif';x.fillText('等待行情…',12,30);return}
 var pre=s.prev,mx=pre,mn=pre;
 ls.forEach(function(v){if(v.p>mx)mx=v.p;if(v.p<mn)mn=v.p});
 var pd=(mx-mn)*0.12||pre*0.01;mx+=pd;mn-=pd;
 var L=6,R=w-44,T=8,PH=h*0.62,VY=T+PH+10,VH=h-VY-12;
 function X(i){return L+(R-L)*i/Math.max(1,240)}
 function Y(p){return T+PH-(p-mn)/(mx-mn)*PH}
 x.strokeStyle='#1a2432';x.fillStyle='#7d8b9c';x.font='10px sans-serif';x.textAlign='right';
 for(var i=0;i<=3;i++){var y=T+PH*i/3;x.beginPath();x.moveTo(L,y);x.lineTo(R,y);x.stroke();x.fillText((mx-(mx-mn)*i/3).toFixed(2),w-2,y+3)}
 x.setLineDash([3,3]);x.strokeStyle='#4a5868';x.beginPath();x.moveTo(L,Y(pre));x.lineTo(R,Y(pre));x.stroke();x.setLineDash([]);
 var vmax=0;ls.forEach(function(v){if(v.v>vmax)vmax=v.v});vmax=vmax||1;
 var bw=Math.max(1,(R-L)/240*0.7);
 ls.forEach(function(v,i){x.fillStyle=(v.p>=(i?ls[i-1].p:pre))?'rgba(255,82,82,.5)':'rgba(0,208,156,.5)';var vh=v.v/vmax*VH;x.fillRect(X(i)-bw/2,VY+VH-vh,bw,vh)});
 var sp=0,sv=0,avgs=[];
 ls.forEach(function(v){sp+=v.p*v.v;sv+=v.v;avgs.push(sv?sp/sv:v.p)});
 x.strokeStyle='#e8b339';x.lineWidth=1;x.beginPath();
 avgs.forEach(function(p,i){var yy=Y(p);i?x.lineTo(X(i),yy):x.moveTo(X(i),yy)});x.stroke();
 x.strokeStyle='#e6edf3';x.lineWidth=1.3;x.beginPath();
 ls.forEach(function(v,i){var yy=Y(v.p);i?x.lineTo(X(i),yy):x.moveTo(X(i),yy)});x.stroke();
 x.fillStyle='#7d8b9c';x.font='10px sans-serif';x.textAlign='left';x.fillText('09:30',L,h-2);x.textAlign='right';x.fillText('15:00',R,h-2);
}
function maArr(ds,k){
 var out=[],sum=0;
 for(var i=0;i<ds.length;i++){sum+=ds[i].c;if(i>=k)sum-=ds[i-k].c;out.push(i>=k-1?sum/k:null)}
 return out;
}
function drawK(s){
 var o=cv2(230),x=o.x,w=o.w,h=o.h,ds=s.kline;
 if(!ds.length){x.fillStyle='#7d8b9c';x.font='12px sans-serif';x.fillText('暂无K线',12,30);return}
 var mx=-1e9,mn=1e9;
 ds.forEach(function(v){if(v.h>mx)mx=v.h;if(v.l<mn)mn=v.l});
 var pd=(mx-mn)*0.1||1;mx+=pd;mn-=pd;
 var L=6,R=w-44,T=8,PH=h*0.6,VY=T+PH+10,VH=h-VY-12,n=ds.length,cw=(R-L)/n;
 function Y(p){return T+PH-(p-mn)/(mx-mn)*PH}
 x.strokeStyle='#1a2432';x.fillStyle='#7d8b9c';x.font='10px sans-serif';x.textAlign='right';
 for(var i=0;i<=3;i++){var y=T+PH*i/3;x.beginPath();x.moveTo(L,y);x.lineTo(R,y);x.stroke();x.fillText((mx-(mx-mn)*i/3).toFixed(2),w-2,y+3)}
 ds.forEach(function(v,i){var up=v.c>=v.o,col=up?'#ff5252':'#00d09c',cx=L+cw*i+cw/2,bw=Math.max(1,cw*0.6);
  x.strokeStyle=col;x.fillStyle=col;x.lineWidth=1;x.beginPath();x.moveTo(cx,Y(v.h));x.lineTo(cx,Y(v.l));x.stroke();
  var y1=Y(Math.max(v.o,v.c)),y2=Y(Math.min(v.o,v.c));
  if(up){x.fillStyle='#0b0f14';x.fillRect(cx-bw/2,y1,bw,Math.max(1,y2-y1));x.strokeRect(cx-bw/2,y1,bw,Math.max(1,y2-y1))}else x.fillRect(cx-bw/2,y1,bw,Math.max(1,y2-y1));
 });
 var vmax=0;ds.forEach(function(v){if(v.v>vmax)vmax=v.v});vmax=vmax||1;
 ds.forEach(function(v,i){var up=v.c>=v.o;x.fillStyle=up?'rgba(255,82,82,.5)':'rgba(0,208,156,.5)';var vh=v.v/vmax*VH;x.fillRect(L+cw*i+cw*0.2,VY+VH-vh,cw*0.6,vh)});
 var mas=[{k:5,c:'#e8b339'},{k:10,c:'#6aa9ff'},{k:30,c:'#c06aff'},{k:60,c:'#00d09c'}];
 x.lineWidth=1;
 mas.forEach(function(m){
  var arr=maArr(ds,m.k);x.strokeStyle=m.c;x.beginPath();var started=false;
  for(var i=0;i<arr.length;i++){if(arr[i]==null)continue;var xx=L+cw*i+cw/2,yy=Y(arr[i]);if(!started){x.moveTo(xx,yy);started=true}else x.lineTo(xx,yy)}
  x.stroke();
 });
 x.font='10px sans-serif';x.textAlign='left';
 x.fillStyle='#e8b339';x.fillText('MA5',L,12);
 x.fillStyle='#6aa9ff';x.fillText('MA10',L+34,12);
 x.fillStyle='#c06aff';x.fillText('MA30',L+74,12);
 x.fillStyle='#00d09c';x.fillText('MA60',L+114,12);
}
function dr(){var s=getStock(sel);if(!s)return;if(mode==='t')drawTrend(s);else drawK(s)}
function doTrade(kind){
 if(!sel)return ts('先选股票');
 var s=getStock(sel);
 var lots=parseInt(E('iq').value);
 if(!(lots>0))return ts('请输入手数');
 var q=lots*100,p;
 if(kind==='buyNow')p=s.book.asks[0]?s.book.asks[0].p:s.price;
 else if(kind==='sellNow')p=s.book.bids[0]?s.book.bids[0].p:s.price;
 else p=parseFloat(E('ip').value);
 var side=(kind==='buyNow'||kind==='buyLimit')?'buy':'sell';
 var r=placeOrder(sel,side,p,q);
 ts(r.msg);
 if(r.ok){rp();rm();rd();dr()}
}
function go(n){
 [].forEach.call(document.querySelectorAll('.pg'),function(p){p.classList.toggle('on',p.id==='p'+n)});
 [].forEach.call(document.querySelectorAll('.nav button'),function(b){b.classList.toggle('on',b.getAttribute('data-p')==n)});
 if(n==='1')rw();if(n==='2')rb();if(n==='3')rp();if(n==='4')rm();
}
[].forEach.call(document.querySelectorAll('.nav button'),function(b){b.onclick=function(){go(b.getAttribute('data-p'))}});
E('bk2').onclick=function(){E('dt').classList.remove('on')};
[].forEach.call(document.querySelectorAll('.ct'),function(b){b.onclick=function(){
 mode=b.getAttribute('data-c');
 [].forEach.call(document.querySelectorAll('.ct'),function(x){x.classList.toggle('on',x===b)});
 dr();
}});
E('bUp').onclick=function(){boardUp=true;E('bUp').className='on';E('bDown').className='';rb()};
E('bDown').onclick=function(){boardUp=false;E('bDown').className='on';E('bUp').className='';rb()};
E('bbNow').onclick=function(){doTrade('buyNow')};
E('bsNow').onclick=function(){doTrade('sellNow')};
E('bbLimit').onclick=function(){doTrade('buyLimit')};
E('bsLimit').onclick=function(){doTrade('sellLimit')};
E('add').onclick=function(){
 var v=E('q').value.trim();
 if(!v)return;
 var st=null;
 for(var i=0;i<M.stocks.length;i++){var s=M.stocks[i];if(s.code===v||s.name.indexOf(v)>-1){st=s;break}}
 if(!st)return ts('没找到这只股票');
 if(W.indexOf(st.code)<0)W.push(st.code);
 E('q').value='';saveW();rw();ts('已添加 '+st.name);
};
E('ck').onclick=function(){var e=selfCheck();ts(e.length?e.join('；'):'对账通过：资金与持仓平衡')};
E('ex').onclick=function(){E('bk').value=JSON.stringify(ACC);ts('已生成，长按复制')};
E('im').onclick=function(){
 try{var o=JSON.parse(E('bk').value);if(!o.pos||typeof o.cashC!=='number')throw 0;ACC=o;saveAcc();rp();rm();ts('导入成功')}
 catch(e){ts('格式不对')}
};
E('rs').onclick=function(){
 if(confirm('重置账户？')){ACC={cashC:100000000,frozenC:0,pos:{},orders:[],trades:[],seq:1};saveAcc();rp();rm();ts('已重置')}
};
E('setcap').onclick=function(){
 var w=parseFloat(E('cap').value);
 if(!(w>=0))return ts('请输入资金（万元）');
 if(setCapital(w*10000)){ts('资金已设为 '+(w*10000).toFixed(0)+' 元');rm();rd()}
};
setInterval(function(){
 stepMinute();matchAll();
 E('hTime').textContent='第'+M.day+'日 '+fmtTime(M.minute);
 var ic=indexChange();
 E('hIndex').textContent=M.index.toFixed(2)+' '+sg(ic)+'%';
 E('hIndex').className='m '+cls(ic);
 if(E('p1').classList.contains('on'))rw();
 if(E('p2').classList.contains('on'))rb();
 if(E('p3').classList.contains('on'))rp();
 if(E('p4').classList.contains('on'))rm();
 if(E('dt').classList.contains('on')){rd();dr()}
},1000);
go('1');
