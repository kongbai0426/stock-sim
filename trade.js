// 交易与结算：订单、撮合、资金、费用、T+1、对账
function feeC(amountC,side){
 var comm=Math.max(500,Math.round(amountC*0.00025));
 var stamp=side==='sell'?Math.round(amountC*0.0005):0;
 var transfer=Math.round(amountC*0.00001);
 return comm+stamp+transfer;
}
function loadAcc(){
 try{var s=JSON.parse(localStorage.getItem('sim_acc_v1'));if(s&&s.pos&&typeof s.cashC==='number')return s}catch(e){}
 return{cashC:100000000,frozenC:0,pos:{},orders:[],trades:[],seq:1};
}
var ACC=loadAcc();
function saveAcc(){try{localStorage.setItem('sim_acc_v1',JSON.stringify(ACC))}catch(e){}}
function sanitizeAcc(){
 for(var i=0;i<ACC.orders.length;i++){
  var o=ACC.orders[i];
  if(o.status==='pending'){
   if(o.side==='buy'){ACC.cashC+=o.frozenC;ACC.frozenC-=o.frozenC;o.frozenC=0}
   else{var p=ACC.pos[o.code];if(p)p.avail+=(o.qty-o.filled)}
   o.status='cancelled';
  }
 }
 for(var c in ACC.pos)ACC.pos[c].avail=ACC.pos[c].qty;
 saveAcc();
}
function findOrder(id){for(var i=0;i<ACC.orders.length;i++)if(ACC.orders[i].id===id)return ACC.orders[i];return null}
function placeOrder(code,side,price,qty){
 var st=getStock(code);
 if(!st)return{ok:false,msg:'股票不存在'};
 price=Math.round(price*100)/100;
 if(!(price>0))return{ok:false,msg:'价格错误'};
 if(!(qty>0)||qty%1!==0)return{ok:false,msg:'数量错误'};
 if(side==='buy'&&qty%100!==0)return{ok:false,msg:'买入须100股整数倍'};
 if(price>st.up)return{ok:false,msg:'超过涨停价 '+st.up};
 if(price<st.dn)return{ok:false,msg:'低于跌停价 '+st.dn};
 if(side==='buy'){
  var amountC=Math.round(price*100)*qty;
  var est=amountC+feeC(amountC,'buy');
  if(est>ACC.cashC)return{ok:false,msg:'可用资金不足，需要 '+money(est)};
  ACC.cashC-=est;ACC.frozenC+=est;
  var o={id:ACC.seq++,code:code,name:st.name,side:side,price:price,qty:qty,filled:0,status:'pending',frozenC:est,day:M.day,time:fmtTime(M.minute)};
  ACC.orders.unshift(o);saveAcc();matchAll();
  return{ok:true,msg:'买入委托已提交',order:o};
 }else{
  var p=ACC.pos[code];
  if(!p||p.avail<qty)return{ok:false,msg:'可卖不足（T+1）'};
  p.avail-=qty;
  var o2={id:ACC.seq++,code:code,name:st.name,side:side,price:price,qty:qty,filled:0,status:'pending',frozenC:0,day:M.day,time:fmtTime(M.minute)};
  ACC.orders.unshift(o2);saveAcc();matchAll();
  return{ok:true,msg:'卖出委托已提交',order:o2};
 }
}
function fill(o,px,q){
 var amountC=Math.round(px*100)*q;
 if(o.side==='buy'){
  var fee=feeC(amountC,'buy'),cost=amountC+fee;
  if(cost>o.frozenC)cost=o.frozenC;
  o.frozenC-=cost;ACC.frozenC-=cost;
  var p=ACC.pos[o.code]||{qty:0,avail:0,costC:0,name:o.name};
  var nq=p.qty+q;
  p.costC=Math.round((p.costC*p.qty+cost)/nq);
  p.qty=nq;p.name=o.name;ACC.pos[o.code]=p;
  o.filled+=q;
  if(o.filled>=o.qty){o.status='filled';ACC.cashC+=o.frozenC;ACC.frozenC-=o.frozenC;o.frozenC=0}
  ACC.trades.unshift({id:o.id,code:o.code,name:o.name,side:'buy',price:px,qty:q,amountC:amountC,feeC:fee,day:M.day,time:fmtTime(M.minute)});
 }else{
  var fee2=feeC(amountC,'sell');
  ACC.cashC+=amountC-fee2;
  var p2=ACC.pos[o.code];
  if(p2){p2.qty-=q;if(p2.qty<=0)delete ACC.pos[o.code]}
  o.filled+=q;
  if(o.filled>=o.qty)o.status='filled';
  ACC.trades.unshift({id:o.id,code:o.code,name:o.name,side:'sell',price:px,qty:q,amountC:amountC,feeC:fee2,day:M.day,time:fmtTime(M.minute)});
 }
}
function matchAll(){
 for(var i=0;i<ACC.orders.length;i++){
  var o=ACC.orders[i];
  if(o.status!=='pending')continue;
  var st=getStock(o.code);if(!st)continue;
  var rem=o.qty-o.filled;if(rem<=0)continue;
  if(o.side==='buy'){
   var lv=st.book.asks[0];
   if(!lv||lv.p>o.price+0.0001)continue;
   var can=Math.floor(lv.q/100)*100,fq=Math.min(rem,can);
   if(fq<=0)continue;
   lv.q-=fq;fill(o,lv.p,fq);
  }else{
   var lv2=st.book.bids[0];
   if(!lv2||lv2.p<o.price-0.0001)continue;
   var can2=Math.floor(lv2.q/100)*100,fq2=Math.min(rem,can2);
   if(fq2<=0)continue;
   lv2.q-=fq2;fill(o,lv2.p,fq2);
  }
 }
}
function cancelOrder(id){
 var o=findOrder(id);
 if(!o||o.status!=='pending')return false;
 if(o.side==='buy'){ACC.cashC+=o.frozenC;ACC.frozenC-=o.frozenC;o.frozenC=0}
 else{var p=ACC.pos[o.code];if(p)p.avail+=(o.qty-o.filled)}
 o.status='cancelled';saveAcc();
 return true;
}
function marketValueC(){
 var mv=0;
 for(var c in ACC.pos){var st=getStock(c);if(st)mv+=Math.round(st.price*100)*ACC.pos[c].qty}
 return mv;
}
function equityC(){return ACC.cashC+ACC.frozenC+marketValueC()}
function money(c){return(c/100).toFixed(2)}
function selfCheck(){
 var errs=[];
 if(ACC.cashC<0)errs.push('现金为负');
 if(ACC.frozenC<0)errs.push('冻结资金为负');
 var sum=0;
 for(var i=0;i<ACC.orders.length;i++){
  var o=ACC.orders[i];
  if(o.status==='pending'&&o.side==='buy')sum+=o.frozenC;
 }
 if(sum!==ACC.frozenC)errs.push('冻结不平：'+sum+' / '+ACC.frozenC);
 for(var c in ACC.pos){
  var p=ACC.pos[c];
  if(p.qty<0)errs.push(c+' 持仓为负');
  if(p.avail<0||p.avail>p.qty)errs.push(c+' 可用数量异常');
 }
 return errs;
}
window.onNewDay=function(){
 for(var c in ACC.pos)ACC.pos[c].avail=ACC.pos[c].qty;
 saveAcc();
};
sanitizeAcc();
