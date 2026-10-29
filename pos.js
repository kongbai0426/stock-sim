/* pos.js —— 持仓页改版（同花顺风格：资产三格 + 每股卡片 + 迷你分时） */
(function(){
  var pg=document.getElementById('p3');if(!pg)return;
  var css=document.createElement('style');
  css.textContent='.ag{display:flex;margin-bottom:14px}.ag>div{flex:1}'
   +'.ak{font-size:11px;color:#7d8b9c}.av{font-size:17px;font-weight:600;margin-top:3px}.av .sm{font-size:11px;font-weight:400}'
   +'.ag2{display:flex;gap:8px;border-top:1px solid #1a2432;padding-top:10px}'
   +'.ag2>div{flex:1}.ag2 span{display:block;font-size:11px;color:#7d8b9c}.ag2 b{font-size:14px;font-weight:500}'
   +'.pw{padding:10px 0;border-bottom:1px solid #1a2432}.pw:last-child{border-bottom:0}'
   +'.prow{display:flex;gap:6px;align-items:flex-start}'
   +'.pc1{flex:1.15;min-width:0}.pc2,.pc3,.pc4{flex:1;text-align:right;font-size:13px}'
   +'.pn{font-size:14px;color:#5fa8ff}.pv{font-size:12px;color:#5fa8ff}'
   +'.pmeta{font-size:10px;color:#7d8b9c;margin:6px 0 2px}'
   +'svg.sp{display:block;width:100%;height:44px}';
  document.head.appendChild(css);
  pg.innerHTML='<div class="c" id="assetBox"></div><div class="c"><div class="oh">持仓</div><div id="pl"></div></div><div class="c"><div class="oh">委托</div><div id="ol"></div></div>';
  function E(i){return document.getElementById(i)}
  function nm(n){return window.nm?window.nm(n):String(Math.round(n))}
  function fy(v){v=+v||0;return Math.abs(v)>=1e4?nm(v):v.toFixed(2)}
  function sg2(v){return (v>=0?'+':'')+fy(v)}
  function pct(v){return (v>=0?'+':'')+v.toFixed(2)+'%'}
  function spark(s){
    var ls=s.hist;if(!ls||ls.length<3)return '';
    var n=ls.length,mx=-1e9,mn=1e9,i,v;
    for(i=0;i<n;i++){v=ls[i].p;if(v>mx)mx=v;if(v<mn)mn=v}
    var rng=(mx-mn)||1,pts=[],K=44;
    for(i=0;i<K;i++){
      var idx=Math.min(n-1,Math.round(i*(n-1)/(K-1)));
      pts.push((i*100/(K-1)).toFixed(1)+','+(40-(ls[idx].p-mn)/rng*40).toFixed(1));
    }
    var col=(s.prev? s.price>=s.prev : true)?'#ff5252':'#00d09c';
    return '<svg class="sp" viewBox="0 0 100 40" preserveAspectRatio="none"><polyline points="'+pts.join(' ')+'" fill="none" stroke="'+col+'" stroke-width="1" vector-effect="non-scaling-stroke"/></svg>';
  }
  window.rp=function(){
    var keys=Object.keys(ACC.pos),i,c,mvAll=0,costAll=0,dayAll=0;
    for(i=0;i<keys.length;i++){
      c=keys[i];var s0=getStock(c),p0=ACC.pos[c];
      if(!s0||!p0)continue;
      mvAll+=s0.price*p0.qty;
      costAll+=(p0.costC/100)*p0.qty;
      dayAll+=(s0.price-s0.prev)*p0.qty;
    }
    var eq=equityC()/100,pnlT=mvAll-costAll,base=eq-dayAll,dpc=base?dayAll/base*100:0;
    E('assetBox').innerHTML='<div class="ag">'
     +'<div><div class="ak">总资产</div><div class="av">'+fy(eq)+'</div></div>'
     +'<div><div class="ak">浮动盈亏</div><div class="av '+(pnlT>=0?'r':'g')+'">'+sg2(pnlT)+'</div></div>'
     +'<div><div class="ak">当日盈亏</div><div class="av '+(dayAll>=0?'r':'g')+'">'+sg2(dayAll)+' <span class="sm">'+pct(dpc)+'</span></div></div>'
     +'</div><div class="ag2">'
     +'<div><span>总市值</span><b>'+fy(mvAll)+'</b></div>'
     +'<div><span>可用</span><b>'+fy(ACC.cashC/100)+'</b></div>'
     +'<div><span>冻结</span><b>'+fy(ACC.frozenC/100)+'</b></div></div>';
    var h='';
    if(!keys.length)h='<div class="emp">暂无持仓</div>';
    keys.forEach(function(c){
      var s=getStock(c),p=ACC.pos[c];if(!s||!p)return;
      var mv=s.price*p.qty,pnl=(s.price*100-p.costC)*p.qty/100;
      var pc=p.costC?((s.price*100-p.costC)/p.costC*100):0;
      var day=(s.price-s.prev)*p.qty,dp=s.prev?((s.price-s.prev)/s.prev*100):0;
      h+='<div class="pw" data-c="'+c+'"><div class="prow">'
       +'<div class="pc1"><div class="pn">'+p.name+'</div><div class="pv">'+fy(mv)+'</div></div>'
       +'<div class="pc2"><div class="'+(day>=0?'r':'g')+'">'+sg2(day)+'</div><div class="'+(dp>=0?'r':'g')+'">'+pct(dp)+'</div></div>'
       +'<div class="pc3"><div>'+(p.costC/100).toFixed(3)+'</div><div class="s">'+s.price.toFixed(3)+'</div></div>'
       +'<div class="pc4"><div class="'+(pnl>=0?'r':'g')+'">'+sg2(pnl)+'</div><div class="'+(pc>=0?'r':'g')+'">'+pct(pc)+'</div></div>'
       +'</div><div class="pmeta">持仓 '+nm(p.qty)+'股 · 可用 '+nm(p.avail)+'股</div>'+spark(s)+'</div>';
    });
    E('pl').innerHTML=h;
    [].forEach.call(document.querySelectorAll('#pl .pw'),function(el){el.onclick=function(){od(el.getAttribute('data-c'))}});
    var oh='';
    ACC.orders.slice(0,20).forEach(function(o){
      var st=o.status==='filled'?'已成交':o.status==='cancelled'?'已撤单':(o.filled>0?'部分成交':'待成交');
      oh+='<div class="od"><div>'+o.name+' <span class="'+(o.side==='buy'?'r':'g')+'">'+(o.side==='buy'?'买':'卖')+'</span> '+o.price.toFixed(2)+' × '+nm(o.qty)+'股'
       +'<div class="s" style="font-size:11px">'+o.time+' · '+st+' '+nm(o.filled)+'股</div></div>'
       +(o.status==='pending'?'<button data-i="'+o.id+'">撤单</button>':'')+'</div>';
    });
    E('ol').innerHTML=oh||'<div class="emp">暂无委托</div>';
    [].forEach.call(document.querySelectorAll('#ol button'),function(b){
      b.onclick=function(){if(cancelOrder(+b.getAttribute('data-i'))){ts('已撤单');rp();rm()}}
    });
  };
})();
