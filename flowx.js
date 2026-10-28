/* flowx.js —— 资金博弈/大单金额 改按时间轴画（和分时图一致）
   原因：原画法是 X = 宽 × i/(点数-1)，永远铺满整宽，所以一开盘就到头。
   现在 X = 宽 × 分钟/240，线从左边慢慢长出来。数据仍由 flow.js 累加。 */
(function(){
  var oF=document.getElementById('fcv'), oB=document.getElementById('bigCv');
  if(oF){oF.id='fcvOld';oF.style.display='none';}
  if(oB){oB.id='bigCvOld';oB.style.display='none';}
  function mk(id,h,anchor){
    var c=document.createElement('canvas');
    c.id=id;c.style.cssText='display:block;width:100%;height:'+h+'px;margin-top:2px';
    if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(c,anchor.nextSibling);
    return c;
  }
  var NF=mk('fcvN',104,oF), NB=mk('bigCvN',62,NF);
  function pre(c,h){
    var r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=r.width;
    if(!w)return null;
    c.width=w*d;c.height=h*d;c.style.height=h+'px';
    var x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,h);
    return {x:x,w:w};
  }
  function drawF(s){
    var o=pre(NF,104); if(!o||!s||!s._fl)return;
    var a=s._fl.hist; if(!a.length)return;
    var x=o.x,w=o.w,L=6,Rr=w-54,T=12,B=92,mx=1;
    a.forEach(function(p){['xl','l','m','s'].forEach(function(k){if(Math.abs(p[k])>mx)mx=Math.abs(p[k])})});
    function Y(v){return T+(B-T)*(0.5-v/(2*mx))}
    function X(i){return L+(Rr-L)*Math.min(240,i)/240}
    x.strokeStyle='#1e2937';x.beginPath();x.moveTo(L,Y(0));x.lineTo(Rr,Y(0));x.stroke();
    var cols={xl:'#ff5252',l:'#e8b339',m:'#6aa9ff',s:'#00d09c'};
    ['xl','l','m','s'].forEach(function(k){
      x.strokeStyle=cols[k];x.lineWidth=1;x.beginPath();
      a.forEach(function(p,i){var yy=Y(p[k]);i?x.lineTo(X(i),yy):x.moveTo(X(i),yy)});
      x.stroke();
    });
    x.font='9px sans-serif';x.textAlign='left';
    x.fillStyle='#ff5252';x.fillText('超大',L,10);
    x.fillStyle='#e8b339';x.fillText('大',L+30,10);
    x.fillStyle='#6aa9ff';x.fillText('中',L+48,10);
    x.fillStyle='#00d09c';x.fillText('小',L+66,10);
    var last=a[a.length-1];x.textAlign='right';
    x.fillStyle='#ff5252';x.fillText((last.xl/1e8).toFixed(2),w-2,Y(last.xl)+3);
    x.fillStyle='#00d09c';x.fillText((last.s/1e8).toFixed(2),w-2,Y(last.s)+3);
  }
  function drawB(s){
    var o=pre(NB,62); if(!o||!s||!s._fl)return;
    var a=s._fl.hist; if(!a.length)return;
    var x=o.x,w=o.w,L=6,Rr=w-54,T=10,B=52,mx=1;
    a.forEach(function(p){var v=p.xl+p.l;if(Math.abs(v)>mx)mx=Math.abs(v)});
    function Y(v){return T+(B-T)*(0.5-v/(2*mx))}
    function X(i){return L+(Rr-L)*Math.min(240,i)/240}
    x.strokeStyle='#1e2937';x.beginPath();x.moveTo(L,Y(0));x.lineTo(Rr,Y(0));x.stroke();
    x.strokeStyle='#e8b339';x.lineWidth=1.2;x.beginPath();
    a.forEach(function(p,i){var v=p.xl+p.l,yy=Y(v);i?x.lineTo(X(i),yy):x.moveTo(X(i),yy)});
    x.stroke();
    var last=a[a.length-1],val=(last.xl+last.l)/1e8;
    x.fillStyle='#e8b339';x.font='9px sans-serif';x.textAlign='left';x.fillText('大单金额',L,9);
    x.textAlign='right';x.fillText((val>0?'+':'')+val.toFixed(2)+'亿',w-2,9);
  }
  function all(){var s=getStock(sel);drawF(s);drawB(s);}
  var odr=window.dr;
  window.dr=function(){if(odr)odr();all();};
  setInterval(function(){
    var dt=document.getElementById('dt');
    if(dt&&dt.classList.contains('on'))all();
  },1000);
})();
