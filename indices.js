/* indices.js —— 8 个指数：流通市值加权，自带分时/日K */
(function(){
  if(!window.M||!M.stocks||!M.stocks.length)return;
  var DEFS=[
    {code:'SH000001',name:'上证指数',base:3050,flt:function(s){return s.code.charAt(0)==='6'}},
    {code:'SZ399001',name:'深证成指',base:9800,flt:function(s){return s.code.charAt(0)==='0'||s.code.charAt(0)==='3'}},
    {code:'SZ399006',name:'创业板指',base:1950,flt:function(s){return s.code.indexOf('300')===0}},
    {code:'SH000688',name:'科创50',base:900,flt:function(s){return s.code.indexOf('688')===0}},
    {code:'SH000016',name:'上证50',base:2450,flt:function(s){return s.code.charAt(0)==='6'},top:50},
    {code:'SH000300',name:'沪深300',base:3550,flt:function(){return true},top:300},
    {code:'SH000905',name:'中证500',base:5600,flt:function(){return true},from:150,to:300},
    {code:'SH000852',name:'中证1000',base:6100,flt:function(){return true},from:300,to:9999}
  ];
  var all=M.stocks.slice().sort(function(a,b){return (b.price*b.floatShares)-(a.price*a.floatShares)});
  M.idx=[];
  for(var d=0;d<DEFS.length;d++){
    var df=DEFS[d],pool=all.filter(df.flt),mem;
    if(df.top!=null||df.from!=null){
      var a=df.from||0,b=df.to!=null?df.to:(df.top||pool.length);
      mem=pool.slice(a,Math.min(b,pool.length));
    }else mem=pool;
    if(!mem.length)continue;
    var ix={code:df.code,name:df.name,idx:1,si:-1,mem:mem,book:{bids:[],asks:[]},hist:[],kline:[]};
    var den=0,i;
    for(i=0;i<mem.length;i++)den+=mem[i].price*mem[i].floatShares;
    ix.k=den?df.base/den:1;
    var days=0;
    for(i=0;i<mem.length;i++)if(mem[i].kline&&mem[i].kline.length>days)days=mem[i].kline.length;
    for(var j=0;j<days;j++){
      var o=0,h=0,l=0,c=0,v=0,w=0;
      for(i=0;i<mem.length;i++){
        var kk=mem[i].kline[j];if(!kk)continue;
        var ww=mem[i].floatShares;
        o+=kk.o*ww;h+=kk.h*ww;l+=kk.l*ww;c+=kk.c*ww;v+=kk.v||0;w+=ww;
      }
      if(!w)continue;
      ix.kline.push({d:j-days,o:o/w*ix.k,h:h/w*ix.k,l:l/w*ix.k,c:c/w*ix.k,v:v});
    }
    var val=0;for(i=0;i<mem.length;i++)val+=mem[i].price*mem[i].floatShares;
    ix.price=Math.round(val*ix.k*100)/100;
    ix.prev=ix.price;ix.open=ix.price;ix.high=ix.price;ix.low=ix.price;
    ix.vol=0;ix.amount=0;ix._m=-1;ix._day=M.day;
    ix.shares=den/(ix.price||1);
    ix.floatShares=ix.shares;
    ix.eps=ix.price/12;
    ix.volBase=Math.max(800,Math.round(ix.vol/240)||1000);
    ix.up=Math.round(ix.prev*1.1*100)/100;ix.dn=Math.round(ix.prev*0.9*100)/100;
    ix.hist=[{p:ix.price,v:0,m:0}];
    M.idx.push(ix);
  }

  var _gs=window.getStock;
  window.getStock=function(code){
    var s=_gs(code);if(s)return s;
    for(var i=0;i<M.idx.length;i++)if(M.idx[i].code===code)return M.idx[i];
    return null;
  };
  var _po=window.placeOrder;
  window.placeOrder=function(code,side,price,qty){
    var s=getStock(code);
    if(s&&s.idx)return{ok:false,msg:'指数不能交易'};
    return _po(code,side,price,qty);
  };

  window.__idxTick=function(){
    if(!M.idx||!M.idx.length)return;
    for(var i=0;i<M.idx.length;i++){
      var ix=M.idx[i],mem=ix.mem,val=0,j;
      for(j=0;j<mem.length;j++)val+=mem[j].price*mem[j].floatShares;
      var p=Math.round(val*ix.k*100)/100;
      if(ix._day!==M.day){
        ix.kline.push({d:ix._day,o:ix.open,h:ix.high,l:ix.low,c:ix.price,v:ix.vol});
        if(ix.kline.length>400)ix.kline.shift();
        ix._day=M.day;ix.prev=ix.price;ix.open=p;ix.high=p;ix.low=p;ix.vol=0;
        ix.hist=[{p:p,v:0,m:0}];ix._m=-1;
      }
      ix.price=p;
      if(p>ix.high)ix.high=p;
      if(p<ix.low)ix.low=p;
      var h=ix.hist[ix.hist.length-1];
      if(ix._m!==M.minute){
        ix._m=M.minute;
        var vv=0;
        for(j=0;j<mem.length;j++){
          var hs=mem[j].hist[mem[j].hist.length-1];
          if(hs&&hs.m===M.minute)vv+=hs.v||0;
        }
        ix.vol+=vv;
        ix.hist.push({p:p,v:vv,m:M.minute});
        if(ix.hist.length>300)ix.hist.shift();
      }else if(h)h.p=p;
      ix.up=Math.round(ix.prev*1.1*100)/100;
      ix.dn=Math.round(ix.prev*0.9*100)/100;
    }
    renderBar();
  };

  var p2=document.getElementById('p2');
  if(p2){
    var bar=document.createElement('div');
    bar.id='idxbar';
    bar.style.cssText='display:flex;gap:6px;overflow-x:auto;padding:8px 12px 2px;white-space:nowrap';
    p2.insertBefore(bar,p2.firstChild);
    bar.addEventListener('click',function(e){
      var t=e.target;
      while(t&&t!==bar&&!t.getAttribute('data-c'))t=t.parentNode;
      if(t&&t!==bar){var c=t.getAttribute('data-c');if(c&&typeof od==='function')od(c);}
    });
  }
  var lastBar='';
  function renderBar(){
    var bar=document.getElementById('idxbar');if(!bar)return;
    var h='';
    for(var i=0;i<M.idx.length;i++){
      var ix=M.idx[i],pc=ix.prev?((ix.price-ix.prev)/ix.prev*100):0;
      var col=pc>0?'#ff5252':(pc<0?'#00d09c':'#7d8b9c');
      h+='<div data-c="'+ix.code+'" style="flex:0 0 auto;background:#131b25;border:1px solid #1e2937;border-radius:10px;padding:4px 9px">'
       +'<div style="font-size:10px;color:#7d8b9c">'+ix.name+'</div>'
       +'<div style="font-size:13px;color:'+col+'">'+ix.price.toFixed(2)+' '+(pc>0?'+':'')+pc.toFixed(2)+'%</div></div>';
    }
    if(h!==lastBar){bar.innerHTML=h;lastBar=h;}
  }
  renderBar();
})();
