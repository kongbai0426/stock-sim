/* flow.js v4 —— 资金博弈：按“金额”分档（小60%/中25%/大12%/超大3%），按时间轴画
   阈值：小<4万 中4~20万 大20~100万 超大≥100万；一手金额超过某档上限则这档不可达 */
(function(){
 var RATIO=[0.60,0.25,0.12,0.03];
 var MAXA=[39999,199999,999999,1e15];
 var MINA=[0,40000,200000,1000000];
 var NOI=[0.05,0.10,0.18,0.28];
 var KEY=['s','m','l','xl'];
 function R(){return Math.random()}
 var cv=document.getElementById('cv');
 if(cv&&!document.getElementById('fcv')){
  var f=document.createElement('canvas');
  f.id='fcv';
  f.style.cssText='display:block;width:100%;height:104px;margin-top:2px';
  cv.parentNode.insertBefore(f,cv.nextSibling);
 }
 var oldStep=window.stepMinute;
 window.stepMinute=function(){
  oldStep();
  for(var i=0;i<M.stocks.length;i++){
   var s=M.stocks[i],h=s.hist[s.hist.length-1];
   if(!h)continue;
   if(M.minute<=1||!s._fl)s._fl={xl:0,l:0,m:0,s:0,hist:[]};
   var cash=(h.v||0)*100*s.price;
   if(cash>0){
    var oneLot=s.price*100,b,j,ok=[],sum=0;
    for(b=0;b<4;b++){ok.push(oneLot<=MAXA[b]);if(ok[b])sum+=RATIO[b]}
    var amt=[0,0,0,0];
    for(b=0;b<4;b++)if(ok[b])amt[b]=cash*RATIO[b]/sum;
    for(b=3;b>=1;b--){
     if(amt[b]>=MINA[b])continue;
     var tgt=-1;
     for(j=b-1;j>=0;j--){if(ok[j]&&amt[j]>0){tgt=j;break}}
     if(tgt>=0){amt[tgt]+=amt[b];amt[b]=0}
    }
    var prev=s.hist.length>1?s.hist[s.hist.length-2].p:s.prev;
    var ret=prev?((s.price-prev)/prev):0;
    var bias=Math.max(-0.18,Math.min(0.18,ret*120));
    for(b=0;b<4;b++){
     if(amt[b]<=0)continue;
     var q=0.5+bias+(R()-0.5)*NOI[b];
     q=Math.max(0.03,Math.min(0.97,q));
     s._fl[KEY[b]]+=amt[b]*(2*q-1);
    }
   }
   s._fl.hist.push({xl:s._fl.xl,l:s._fl.l,m:s._fl.m,s:s._fl.s,t:M.minute});
   if(s._fl.hist.length>240)s._fl.hist.shift();
  }
 };
 function drawFlow(s){
  var c=document.getElementById('fcv');if(!c||!s||!s._fl)return;
  var a=s._fl.hist;if(!a.length)return;
  var r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=r.width;
  if(!w)return;
  var hh=104;
  c.width=w*d;c.height=hh*d;c.style.height=hh+'px';
  var x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,hh);
  var L=6,Rr=w-54,T=12,B=hh-12,mx=1,i,k,v;
  var KS=['xl','l','m','s'];
  for(i=0;i<a.length;i++)for(k=0;k<4;k++){v=Math.abs(a[i][KS[k]]);if(v>mx)mx=v}
  function Y(t){return T+(B-T)*(0.5-t/(2*mx))}
  function X(j){return L+(Rr-L)*Math.min(240,(a[j].t!=null?a[j].t:j))/240}
  x.strokeStyle='#1e2937';x.beginPath();x.moveTo(L,Y(0));x.lineTo(Rr,Y(0));x.stroke();
  var cols={xl:'#ff5252',l:'#e8b339',m:'#6aa9ff',s:'#00d09c'};
  for(k=0;k<4;k++){
   var kk=KS[k],yy;x.strokeStyle=cols[kk];x.lineWidth=1;x.beginPath();
   for(i=0;i<a.length;i++){yy=Y(a[i][kk]);i?x.lineTo(X(i),yy):x.moveTo(X(i),yy)}
   x.stroke();
  }
  x.font='9px sans-serif';x.textAlign='left';
  x.fillStyle='#ff5252';x.fillText('超大',L,10);
  x.fillStyle='#e8b339';x.fillText('大',L+30,10);
  x.fillStyle='#6aa9ff';x.fillText('中',L+48,10);
  x.fillStyle='#00d09c';x.fillText('小',L+66,10);
  var last=a[a.length-1];x.textAlign='right';
  x.fillStyle='#ff5252';x.fillText((last.xl/1e8).toFixed(2),w-2,Y(last.xl)+3);
  x.fillStyle='#00d09c';x.fillText((last.s/1e8).toFixed(2),w-2,Y(last.s)+3);
 }
 var oldDr=window.dr;
 window.dr=function(){oldDr();drawFlow(getStock(sel))};
 setInterval(function(){var d=document.getElementById('dt');if(d&&d.classList.contains('on'))drawFlow(getStock(sel))},1000);
})();
