/* loop.js v7 —— 唯一时钟 + 指数更新 + 关键位暗力（不显示） */
(function(){
 function force(){
  if(typeof M==='undefined'||M.phase!=='open')return;
  var f=window.__lvlOf;if(!f)return;
  for(var i=0;i<M.stocks.length;i++){
   var s=M.stocks[i];
   var p=s.price,pp=s._ppv;
   s._ppv=p;
   if(pp==null)continue;
   var d=p-pp;if(!d)continue;
   var L=f(s);if(!L||!L.length)continue;
   var res=null,sup=null,j,q;
   for(j=0;j<L.length;j++){
    q=L[j];
    if(q.p>p&&(res==null||q.p<res))res=q.p;
    if(q.p<p&&(sup==null||q.p>sup))sup=q.p;
   }
   var np=p;
   if(d>0&&res!=null&&(res-p)/p<0.004)np=pp+d*0.20;
   if(d<0&&sup!=null&&(p-sup)/p<0.004)np=pp+d*0.20;
   if(np!==p){
    np=Math.round(np*100)/100;
    s.price=np;s._px=np;s.lf=Math.log(np);
    var h=s.hist[s.hist.length-1];if(h)h.p=np;
   }
  }
 }
 function one(){
  if(window.__clock)window.__clock();
  else if(window.__engineStep)window.__engineStep();
  if(window.__mood)window.__mood();
  if(window.__ob)window.__ob();
  force();
  if(window.__idxTick)window.__idxTick();
 }
 function realOne(){
  if(window.__engineStep)window.__engineStep();
  if(window.__mood)window.__mood();
  if(window.__ob)window.__ob();
  force();
  if(window.__idxTick)window.__idxTick();
 }
 window.stepMinute=one;
 window.__stepReal=realOne;

 setInterval(function(){
  try{
   var b=document.getElementById('secBack');
   if(!b||!b.parentNode)return;
   var card=b.parentNode;
   while(card&&card.className.indexOf('c')<0)card=card.parentNode;
   if(!card||card.id==='secWrap')return;
   card.style.display=(b.style.display==='none')?'none':'';
  }catch(e){}
 },400);
})();
