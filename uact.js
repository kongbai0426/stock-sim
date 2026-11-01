/* uact.js v1 · 用户行为与订单流 · AX47 */
(function(){
var BQ,SQ,run=0;
function init(){
  var L=(window.M&&M.stocks)?M.stocks.length:0;
  if(!L) return false;
  BQ=new Float64Array(L); SQ=new Float64Array(L); run=1;
  window.UQ={b:BQ,s:SQ,clear:function(){BQ.fill(0);SQ.fill(0);}};
  return true;
}
function decide(i){
  var U=window.USERS,S=window.M&&M.stocks; if(!U||!S) return;
  var wn=U.wn[i]; if(!wn) return;
  var k=U.watch[i*5+(U.wi[i]%wn)]; U.wi[i]++;
  var s=S[k]; if(!s) return;
  var pre=s.pre||s.preClose||s.price||10;
  var px=s.price||pre;
  var chg=(px-pre)/pre;
  var t=U.type[i], m=U.mood[i];
  var tgt = t===0?chg*9 : t===2?chg*14 : t===3?-chg*5 : chg*.6;
  m+=(tgt-m)*.18; U.mood[i]=m;
  if(U.cash[i]<5000) return;
  var b = m>.12?1 : m<-.12?-1 : 0;
  if(!b) return;
  if(Math.random()<.22) b=-b;
  var q = t===0 ? (1+((Math.random()*20)|0))*100
        : t===1 ? (50+((Math.random()*950)|0))*100
        : t===2 ? (10+((Math.random()*90)|0))*100
        : (1+((Math.random()*5)|0))*100;
  if(b>0){
    if(U.cash[i] < q*px) return;
    U.cash[i]-=q*px;
    BQ[k]+=q;
  } else {
    SQ[k]+=q;
  }
  UACT.n++;
}
function tick(){
  if(!run && !init()) return;
  var t0=performance.now(),n=0,lim=1400;
  UACT.n=0;
  while(n<lim && ((n&63)||(performance.now()-t0<6))){
    decide((Math.random()*USERS.N)|0); n++;
  }
}
var UACT={tick:tick,n:0,init:init};
window.UACT=UACT;
function loop(){ tick(); requestAnimationFrame(loop); }
if(window.M&&M.stocks) init();
requestAnimationFrame(loop);
})();
