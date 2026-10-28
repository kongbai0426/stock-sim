/* klinefix.js —— 日K不增长修复
   病根：multi.js 的 extDaily 把 s.kline 快照进 s._ext 后永不更新，
        收盘新生成的日线进不去，所以日K只有"今天"这一根在变。
   做法：3400根假历史只生成一次并缓存，_ext 每次用 假历史+真实kline 重拼。 */
(function(){
  function rr(n){n=(n*1103515245+12345)&0x7fffffff;return((n>>>8)&0xffff)/65535}
  function seedOf(s){var n=0;for(var i=0;i<s.code.length;i++)n=n*31+s.code.charCodeAt(i);return n||7}
  function prefix(s){
    if(s._kp)return s._kp;
    var base=s.kline;
    if(!base||!base.length)return [];
    var old=[],p=base[0].o,seed=seedOf(s),fd=(base[0].d||0);
    for(var j=0;j<3400;j++){
      var r=rr(seed+j*7+1),g=(r-0.5)*0.04;p=p/(1+g);
      var o=p*(1+(r-0.5)*0.006),c=p;
      old.push({d:fd-3400+j,o:o,h:Math.max(o,c)*(1+r*0.007),l:Math.min(o,c)*(1-r*0.007),c:c,v:(base[0].v||1000)*(0.5+r)});
    }
    s._kp=old;return old;
  }
  function sync(s){
    if(!s||!s.kline)return;
    var n=s.kline.length,key=n+'_'+(n?s.kline[n-1].d:0);
    if(s._ext&&s._kx===key)return;
    s._kx=key;
    s._ext=prefix(s).concat(s.kline);
    s.k60=null;
  }
  var odr=window.dr;
  window.dr=function(){sync(getStock(sel));if(odr)odr()};
  var ost=window.stepMinute;
  window.stepMinute=function(){if(ost)ost();sync(getStock(sel))};
})();
