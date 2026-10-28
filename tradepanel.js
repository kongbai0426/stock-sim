/* tradepanel.js —— 交易面板改版（同花顺风格：价格/数量步进 + 快捷键 + 大按钮） */
(function(){
  var f=document.querySelector('#dt .f');if(!f)return;
  var css=document.createElement('style');
  css.textContent='.tp{padding:10px 12px 0}.tps{display:flex;gap:8px;margin-bottom:8px}'
   +'.tpb{flex:1;padding:9px;border-radius:8px;background:#131b25;color:#7d8b9c;font-size:14px;border:1px solid #1e2937}'
   +'.tpb.on{background:#ff5252;color:#fff;border-color:#ff5252}.tpb.on[data-s="sell"]{background:#00d09c;color:#04241b;border-color:#00d09c}'
   +'.tpr{display:flex;gap:8px;margin-bottom:8px;align-items:center}'
   +'.tpn{width:48px;height:42px;border:1px solid #2a3644;border-radius:8px;background:#0f151d;color:#e6edf3;font-size:22px;line-height:1}'
   +'.tpr input{flex:1;height:42px;text-align:center;font-size:20px;font-weight:600}'
   +'.tpi{display:flex;flex-wrap:wrap;gap:10px;align-items:center;font-size:12px;color:#7d8b9c;margin-bottom:8px}'
   +'.tq2{margin-left:auto;border:1px solid #ff5252;color:#ff5252;border-radius:6px;padding:4px 8px;font-size:12px}'
   +'.tpq{display:flex;gap:6px;margin-bottom:10px}'
   +'.tpq button{flex:1;padding:8px 0;border:1px solid #2a3644;border-radius:6px;background:#0f151d;color:#c9d4e0;font-size:12px}'
   +'.tgo{width:100%;padding:15px;border-radius:10px;font-size:17px;font-weight:700;background:#ff5252;color:#fff}'
   +'.tgo.sell{background:#00d09c;color:#04241b}';
  document.head.appendChild(css);
  f.innerHTML='<div class="tp">'
   +'<div class="tps"><button class="tpb on" data-s="buy">买入</button><button class="tpb" data-s="sell">卖出</button></div>'
   +'<div class="tpr"><button class="tpn" data-a="px-">−</button><input id="ip" type="number" step="0.01" placeholder="价格"><button class="tpn" data-a="px+">＋</button></div>'
   +'<div class="tpr"><button class="tpn" data-a="q-">−</button><input id="iq" type="number" step="1" placeholder="数量（手）"><button class="tpn" data-a="q+">＋</button></div>'
   +'<div class="tpi"><span>跌停 <b id="tld" class="g">--</b></span><span>涨停 <b id="tlu" class="r">--</b></span>'
   +'<span id="tlab">可买 <b id="tln">--</b></span><button id="tamt" class="tq2">按金额买入</button></div>'
   +'<div class="tpq"><button data-k="1">全仓</button><button data-k="0.5">1/2仓</button><button data-k="0.333">1/3仓</button>'
   +'<button data-k="0.25">1/4仓</button><button data-k="0.667">2/3仓</button><button data-a="k1000">1000元</button></div>'
   +'<button id="tgo" class="tgo">买入</button><div class="note" id="fi">--</div></div>';
  if(window.MISS)MISS.length=0;
  var side='buy',amtMode=false;
  function E(i){return document.getElementById(i)}
  function nm(n){return window.nm?window.nm(n):Math.round(n)}
  function px(){var s=getStock(sel);return parseFloat(E('ip').value)||(s?s.price:0)}
  function lotsMax(){var p=px();return p>0?Math.floor(ACC.cashC/(p*10000)*0.998):0}
  function sellMax(){var q=ACC.pos[sel];return q?Math.floor(q.avail/100):0}
  function refresh(){
    var s=getStock(sel);if(!s)return;
    E('tld').textContent=s.dn.toFixed(2);
    E('tlu').textContent=s.up.toFixed(2);
    E('tlab').firstChild.textContent=side==='buy'?'可买 ':'可卖 ';
    E('tln').textContent=nm(side==='buy'?lotsMax():sellMax())+'手';
    E('tgo').textContent=side==='buy'?'买入':'卖出';
    E('tgo').className='tgo'+(side==='sell'?' sell':'');
  }
  f.addEventListener('click',function(ev){
    var t=ev.target;
    var a=t.getAttribute('data-a'),k=t.getAttribute('data-k'),s=t.getAttribute('data-s');
    if(s){side=s;var st=getStock(sel);if(st&&st.book){var lv=side==='buy'?st.book.asks[0]:st.book.bids[0];E('ip').value=(lv?lv.p:st.price).toFixed(2)}[].forEach.call(f.querySelectorAll('.tpb'),function(b){b.classList.toggle('on',b.getAttribute('data-s')===side)});refresh();return}
    if(k){var mx=side==='buy'?lotsMax():sellMax();E('iq').value=Math.max(0,Math.floor(mx*parseFloat(k)));return}
    if(a==='px+')E('ip').value=(px()+0.01).toFixed(2);
    else if(a==='px-')E('ip').value=Math.max(0.01,px()-0.01).toFixed(2);
    else if(a==='q+')E('iq').value=(parseInt(E('iq').value)||0)+1;
    else if(a==='q-')E('iq').value=Math.max(0,(parseInt(E('iq').value)||0)-1);
    else if(a==='k1000'){var p=px();E('iq').value=p>0?Math.floor(100000/(p*10000)):0}
    if(a)refresh();
  });
  f.querySelector('#tamt').addEventListener('click',function(){
    amtMode=!amtMode;
    this.textContent=amtMode?'按股数买入':'按金额买入';
    E('iq').placeholder=amtMode?'金额（元）':'数量（手）';
    E('iq').value='';
  });
  f.querySelector('#tgo').addEventListener('click',function(){
    var s=getStock(sel);if(!s)return ts('先选股票');
    var p=px(),q;
    if(amtMode)q=Math.floor((parseFloat(E('iq').value)||0)/p/100)*100;
    else q=(parseInt(E('iq').value)||0)*100;
    if(!(q>0))return ts(amtMode?'请输入金额':'请输入数量');
    var r=placeOrder(sel,side,p,q);ts(r.msg);
    if(r.ok){rp();rm();rd();dr()}
  });
  var ord=window.rd;window.rd=function(){if(ord)ord();refresh()};
  refresh();
})();
