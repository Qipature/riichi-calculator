const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),c={document:{addEventListener(){}}};vm.createContext(c);
vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],c);
for(const f of ['learning.js','tenpai.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c);
function hand(shape){const a=Array(34).fill(0);for(const g of shape.split(' '))for(const d of g.slice(0,-1))a[vm.runInContext(`exampleTileIndex('${d+g.at(-1)}')`,c)]++;return a;}
function score(shape,win,options={}){return JSON.parse(vm.runInContext(`JSON.stringify(shapeYaku(${JSON.stringify(hand(shape))},exampleTileIndex('${win}'),${JSON.stringify(options)}))`,c));}
const names=r=>r.yaku.map(y=>y.name);
const nine=JSON.parse(vm.runInContext(`JSON.stringify(waitingYaku(${JSON.stringify(hand('1112345678999p'))},{seat:28,round:27}))`,c));
assert.equal(nine.length,9);assert.deepEqual(nine.map(w=>w.tile),[9,10,11,12,13,14,15,16,17]);assert.ok(nine.every(w=>names(w.ron).includes('纯正九莲宝灯（九面待）')));
assert.ok(names(score('234m 567m 345p 456s 88s','6s')).includes('平和'));
assert.ok(!names(score('123m 456p 789s 234p 55s','3m')).includes('平和'),'12 waiting 3 is edge wait');
assert.ok(!names(score('123m 456p 789s 234p 55s','2m')).includes('平和'),'13 waiting 2 is closed wait');
const noYaku='123m 456p 789s 444m 22p';assert.equal(score(noYaku,'9s').han,0);assert.ok(names(score(noYaku,'9s',{tsumo:true})).includes('门清自摸'));assert.ok(names(score(noYaku,'9s',{riichi:true})).includes('立直'));
assert.ok(!names(score('222m 555p 888s 123p 11z','8s')).includes('三暗刻'));assert.ok(names(score('222m 555p 888s 123p 11z','8s',{tsumo:true})).includes('三暗刻'));
assert.ok(!names(score('222m 555p 888s 111z 33p','8s')).some(n=>n.startsWith('四暗刻')));assert.ok(names(score('222m 555p 888s 111z 33p','8s',{tsumo:true})).includes('四暗刻'));
assert.ok(names(score('222m 555p 888s 111z 33p','3p')).includes('四暗刻（单骑）'));
assert.equal(score('111z 123m 456p 789s 22p','9s',{seat:27,round:27}).yaku.find(y=>y.name.includes('连风')).han,2);
assert.ok(!names(score('111z 123m 456p 789s 22p','9s',{seat:28,round:29})).some(n=>n.startsWith('役牌')));
assert.ok(names(score('11m 33m 55p 77p 22s 66s 11z','1z')).includes('七对子'));
const ambiguous=score('123m 123m 456p 456p 77s','7s');assert.ok(names(ambiguous).includes('二杯口'));assert.ok(!names(ambiguous).includes('七对子'));assert.ok(!names(ambiguous).includes('一杯口'));
assert.ok(names(score('19m 19p 19s 1234567z 1m','1m')).includes('国士无双十三面待'));
assert.equal(score('1111m 234m 234p 234s 22z','4m'),null,'Quads are outside this input mode');
assert.ok(!names(score('123m 456p 789s 234p 55s','9s')).some(n=>['一发','海底摸月','天和','地和'].includes(n)));
assert.ok(fs.readFileSync(path.join(root,'sw.js'),'utf8').includes("'./tenpai.js'"));
console.log('Passed: nine-sided waits, pinfu waits, no-yaku/riichi/tsumo, concealed triplets, wind context, special and ambiguous shapes.');
