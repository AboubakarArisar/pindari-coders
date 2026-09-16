import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { roadmaps, findRoadmap } from './lib/roadmaps.js';
import { newsUrl, newsRequests, normalizeNews, mergeNews, newsPage, NEWS_WINDOW } from './lib/news.js';
import { labDomains, inspectJson, simulateHttp, parseNumbers, bubbleFrames, binarySteps, chunkText, wordSimilarity } from './lib/lab-modules.js';
import { sortFrames, linearFrames, gcdFrames, breadthFrames } from './lib/algorithm-frames.js';
import { normalizeResources, resourcePage, RESOURCE_ENDPOINT } from './lib/resources.js';
import { normalizeOpportunities, opportunityPage, deadlineLabel, OPPORTUNITY_ENDPOINT } from './lib/opportunities.js';
const validResource = { id: 'resource-1', name: 'A tool', description: 'Useful for learning', url: 'https://example.com/', image: 'https://cdn.sanity.io/images/uffqpes0/production/example-640x360.png', alt: 'Tool preview', category: 'Frontend', pricing: 'Free' };
assert.equal(normalizeResources({ result: [validResource, validResource] }).length, 1);
assert.equal(normalizeResources({ result: [{ ...validResource, id: 'drafts.resource-1' }] }).length, 0);
assert.equal(normalizeResources({ result: [{ ...validResource, url: 'javascript:alert(1)' }] }).length, 0);
assert.equal(normalizeResources({ result: [{ ...validResource, image: 'https://evil.example/image.png' }] }).length, 0);
assert.equal(normalizeResources({ result: [null, {}] }).length, 0);
assert.throws(() => normalizeResources({ error: 'Unavailable' }));
assert.equal(new URL(RESOURCE_ENDPOINT).searchParams.get('perspective'), 'published');
const validOpportunity = { id: 'opportunity-1', title: 'Junior React developer', company: 'Example', description: 'Build accessible web products.', url: 'https://example.com/jobs/1', location: 'Worldwide', type: 'Job', experience: 'Junior', domain: 'Frontend', source: 'Himalayas', skills: ['React'], publishedAt: '2026-09-13T00:00:00.000Z', expiresAt: '2026-10-13T00:00:00.000Z' };
assert.equal(normalizeOpportunities({ result: [validOpportunity, validOpportunity] }).length, 1);
assert.equal(normalizeOpportunities({ result: [{ ...validOpportunity, id: 'drafts.opportunity-1' }] }).length, 0);
assert.equal(normalizeOpportunities({ result: [{ ...validOpportunity, url: 'javascript:alert(1)' }] }).length, 0);
assert.equal(opportunityPage([validOpportunity], { query: 'react', location: 'Worldwide' }).total, 1);
assert.equal(opportunityPage([validOpportunity], { domain: 'Backend' }).total, 0);
assert.equal(deadlineLabel(Date.UTC(2026, 8, 14), Date.UTC(2026, 8, 13)), '1 day left');
assert.equal(new URL(OPPORTUNITY_ENDPOINT).searchParams.get('perspective'), 'published');
const resourceItems = Array.from({ length: 20 }, (_, index) => ({ ...validResource, id: `resource-${index}`, category: index < 12 ? 'AI' : 'Backend', pricing: index % 2 ? 'Free' : 'Paid' }));
assert.equal(resourcePage(resourceItems, { category: 'AI' }).total, 12);
assert.equal(resourcePage(resourceItems, { category: 'AI', pricing: 'Free' }).total, 6);
assert.equal(resourcePage(resourceItems, { page: 99 }).current, 2);
assert.equal(resourcePage(resourceItems, { page: 2 }).items.length, 8);

for (const algorithm of ['selection', 'insertion']) {
  for (const values of [[8, 3, 6, 1], [3, -2, 3, 0], [1, 2, 3], [4, 3, 2, 1]]) {
    const original = [...values], frames = sortFrames(values, algorithm);
    assert.deepEqual(frames.at(-1).items, [...values].sort((a, b) => a - b));
    assert.deepEqual(values, original);
    assert.deepEqual(frames[0].items, original);
    for (const frame of frames) assert.deepEqual([...frame.items].sort((a, b) => a - b), [...original].sort((a, b) => a - b));
  }
}
assert.throws(() => sortFrames([2, 1], 'unknown'));
assert.match(linearFrames([4, 4, 8], 4).at(-1).text, /index 0/);
assert.match(linearFrames([4, 8], 7).at(-1).text, /Not found/);
assert.equal(gcdFrames(48, 18).at(-1).items[0], 6);
assert.equal(gcdFrames(17, 13).at(-1).items[0], 1);
assert.equal(gcdFrames(0, 18).at(-1).items[0], 18);
assert.equal(gcdFrames(18, 0).at(-1).items[0], 18);
assert.throws(() => gcdFrames(0, 0));
assert.throws(() => gcdFrames(-1, 8));
assert.throws(() => gcdFrames(1.5, 8));
assert.deepEqual(breadthFrames('A', 'F').at(-1).path, ['A', 'C', 'F']);
assert.deepEqual(breadthFrames('A', 'A').at(-1).path, ['A']);
assert.match(breadthFrames('A', 'G').at(-1).text, /No path/);
assert.match(breadthFrames('G', 'A').at(-1).text, /No path/);
assert.throws(() => breadthFrames('unknown', 'A'));
for (const frame of breadthFrames('A', 'G')) assert.equal(new Set(frame.visited).size, frame.visited.length);

