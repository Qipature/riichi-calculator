// Shape-based yaku for 13/14 concealed tiles, without declared quads or event history.
function winningDecompositions(hand){
 const result=[];
 for(let pair=0;pair<34;pair++){
  if(hand[pair]<2)continue;
  const a=hand.slice();a[pair]-=2;
  function visit(groups){
   const i=a.findIndex(n=>n>0);
   if(i<0){if(groups.length===4)result.push({pair,groups:groups.slice()});return;}
   if(groups.length===4)return;
   if(a[i]>=3){a[i]-=3;visit(groups.concat({type:'triplet',tile:i}));a[i]+=3;}
   if(i<27&&i%9<=6&&a[i+1]&&a[i+2]){
    a[i]--;a[i+1]--;a[i+2]--;visit(groups.concat({type:'sequence',tile:i}));a[i]++;a[i+1]++;a[i+2]++;
   }
  }
  visit([]);
 }
 return result;
}
function shapeYaku(hand,win,options={}){
 if(hand.length!==34||hand.some(n=>n<0||n>4)||hand.reduce((a,b)=>a+b,0)!==14||!hand[win])return null;
 const tsumo=!!options.tsumo,seat=options.seat??28,round=options.round??27;
 const present=hand.flatMap((n,i)=>n?[i]:[]),terminal=i=>i>=27||i%9===0||i%9===8;
 const suits=new Set(present.filter(i=>i<27).map(i=>Math.floor(i/9))),honors=present.some(i=>i>=27);
 const candidates=[];
 function evaluate(d,winningGroup,seven=false,kokushi=false){
  const ordinary=[],limits=[];const add=(name,han)=>ordinary.push({name,han}),limit=name=>limits.push({name,yakuman:1});
  const groups=d?.groups||[],seq=groups.filter(g=>g.type==='sequence').map(g=>g.tile),trip=groups.filter(g=>g.type==='triplet').map(g=>g.tile);
  const dark=trip.length-(!tsumo&&winningGroup?.type==='triplet'?1:0);
  if(kokushi){const before=hand.slice();before[win]--;limit(present.every(i=>before[i]===1)?'国士无双十三面待':'国士无双');}
  if(present.every(i=>i>=27))limit('字一色');
  if(present.every(i=>i<27&&terminal(i)))limit('清老头');
  if(present.every(i=>[19,20,21,23,25,32].includes(i)))limit('绿一色');
  if(trip.filter(i=>i>=31).length===3)limit('大三元');
  const winds=trip.filter(i=>i>=27&&i<=30).length;
  if(winds===4)limit('大四喜');else if(winds===3&&d.pair>=27&&d.pair<=30)limit('小四喜');
  if(dark===4)limit('四暗刻'+(winningGroup?.type==='pair'?'（单骑）':''));
  if(suits.size===1&&!honors){
   const suit=[...suits][0],a=hand.slice(suit*9,suit*9+9);
   if(a[0]>=3&&a[8]>=3&&a.slice(1,8).every(n=>n>=1)){const before=a.slice();before[win%9]--;limit(before[0]===3&&before[8]===3&&before.slice(1,8).every(n=>n===1)?'纯正九莲宝灯（九面待）':'九莲宝灯');}
  }
  if(limits.length){candidates.push({yaku:limits,yakuman:limits.length,han:0,rank:100*limits.length});return;}
  if(options.riichi)add('立直',1);
  if(tsumo)add('门清自摸',1);
  if(present.every(i=>i<27&&!terminal(i)))add('断幺九',1);
  if(suits.size===1)add(honors?'混一色':'清一色',honors?3:6);
  if(present.every(terminal))add('混老头',2);
  if(seven)add('七对子',2);
  if(d){
   for(const i of trip){
    if(i>=31)add('役牌·'+['白','发','中'][i-31],1);
    else if(i===seat||i===round)add('役牌·'+['东','南','西','北'][i-27]+(i===seat&&i===round?'（连风）':i===seat?'（自风）':'（场风）'),(i===seat?1:0)+(i===round?1:0));
   }
   const valuePair=d.pair>=31||d.pair===seat||d.pair===round;
   const twoSided=winningGroup?.type==='sequence'&&win!==winningGroup.tile+1&&!(winningGroup.tile%9===0&&win===winningGroup.tile+2)&&!(winningGroup.tile%9===6&&win===winningGroup.tile);
   if(seq.length===4&&!valuePair&&twoSided)add('平和',1);
   const sequencePairs=[...new Set(seq)].reduce((n,i)=>n+Math.floor(seq.filter(j=>i===j).length/2),0);
   if(sequencePairs>=2)add('二杯口',3);else if(sequencePairs===1)add('一杯口',1);
   for(let n=0;n<=6;n++)if([n,n+9,n+18].every(i=>seq.includes(i))){add('三色同顺',2);break;}
   for(let s=0;s<3;s++)if([s*9,s*9+3,s*9+6].every(i=>seq.includes(i))){add('一气通贯',2);break;}
   if(trip.length===4)add('对对和',2);
   if(dark>=3)add('三暗刻',2);
   for(let n=0;n<9;n++)if([n,n+9,n+18].every(i=>trip.includes(i))){add('三色同刻',2);break;}
   if(trip.filter(i=>i>=31).length===2&&d.pair>=31)add('小三元',2);
   if(seq.length&&terminal(d.pair)&&groups.every(g=>g.type==='triplet'?terminal(g.tile):[0,6].includes(g.tile%9)))add(honors?'混全带幺九':'纯全带幺九',honors?2:3);
  }
  const han=ordinary.reduce((n,y)=>n+y.han,0);candidates.push({yaku:ordinary,han,yakuman:0,rank:han});
 }
 const terminals=[0,8,9,17,18,26,27,28,29,30,31,32,33];
 if(terminals.every(i=>hand[i]>0)&&present.every(i=>terminals.includes(i)))evaluate(null,null,false,true);
 if(present.length===7&&present.every(i=>hand[i]===2))evaluate(null,{type:'pair'},true);
 for(const d of winningDecompositions(hand)){
  if(d.pair===win)evaluate(d,{type:'pair',tile:win});
  for(const group of d.groups)if(group.type==='triplet'?group.tile===win:win>=group.tile&&win<=group.tile+2)evaluate(d,group);
 }
 return candidates.sort((a,b)=>b.rank-a.rank)[0]||null;
}
function tenpaiContext(){return {seat:Number(v('analysisSeat')),round:Number(v('analysisRound')),riichi:$('analysisRiichi').checked};}
function yakuResultText(result){
 if(!result)return '未构成完整牌形';
 if(!result.yaku.length)return '无役，不能直接荣和；可考虑合法宣告立直';
 return result.yaku.map(y=>y.name+(y.yakuman?' · 役满':' '+y.han+'番')).join('、')+(result.yakuman?(result.yakuman>1?'（合计'+result.yakuman+'倍役满）':''):'（合计'+result.han+'番，不含宝牌）');
}
function waitingYaku(a,context){
 const waits=[];
 for(let i=0;i<34;i++){
  if(a[i]>=4)continue;
  const full=a.slice();full[i]++;
  const ron=shapeYaku(full,i,{...context,tsumo:false});
  if(ron)waits.push({tile:i,remaining:4-a[i],ron,tsumo:shapeYaku(full,i,{...context,tsumo:true})});
 }
 return waits;
}
function renderWaits(a){
 const waits=waitingYaku(a,tenpaiContext());
 return '<h3>已经听牌：等这些牌</h3><div class="wait-cards">'+waits.map(w=>'<article class="wait-card"><div class="wait-title">'+exampleTile(TILE_SHORT[w.tile].length===2&&/^[1-9][mps]$/.test(TILE_SHORT[w.tile])?TILE_SHORT[w.tile]:(w.tile-26)+'z')+'<b>'+TILE_LABELS[w.tile]+'</b><span class="sm">理论剩余'+w.remaining+'枚</span></div><p><b>荣和：</b>'+yakuResultText(w.ron)+'</p><p><b>自摸：</b>'+yakuResultText(w.tsumo)+'</p></article>').join('')+'</div><p class="sm">按可成立的最佳役种组合展示，不把不同拆法的役相加。余牌只扣手牌；荣和还要自行检查振听。大四喜、国士十三面待、四暗刻单骑、纯正九莲是否算双倍役满，依桌规另行约定。</p>';
}
function setupTenpai(){
 for(const id of ['analysisSeat','analysisRound','analysisRiichi'])$(id).addEventListener('change',renderHand);
}
