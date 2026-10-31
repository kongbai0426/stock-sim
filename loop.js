/* loop.js v1 —— 唯一时钟：把 6 层 stepMinute 包装收敛成一条显式顺序
   顺序与旧链一致：clock(1/10 走 engine，其余 sub×2) → mood.tick → ob(flowTick+run)
   flow.js 会在 load 时再包一层 acc，所以 acc 仍在本链之后执行。 */
(function(){
  function one(){
    if(window.__clock)window.__clock();
    else if(window.__engineStep)window.__engineStep();
    if(window.__mood)window.__mood();
    if(window.__ob)window.__ob();
  }
  function realOne(){
    if(window.__engineStep)window.__engineStep();
    if(window.__mood)window.__mood();
    if(window.__ob)window.__ob();
  }
  window.stepMinute=one;
  window.__stepReal=realOne;
})();
