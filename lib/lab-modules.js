export const labDomains = [
  { slug: 'frontend', title: 'frontend & design', symbol: '</>', description: 'See how layout, type, and color change what people experience.', modules: ['Flexbox canvas', 'Typography studio', 'Color contrast', 'CSS Grid', 'Box model', 'Shadows & corners', 'Transforms'] },
  { slug: 'backend', title: 'backend & APIs', symbol: '{ }', description: 'Inspect data and explore the conversation between a client and a server.', modules: ['JSON inspector', 'HTTP response sandbox'] },
  { slug: 'algorithms', title: 'algorithms', symbol: '[ ]', description: 'Slow things down. Follow each comparison and see how an answer takes shape.', modules: ['Bubble sort stepper', 'Binary search explorer', 'Selection sort', 'Insertion sort', 'Linear search', 'Euclid’s GCD', 'Breadth-first search'] },
  { slug: 'ai', title: 'AI & text', symbol: 'Aa', description: 'Explore two building blocks used around AI systems, right in your browser.', modules: ['Text chunking', 'Word-vector similarity'] },
];

export function inspectJson(input) {
  if (input.length > 20000) throw new Error('Keep the JSON under 20,000 characters.');
  try {
    const parsed = JSON.parse(input);
    return { formatted: JSON.stringify(parsed, null, 2), type: parsed === null ? 'null' : Array.isArray(parsed) ? 'array' : typeof parsed, count: parsed && typeof parsed === 'object' ? Object.keys(parsed).length : null };
  } catch (error) { throw new Error(`Invalid JSON: ${error.message}`); }
}
export function simulateHttp(method, path, body) {
  if (!['GET', 'POST', 'DELETE'].includes(method)) throw new Error('Choose GET, POST, or DELETE.');
  if (!['/books', '/books/1', '/missing'].includes(path)) throw new Error('Choose one of the sample routes.');
  if (path === '/missing') return { status: 404, label: 'Not Found', body: { error: 'Resource not found' } };
  if (method === 'GET') return { status: 200, label: 'OK', body: path === '/books' ? [{ id: 1, title: 'A small beginning' }] : { id: 1, title: 'A small beginning' } };
  if (method === 'DELETE') return path === '/books/1' ? { status: 204, label: 'No Content', body: null } : { status: 405, label: 'Method Not Allowed', body: { error: 'Delete an individual book instead' } };
  if (path !== '/books') return { status: 405, label: 'Method Not Allowed', body: { error: 'Create books at /books' } };
  let value;
  try { value = JSON.parse(body); } catch { return { status: 400, label: 'Bad Request', body: { error: 'Body must be valid JSON' } }; }
  if (!value || typeof value.title !== 'string' || !value.title.trim()) return { status: 422, label: 'Unprocessable Content', body: { error: 'A non-empty title is required' } };
  return { status: 201, label: 'Created', body: { id: 2, title: value.title.trim() } };
}
export function parseNumbers(input) {
  const tokens = input.split(',').map(value => value.trim());
  if (tokens.length < 2 || tokens.length > 12 || tokens.some(value => !/^-?\d+$/.test(value) || Math.abs(Number(value)) > 999)) throw new Error('Enter 2–12 whole numbers between -999 and 999, separated by commas.');
  return tokens.map(Number);
}
export function bubbleFrames(values) {
  const items = [...values];
  const frames = [{ items: [...items], active: [], text: 'Start with the original list.' }];
  for (let end = items.length - 1; end > 0; end--) {
    let swapped = false;
    for (let index = 0; index < end; index++) {
      const left = items[index], right = items[index + 1];
      frames.push({ items: [...items], active: [index, index + 1], text: `Compare ${left} and ${right}.` });
      if (left > right) {
        [items[index], items[index + 1]] = [right, left]; swapped = true;
        frames.push({ items: [...items], active: [index, index + 1], text: `${left} is larger. Swap the pair.` });
      }
    }
    if (!swapped) break;
  }
  frames.push({ items: [...items], active: [], text: 'Sorted! Every value is in ascending order.' });
  return frames;
}
export function binarySteps(values, target) {
  const items = [...values].sort((a, b) => a - b), steps = [];
  let low = 0, high = items.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2), value = items[mid];
    steps.push({ low, high, mid, value, result: value === target ? 'Found' : value < target ? 'Search right half' : 'Search left half' });
    if (value === target) return { items, steps, found: mid };
    if (value < target) low = mid + 1; else high = mid - 1;
  }
  return { items, steps, found: -1 };
}
export function chunkText(text, size, overlap) {
  if (!Number.isInteger(size) || size < 40 || size > 400 || !Number.isInteger(overlap) || overlap < 0 || overlap >= size) throw new Error('Overlap must be smaller than chunk size.');
  if (text.length > 4000) throw new Error('Use up to 4,000 characters.');
  const characters = Array.from(text), chunks = [];
  for (let start = 0; start < characters.length; start += size - overlap) {
    chunks.push({ start, end: Math.min(start + size, characters.length), text: characters.slice(start, start + size).join('') });
    if (start + size >= characters.length) break;
  }
  return chunks;
}
export function wordSimilarity(first, second) {
  const counts = text => {
    const result = new Map();
    for (const word of text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || []) result.set(word, (result.get(word) || 0) + 1);
    return result;
  };
  const a = counts(first), b = counts(second), words = [...new Set([...a.keys(), ...b.keys()])].sort();
  let dot = 0, aa = 0, bb = 0;
  const rows = words.map(word => { const x = a.get(word) || 0, y = b.get(word) || 0; dot += x * y; aa += x * x; bb += y * y; return { word, a: x, b: y }; });
  return { score: aa && bb ? dot / (Math.sqrt(aa) * Math.sqrt(bb)) : 0, rows, empty: !aa || !bb };
}
