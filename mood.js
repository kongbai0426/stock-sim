/* mood.js v5 —— 板块主线(多日) + 大盘情绪 + 波动倍率 + 个股趋势(OU过程)
   趋势不是常量漂移，而是会回归0的随机过程：涨一段会横/回一段，不会一路直线。
   另外用 M._mdMin 保证每分钟只执行一次（stepMinute 每秒会被调用）。 */
(function(){
  var day=-1,theme=[],themeDays=0,moodT=0,strength=1,kvol=1;
  function newDay(){
    var i,si,st;
    for(i=0;i<M.secMood.length;i++)M.secMood[i]=0;
    strength=0.5+Math.random()*1.1;
    moodT=(Math.random()-0.5)*0.4*strength;
    if(--themeDays<=0||!theme.length){
      themeDays=3+Math.floor(Math.random()*6);
      theme=[];
      var n=1+(Math.random()<0.4?1:0);
      for(i=0;i<n;i++){si=Math.floor(Math.random()*SECTORS.length);theme.push({si:si,dir:Math.random()<0.65?1:-1})}
    }
    for(i=0;i<M.stocks.length;i++){
      st=M.stocks[i];
      if(st._tr==null)st._tr=(Math.random()-0.5)*1e-4;
    }
  }
  function tick(){
    if(M._mdMin===M.minute)return;
    M._mdMin=M.minute;
    if(M.day!==day){day=M.day;newDay()}
    kvol+=(Math.random()-0.5)*0.16+(1-kvol)*0.03;
    if(kvol<0.4)kvol=0.4;if(kvol>2.2)kvol=2.2;
    M.kvol=kvol;
    M.mood=moodT;
    var i,t,st;
    for(i=0;i<theme.length;i++){t=theme[i];M.secMood[t.si]=t.dir*0.35*strength}
    for(i=0;i<M.stocks.length;i++){
      st=M.stocks[i];
      st.anchor=st.lfair;
      st._tr+=(0-st._tr)*0.0004+(Math.random()-0.5)*3.2e-6;
      if(st._tr>1.6e-4)st._tr=1.6e-4;
      if(st._tr<-1.6e-4)st._tr=-1.6e-4;
      st.lfair+=st._tr;
    }
  }
  var old=window.stepMinute,real=window.__stepReal;
  window.stepMinute=function(){old();tick()};
  if(real)window.__stepReal=function(){real();tick()};
})();
