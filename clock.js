/* clock.js —— 时间比例 1:6  v1
   1真实秒 = 6模拟秒 → 1模拟分钟 = 10真实秒 → 一天240分钟 ≈ 40分钟
   拦截 stepMinute：每 10 次只真走 1 分钟，其余 9 次做分钟内价格试探，
   中间点写进 st.hist（m 带小数，分时线因此有中间点）。
   成交量/成交额仍由真正的 stepMinute 每分钟结算一次，不变。 */
(function(){
  var REAL=window.stepMinute, PER=10, c=0;
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
    var b=st.book; if(!b)return;
    var L=[b.bids,b.asks],i,j,a;
    for(i=0;i<2;i++){a=L[i];if(!a)continue;
      for(j=0;j<a.length;j++)a[j].p=Math.round((a[j].p+d)*100)/100;}
  }
  function intra(){
    if(M.phase!=='open')return;
    var i,st,old,dev;
    for(i=0;i<M.stocks.length;i++){
      st=M.stocks[i];old=st.price;
      dev=st.lfair-st.lf;
      st.lf+=gauss()*0.00040+dev*0.06;
      fix(st);
      if(st.price>st.high)st.high=st.price;
      if(st.price<st.low)st.low=st.price;
      if(st.price!==old)mvBook(st,st.price-old);
      if(st.hist)st.hist.push({p:st.price,v:0,m:M.minute+c/PER});
    }
  }
  window.stepMinute=function(){
    c++;
    if(c>=PER){c=0;REAL();}
    else intra();
  };
})();
