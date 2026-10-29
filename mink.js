/* mink.js —— 分钟K数据层：为 5/15/30/60 分K 提供真实结构的K线
   历史日：按当天 开/高/低/收 生成 240 根分钟线（随机但严格落在高低之间，并触及高低点）
   当日：直接用 s.hist 的分钟点。之后按 5/15/30/60 聚合。 */
(function(){
  var DAYS=20;
  function rr(n){n=(n*1103515245+12345)&0x7fffffff;return((n>>>8)&0xffff)/65535}
  function seedOf(s){var n=0;for(var i=0;i<s.code.length;i++)n=n*31+s.code.charCodeAt(i);return n||7}
  function synth(s,k){
    var N=240,o=k.o,h=k.h,l=k.l,c=k.c,i;
    if(!(h>=l)||!(o>0)){h=o=l=c=o||1}
    var seed=seedOf(s)+(k.d||0)*977,vol=Math.max((h-l)/8,c*0.002);
    var iH=10+Math.floor(rr(seed)*110),iL=120+Math.floor(rr(seed+31)*110);
    if(iH>iL){var tp=iH;iH=iL;iL=tp}
    var A=[{i:0,p:o},{i:iH,p:h},{i:iL,p:l},{i:239,p:c}];
    A.sort(function(x,y){return x.i-y.i});
    var mins=[],prev=o;
    for(i=0;i<N;i++){
      var s0=A[0],s1=A[A.length-1],j;
      for(j=0;j<A.length-1;j++){if(i>=A[j].i&&i<=A[j+1].i){s0=A[j];s1=A[j+1];break}}
      var t2=(s1.i===s0.i)?0:(i-s0.i)/(s1.i-s0.i);
      var base=s0.p+(s1.p-s0.p)*t2;
      var wig=Math.sin(Math.PI*t2)*(rr(seed+i*13)-0.5)*vol*2;
      var v=base+wig;
      if(v>h)v=h;if(v<l)v=l;
      var oo=prev,cc=v;
      var hi=Math.max(oo,cc)*(1+rr(seed+i*7)*0.0008);
      var lo=Math.min(oo,cc)*(1-rr(seed+i*11)*0.0008);
      mins.push({o:oo,h:Math.min(h,Math.max(hi,oo,cc)),l:Math.max(l,Math.min(lo,oo,cc)),c:cc,v:0});
      prev=cc;
    }
    var w=[],wsum=0;
    for(i=0;i<N;i++){var ww=1+1.2*Math.exp(-i/25)+0.7*Math.exp(-(N-i)/25);w.push(ww);wsum+=ww}
    var tot=k.v||0;
    for(i=0;i<N;i++)mins[i].v=tot*w[i]/wsum;
    return mins;
  }
  function todayMins(s){
    var N=240,mins=[],i;
    for(i=0;i<N;i++)mins.push(null);
    var hs=s.hist||[];
    for(var j=0;j<hs.length;j++){
      var h=hs[j],mi=Math.floor(h.m==null?j:h.m);
      if(mi<0||mi>=N)continue;
      var b=mins[mi];
      if(!b){b={o:h.p,h:h.p,l:h.p,c:h.p,v:0};mins[mi]=b}
      if(h.p>b.h)b.h=h.p;
      if(h.p<b.l)b.l=h.p;
      b.c=h.p;b.v+=(h.v||0);
    }
    return mins;
  }
  function agg(mins,per,day){
    var out=[],i,j;
    for(i=0;i<240;i+=per){
      var o=null,h=null,l=null,c=null,v=0;
      for(j=i;j<i+per&&j<240;j++){
        var b=mins[j];if(!b)continue;
        if(o===null)o=b.o;
        c=b.c;
        if(h===null||b.h>h)h=b.h;
        if(l===null||b.l<l)l=b.l;
        v+=b.v;
      }
      if(o===null)continue;
      var bar={d:day,o:o,h:h,l:l,c:c,v:v};
      if(per===60)bar.t=Math.floor(i/60);
      out.push(bar);
    }
    return out;
  }
  window.mk=function(s,per){
    if(!s||!s.kline)return [];
    var kl=s.kline,last=kl.length?kl[kl.length-1].d:0;
    var key=kl.length+'_'+last+'_'+per+'_'+(M.minute||0);
    if(s._mkKey===key&&s._mkCache)return s._mkCache;
    var out=[],from=Math.max(0,kl.length-DAYS),i;
    for(i=from;i<kl.length;i++)out=out.concat(agg(synth(s,kl[i]),per,kl[i].d));
    if(M.minute>0)out=out.concat(agg(todayMins(s),per,M.day));
    s._mkKey=key;s._mkCache=out;
    return out;
  };
})();
