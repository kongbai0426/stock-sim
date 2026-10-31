/* loop.js v5 —— 唯一时钟 + 指数更新（撤掉硬闸门） */
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
})();
