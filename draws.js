// Situational teaching examples, not winning-hand or scoring-engine inputs.
const DRAW_EXAMPLES = [
 {id:'exhaustive',name:'荒牌流局（牌山摸完）',type:'正常流局',
  intro:'能正常摸的活牌用完了，还是没人和牌，这一局就结束。王牌里的牌不能接着当普通摸牌用。',
  rows:[['其中一家的13张手牌','123m 456m 234p 67s 55p']],
  scene:'牌山剩余活牌：0张。这家最后的67索等5索或8索，已经听牌，但一直没有和牌；另外三家都没听牌。',
  result:'常见结算：另外三家各付1000点，唯一听牌的人收3000点。若两家听，每家收1500；三家听，每家收1000；全听或全没听不交换听牌料。庄家听牌通常连庄，本场通常加1。'},
 {id:'nagashi',name:'流局满贯',type:'特殊结算 · 满贯',
  intro:'不是看手里有没有凑好，而是看整局打出去的牌：直到牌山摸完，自己的弃牌全是1、9或字牌，而且没有被别人吃碰杠走。',
  rows:[['这家整局的弃牌河','1m 9p 5z 9s 1p 1z 9m 6z 1s 2z 7z 9p 3z 4z']],
  scene:'图中所有弃牌都是幺九牌，整条牌河没有一张被鸣走。本例这家自己也没有副露；不要求手牌已听牌或已完成和牌形。',
  result:'若本桌采用流局满贯，常按满贯自摸结算：闲家收庄家4000点、另外两家各2000点；庄家则收其他三家各4000点（未加本场）。自己能否副露、是否另收听牌料、连庄和供托怎么处理，各规则不同。'},
 {id:'nineTerminals',name:'九种九牌',type:'途中流局 · 需桌规采用',
  intro:'第一次摸牌后，手里至少有9种不同的1、9或字牌，且之前没人吃碰杠，可以按采用的规则申请流局。不是有9张就够，要数不同种类。',
  rows:[['首次摸牌后的14张手牌','19m 19p 19s 123456z 22m']],
  scene:'本例有1/9万、1/9筒、1/9索，加东南西北白发，共12种幺九牌；两个2万不算幺九牌。自己尚未打出第一张牌，此前无人鸣牌。',
  result:'可以申请九种九牌流局，也可以不申请，继续打。宣告机会与流局后是否连庄、本场怎么加，按本桌规则处理。'},
 {id:'fourWinds',name:'四风连打',type:'途中流局 · 需桌规采用',
  intro:'四家第一次打牌都打同一种风牌，而且中间没人吃碰杠，采用这条规则时可能直接流局。',
  players:[['东家首次弃牌','1z'],['南家首次弃牌','1z'],['西家首次弃牌','1z'],['北家首次弃牌','1z']],
  scene:'四家的第一张弃牌都是东，期间无人鸣牌。四张东恰好用完同种牌的四枚。',
  result:'采用四风连打时判途中流局。四家分别打东、南、西、北不算；若途中有人鸣牌，也不满足本例条件。不要把它理解成“连续出现任意四张风牌”。'},
 {id:'fourRiichi',name:'四家立直',type:'途中流局 · 需桌规采用',
  intro:'四家都已经合法宣布立直，一共交了四根立直棒。有的牌桌让这一局流局，有的让大家继续摸打。',
  players:[['东家：已立直，交1000点','5m'],['南家：已立直，交1000点','2p'],['西家：已立直，交1000点','6s'],['北家：第四家宣布立直','3z']],
  scene:'这里显示各家的立直宣告牌，手牌都已满足立直条件。北家的宣告牌没有被荣和，第四次立直按规则成立。',
  result:'采用四家立直流局时，供托通常留到下一局；不采用则继续打。第四家宣布立直时若打出的牌被荣和，要先处理荣和，不能抢先按流局跳过。'},
 {id:'fourKans',name:'四杠散了',type:'途中流局 · 需桌规采用',
  intro:'不同玩家合计做出了四组杠，采用这条规则时会途中流局。一个人自己做四杠通常例外，可以继续争取四杠子。',
  players:[['东家已经做出的两组杠','1111m 5555p'],['南家做出的第三、第四组杠','9999s 6666z']],
  scene:'东家两杠、南家两杠，合计四杠，由不同玩家完成。这里展示四组已宣告的明杠；重点是“分属不同人”。',
  result:'停止摸打的具体时机按规则：常见做法先处理第四杠可能引发的抢杠、岭上自摸，以及随后舍牌的荣和，再判流局。若是同一人四杠，不要直接套用本例；一般不允许再开第五杠。'},
 {id:'tripleRon',name:'三家荣和（三家和了）',type:'途中流局 · 需桌规采用',
  intro:'一张弃牌同时让其他三家都能荣和。有些规则把这种情况判流局，也有规则允许三家都和，或只让其中一家和。',
  rows:[['东家打出的一张牌','5p']],
  players:[['南家：34筒，等2/5筒','34p'],['西家：67筒，等5/8筒','67p'],['北家：5筒单骑，等5筒','5p']],
  scene:'这里只展示三家的听牌部分；其他牌组均已完成，各家都有役且没有振听。东家打5筒，三家同时宣告荣和。',
  result:'只有采用“三家荣和流局”时才判途中流局。允许三响的牌桌按多人荣和结算；采用头跳的牌桌按规定顺序只让一家和。先统一规则，不能看到三家举手就自动判流局。'}
];
function drawTilesHTML(shape){
 return shape.split(' ').map(g=>'<span class="draw-group">'+[...g.slice(0,-1)].map((d,j)=>exampleTile(d+g.at(-1),g.length===5&&j===0?'sideways':'')).join('')+'</span>').join('');
}
function renderDraws(query=''){
 $('drawCards').innerHTML=DRAW_EXAMPLES.filter(d=>(d.name+d.intro+d.scene+d.result).includes(query.trim())).map(d=>'<article class="yaku-card draw-card" data-draw="'+d.id+'"><h3>'+d.name+'</h3><span class="badge">'+d.type+'</span><p>'+d.intro+'</p><div class="draw-scene">'+(d.rows||[]).map(([label,shape])=>'<div class="draw-zone"><div class="zone-title">'+label+'</div><div class="draw-tiles">'+drawTilesHTML(shape)+'</div></div>').join('')+(d.players?'<div class="draw-players">'+d.players.map(([label,shape])=>'<div class="draw-zone"><div class="zone-title">'+label+'</div><div class="draw-tiles">'+drawTilesHTML(shape)+'</div></div>').join('')+'</div>':'')+'<p><b>这个例子发生了什么：</b>'+d.scene+'</p></div><p><b>怎么处理：</b>'+d.result+'</p></article>').join('');
}
