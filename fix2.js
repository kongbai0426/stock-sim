// 收盘结算：把当天剩余分钟全部走完，再进入下一天
(function(){
 function fin(){
  var d=M.day,g=0;
  while(M.day===d&&g<300){stepMinute();matchAll();g++}
 }
 function bind(id,fn){var e=document.getElementById(id);if(e)e.onclick=fn}
 bind('btnEnd',function(){
  fin();running=false;
  var p=document.getElementById('btnPause');if(p)p.textContent='▶ 继续';
  rw();rp();rm();ts('第'+(M.day-1)+'日已收盘，进入第'+M.day+'日');
 });
 bind('btnNext',function(){
  fin();running=true;
  var p=document.getElementById('btnPause');if(p)p.textContent='⏸ 暂停';
  rw();rp();rm();ts('已进入第'+M.day+'日');
 });
})();
