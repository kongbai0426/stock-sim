/* clock.js v3 —— 1真实秒 = 6模拟秒；一天240分钟 ≈ 40分钟
   每分钟 19 个点（18 个中间点 + 1 个正式分钟点，约 3.2 模拟秒一个）。
   每 tick 走 2 小步；中间点只给当前选中的票记录，避免一天几万点撑爆内存。 */
(function(){
  var REAL=window.stepMinute, PER=10, SUB=2, LN=PER*SUB, c=0;
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
  function sub(k){
    var tg=sel?getStock(sel):null,i,st,old,dev;
    for(i=0;i<M.stocks.length;i++){
      st=M.stocks[i];old=st.price;dev=st.lfair-st.lf;
      st.lf+=gauss()*0.00018+dev*0.08;
      fix(st);
      if(st.price>st.high)st.high=st.price;
      if(st.price<st.low)st.low=st.price;
      if(st.price!==old)mvBook(st,st.price-old);
      if(st===tg&&st.hist)st.hist.push({p:st.price,v:0,m:M.minute+k/LN});
    }
  }
  window.stepMinute=function(){
    c++;
    if(c>=PER){c=0;REAL();}
    else{for(var j=1;j<=SUB;j++)sub((c-1)*SUB+j);}
  };
})();
