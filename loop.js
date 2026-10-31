/* loop.js v6 —— 唯一时钟 + 指数更新 + 隐藏旧的“上证模拟指数”卡片 */
(function(){
 function one(){
  if(window.__clock)window.__clock();
  else if(window.__engineStep)window.__engineStep();
  if(window.__mood)window.__mood();
  if(window.__ob)window.__ob();
  if(window.__idxTick)window.__idxTick();
 }
 function realOne(){
  if(window.__engineStep)window.__engineStep();
  if(window.__mood)window.__mood();
  if(window.__ob)window.__ob();
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
