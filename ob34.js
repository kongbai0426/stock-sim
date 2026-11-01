/* ob34.js v1 · 用户订单流驱动价格 · AX47 */
(function(){
function step(){
  var Q=window.UQ,S=window.M&&M.stocks;
  if(!Q||!S) return;
  for(var k=0;k<S.length;k++){
    var b=Q.b[k],s=Q.s[k],tot=b+s;
    if(tot<=0) continue;
    var st=S[k]; if(!st||st._seal) continue;   // 封板的先交给 ob.js
    var pre=st.pre||st.price||10, px=st.price||pre;
    var net=(b-s)/tot;                          // -1..1 净买压
    px*=(1+net*0.0012);
    var up=pre*1.1, dn=pre*0.9;
    if(px>up)px=up; if(px<dn)px=dn;
    st.price=Math.round(px*100)/100;
    st._cmv=(st._cmv||0)+tot;
  }
  Q.clear();
}
setInterval(step,250);
})();
