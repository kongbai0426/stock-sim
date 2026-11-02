/* pos.js v2 —— 持仓页（同花顺风格：两屏横滑 + 点击看行情） */
(function(){
  var pg=document.getElementById('p3');if(!pg)return;
  var cur=null;
  var css=document.createElement('style');
  css.textContent=
   '.ag{display:flex;margin-bottom:12px}.ag>div{flex:1}'
   +'.ak{font-size:11px;color:#7d8b9c}.av{font-size:17px;font-weight:600;margin-top:3px}'
   +'.ag2{display:flex;gap:8px;border-top:1px solid #1a2432;padding-top:10px}'
   +'.ag2>div{flex:1}.ag2 span{display:block;font-size:11px;color:#7d8b9c}.ag2 b{font-size:14px;font-weight:500}'
   +'.hs{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none}'
   +'.hs::-webkit-scrollbar{display:none}'
   +'.hp{flex:0 0 100%;scroll-snap-align:start;min-width:0}'
   +'.ph{display:flex;font-size:11px;color:#7d8b9c;padding:6px 2px;border-bottom:1px solid #1a2432}'
   +'.ph span{flex:1;text-align:right}.ph span:first-child{flex:1.5;text-align:left}'
   +'.pw{border-bottom:1px solid #1a2432}'
   +'.pr2{display:flex;align-items:flex-start;padding:8px 2px;font-size:13px}'
   +'.pr2 .c1{flex:1.5;min-width:0}.pr2 .c2,.pr2 .c3,.pr2 .c4{flex:1;text-align:right}'
   +'.pn{font-size:14px;color:#5fa8ff}.pv{font-size:12px;color:#5fa8ff}'
   +'.act{display:flex;gap:8px;padding:0 2px 8px}'
   +'.act button{flex:1;padding:9px 0;border:1px solid #1e2937;border-radius:8px;background:#131b25;color:#c9d4e0;font-size:13px}'
   +'.dots{display:flex;justify-content:center;gap:6px;padding:8px 0 2px}'
   +'.dots i{width:6px;height:6px;border-radius:50%;background:#2a3644;display:block}'
   +'.dots i.on{background:#e8b339}';
  document.head.appendChild(css);
  pg.innerHTML='<div class="c" id="assetBox"></div>'
   +'<div class="c"><div class="oh">持仓</div>'
   +'<div class="hs" id="hs"><div class="hp" id="pp1"></div><div class="hp" id="pp2"></div></div>'
   +'<div class="dots"><i class="on"></i><i></i></div></div>'
   +'<div class="c"><div class="oh">委托</div><div id="ol"></div></div>';
  function E(i){return document.getElementById(i)}
  function nm(n){return window.nm?window.nm(n):String(Math.round(n))}
  function fy(v){v=+v||0;return Math.abs(v)>=1e4?nm(v):v.toFixed(2)}
  function sg2(v){return (v>=0?'+':'')+fy(v)}
  function pct(v){return (v>=0?'+':'')+v.toFixed(2)+'%'}
  function cl(v){return v>0?'r':v<0?'g':'s'}
  function rows(){
    var keys=Object.keys(ACC.pos),i,mvAll=0,costAll=0,dayAll=0;
    for(i=0;i<keys.length;i++){
      var s0=getStock(keys[i]),p0=ACC.pos[keys[i]];
      if(!s0||!p0)continue;
      mvAll+=s0.price*p0.qty;costAll+=(p0.costC/100)*p0.qty;dayAll+=(s0.price-s0.prev)*p0.qty;
    }
    var eq=equityC()/100,base=eq-dayAll;
    E('assetBox').innerHTML='<div class="ag">'
     +'<div><div class="ak">总资产</div><div class="av">'+fy(eq)+'</div></div>'
     +'<div><div class="ak">浮动盈亏</div><div class="av '+(mvAll-costAll>=0?'r':'g')+'">'+sg2(mvAll-costAll)+'</div></div>'
     +'<div><div class="ak">当日盈亏</div><div class="av '+(dayAll>=0?'r':'g')+'">'+sg2(dayAll)+' <span class="sm">'+pct(base?dayAll/base*100:0)+'</span></div></div>'
     +'</div><div class="ag2">'
     +'<div><span>总市值</span><b>'+fy(mvAll)+'</b></div>'
     +'<div><span>可用</span><b>'+fy(ACC.cashC/100)+'</b></div>'
     +'<div><span>可取</span><b>0.00</b></div></div>';
    var h1='<div class="ph"><span>市值</span><span>当日盈亏</span><span>成本/现价</span><span>盈亏</span></div>';
    var h2='<div class="ph"><span>市值</span><span>个股仓位</span><span>持仓/可用</span><span>止盈/止损</span></div>';
    if(!keys.length){h1+='<div class="emp">暂无持仓</div>';h2+='<div class="emp">暂无持仓</div>'}
    keys.forEach(function(c){
      var s=getStock(c),p=ACC.pos[c];if(!s||!p)return;
      var mv=s.price*p.qty,day=(s.price-s.prev)*p.qty,pnl=(s.price*100-p.costC)*p.qty/100;
      var pc=p.costC?((s.price*100-p.costC)/p.costC*100):0;
      var dp=s.prev?((s.price-s.prev)/s.prev*100):0,pos=mvAll?mv/mvAll*100:0;
      var open=cur===c;
      h1+='<div class="pw" data-c="'+c+'"><div class="pr2">'
       +'<div class="c1"><div class="pn">'+p.name+'</div><div class="pv">'+fy(mv)+'</div></div>'
       +'<div class="c2"><div class="'+cl(day)+'">'+sg2(day)+'</div><div class="'+cl(day)+'">'+pct(dp)+'</div></div>'
       +'<div class="c3"><div>'+(p.costC/100).toFixed(3)+'</div><div>'+s.price.toFixed(3)+'</div></div>'
       +'<div class="c4"><div class="'+cl(pnl)+'">'+sg2(pnl)+'</div><div class="'+cl(pnl)+'">'+pct(pc)+'</div></div>'
       +'</div>'+(open?'<div class="act"><button data-go="'+c+'">看行情</button></div>':'')+'</div>';
      h2+='<div class="pw" data-c="'+c+'"><div class="pr2">'
       +'<div class="c1"><div class="pn">'+p.name+'</div><div class="pv">'+fy(mv)+'</div></div>'
       +'<div class="c2">'+pos.toFixed(1)+'%</div>'
       +'<div class="c3"><div>'+nm(p.qty)+'</div><div>'+nm(p.avail)+'</div></div>'
       +'<div class="c4">--<br>--</div>'
       +'</div>'+(open?'<div class="act"><button data-go="'+c+'">看行情</button></div>':'')+'</div>';
    });
    E('pp1').innerHTML=h1;E('pp2').innerHTML=h2;
    [].forEach.call(pg.querySelectorAll('.pw'),function(el){
      el.onclick=function(e){
        var g=e.target.getAttribute('data-go');
        if(g){if(typeof od==='function')od(g);return}
        var c=el.getAttribute('data-c');cur=(cur===c?null:c);rows();
      };
    });
    var oh='';
    ACC.orders.slice(0,20).forEach(function(o){
      var st=o.status==='filled'?'已成交':o.status==='cancelled'?'已撤单':(o.filled>0?'部分成交':'待成交');
      oh+='<div class="od"><div>'+o.name+' <span class="'+(o.side==='buy'?'r':'g')+'">'+(o.side==='buy'?'买':'卖')+'</span> '+o.price.toFixed(2)+' × '+nm(o.qty)+'股'
       +'<div class="s" style="font-size:11px">'+o.time+' · '+st+' '+nm(o.filled)+'股</div></div>'
       +(o.status==='pending'?'<button data-i="'+o.id+'">撤单</button>':'')+'</div>';
    });
    E('ol').innerHTML=oh||'<div class="emp">暂无委托</div>';
    [].forEach.call(pg.querySelectorAll('#ol button'),function(b){
      b.onclick=function(){if(cancelOrder(+b.getAttribute('data-i'))){ts('已撤单');rp();rm()}}
    });
  }
  window.rp=rows;
  var hs=null;
  setInterval(function(){
    hs=E('hs');
    if(!hs||!hs.children.length)return;
    var i=Math.round(hs.scrollLeft/hs.clientWidth);
    var ds=pg.querySelectorAll('.dots i');
    for(var k=0;k<ds.length;k++)ds[k].className=(k===i?'on':'');
  },300);
})();
