import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { roadmaps, findRoadmap } from './lib/roadmaps.js';
import { newsUrl, rankStories } from './lib/news.js';
import { labDomains, inspectJson, simulateHttp, parseNumbers, bubbleFrames, binarySteps, chunkText, wordSimilarity } from './lib/lab-modules.js';

const html = readFileSync('out/lab/frontend/index.html', 'utf8');
const home = readFileSync('out/index.html', 'utf8');
const paths = ['/', '/learn/', '/lab/', '/resources/', '/story/', '/trending/', '/roadmaps/', ...labDomains.map(item=>`/lab/${item.slug}/`), ...roadmaps.flatMap(item => [`/learn/${item.slug}/`, `/roadmaps/${item.slug}/`])];
for (const route of paths) {
  const page = readFileSync(`out${route}index.html`, 'utf8');
  for (const match of page.matchAll(/(?:src|href)="(\/[^"#?]*)/g)) assert(existsSync(`out${match[1]}`), `Missing local destination in ${route}: ${match[1]}`);
}
assert(!home.includes('id="flex-items"'), 'Playground must live on its own page');
const story = readFileSync('out/story/index.html', 'utf8');
assert(story.includes('Abou Bakar') && story.includes('Muhammad Abdullah'));
assert(!story.includes('Abou Bakar Arisar') && !story.includes('Abdullah Arain') && !/co-founder/i.test(story));
assert(!existsSync('out/notes/index.html'), 'Field notes should be removed');
assert(story.includes('temporary photo'));
const elements = new Map();
for (const match of html.matchAll(/id="([^"]+)"/g)) {
  assert(!elements.has(match[1]), `Duplicate ID: ${match[1]}`);
  elements.set(match[1], { value: '', textContent: '', style: {}, events: {}, addEventListener(name, fn) { this.events[name] = fn; } });
}
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (match[1].startsWith('#') && match[1].length > 1) assert(elements.has(match[1].slice(1)), `Missing anchor: ${match[1]}`);
  else if (!/^(https?:|data:|#)/.test(match[1])) {
    const path = match[1].split('#')[0].split('?')[0];
    if (path) assert(existsSync(`out${path}`), `Missing local asset or route: ${path}`);
  }
}
assert(html.includes('Abou Bakar'));
assert(!html.includes('Abou Bakar Isar'));
assert.equal(new Set(roadmaps.map(item => item.slug)).size, roadmaps.length);
for (const roadmap of roadmaps) {
  assert(existsSync(`out/roadmaps/${roadmap.slug}/index.html`));
  assert.equal(findRoadmap(roadmap.slug), roadmap);
  assert(roadmap.steps.length > 0);
  for (const step of roadmap.steps) {
    assert(step.title && step.description && step.task && step.topics.length && step.resources.length);
    for (const resource of step.resources) assert(resource.url.startsWith('/') || new URL(resource.url).protocol === 'https:');
  }
}
assert.equal(findRoadmap('missing-path'), undefined);
assert.equal(labDomains.reduce((total,domain)=>total+domain.modules.length,0),9);
assert.equal(inspectJson('[1,2]').count,2);
assert.equal(inspectJson('null').type,'null');
assert.throws(()=>inspectJson('{bad}'));
assert.equal(simulateHttp('POST','/books','{"title":"new"}').status,201);
assert.equal(simulateHttp('POST','/books','bad').status,400);
assert.equal(simulateHttp('POST','/books','{}').status,422);
assert.equal(simulateHttp('GET','/missing','').status,404);
assert.equal(simulateHttp('DELETE','/books/1','').body,null);
assert.equal(simulateHttp('DELETE','/books','').status,405);
assert.throws(()=>parseNumbers('1,,2'));
const numbers=parseNumbers('5, -2, 5, 0');
assert.deepEqual(bubbleFrames(numbers).at(-1).items,[-2,0,5,5]);
assert.deepEqual(numbers,[5,-2,5,0]);
assert.equal(binarySteps(numbers,0).found,1);
assert.equal(binarySteps(numbers,7).found,-1);
assert.equal(chunkText('',40,5).length,0);
assert.equal(chunkText('x'.repeat(100),40,10).length,3);
assert.throws(()=>chunkText('text',40,40));
assert(Math.abs(wordSimilarity('hello world','WORLD hello').score-1)<1e-10);
assert.equal(wordSimilarity('happy','joyful').score,0);
assert.equal(wordSimilarity('','words').empty,true);
const now = Date.UTC(2026, 8, 12);
const item = { objectID: '1', title: 'AI release', created_at_i: now / 1000 - 3600, points: 10, num_comments: 3, url: 'https://example.com/article' };
const ranked = rankStories([{ hits: [item, item, { ...item, objectID: '2', points: 100, url: 'javascript:alert(1)' }, { ...item, objectID: '3', created_at_i: now / 1000 - 9 * 86400 }, { ...item, objectID: '4', created_at_i: now / 1000 + 1 }, null] }], now);
assert.deepEqual(ranked.map(story => story.id), ['2', '1']);
assert.equal(ranked[0].url, 'https://news.ycombinator.com/item?id=2');
assert.deepEqual(rankStories([{}, { hits: [] }], now), []);
assert.equal(new URL(newsUrl('AI', now)).searchParams.get('numericFilters'), `created_at_i>${now / 1000 - 7 * 86400}`);
const get = id => elements.get(id);
for (const [id, value] of Object.entries({ gap: '12', justify: 'center', 'type-size': '48', 'type-tracking': '-2', 'type-font': 'sans', 'type-text': 'hello', foreground: '#243427', background: '#d9fa76' })) get(id).value = value;
get('justify').options = ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'].map(value => ({ value }));
let tool, copied;
const mock = {
  document: { body: { style: { overflow: 'auto' } }, getElementById: get, querySelectorAll: () => [], modelContext: { registerTool(value) { tool = value; } } },
  window: { addEventListener() {} }, AbortController, console,
  navigator: { clipboard: { async writeText(value) { copied = value; } } }
};
vm.runInNewContext(readFileSync('lib/playgrounds.js', 'utf8').replace('export function', 'function') + '\nvar cleanup = mountPlaygrounds();', mock);
assert.equal(get('flex-items').style.gap, '12px');
get('gap').value = '32'; get('gap').events.input();
assert.equal(get('flex-items').style.gap, '32px');
get('justify').value = 'space-between'; get('justify').events.change();
assert.equal(get('flex-items').style.justifyContent, 'space-between');
await get('copy-css').events.click();
assert.match(copied, /justify-content: space-between/);
assert.match(copied, /gap: 32px/);
get('type-text').value = '<img src=x>'; get('type-text').events.input();
assert.equal(get('type-preview').textContent, '<img src=x>');
get('foreground').value = '#000000'; get('background').value = '#ffffff'; get('foreground').events.input();
assert.equal(get('contrast-ratio').textContent, '21.00:1');
get('foreground').value = '#ffffff'; get('foreground').events.input();
assert.equal(get('contrast-ratio').textContent, '1.00:1');
assert.match(get('contrast-verdict').textContent, /Low contrast/);
tool.execute({ justify: 'center', gap: 8 });
assert.equal(get('flex-items').style.gap, '8px');
assert.throws(() => tool.execute({ justify: 'invalid', gap: 100 }));
assert.equal(get('flex-items').style.gap, '8px');
mock.cleanup();
assert.equal(mock.document.body.style.overflow, 'auto');
console.log('Passed: exported routes, corrected name, roadmap content, assets, anchors, Flexbox controls, CSS copy, text rendering, contrast endpoints, cleanup, and mock agent-tool validation.');
