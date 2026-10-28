/* fmt.js —— 数字统一显示（只改显示，内部仍是 股/分）
   <1万原样；1万~1亿→x.x万（≥100万不带小数）；≥1亿→x.xx亿
   盘口按“手”，持仓/委托按“股”，资金按“元”（<1万保留两位小数） */
(function(){
  var BOOK=1;
  function nm(n){
    n=+n||0;var a=Math.abs(n),s=n<0?'-':'';
    if(a>=1e8)return s+(a/1e8).toFixed(2)+'亿';
    if(a>=1e4){var v=a/1e4;return s+(v>=100?v.toFixed(0):v.toFixed(1).replace(/\.0$/,''))+'万'}
    return s+Math.round(a);
  }
  window.nm=nm;
  function q(v){var s=getStock(sel);return nm((+v||0)*(s?s.price:0))+'元'}
  function sh(v){return nm(v)+'股'}
  function yv(v){var a=Math.abs(+v||0);return a>=1e4?nm(v):(+v||0).toFixed(2)}
  function yuan(c){var v=(+c||0)/100;return yv(v)+'元'}
  function E(id){return document.getElementById(id)}

  window.rd=function(){
    var s=getStock(sel);if(!s)return;
    var p=pctOf(s),e;
    e=E('dn');if(e)e.textContent=s.name+' '+s.code;
    e=E('dp');if(e){e.textContent=s.price.toFixed(2);e.className='qp m '+cls(p)}
    e=E('dc');if(e){e.textContent=sg(p)+'%';e.className='qc m '+cls(p)}
    e=E('dm');if(e)e.textContent='今开 '+s.open.toFixed(2)+'  最高 '+s.high.toFixed(2)+'  最低 '+s.low.toFixed(2)+'  昨收 '+s.prev.toFixed(2);
    var h='',i,a,b;
    for(i=4;i>=0;i--){a=s.book.asks[i];h+='<div class="lv"><span>卖'+(i+1)+'</span><span class="m s">'+(a?a.p.toFixed(2):'--')+'</span><span class="m s">'+(a?q(a.q):'')+'</span></div>'}
    h+='<div class="lv" style="border-top:1px solid #1e2937;border-bottom:1px solid #1e2937"><span>最新</span><span class="m">'+s.price.toFixed(2)+'</span><span class="m s">'+nm(s.vol)+'手</span></div>';
    for(i=0;i<5;i++){b=s.book.bids[i];h+='<div class="lv"><span>买'+(i+1)+'</span><span class="m s">'+(b?b.p.toFixed(2):'--')+'</span><span class="m s">'+(b?q(b.q):'')+'</span></div>'}
    e=E('lv');if(e)e.innerHTML=h;
    var ip=E('ip'),px=parseFloat(ip?ip.value:0)||s.price;
    var lots=Math.floor(ACC.cashC/(px*10000));
    e=E('fi');if(e)e.textContent='可用 '+yuan(ACC.cashC)+' · 最多可买 '+nm(lots>0?lots:0)+'手 · 1手=100股';
  };

  window.rp=function(){
    var keys=Object.keys(ACC.pos),h='',e;
    if(!keys.length)h='<div class="emp">暂无持仓</div>';
    keys.forEach(function(c){
      var s=getStock(c),p=ACC.pos[c];if(!s)return;
      var pnl=(s.price*100-p.costC)*p.qty/100,pc=p.costC?((s.price*100-p.costC)/p.costC*100):0;
      h+='<div class="w" data-c="'+c+'"><div class="l"><div class="n">'+p.name+'</div><div class="cd">'+c+' · 持仓'+sh(p.qty)+' 可用'+sh(p.avail)+'</div></div><div class="rt"><div class="p m '+cls(pnl)+'">'+yv(pnl)+'</div><div class="pc m '+cls(pnl)+'">'+sg(pc)+'%</div></div></div>';
    });
    e=E('pl');if(e)e.innerHTML=h;
    [].forEach.call(document.querySelectorAll('#pl .w'),function(n){n.onclick=function(){od(n.getAttribute('data-c'))}});
    var oh='';
    ACC.orders.slice(0,20).forEach(function(o){
      var st=o.status==='filled'?'已成交':o.status==='cancelled'?'已撤单':(o.filled>0?'部分成交':'待成交');
      oh+='<div class="od"><div>'+o.name+' <span class="'+(o.side==='buy'?'r':'g')+'">'+(o.side==='buy'?'买':'卖')+'</span> '+o.price.toFixed(2)+' × '+sh(o.qty)+'<div class="s" style="font-size:11px">'+o.time+' · '+st+' '+sh(o.filled)+'</div></div>'+(o.status==='pending'?'<button data-i="'+o.id+'">撤单</button>':'')+'</div>';
    });
    e=E('ol');if(e)e.innerHTML=oh||'<div class="emp">暂无委托</div>';
    [].forEach.call(document.querySelectorAll('#ol button'),function(b){b.onclick=function(){if(cancelOrder(+b.getAttribute('data-i'))){ts('已撤单');rp();rm()}}});
  };

  window.rm=function(){
    var eq=equityC(),pnl=eq-100000000,e;
    e=E('t1');if(e)e.textContent=yuan(eq);
    e=E('t2');if(e)e.textContent=yuan(ACC.cashC);
    e=E('t3');if(e)e.textContent=yuan(ACC.frozenC);
    e=E('t4');if(e){e.textContent=yv(pnl)+'元';e.className='m '+cls(pnl)}
  };
})();
