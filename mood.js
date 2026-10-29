/* mood.js —— 行情活跃度：板块主线 + 大盘情绪 + 妖股 + 每日强度
   原理：不重写引擎，只在每分钟结束后改写 M.mood / M.secMood / 个别股票的 lfair，
   让引擎下一分钟按新的公允价值去走，成交量和盘口都由引擎自己维护。 */
(function(){
  var day=-1,theme=[],yao=[],moodT=0,strength=1;
  function newDay(){
    var i,si;
    for(i=0;i<M.secMood.length;i++)M.secMood[i]=0;
    strength=0.5+Math.random()*1.3;              // 当天活跃度 0.5~1.8
    moodT=(Math.random()-0.5)*0.5*strength;      // 大盘情绪 ±
    theme=[];
    var n=1+(Math.random()<0.45?1:0);
    for(i=0;i<n;i++){
      si=Math.floor(Math.random()*SECTORS.length);
      theme.push({si:si,dir:Math.random()<0.7?1:-1});
    }
    yao=[];
    for(i=0;i<M.stocks.length;i++){
      if(Math.random()<0.035)yao.push({c:M.stocks[i].code,dir:Math.random()<0.7?1:-1});
    }
  }
  var old=window.stepMinute;
  window.stepMinute=function(){
    old();
    if(M.day!==day){day=M.day;newDay()}
    var i,t,st;
    M.mood=moodT;
    for(i=0;i<theme.length;i++){
      t=theme[i];
      M.secMood[t.si]=t.dir*0.45*strength;
    }
    for(i=0;i<yao.length;i++){
      st=getStock(yao[i].c);if(!st)continue;
      var push=yao[i].dir*0.0011*strength;
      st.lfair+=push;st.lf+=push;
      var p=Math.exp(st.lf);
      if(p>st.up)p=st.up;if(p<st.dn)p=st.dn;
      st.price=Math.round(p*100)/100;st.lf=Math.log(st.price);
      if(st.price>st.high)st.high=st.price;
      if(st.price<st.low)st.low=st.price;
      var h=st.hist[st.hist.length-1];
      if(h)h.p=st.price;
      if(window.buildBook)window.buildBook(st);
    }
  };
})();
