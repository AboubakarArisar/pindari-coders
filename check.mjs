import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const html = readFileSync('dist/index.html', 'utf8');
const elements = new Map();
for (const match of html.matchAll(/id="([^"]+)"/g)) {
  assert(!elements.has(match[1]), `Duplicate ID: ${match[1]}`);
  elements.set(match[1], { value: '', textContent: '', style: {}, events: {}, addEventListener(name, fn) { this.events[name] = fn; } });
}
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (match[1].startsWith('#') && match[1].length > 1) assert(elements.has(match[1].slice(1)), `Missing anchor: ${match[1]}`);
  else if (!/^(https?:|data:|#)/.test(match[1])) assert(existsSync(`dist/${match[1]}`), `Missing asset: ${match[1]}`);
}
const get = id => elements.get(id);
for (const [id, value] of Object.entries({ gap: '12', justify: 'center', 'type-size': '48', 'type-tracking': '-2', 'type-font': 'sans', 'type-text': 'hello', foreground: '#243427', background: '#d9fa76' })) get(id).value = value;
get('justify').options = ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'].map(value => ({ value }));
let tool, copied;
vm.runInNewContext(readFileSync('dist/app.js', 'utf8'), {
  document: { getElementById: get, querySelectorAll: () => [], modelContext: { registerTool(value) { tool = value; } } },
  window: { addEventListener() {} }, AbortController, console,
  navigator: { clipboard: { async writeText(value) { copied = value; } } }
});
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
console.log('Passed: assets, anchors, Flexbox controls, CSS copy, literal text rendering, contrast endpoints, and agent-tool validation (mock context).');
