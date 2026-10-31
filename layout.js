/* layout.js v5 —— 双栏 + 封单可被真实砸开（替换 matchAll） */
(function(){
  var dt=document.getElementById('dt');if(!dt)return;
  var cv=document.getElementById('cv'),tabs=dt.querySelector('.tabs2');
  if(!cv||!tabs)return;

  function c2(x){return Math.round(x*100)}
  function f2(c){return c/100}
  function cl(s,p){return f2(Math.max(c2(s.dn),Math.min(c2(s.up),c2(p))))}
  function addB(s,side,p,q){
    p=cl(s,p);
    var arr=side==='buy'?s.book.bids:s.book.asks,i;
    for(i=0;i<arr.length;i++)if(c2(arr[i].p)===c2(p)){arr[i].q+=q;return}
    arr.push({p:p,q:q});
    arr.sort(side==='buy'?function(x,y){return y.p-x.p}:function(x,y){return x.p-y.p});
  }
  window.matchAll=function(){
    for(var i=0;i<ACC.orders.length;i++){
      var o=ACC.orders[i];
      if(!o||o.status!=='pending')continue;
      var s=getStock(o.code);if(!s||!s.book)continue;
      var rem=o.qty-o.filled,take;
      if(rem<=0)continue;
      if(o.side==='buy'){
        while(rem>0&&s.book.asks.length&&c2(s.book.asks[0].p)<=c2(o.price)){
          var a=s.book.asks[0];take=Math.min(rem,a.q);a.q-=take;rem-=take;
          fill(o,a.p,take);s.price=cl(s,a.p);
          if(s._seal===-1&&c2(a.p)===c2(s.dn)){
            s._sealQty=(s._sealQty||0)-take;
            if(s._sealQty<=0){s._sealQty=0;s._seal=0;s.price=f2(c2(s.dn)+1)}
          }
          if(a.q<=0)s.book.asks.shift();
          if(take<=0)break;
        }
        if(rem>0)addB(s,'buy',o.price,rem);
      }else{
        while(rem>0&&s.book.bids.length&&c2(s.book.bids[0].p)>=c2(o.price)){
          var b=s.book.bids[0];take=Math.min(rem,b.q);b.q-=take;rem-=take;
          fill(o,b.p,take);s.price=cl(s,b.p);
          if(s._seal===1&&c2(b.p)===c2(s.up)){
            s._sealQty=(s._sealQty||0)-take;
            if(s._sealQty<=0){s._sealQty=0;s._seal=0;s.price=f2(c2(s.up)-1)}
          }
          if(b.q<=0)s.book.bids.shift();
          if(take<=0)break;
        }
        if(rem>0)addB(s,'sell',o.price,rem);
      }
    }
  };

  var css=document.createElement('style');
  css.textContent=
   'html,body{max-width:100%;overflow-x:hidden}'
   +'#dt{overflow-x:hidden}'
   +'canvas{max-width:100%}'
   +'#dmain{display:flex;gap:6px;padding:0 4px;align-items:flex-start;width:100%;max-width:100%;box-sizing:border-box;overflow:hidden}'
   +'#dmain .dl{flex:1 1 0;min-width:0}'
   +'#dmain .dr{flex:0 0 34%;max-width:34%;min-width:0;border-left:1px solid #16202b;padding-left:2px}'
   +'#dmain .dr .oh{padding-left:8px;margin:2px 0 2px}'
   +'#dmain .dr .lv5{padding:1px 6px;font-size:11.5px;line-height:19px}'
   +'#dmain .dr .lv5 .lab{width:22px;flex:0 0 22px;font-size:11px}'
   +'#dmain .dr .lv5 .qt{width:56px;flex:0 0 56px}'
   +'#dmain .dr .lv5 .qb{width:22px;flex:0 0 22px}'
   +'#dmain .dr .tr{padding:1px 6px;font-size:10.5px;line-height:17px}'
   +'#dmain .dr .trh{padding:1px 6px;font-size:9px}'
   +'#dmain .dr .trh span:first-child,#dmain .dr .tr span:first-child{width:36px}'
   +'#dmain .dr .trh span:nth-child(3),#dmain .dr .tr span:nth-child(3){width:62px}'
   +'#dmain .dr .bkbar{margin:2px 8px}'
   +'#dmain .dr .bkinfo{padding:1px 8px 3px}'
   +'#dmain .dl .f{padding:6px 6px 0}'
   +'#dmain .dl .f .ln input{height:34px;font-size:16px}';
  document.head.appendChild(css);

  var main=document.createElement('div');main.id='dmain';
  var dl=document.createElement('div');dl.className='dl';
  var dr=document.createElement('div');dr.className='dr';
  main.appendChild(dl);main.appendChild(dr);
  tabs.parentNode.insertBefore(main,tabs.nextSibling);
  dl.appendChild(cv);
  var fcv=document.getElementById('fcv');if(fcv)dl.appendChild(fcv);
  var f=dt.querySelector('.f');if(f)dl.appendChild(f);
  var lv=document.getElementById('lv');if(lv)dr.appendChild(lv);
  var tp=document.getElementById('tpHolder');if(tp)dr.appendChild(tp);
})();
