// 跨天清除K线缓存
(function(){
 var d=-1;
 function c(){
  if(window.M&&M.day!==d){
   d=M.day;
   for(var i=0;i<M.stocks.length;i++){M.stocks[i]._ext=null;M.stocks[i].k60=null}
  }
 }
 var oldStep=window.stepMinute;
 window.stepMinute=function(){oldStep();c()};
 var oldDr=window.dr;
 window.dr=function(){
  c();
  var s=getStock(sel);
  // 缓存在 dr 前清掉后，v6 会重新生成
  oldDr();
 };
})();
