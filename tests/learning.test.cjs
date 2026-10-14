const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const context = { document: { addEventListener() {} } };
vm.createContext(context);
vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1], context);
vm.runInContext(fs.readFileSync(path.join(root, 'learning.js'), 'utf8'), context);
const data = JSON.parse(vm.runInContext('JSON.stringify({Y,Z,HONOR_YAKU,YAKU_EXAMPLES,GLOSSARY})', context));
for (const yaku of [...data.Y, ...data.Z, ...data.HONOR_YAKU]) {
 const example = data.YAKU_EXAMPLES[yaku[0]];
 assert.ok(example, `Missing example: ${yaku[0]}`);
 const [shape, win, note] = example;
 const counts = Array(34).fill(0);
 let quads = 0;
 for (const group of shape.split(' ')) {
  assert.match(group, /^[1-9]+[mps]$|^[1-7]+z$/);
  if (group.length === 5 && new Set(group.slice(0, -1)).size === 1) quads++;
  for (const digit of group.slice(0, -1)) {
   counts[vm.runInContext(`exampleTileIndex('${digit + group.at(-1)}')`, context)]++;
  }
 }
 assert.ok(counts.every(n => n <= 4), `More than four copies: ${yaku[0]}`);
 assert.equal(counts.reduce((a,b) => a+b, 0), 14 + quads, `Tile count: ${yaku[0]}`);
 const winningIndex = vm.runInContext(`exampleTileIndex('${win}')`, context);
 assert.ok(counts[winningIndex], `Winning tile not in hand: ${yaku[0]}`);
 assert.ok(note.length > 10, `Missing scenario: ${yaku[0]}`);
 // Validate declared quads as three-tile melds, then check completed shape.
 const normalCounts = counts.slice();
 for (const group of shape.split(' ')) if (group.length === 5 && new Set(group.slice(0, -1)).size === 1) {
  normalCounts[vm.runInContext(`exampleTileIndex('${group[0] + group.at(-1)}')`, context)]--;
 }
 assert.equal(vm.runInContext(`handShanten(${JSON.stringify(normalCounts)}).min`, context), -1, `Invalid winning shape: ${yaku[0]}`);
 if (['tanyao', 'chinroutou', 'honroutou', 'tsuuiisou', 'ryuuiisou'].includes(yaku[0])) {
  const allowed = yaku[0] === 'tanyao' ? i => i < 27 && i % 9 > 0 && i % 9 < 8
   : yaku[0] === 'chinroutou' ? i => i < 27 && [0,8].includes(i % 9)
   : yaku[0] === 'honroutou' ? i => i >= 27 || [0,8].includes(i % 9)
   : yaku[0] === 'tsuuiisou' ? i => i >= 27 : i => [19,20,21,23,25,32].includes(i);
  assert.ok(counts.every((n,i) => !n || allowed(i)), `Forbidden tile: ${yaku[0]}`);
 }
 if (['kokushi13', 'junseiChuuren'].includes(yaku[0])) {
  counts[winningIndex]--;
  if (yaku[0] === 'kokushi13') assert.equal(counts.filter(n => n === 1).length, 13);
  else assert.deepEqual(counts.slice(0,9), [3,1,1,1,1,1,1,1,3]);
 }
}
assert.ok(!data.Y.some(y => y[0] === 'yakuhaiExtra'), 'Ambiguous/double-countable extra yakuhai removed');
assert.equal(data.HONOR_YAKU.length, 6);
assert.equal(data.GLOSSARY.length, 8);
assert.ok(fs.readFileSync(path.join(root, 'sw.js'), 'utf8').includes("'./learning.js'"));
console.log(`Passed: ${Object.keys(data.YAKU_EXAMPLES).length} winning examples; ${data.GLOSSARY.reduce((n,g) => n+g[1].length, 0)} glossary entries; offline asset.`);
