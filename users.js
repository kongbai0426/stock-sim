/* users.js v1 · 3万虚拟用户池 · AX47 */
(function(){
var N=30000,U={N:N};
U.type=new Uint8Array(N);
U.cash=new Float32Array(N);
U.mood=new Float32Array(N);
U.skill=new Float32Array(N);
U.watch=new Int32Array(N*5);
U.wn=new Uint8Array(N);
U.wi=new Uint8Array(N);
U.gen=function(){
  var S=(window.M&&M.stocks)||[],L=S.length||1,i,j,n,r,t;
  for(i=0;i<N;i++){
    r=Math.random();
    t=r<.80?0:r<.90?1:r<.95?2:3;   // 0散户 1机构 2游资 3量化
    U.type[i]=t;
    U.cash[i]= t===1 ? 2e7+Math.random()*1.8e8
             : t===2 ? 5e6+Math.random()*5e7
             : t===3 ? 1e7+Math.random()*9e7
             : 1e4+Math.random()*5e5;
    U.mood[i]=Math.random()*2-1;
    U.skill[i]=Math.random();
    n=2+((Math.random()*4)|0); U.wn[i]=n;
    for(j=0;j<n;j++) U.watch[i*5+j]=(Math.random()*L)|0;
  }
  return U;
};
window.USERS=U;
if(window.M&&M.stocks) U.gen();
})();
