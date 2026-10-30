/* book5.js v4 —— 五档：标签 / 价格 / 金额 / 右侧迷你量条 + 中间对抗条 */
(function(){
  var lv=document.getElementById('lv');
  if(!lv)return;
  var css=document.createElement('style');
  css.textContent=
   '.lv5{display:flex;align-items:center;font-size:12.5px;padding:2px 12px;line-height:21px}'
   +'.lv5 .lab{width:24px;flex:0 0 24px;color:#7d8b9c;font-size:12px}'
   +'.lv5 .pr{flex:1;font-variant-numeric:tabular-nums}'
   +'.lv5 .qt{width:66px;flex:0 0 66px;text-align:right;color:#e6edf3;font-variant-numeric:tabular-nums}'
   +'.lv5 .qb{width:36px;flex:0 0 36px;height:13px;position:relative;margin-left:4px}'
   +'.lv5 .qb i{position:absolute;right:0;top:1px;bottom:1px;border-radius:1px}'
   +'.bkbar{display:flex;height:4px;margin:2px 12px;border-radius:2px;overflow:hidden;background:#1a2432}'
   +'.bkbar div{height:100%}'
   +'.bkinfo{display:flex;justify-content:space-between;font-size:9px;color:#7d8b9c;padding:1px 12px 4px}';
  document.head.appendChild(css);
  function nm(v){
    if(v>=1e8)return (v/1e8).toFixed(2)+'亿';
    if(v>=1e4){var w=v/1e4;return (w>=100?w.toFixed(0):w.toFixed(2))+'万'}
    return Math.round(v)+'';
  }
  function row(lab,px,q,maxq,prev,side){
    var w=maxq>0?Math.round(q/maxq*100):0;
    if(w<3)w=3;
    var col=side==='ask'?'rgba(0,208,156,.85)':'rgba(255,82,82,.85)';
    var pc=px>prev?'r':px<prev?'g':'s';
    return '<div class="lv5"><span class="lab">'+lab+'</span>'
     +'<span class="pr '+pc+' m">'+px.toFixed(2)+'</span>'
     +'<span class="qt">'+nm(q*px)+'</span>'
     +'<span class="qb"><i style="width:'+w+'%;background:'+col+'"></i></span></div>';
  }
  function render(){
    var s=getStock(sel);if(!s||!s.book)return;
    var b=s.book,prev=s.prev||s.price,i,q,maxq=1;
    var asks=b.asks.slice().sort(function(x,y){return y.p-x.p});
    var bids=b.bids.slice().sort(function(x,y){return y.p-x.p});
    for(i=0;i<bids.length;i++){q=bids[i].q||0;if(q>maxq)maxq=q}
    for(i=0;i<asks.length;i++){q=asks[i].q||0;if(q>maxq)maxq=q}
    var b1=bids[0]?bids[0].q:0,a1=asks[0]?asks[0].q:0;
    var tot=b1+a1,bp=tot>0?b1/tot*100:100,px=s.price||prev;
    var h='';
    for(i=0;i<5;i++){
      var a=asks[i];
      if(a)h+=row('卖'+(5-i),a.p,a.q,maxq,prev,'ask');
      else h+='<div class="lv5"><span class="lab">卖'+(5-i)+'</span><span class="pr s m">--</span><span class="qt"></span><span class="qb"></span></div>';
    }
    h+='<div class="bkbar"><div style="width:'+bp+'%;background:#ff5252"></div><div style="flex:1;background:#00d09c"></div></div>';
    h+='<div class="bkinfo"><span class="r">买一 '+nm(b1*px)+'</span><span class="g">卖一 '+nm(a1*px)+'</span></div>';
    for(i=0;i<5;i++){
      var b2=bids[i];
      if(b2)h+=row('买'+(i+1),b2.p,b2.q,maxq,prev,'bid');
      else h+='<div class="lv5"><span class="lab">买'+(i+1)+'</span><span class="pr s m">--</span><span class="qt"></span><span class="qb"></span></div>';
    }
    lv.innerHTML=h;
  }
  var o=window.rd;
  window.rd=function(){if(o)o();try{render()}catch(e){}};
})();
