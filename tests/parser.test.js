const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { Parser } = require('../app.js');

const parser = new Parser();
const samplePath = path.join(__dirname, '..', 'samples', 'sample-report.txt');
const txt = fs.readFileSync(samplePath, 'utf8');
const objects = parser.parse(txt);

const bigReportOnePath = path.join(__dirname, '..', 'samples', 'Report One.txt');
const bigReportTwoPath = path.join(__dirname, '..', 'samples', 'Report Two.txt');
const bigObjectsOne = parser.parse(fs.readFileSync(bigReportOnePath, 'utf16le'));
const bigObjectsTwo = parser.parse(fs.readFileSync(bigReportTwoPath, 'utf16le'));

assert.ok(objects.length >= 4, 'Должно распознаться несколько объектов');
const doc = objects.find((o) => o.path === 'Документ.РеализацияТоваровУслуг');
assert.ok(doc, 'Документ должен распознаться');
assert.ok(doc.diffs.some((d) => d.kind === 'code'), 'Должны быть блоки кода');
assert.ok(doc.diffs.some((d) => d.kind === 'metadata'), 'Должны быть блоки метаданных');
assert.ok(['Высокий', 'Средний', 'Низкий'].includes(doc.risk), 'Риск должен быть вычислен');

const httpBlock = doc.diffs.find((d) => (d.blockLabel || '').includes('11462'));
assert.ok(httpBlock, 'Должен выделяться блок по строке Изменено: N - M');
assert.ok((httpBlock.before || '').includes('HTTPЗапрос = Новый HTTPЗапрос'), 'Строка в кавычках должна попадать в блок было');
assert.ok(!(httpBlock.before || '').includes('···'), 'Технические точки должны чиститься');

const refObj = objects.find((o) => o.path === 'ОбщийМодуль.ОбщегоНазначения');
assert.ok(refObj && refObj.isReferenceOnly, 'Help/справка должна уйти в справочную вкладку');

assert.ok(bigObjectsOne.length > 1000, 'Report One должен успешно парситься (много объектов)');
assert.ok(bigObjectsTwo.length > 1000, 'Report Two должен успешно парситься (много объектов)');
assert.ok(bigObjectsOne.some((o) => o.path === 'Конфигурация.УправлениеТорговлей'), 'Report One: должен находиться корневой объект конфигурации');
assert.ok(bigObjectsTwo.some((o) => o.path === 'Конфигурация.УправлениеТорговлей'), 'Report Two: должен находиться корневой объект конфигурации');
assert.ok(bigObjectsOne.every((o) => o.diffs.length > 0), 'Report One: каждый объект должен содержать минимум один блок изменений');
assert.ok(bigObjectsTwo.every((o) => o.diffs.length > 0), 'Report Two: каждый объект должен содержать минимум один блок изменений');
assert.ok(bigObjectsOne.some((o) => o.diffs.some((d) => d.kind === 'metadata')), 'Report One: должны присутствовать метаданные');
assert.ok(bigObjectsTwo.some((o) => o.diffs.some((d) => d.kind === 'metadata')), 'Report Two: должны присутствовать метаданные');

console.log('parser.test.js: ok');
