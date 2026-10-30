/* book5.js v2 —— 五档盘口；对抗条 = 买一 vs 卖一（当前这一档的对抗） */
(function(){
  var lv=document.getElementById('lv');
  if(!lv)return;
  var css=document.createElement('style');
  css.textContent=
   '.lv5{display:flex;align-items:center;font-size:13px;padding:2px 16px;line-height:21px}'
   +'.lv5 .lab{width:26px;color:#7d8b9c;font-size:12px;flex:0 0 26px}'
   +'.lv5 .pr{flex:1;font-variant-numeric:tabular-nums}'
   +'.lv5 .qt{width:100px;flex:0 0 100px;position:relative;text-align:right;height:19px}'
   +'.lv5 .qt i{position:absolute;right:0;top:2px;bottom:2px;border-radius:2px}'
   +'.lv5 .qt b{position:relative;font-weight:400;z-index:1;padding-right:3px;color:#e6edf3}'
   +'.bkbar{display:flex;height:6px;margin:3px 16px;border-radius:3px;overflow:hidden;background:#1a2432}'
   +'.bkbar div{height:100%}'
   +'.bkinfo{display:flex;justify-content:space-between;font-size:9px;color:#7d8b9c;padding:0 16px}';
  document.head.appendChild(css);
  function nm(v){
    if(v>=1e8)return (v/1e8).toFixed(2)+'亿';
    if(v>=1e4){var w=v/1e4;return (w>=100?w.toFixed(0):w.toFixed(2))+'万'}
    return Math.round(v)+'';
  }
  function row(lab,px,q,maxq,prev,side){
    var w=maxq>0?Math.round(q/maxq*100):0;
    if(w<2)w=2;
    var col=side==='ask'?'0,208,156':'255,82,82';
    var pc=px>prev?'r':px<prev?'g':'s';
    return '<div class="lv5"><span class="lab">'+lab+'</span>'
     +'<span class="pr '+pc+' m">'+px.toFixed(2)+'</span>'
     +'<span class="qt"><i style="width:'+w+'%;background:rgba('+col+',.35)"></i><b>'+nm(q*px)+'</b></span></div>';
  }
  function render(){
    var s=getStock(sel);if(!s||!s.book)return;
    var b=s.book,prev=s.prev||s.price,i,q,maxq=1;
    var asks=b.asks.slice().sort(function(x,y){return y.p-x.p});
    var bids=b.bids.slice().sort(function(x,y){return y.p-x.p});
    for(i=0;i<bids.length;i++){q=bids[i].q||0;if(q>maxq)maxq=q}
    for(i=0;i<asks.length;i++){q=asks[i].q||0;if(q>maxq)maxq=q}
    var b1=bids[0]?bids[0].q:0, a1=asks[0]?asks[0].q:0;
    var tot=b1+a1, bp=tot>0?b1/tot*100:100;
    var h='';
    for(i=0;i<5;i++){
      var a=asks[i];
      if(a)h+=row('卖'+(5-i),a.p,a.q,maxq,prev,'ask');
      else h+='<div class="lv5"><span class="lab">卖'+(5-i)+'</span><span class="pr s m">--</span><span class="qt"></span></div>';
    }
    h+='<div class="bkbar"><div style="width:'+bp+'%;background:#ff5252"></div><div style="flex:1;background:#00d09c"></div></div>';
    h+='<div class="bkinfo"><span class="r">买一 '+nm(b1*prev)+' · '+bp.toFixed(0)+'%</span>'
      +'<span class="g">'+(100-bp).toFixed(0)+'% · 卖一 '+nm(a1*prev)+'</span></div>';
    for(i=0;i<5;i++){
      var b2=bids[i];
      if(b2)h+=row('买'+(i+1),b2.p,b2.q,maxq,prev,'bid');
      else h+='<div class="lv5"><span class="lab">买'+(i+1)+'</span><span class="pr s m">--</span><span class="qt"></span></div>';
    }
    lv.innerHTML=h;
  }
  var o=window.rd;
  window.rd=function(){if(o)o();try{render()}catch(e){}};
})();
