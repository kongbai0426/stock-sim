/* clock.js v4 —— 1真实秒 = 6模拟秒（一天 240 分钟 ≈ 40 分钟）
   分钟内只让“最新价 / 盘口”小幅跳动，不再往 hist 里塞插值点。
   于是 hist 每天只有 240 个点，量柱也是 240 根，和撮合次数一一对应。 */
(function(){
  var REAL=window.stepMinute, PER=10, SUB=2, c=0;
  if(typeof REAL!=='function')return;
  window.__stepReal=REAL;
  function fix(st){
    var p=Math.exp(st.lf);
    if(p>st.up)p=st.up;
    if(p<st.dn)p=st.dn;
    st.price=Math.round(p*100)/100;
    st.lf=Math.log(st.price);
  }
  function mvBook(st,d){
    var b=st.book;if(!b)return;
    var L=[b.bids,b.asks],i,j,a;
    for(i=0;i<2;i++){a=L[i];if(!a)continue;
      for(j=0;j<a.length;j++)a[j].p=Math.round((a[j].p+d)*100)/100;}
  }
  function sub(){
    if(M.phase!=='open')return;
    for(var i=0;i<M.stocks.length;i++){
      var st=M.stocks[i],old=st.price,dev=st.lfair-st.lf;
      st.lf+=gauss()*0.00020+dev*0.10;
      fix(st);
      if(st.price>st.high)st.high=st.price;
      if(st.price<st.low)st.low=st.price;
      if(st.price!==old)mvBook(st,st.price-old);
    }
  }
  window.stepMinute=function(){
    c++;
    if(c>=PER){c=0;REAL();}
    else{for(var j=1;j<=SUB;j++)sub();}
  };
})();
