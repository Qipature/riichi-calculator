const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const context={document:{addEventListener(){}}};vm.createContext(context);
vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],context);
for(const file of ['learning.js','draws.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
const examples=JSON.parse(vm.runInContext('JSON.stringify(DRAW_EXAMPLES)',context));
const index=code=>vm.runInContext(`exampleTileIndex('${code}')`,context);
function tiles(shape){return shape.split(' ').flatMap(g=>[...g.slice(0,-1)].map(d=>d+g.at(-1)));}
assert.equal(examples.length,7);
for(const d of examples){
 const codes=[...(d.rows||[]),...(d.players||[])].flatMap(r=>tiles(r[1]));
 const counts=Array(34).fill(0);for(const code of codes){assert.match(code,/^[1-9][mps]$|^[1-7]z$/);counts[index(code)]++;}
 assert.ok(counts.every(n=>n<=4),'Visible copies: '+d.id);
 assert.ok(d.scene&&d.result,'Scenario and outcome: '+d.id);
}
const find=id=>examples.find(d=>d.id===id);
const initial=tiles(find('nineTerminals').rows[0][1]);
const terminal=i=>i>=27||i%9===0||i%9===8;
assert.equal(initial.length,14);
assert.ok(new Set(initial.map(index).filter(terminal)).size>=9);
assert.ok(tiles(find('nagashi').rows[0][1]).map(index).every(terminal),'Nagashi discard river is all terminals/honors');
assert.equal(find('fourWinds').players.length,4);
assert.ok(find('fourWinds').players.every(p=>p[1]==='1z'),'Four identical first wind discards');
const kans=find('fourKans').players.flatMap(p=>p[1].split(' '));
assert.equal(kans.length,4);
assert.ok(kans.every(g=>g.length===5&&new Set(g.slice(0,-1)).size===1),'Four complete quads across different players');
const hand=Array(34).fill(0);for(const code of tiles(find('exhaustive').rows[0][1]))hand[index(code)]++;
assert.equal(vm.runInContext(`handShanten(${JSON.stringify(hand)}).min`,context),0,'Exhaustive-draw example is tenpai');
assert.ok(html.includes('id="tab-draws"')&&html.includes('src="./draws.js"'));
assert.ok(fs.readFileSync(path.join(root,'sw.js'),'utf8').includes("'./draws.js'"));
console.log('Passed: 7 draw scenarios, nine distinct terminal types, nagashi river, four winds/kans and offline module.');
