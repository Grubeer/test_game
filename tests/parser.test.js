const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { Parser } = require('../app.js');

const parser = new Parser();
const samplePath = path.join(__dirname, '..', 'samples', 'sample-report.txt');
const txt = fs.readFileSync(samplePath, 'utf8');
const objects = parser.parse(txt);

assert.ok(objects.length >= 4, 'Должно распознаться несколько объектов');
const doc = objects.find((o) => o.path === 'Документ.РеализацияТоваровУслуг');
assert.ok(doc, 'Документ должен распознаться');
assert.ok(doc.diffs.some((d) => d.kind === 'code'), 'Должны быть блоки кода');
assert.ok(doc.diffs.some((d) => d.kind === 'metadata'), 'Должны быть блоки метаданных');
assert.ok(['Высокий', 'Средний', 'Низкий'].includes(doc.risk), 'Риск должен быть вычислен');

const refObj = objects.find((o) => o.path === 'ОбщийМодуль.ОбщегоНазначения');
assert.ok(refObj && refObj.isReferenceOnly, 'Help/справка должна уйти в справочную вкладку');

console.log('parser.test.js: ok');
