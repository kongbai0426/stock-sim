// 日切统一重算：prev / open / up / dn / 封板状态 / 价格同步
(function(){
 function r2(x){return Math.round(x*100)/100}
 var old=window.stepMinute;
 window.stepMinute=function(){
  old();
  var first=(M.minute<=1);
  for(var i=0;i<M.stocks.length;i++){
   var s=M.stocks[i];
   if(first){
    var p=s.prev;
    s.open=p;
    s.high=p;
    s.low=p;
    s.up=r2(p*1.1);
    s.dn=r2(p*0.9);
    s.price=p;
    s.vol=0;
    s.amount=0;
    s._seal=0;
    s._sealQty=0;
    s.hist=[{p:p,v:0,m:0}];
   }
   if(s.price>s.up)s.price=s.up;
   if(s.price<s.dn)s.price=s.dn;
   var h=s.hist[s.hist.length-1];
   if(h)h.p=s.price;
  }
 };
})();