const serverBuild = !readFileSync('next.config.mjs', 'utf8').includes("output: 'export'");
if (serverBuild) {
  for (const file of [
    '.next/server/app/wall.html',
    '.next/server/app/builds/[slug]/page.js',
    '.next/server/app/control-room.html',
    '.next/server/app/api/wall/projects/route.js',
    '.next/server/app/api/wall/projects/[id]/reaction/route.js',
    '.next/server/app/api/wall/submit/route.js',
    '.next/server/app/api/control-room/login/route.js',
    '.next/server/app/api/control-room/projects/route.js',
  ]) assert(existsSync(file), `Missing server build artifact: ${file}`);
  const wall = readFileSync('components/wall-gallery.jsx', 'utf8');
  const buildDetail = readFileSync('app/builds/[slug]/page.jsx', 'utf8');
  const controlRoom = readFileSync('components/control-room.jsx', 'utf8');
  const migration = readFileSync('supabase/migrations/20260915_create_community_wall.sql', 'utf8');
  const reactionsMigration = readFileSync('supabase/migrations/20260917_add_project_reactions.sql', 'utf8');
  assert(wall.includes('exactly 3 JPG, PNG or WebP files, 3 MB each'));
  assert(wall.includes('wall-image-preview') && wall.includes('removeImage'));
  assert(wall.includes('wall-carousel-button') && wall.includes('GitHub ↗'));
  assert(wall.includes('wall-card-open') && wall.includes('/builds/${encodeURIComponent(project.slug)}/'));
  assert(wall.includes('❤️') && wall.includes('🙋') && wall.includes('wall-reactions'));
  assert(wall.includes('const nextCounts = { ...previousCounts };'));
  assert(wall.includes('setReactionCounts(nextCounts);'));
  assert(wall.includes('const form = event.currentTarget;'));
  assert(controlRoom.includes('/api/control-room/login'));
  assert(controlRoom.includes('const form = event.currentTarget;'));
  assert(controlRoom.includes("window.location.replace('/')"));
  assert(migration.includes('alter table public.community_projects enable row level security'));
  assert(reactionsMigration.includes('primary key (project_id, fingerprint)'));
  assert(reactionsMigration.includes('set_community_project_reaction'));
  assert(buildDetail.includes('moderation_status=eq.approved'));
  assert(buildDetail.includes('About this build') && buildDetail.includes('ProjectReactions'));
  assert(readFileSync('components/site-header.jsx', 'utf8').includes('href="/wall/"'));
  console.log('Passed: content logic, lab algorithms, Wall routes, moderation UI, Supabase migration, and server build artifacts.');
  process.exit(0);
}

