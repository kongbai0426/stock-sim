// 板块指数与成分股
(function(){
 var on=false,cur=-1;
 function E(id){return document.getElementById(id)}
 function bAll(){var s=0;for(var i=0;i<M.stocks.length;i++)s+=M.stocks[i].baseCap;return s||1}
 function bSec(si){var s=0;for(var i=0;i<M.stocks.length;i++)if(M.stocks[i].si===si)s+=M.stocks[i].baseCap;return s||1}
 function val(si,prev){
  var s=0;
  for(var i=0;i<M.stocks.length;i++){
   var st=M.stocks[i];if(si>=0&&st.si!==si)continue;
   s+=(prev?st.prev:st.price)*st.shares;
  }
  return 1000*s/(si>=0?bSec(si):bAll());
 }
 function series(si){
  var out=[];
  for(var m=0;m<=M.minute;m++){
   var s=0;
   for(var i=0;i<M.stocks.length;i++){
    var st=M.stocks[i];if(si>=0&&st.si!==si)continue;
    var h=st.hist[m];var p=(h&&h.m===m)?h.p:st.price;
    s+=p*st.shares;
   }
   out.push({p:1000*s/(si>=0?bSec(si):bAll()),m:m});
  }
  return out;
 }
 function draw(arr){
  var c=E('idxCv'),r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=r.width,h=200;
  c.width=w*d;c.height=h*d;c.style.height=h+'px';
  var x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,h);
  if(arr.length<2){x.fillStyle='#7d8b9c';x.font='12px sans-serif';x.fillText('等待行情…',12,30);return}
  var mx=-1e9,mn=1e9;
  arr.forEach(function(v){if(v.p>mx)mx=v.p;if(v.p<mn)mn=v.p});
  var pad=(mx-mn)*0.15||1;mx+=pad;mn-=pad;
  var L=6,R=w-50,T=10,PH=h-28;
  function X(i){var mm=arr[i].m!=null?arr[i].m:i;return L+(R-L)*mm/240}
  function Y(p){return T+PH-(p-mn)/(mx-mn)*PH}
  x.strokeStyle='#1a2432';x.fillStyle='#7d8b9c';x.font='10px sans-serif';x.textAlign='right';
  for(var i=0;i<=3;i++){var y=T+PH*i/3;x.beginPath();x.moveTo(L,y);x.lineTo(R,y);x.stroke();x.fillText((mx-(mx-mn)*i/3).toFixed(2),w-2,y+3)}
  x.strokeStyle='#e8b339';x.lineWidth=1.5;x.beginPath();
  arr.forEach(function(v,i){var yy=Y(v.p);i?x.lineTo(X(i),yy):x.moveTo(X(i),yy)});
  x.stroke();
 }
 function render(){
  if(!on)return;
  var si=cur;
  var now=val(si,false),prev=val(si,true);
  var pc=prev?((now-prev)/prev*100):0;
  E('idxTitle').textContent=si<0?'上证指数':SECTORS[si]+'指数';
  E('idxVal').textContent=now.toFixed(2)+'  '+(pc>0?'+':'')+pc.toFixed(2)+'%';
  E('idxVal').className='m '+(pc>0?'r':pc<0?'g':'s');
  E('secBack').style.display=si<0?'none':'inline';
  draw(series(si));
  var h='';
  if(si<0){
   for(var i=0;i<SECTORS.length;i++){
    var n=val(i,false),p=val(i,true),q=p?((n-p)/p*100):0,cl=q>0?'r':q<0?'g':'s';
    h+='<div class="w" data-s="'+i+'"><div class="l"><div class="n">'+SECTORS[i]+'</div><div class="cd">成分股 '+cnt(i)+' 只</div></div><div class="rt"><div class="p m '+cl+'">'+n.toFixed(1)+'</div><div class="pc m '+cl+'">'+(q>0?'+':'')+q.toFixed(2)+'%</div></div></div>';
   }
  }else{
   for(var i=0;i<M.stocks.length;i++){
    var st=M.stocks[i];if(st.si!==si)continue;
    var q2=st.prev?((st.price-st.prev)/st.prev*100):0,cl2=q2>0?'r':q2<0?'g':'s';
    h+='<div class="w" data-c="'+st.code+'"><div class="l"><div class="n">'+st.name+'</div><div class="cd">'+st.code+'</div></div><div class="rt"><div class="p m '+cl2+'">'+st.price.toFixed(2)+'</div><div class="pc m '+cl2+'">'+(q2>0?'+':'')+q2.toFixed(2)+'%</div></div></div>';
   }
  }
  E('secList').innerHTML=h;
  [].forEach.call(document.querySelectorAll('#secList .w'),function(e){
   e.onclick=function(){
    var s=e.getAttribute('data-s');
    if(s!=null){cur=+s;render()}
    else{var c=e.getAttribute('data-c');if(typeof od==='function')od(c)}
   };
  });
 }
 function cnt(si){var n=0;for(var i=0;i<M.stocks.length;i++)if(M.stocks[i].si===si)n++;return n}
 function show(v){
  on=v;
  E('rankWrap').style.display=v?'none':'block';
  E('secWrap').style.display=v?'block':'none';
  E('tabRank').className=v?'':'on';
  E('tabSec').className=v?'on':'';
  if(v)render();
 }
 E('tabRank').onclick=function(){show(false)};
 E('tabSec').onclick=function(){show(true)};
 E('secBack').onclick=function(){cur=-1;render()};
 setInterval(function(){if(on)render()},1000);
})();
