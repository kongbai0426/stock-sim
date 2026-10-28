/* head.js —— 个股头部数据（同花顺布局）
   左：现价 + 涨跌额/涨跌幅；右：高/低/开 · 市值/流通/市盈 · 量比/换手/额 */
(function(){
  var q=document.querySelector('#dt .q');if(!q)return;
  var css=document.createElement('style');
  css.textContent='.q2{display:flex;gap:10px;padding:10px 14px;align-items:center}'
   +'.q2l{width:106px;flex:0 0 106px}.q2l .qp{font-size:28px;font-weight:700;line-height:1.1}'
   +'.q2l .qc{font-size:12px;margin-top:3px}'
   +'.q2r{flex:1;display:flex;gap:6px}.q2c{flex:1;font-size:10px;line-height:1.65;min-width:0}'
   +'.q2c div{display:flex;justify-content:space-between;gap:2px}.q2c span{color:#7d8b9c}'
   +'.q2c b{font-weight:400}';
  document.head.appendChild(css);
  q.innerHTML='<div class="q2"><div class="q2l"><div id="dp" class="qp m">--</div><div id="dc" class="qc m"></div></div>'
   +'<div class="q2r">'
   +'<div class="q2c"><div><span>高</span><b id="qx1">--</b></div><div><span>低</span><b id="qx2">--</b></div><div><span>开</span><b id="qx3">--</b></div></div>'
   +'<div class="q2c"><div><span>市值</span><b id="qx4">--</b></div><div><span>流通</span><b id="qx5">--</b></div><div><span>市盈</span><b id="qx6">--</b></div></div>'
   +'<div class="q2c"><div><span>量比</span><b id="qx7">--</b></div><div><span>换手</span><b id="qx8">--</b></div><div><span>额</span><b id="qx9">--</b></div></div>'
   +'</div></div>';
  function E(i){return document.getElementById(i)}
  function nm(n){return window.nm?window.nm(n):Math.round(n)}
  function big(n){n=+n||0;return Math.abs(n)>=1e12?(n/1e12).toFixed(2)+'万亿':nm(n)}
  function cmp(id,v,ref){
    var e=E(id);if(!e)return;
    e.textContent=(+v).toFixed(2);
    e.className=(+v)>(+ref)?'r':(+v)<(+ref)?'g':'';
  }
  function draw(){
    var s=getStock(sel);if(!s)return;
    var e,pct=s.prev?((s.price-s.prev)/s.prev*100):0,chg=s.price-s.prev;
    e=E('dc');
    if(e){e.textContent=(chg>=0?'+':'')+chg.toFixed(2)+'  '+(pct>=0?'+':'')+pct.toFixed(2)+'%';e.className='qc m '+cls(pct)}
    cmp('qx1',s.high,s.prev);cmp('qx2',s.low,s.prev);cmp('qx3',s.open,s.prev);
    var cap=s.price*s.shares*1e8,fl=s.price*(s.floatShares||s.shares*0.72)*1e8;
    e=E('qx4');if(e)e.textContent=big(cap);
    e=E('qx5');if(e)e.textContent=big(fl);
    e=E('qx6');if(e){var pe=s.eps>0?s.price/s.eps:0;e.textContent=pe>0?pe.toFixed(2):'--';e.className='s'}
    var vr=(s.vol/Math.max(1,M.minute))/(s.volBase||1);
    e=E('qx7');if(e){e.textContent=vr.toFixed(2);e.className=vr>=1?'r':'g'}
    var turn=s.vol*100/((s.floatShares||s.shares)*1e8)*100;
    e=E('qx8');if(e){e.textContent=turn.toFixed(2)+'%';e.className=''}
    e=E('qx9');if(e)e.textContent=big(s.vol*100*s.price);
  }
  var o=window.rd;window.rd=function(){if(o)o();draw()};
})();
