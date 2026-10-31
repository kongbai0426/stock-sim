/* layout.js v3 —— 详情页双栏（修整页左右晃） */
(function(){
  var dt=document.getElementById('dt');if(!dt)return;
  var cv=document.getElementById('cv'),tabs=dt.querySelector('.tabs2');
  if(!cv||!tabs)return;
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
