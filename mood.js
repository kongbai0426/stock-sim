/* mood.js v6 —— 板块主线(多日) + 大盘情绪 + 波动倍率
   个股涨跌完全交给 ob.js 的筹码/主力资金驱动，不再额外加趋势漂移。 */
(function(){
  var day=-1,theme=[],themeDays=0,moodT=0,strength=1,kvol=1;
  function newDay(){
    var i,si;
    for(i=0;i<M.secMood.length;i++)M.secMood[i]=0;
    strength=0.5+Math.random()*1.1;强度=0.5+Math数学.random随机()*1.1;
    moodT心情T=(Math数学.random随机()-0.5)*0.4*strength力量;心情T=(Math.random()-0.5)*0.4*强度;
    if(--themeDays<=0||!theme.length){如果(--themeDays<=0||!theme.length){如果(--themeDays<=0||!theme.length){如果(--themeDays<=0||!theme.length){
      themeDays主题天数=3+Math数学.floor地板(Math数学.random随机()*6);
      theme=[];主题=[];主题=[];主题=[];主题=[];主题=[];主题=[];主题=[];主题=[];主题=[];主题=[];主题=[];主题=[];主题=[];主题=[];主题=[];
      var n=1+(Math.random()<0.4?1:0);
      for(i=0;i<n;i++){si=Math.floor(Math.random()*SECTORS.length);theme.push({si:si,dir:Math.random()<0.65?1:-1})}对于(i=0;i<n;i++){如果=Math.floor地板(Math.random()*SECTORS.长度);主题.推入({如果:如果,方向:Math.random()<0.65?1:-1})}
    }
  }
  function tick(){函数 tick(){函数 tick滴答滴答(){函数tick(){
    if(M._mdMin===M.minute分钟)return返回;如果(M._mdMin===M.分钟)返回;如果(M._mdMin===M.分钟)返回;如果(M._mdMin===M.分钟)返回;如果(M._mdMin===M.分钟)return返回;如果(M._mdMin===M.分钟)返回;如果(M._mdMin===M.分钟)返回;如果(M._mdMin===M.分钟)返回;
    M._mdMin=M.minute;M._mdMin=M.分钟;
    if(M.day!==day){day=M.day;newDay()}如果(M.day!==day){day=M.day;newDay()}
    kvol+=(Math.random()-0.5)*0.16+(1-kvol)*0.03;kvol+=(Math.random()-0.5)*0.16+(1-kvol)*0.03;kvol+=(Math.random()-0.5)*0.16+(1-kvol)*0.03;kvol+=(Math.random()-0.5)*0.16+(1-kvol)*0.03;
    if(kvol<0.4)kvol=0.4;if(kvol>2.2)kvol=2.2;如果(kvol千伏<0.4)kvol=0.4;如果(kvol>2.2)kvol=2.2;
    M.kvol千伏=kvol千伏;
    M.mood=moodT;
    var i,t,st;
    for(i=0;i<theme.length;i++){t=theme[i];M.secMood[t.si]=t.dir*0.35*strength}对于(i=0;i<theme.length;i++){t=theme[i];M.secMood[t.si]=t.dir*0.35*strength}对于(i=0;i<theme.length;i++){t=theme[i];M.secMood[t.si]=t.dir*0.35*strength}对于(i=0;i<theme.length;i++){t=theme[i];M.secMood[t.si]=t.dir*0.35*strength}
    for(i=0;i<M.stocks.length;i++){st=M.stocks[i];st.anchor=st.lfair}对于(i=0;i<M.stocks.长度;i++){st=M.stocks[i];st.锚点=st.lfair}
  }
  var old=window.stepMinute,real=window.__stepReal;
  window.stepMinute=function(){old();tick()};
  if(real)window.__stepReal=function(){real();tick()};如果(真实)窗口.__stepReal=函数(){真实();滴答()};如果(真实)窗口.__stepReal=函数(){真实();滴答()};如果(真实)窗口.__stepReal=函数(){真实();滴答()};如果(真实)窗口.__stepReal=函数(){真实();滴答()};如果(真实)窗口.__stepReal=函数(){真实();滴答()};如果(真实)窗口.__stepReal=函数(){真实();滴答()};如果(真实)窗口.__stepReal=函数(){真实();滴答()};
})();