const html = readFileSync('out/lab/frontend/index.html', 'utf8');
const home = readFileSync('out/index.html', 'utf8');
const paths = ['/', '/learn/', '/lab/', '/resources/', '/opportunities/', '/story/', '/trending/', '/roadmaps/', ...labDomains.map(item=>`/lab/${item.slug}/`), ...roadmaps.flatMap(item => [`/learn/${item.slug}/`, `/roadmaps/${item.slug}/`])];
for (const route of paths) {
  const page = readFileSync(`out${route}index.html`, 'utf8');
  for (const match of page.matchAll(/(?:src|href)="(\/[^"#?]*)/g)) assert(existsSync(`out${match[1]}`), `Missing local destination in ${route}: ${match[1]}`);
}
assert(!home.includes('id="flex-items"'), 'Playground must live on its own page');
const story = readFileSync('out/story/index.html', 'utf8');
assert(story.includes('Abou Bakar') && story.includes('Muhammad Abdullah'));
assert(!story.includes('Abou Bakar Arisar') && !story.includes('Abdullah Arain') && !/co-founder/i.test(story));
assert(!existsSync('out/notes/index.html'), 'Field notes should be removed');
assert(!story.includes('where the idea first found a home'));
assert.equal((story.match(/href="https:\/\/web.facebook.com\/100091890139657\/"/g) || []).length, 1);
for (const id of ['grid', 'box', 'shadow', 'transform']) assert(html.includes('id="frontend-' + id + '"'));
assert(!story.includes('temporary photo'));
assert(story.includes('https://muhammad-abdullah.dev/'));
assert(story.includes('/muhammad-abdullah.jpeg'));
assert(home.includes('/muhammad-abdullah.jpeg'));
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
    assert(step.checkpoint && step.title && step.description && step.task && step.topics.length && step.resources.length);
    for (const resource of step.resources) assert(resource.url.startsWith('/') || new URL(resource.url).protocol === 'https:');
  }
}
assert.equal(findRoadmap('missing-path'), undefined);
// Exercise the client state/storage flow without requiring a browser or test dependency.
const explorerSource = readFileSync('components/roadmap-explorer.jsx', 'utf8');
const explorerBody = explorerSource.slice(explorerSource.indexOf('export default function'), explorerSource.indexOf('  return <>')).replace('export default ', '');
let hookIndex = 0, hookValues = [], effects = [], savedProgress = '[]', storageBlocked = false;
const progressContext = {
  useState(initial) { const index = hookIndex++; if (!(index in hookValues)) hookValues[index] = initial; return [hookValues[index], value => { hookValues[index] = value; }]; },
  useEffect(effect) { effects.push(effect); }, useRef: () => ({ current: null }),
  document: {}, console,
  localStorage: { getItem() { return savedProgress; }, setItem(key, value) { if (storageBlocked) throw new Error('Storage blocked'); savedProgress = value; } },
};
vm.createContext(progressContext);
vm.runInContext(explorerBody + '\nreturn { completed, ready, storageMessage, toggleComplete };\n}', progressContext);
function renderProgress() { hookIndex = 0; effects = []; return progressContext.RoadmapExplorer({ roadmap: roadmaps[0] }); }
renderProgress(); effects.forEach(effect => effect());
let progressView = renderProgress();
assert.equal(progressView.ready, true);
progressView.toggleComplete();
assert.deepEqual(JSON.parse(savedProgress), [roadmaps[0].steps[0].title]);
renderProgress().toggleComplete();
assert.deepEqual(JSON.parse(savedProgress), []);
savedProgress = JSON.stringify([roadmaps[0].steps[0].title, roadmaps[0].steps[0].title, 'deleted step']);
renderProgress(); effects.forEach(effect => effect());
assert.equal(renderProgress().completed.length, 1);
savedProgress = '{broken'; renderProgress(); effects.forEach(effect => effect());
assert.match(renderProgress().storageMessage, /could not be loaded/);
storageBlocked = true; renderProgress().toggleComplete();
assert.match(renderProgress().storageMessage, /this visit only/);
assert.equal(labDomains.reduce((total,domain)=>total+domain.modules.length,0),18);
const algorithmsPage = readFileSync('out/lab/algorithms/index.html', 'utf8');
for (let module = 1; module <= 7; module++) assert(algorithmsPage.includes(`id="module-0${module}"`));
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

const hnRequest = { source: 'Hacker News', topic: 'AI' };
const normalized = normalizeNews({ hits: [item, item, { ...item, objectID: '2', points: 100, url: 'javascript:alert(1)' }, { ...item, objectID: '3', created_at_i: (now - NEWS_WINDOW - 1000) / 1000 }, { ...item, objectID: '4', created_at_i: now / 1000 + 1 }, null] }, hnRequest, now);
const merged = mergeNews(normalized);
assert.equal(merged.length, 2);
const ranked = newsPage(merged, { sort: 'popular' }, now);
assert.deepEqual(ranked.stories.map(story => story.id), ['hn-2', 'hn-1']);
assert.equal(ranked.stories[0].url, 'https://news.ycombinator.com/item?id=2');
assert.throws(() => normalizeNews({}, hnRequest, now));
const devRequest = { source: 'DEV Community', topic: 'Job market' };
const dev = normalizeNews([{ id: 1, title: 'AI hiring', url: 'https://dev.to/example', published_timestamp: new Date(now - 1000).toISOString(), public_reactions_count: 4, comments_count: 2 }], devRequest, now);
assert(dev[0].topics.includes('AI') && dev[0].topics.includes('Job market'));
assert.equal(newsPage([...merged, ...dev], { source: 'DEV Community' }, now).total, 1);
assert.equal(newsPage([...merged, ...dev], { topic: 'Job market' }, now).total, 1);
assert.equal(newsPage([...merged, ...dev], { topic: 'Tech', page: 8 }, now).current, 1);
assert.equal(newsPage([...merged, ...dev], { topic: 'Tech' }, now).total, 0);
assert.equal(normalizeNews([{ id: 2, title: 'Bad URL', url: 'javascript:alert(1)', published_timestamp: new Date(now).toISOString() }], devRequest, now).length, 0);
const many = Array.from({ length: 23 }, (_, index) => ({ ...dev[0], id: 'test-' + index, published: now - index * 1000 }));
assert.equal(newsPage(many, { page: 1 }, now).stories.length, 10);
assert.equal(newsPage(many, { page: 2 }, now).stories.length, 10);
assert.equal(newsPage(many, { page: 99 }, now).stories.length, 3);
assert.equal(newsPage(many, { page: 99 }, now).current, 3);
assert.equal(newsPage(many, {}, now + NEWS_WINDOW + 1000).total, 0);
assert.equal(new Set(newsRequests(now).map(request => request.source)).size, 2);
assert.equal(new URL(newsUrl('AI', now)).searchParams.get('numericFilters'), 'created_at_i>' + (now / 1000 - 3 * 86400));
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
