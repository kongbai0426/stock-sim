/* levels.js —— 关键位：筹码峰/前高前低/箱体/均线/斐波那契/整数关/昨涨停/缺口 */
(function(){
 function ma(kl,k){var n=kl.length;if(n<k)return null;var s=0;for(var i=n-k;i<n;i++)s+=kl[i].c;return s/k}
 function calc(s){
  var kl=s.kline||[],n=kl.length;if(n<12)return[];
  var p=s.price,i,out=[];
  function add(v,tag,side,pri){
   if(!(v>0))return;if(Math.abs(v/p-1)>0.25)return;
   out.push({p:v,tag:tag,side:side,pri:pri});
  }
  var hi=-1e9,lo=1e9,h20=-1e9,l20=1e9,b;
  for(i=Math.max(0,n-60);i<n;i++){b=kl[i];if(b.h>hi)hi=b.h;if(b.l<lo)lo=b.l}
  for(i=Math.max(0,n-20);i<n;i++){b=kl[i];if(b.h>h20)h20=b.h;if(b.l<l20)l20=b.l}
  add(hi,'60日高','up',1);add(h20,'20日高','up',2);
  add(lo,'60日低','dn',1);add(l20,'20日低','dn',2);
  var m20=ma(kl,20),m60=ma(kl,60);
  if(m20)add(m20,'MA20',m20>=p?'up':'dn',3);
  if(m60)add(m60,'MA60',m60>=p?'up':'dn',3);
  if(hi>lo){
   var r=hi-lo;
   add(lo+r*0.382,'0.382',(lo+r*0.382)>=p?'up':'dn',4);
   add(lo+r*0.618,'0.618',(lo+r*0.618)>=p?'up':'dn',4);
  }
  var pts=[],j;
  for(i=Math.max(0,n-120);i<n;i++){b=kl[i];if(b.c>0)pts.push({p:b.c,v:b.v||1})}
  if(pts.length>5){
   var mn=1e9,mx=-1e9;
   for(j=0;j<pts.length;j++){if(pts[j].p<mn)mn=pts[j].p;if(pts[j].p>mx)mx=pts[j].p}
   var st=(mx-mn)/24||0.01,bk=[];
   for(j=0;j<24;j++)bk.push({p:mn+st*(j+0.5),v:0});
   for(j=0;j<pts.length;j++){var k=Math.floor((pts[j].p-mn)/st);if(k<0)k=0;if(k>23)k=23;bk[k].v+=pts[j].v}
   bk.sort(function(a,b2){return b2.v-a.v});
   var nu=0,nd=0;
   for(j=0;j<bk.length;j++){
    var q=bk[j];if(Math.abs(q.p/p-1)>0.18)continue;
    if(q.p>p&&nu<2){add(q.p,'筹码峰','up',0);nu++}
    else if(q.p<p&&nd<2){add(q.p,'筹码峰','dn',0);nd++}
    if(nu>=2&&nd>=2)break;
   }
  }
  for(i=n-1;i>Math.max(0,n-60);i--){
   var a=kl[i-1],c=kl[i];
   if(c.l>a.h*1.002){add(a.h,'缺口','up',2);add(c.l,'缺口','dn',2);break}
   if(c.h<a.l*0.998){add(c.h,'缺口','up',2);add(a.l,'缺口','dn',2);break}
  }
  var lb=kl[n-1];
  if(lb&&lb.o>0&&(lb.c/lb.o-1)>0.095)add(lb.c,'昨涨停','up',0);
  var unit=p<5?0.5:(p<20?1:(p<100?5:(p<500?10:50)));
  add(Math.ceil(p/unit)*unit,'整数关','up',5);
  add(Math.floor(p/unit)*unit,'整数关','dn',5);
  return out;
 }
 function lv(s){
  if(s._lvd===M.day&&s._lvc)return s._lvc;
  s._lvd=M.day;s._lvc=calc(s);return s._lvc;
 }
 function draw(s,L){
  if(typeof mode!=='undefined'&&mode!=='t')return;
  var c=document.getElementById('cv');if(!c)return;
  var r=c.getBoundingClientRect(),w=r.width,h=230;if(!w)return;
  var x=c.getContext('2d');
  var pre=s.prev||s.price,hi=s.high||pre,lo=s.low||pre;
  if(hi<pre)hi=pre;if(lo>pre)lo=pre;
  var dev=Math.max(hi-pre,pre-lo);if(dev<pre*0.005)dev=pre*0.005;
  var mx=pre+dev,mn=pre-dev,T=12,PH=h*0.6,Lx=4,Rx=w-2;
  if(mx<=mn)return;
  function Y(p){return T+PH-(p-mn)/(mx-mn)*PH}
  var used=[];
  x.font='9px sans-serif';
  for(var i=0;i<L.length;i++){
   var o=L[i];if(o.p<mn||o.p>mx)continue;
   var y=Y(o.p);if(y<T||y>T+PH)continue;
   var ok=true,j;
   for(j=0;j<used.length;j++)if(Math.abs(used[j]-y)<9){ok=false;break}
   if(!ok)continue;
   used.push(y);
   var col=o.side==='up'?'rgba(255,82,82,.75)':'rgba(0,208,156,.75)';
   x.strokeStyle=col;x.lineWidth=1;x.setLineDash([2,4]);
   x.beginPath();x.moveTo(Lx,y);x.lineTo(Rx,y);x.stroke();
   x.setLineDash([]);
   var t=o.tag+' '+o.p.toFixed(2);
   var tw=x.measureText(t).width;
   x.fillStyle='rgba(11,15,20,.8)';x.fillRect(Lx,y-10,tw+4,10);
   x.fillStyle=col;x.textAlign='left';x.fillText(t,Lx+2,y-2);
  }
 }
 function panel(s,L){
  var lvEl=document.getElementById('lv');if(!lvEl||!lvEl.parentNode)return;
  var card=document.getElementById('lvCard');
  if(!card){
   card=document.createElement('div');card.id='lvCard';
   card.style.cssText='padding:6px 8px 4px;border-bottom:1px solid #16202b';
   lvEl.parentNode.insertBefore(card,lvEl);
  }
  var up=[],dn=[],i;
  for(i=0;i<L.length;i++)(L[i].side==='up'?up:dn).push(L[i]);
  up.sort(function(a,b){return a.p-b.p});dn.sort(function(a,b){return b.p-a.p});
  function row(o){
   var c=o.side==='up'?'#ff5252':'#00d09c';
   return '<div style="display:flex;justify-content:space-between;font-size:10.5px;line-height:16px"><span style="color:'+c+'">'+o.tag+'</span><span class="m" style="color:'+c+'">'+o.p.toFixed(2)+'</span></div>';
  }
  var h='<div style="font-size:9px;color:#5c6b7a;margin-bottom:2px">关键位</div>';
  for(i=0;i<Math.min(3,up.length);i++)h+=row(up[i]);
  for(i=0;i<Math.min(3,dn.length);i++)h+=row(dn[i]);
  if(card.innerHTML!==h)card.innerHTML=h;
 }
 var _dr=window.dr;
 window.dr=function(){
  if(_dr)_dr();
  try{
   var s=getStock(sel);if(!s)return;
   var card=document.getElementById('lvCard');
   if(s.idx){if(card)card.innerHTML='';return}
   var L=lv(s);draw(s,L);panel(s,L);
  }catch(e){}
 };
})();
