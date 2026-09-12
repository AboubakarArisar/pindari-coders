export function sortFrames(values, algorithm) {
  if (!['selection', 'insertion'].includes(algorithm)) throw new Error('Choose selection or insertion sort.');
  const items = [...values], frames = [];
  const record = (active, text) => frames.push({ items: [...items], active, text });
  record([], 'Start with the original list.');
  if (algorithm === 'selection') {
    for (let start = 0; start < items.length - 1; start++) {
      let minimum = start;
      for (let index = start + 1; index < items.length; index++) {
        record([minimum, index], `Compare candidate ${items[minimum]} with ${items[index]}.`);
        if (items[index] < items[minimum]) minimum = index;
      }
      [items[start], items[minimum]] = [items[minimum], items[start]];
      record([start, minimum], `Place the smallest remaining value, ${items[start]}, at index ${start}.`);
    }
  } else {
    for (let index = 1; index < items.length; index++) {
      let position = index;
      record([position], `Insert ${items[position]} into the sorted prefix to its left.`);
      while (position > 0) {
        record([position - 1, position], `Compare ${items[position - 1]} with ${items[position]}.`);
        if (items[position - 1] <= items[position]) break;
        [items[position - 1], items[position]] = [items[position], items[position - 1]];
        record([position - 1, position], 'Move the smaller value left by swapping this pair.');
        position--;
      }
    }
  }
  record([], 'Sorted in ascending order.');
  return frames;
}

export function linearFrames(values, target) {
  const frames = [{ items: [...values], active: [], text: 'Keep the original order. Start at the first value.' }];
  for (let index = 0; index < values.length; index++) {
    frames.push({ items: [...values], active: [index], text: `Compare ${values[index]} with target ${target}.` });
    if (values[index] === target) {
      frames.push({ items: [...values], active: [index], text: `Found the first match at index ${index} after ${index + 1} comparison(s).` });
      return frames;
    }
  }
  frames.push({ items: [...values], active: [], text: `Not found after ${values.length} comparisons.` });
  return frames;
}

export function gcdFrames(first, second) {
  if (![first, second].every(value => Number.isInteger(value) && value >= 0 && value <= 999) || (first === 0 && second === 0)) throw new Error('Use integers from 0 to 999, with at least one nonzero value.');
  let a = first, b = second;
  const frames = [{ items: [a, b], active: [], text: 'The two cells show a and b. Replace (a, b) with (b, a mod b) until b is zero.' }];
  while (b !== 0) {
    const remainder = a % b;
    frames.push({ items: [a, b], active: [0, 1], text: `${a} = ${Math.floor(a / b)} × ${b} + ${remainder}. The remainder is ${remainder}.` });
    [a, b] = [b, remainder];
    frames.push({ items: [a, b], active: [0, 1], text: `Now a = ${a} and b = ${b}.` });
  }
  frames.push({ items: [a, b], active: [0], text: `b is zero. The greatest common divisor is ${a}.` });
  return frames;
}

export const exampleGraph = { A: ['B', 'C'], B: ['A', 'D', 'E'], C: ['A', 'F'], D: ['B'], E: ['B', 'F'], F: ['C', 'E'], G: [] };
export function breadthFrames(start, target) {
  if (!Object.hasOwn(exampleGraph, start) || !Object.hasOwn(exampleGraph, target)) throw new Error('Choose a node from A to G.');
  const queue = [start], visited = new Set([start]), parents = new Map(), frames = [];
  const record = (current, text, path = []) => frames.push({ current, queue: [...queue], visited: [...visited], text, path });
  record(null, `Enqueue ${start}. Mark nodes when enqueuing so cycles cannot add them twice.`);
  while (queue.length) {
    const current = queue.shift();
    record(current, `Remove ${current} from the front of the queue.`);
    if (current === target) {
      const path = [current];
      while (parents.has(path[0])) path.unshift(parents.get(path[0]));
      record(current, `Shortest path: ${path.join(' → ')}. ${path.length - 1} edge(s).`, path);
      return frames;
    }
    for (const neighbor of exampleGraph[current]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor); parents.set(neighbor, current); queue.push(neighbor);
        record(current, `Discover ${neighbor} from ${current} and add it to the back of the queue.`);
      }
    }
  }
  record(null, `No path to ${target}. The queue is empty.`, []);
  return frames;
}
