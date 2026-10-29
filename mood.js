/* mood.js v2 —— 板块主线 + 大盘情绪 + 妖股(放量) + 盘内波动倍率 */
(function(){
  var day=-1,theme=[],yao=[],moodT=0,strength=1,kvol=1;
  function newDay(){
    var i,si,st;
    for(i=0;i<M.stocks.length;i++){st=M.stocks[i];if(st._vbBase)st.volBase=st._vbBase}
    for(i=0;i<M.secMood.length;i++)M.secMood[i]=0;
    strength=0.5+Math.random()*1.3;
    moodT=(Math.random()-0.5)*0.5*strength;
    theme=[];
    var n=1+(Math.random()<0.45?1:0);
    for(i=0;i<n;i++){si=Math.floor(Math.random()*SECTORS.length);theme.push({si:si,dir:Math.random()<0.7?1:-1})}
    yao=[];
    for(i=0;i<M.stocks.length;i++){
      if(Math.random()<0.035){
        st=M.stocks[i];
        if(!st._vbBase)st._vbBase=st.volBase;
        st.volBase=Math.round(st._vbBase*(4+Math.random()*6));
        yao.push({c:st.code,dir:Math.random()<0.7?1:-1});
      }
    }
  }
  function tick(){
    if(M.day!==day){day=M.day;newDay()}
    kvol+=(Math.random()-0.5)*0.16+(1-kvol)*0.03;
    if(kvol<0.4)kvol=0.4;if(kvol>2.6)kvol=2.6;
    M.kvol=kvol;
    M.mood=moodT;
    var i,t,st,push,p,h;
    for(i=0;i<theme.length;i++){t=theme[i];M.secMood[t.si]=t.dir*0.45*strength}
    for(i=0;i<yao.length;i++){
      st=getStock(yao[i].c);if(!st)continue;
      push=yao[i].dir*0.0011*strength;
      st.lfair+=push;st.lf+=push;
      p=Math.exp(st.lf);
      if(p>st.up)p=st.up;if(p<st.dn)p=st.dn;
      st.price=Math.round(p*100)/100;st.lf=Math.log(st.price);
      if(st.price>st.high)st.high=st.price;
      if(st.price<st.low)st.low=st.price;
      h=st.hist[st.hist.length-1];
      if(h)h.p=st.price;
      if(window.buildBook)window.buildBook(st);
    }
  }
  var old=window.stepMinute,real=window.__stepReal;
  window.stepMinute=function(){old();tick()};
  if(real)window.__stepReal=function(){real();tick()};
})();
