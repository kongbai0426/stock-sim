/* mood.js v3 —— 板块主线 + 大盘情绪 + 波动倍率（妖股统一交给 flow.js 管） */
(function(){
  var day=-1,theme=[],moodT=0,strength=1,kvol=1;
  function newDay(){
    var i,si;
    for(i=0;i<M.secMood.length;i++)M.secMood[i]=0;
    strength=0.5+Math.random()*1.1;
    moodT=(Math.random()-0.5)*0.4*strength;
    theme=[];
    var n=1+(Math.random()<0.4?1:0);
    for(i=0;i<n;i++){si=Math.floor(Math.random()*SECTORS.length);theme.push({si:si,dir:Math.random()<0.7?1:-1})}
  }
  function tick(){
    if(M.day!==day){day=M.day;newDay()}
    kvol+=(Math.random()-0.5)*0.16+(1-kvol)*0.03;
    if(kvol<0.4)kvol=0.4;if(kvol>2.2)kvol=2.2;
    M.kvol=kvol;
    M.mood=moodT;
    var i,t;
    for(i=0;i<theme.length;i++){t=theme[i];M.secMood[t.si]=t.dir*0.32*strength}
  }
  var old=window.stepMinute,real=window.__stepReal;
  window.stepMinute=function(){old();tick()};
  if(real)window.__stepReal=function(){real();tick()};
})();
