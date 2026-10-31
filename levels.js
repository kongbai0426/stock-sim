/* levels.js v4 —— 关键位：仅后台计算，不显示 */
(function(){
 function ma(kl,k){var n=kl.length;if(n<k)return null;var s=0;for(var i=n-k;i<n;i++)s+=kl[i].c;return s/k}
 function calc(s){
  var kl=s.kline||[],n=kl.length;if(n<12)return[];
  var p=s.price,i,out=[];
  function add(v,tag,side){
   if(!(v>0))return;if(Math.abs(v/p-1)>0.25)return;
   out.push({p:v,side:side});
  }
  var hi=-1e9,lo=1e9,h20=-1e9,l20=1e9,b;
  for(i=Math.max(0,n-60);i<n;i++){b=kl[i];if(b.h>hi)hi=b.h;if(b.l<lo)lo=b.l}
  for(i=Math.max(0,n-20);i<n;i++){b=kl[i];if(b.h>h20)h20=b.h;if(b.l<l20)l20=b.l}
  add(hi,'60日高','up');add(h20,'20日高','up');
  add(lo,'60日低','dn');add(l20,'20日低','dn');
  var m20=ma(kl,20),m60=ma(kl,60);
  if(m20)add(m20,'MA20',m20>=p?'up':'dn');
  if(m60)add(m60,'MA60',m60>=p?'up':'dn');
  if(hi>lo){
   var r=hi-lo;
   add(lo+r*0.382,'0.382',(lo+r*0.382)>=p?'up':'dn');
   add(lo+r*0.618,'0.618',(lo+r*0.618)>=p?'up':'dn');
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
    if(q.p>p&&nu<2){add(q.p,'筹码峰','up');nu++}
    else if(q.p<p&&nd<2){add(q.p,'筹码峰','dn');nd++}
    if(nu>=2&&nd>=2)break;
   }
  }
  for(i=n-1;i>Math.max(0,n-60);i--){
   var a=kl[i-1],c=kl[i];
   if(c.l>a.h*1.002){add(a.h,'缺口','up');add(c.l,'缺口','dn');break}
   if(c.h<a.l*0.998){add(c.h,'缺口','up');add(a.l,'缺口','dn');break}
  }
  var lb=kl[n-1];
  if(lb&&lb.o>0&&(lb.c/lb.o-1)>0.095)add(lb.c,'昨涨停','up');
  var unit=p<5?0.5:(p<20?1:(p<100?5:(p<500?10:50)));
  add(Math.ceil(p/unit)*unit,'整数关','up');
  add(Math.floor(p/unit)*unit,'整数关','dn');
  return out;
 }
 window.__lvlOf=function(s){
  if(s._lvd===M.day&&s._lvc)return s._lvc;
  s._lvd=M.day;s._lvc=calc(s);return s._lvc;
 };
})();
