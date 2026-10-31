/* uixtra.js —— 个股权重显示 + 指数模式隐藏交易区 */
(function(){
  var done=false;
  function ready(){
    if(done)return;done=true;
    if(!window.M||!M.idx)return;
    var s300=null,i,j;
    for(i=0;i<M.idx.length;i++)if(M.idx[i].code==='SH000300')s300=M.idx[i];
    var tot300=0,totAll=0;
    if(s300)for(j=0;j<s300.mem.length;j++)tot300+=s300.mem[j].price*s300.mem[j].floatShares;
    for(j=0;j<M.stocks.length;j++)totAll+=M.stocks[j].price*M.stocks[j].floatShares;
    function w300(s){
      if(s300&&tot300){
        for(var k=0;k<s300.mem.length;k++)if(s300.mem[k]===s)return s.price*s.floatShares/tot300*100;
      }
      return totAll?s.price*s.floatShares/totAll*100:0;
    }
    var _rd=window.rd;
    window.rd=function(){
      if(_rd)_rd();
      try{
        var s=getStock(sel);if(!s||s.idx)return;
        var e=document.getElementById('dm');
        if(e){
          var w=w300(s);
          if(w>0)e.textContent+='   权重 '+w.toFixed(2)+'%';
        }
      }catch(x){}
    };
    var css=document.createElement('style');
    css.textContent='#dt.idxmode #lv,#dt.idxmode #tpHolder,#dt.idxmode .f{display:none!important}';
    document.head.appendChild(css);
    var _od=window.od;
    if(typeof _od==='function'){
      window.od=function(code){
        _od(code);
        try{
          var s=getStock(code),dt=document.getElementById('dt');
          if(dt)dt.classList.toggle('idxmode',!!(s&&s.idx));
        }catch(x){}
      };
    }
  }
  setTimeout(ready,0);
  setTimeout(ready,600);
})();
