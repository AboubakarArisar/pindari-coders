'use client';
import { useState } from 'react';
import { parseNumbers } from '../lib/lab-modules';
import { sortFrames, linearFrames, gcdFrames, breadthFrames, exampleGraph } from '../lib/algorithm-frames';

function Controls({ position, count, setPosition }) {
  return <div className="module-actions"><button disabled={position === 0} onClick={() => setPosition(position - 1)}>← previous</button><span>{position + 1} / {count}</span><button disabled={position === count - 1} onClick={() => setPosition(position + 1)}>next step →</button><button onClick={() => setPosition(0)}>reset</button></div>;
}
const exercises = [
  { id: 'selection', number: '03', title: 'find the smallest. move it forward.', intro: 'Selection sort scans the unsorted region for its minimum, then places it at the next position.', cost: 'O(n²) comparisons even for sorted input; O(1) extra working space. Try a sorted list and notice that every scan still happens.' },
  { id: 'insertion', number: '04', title: 'make room in the sorted part.', intro: 'Insertion sort grows a sorted prefix. This version moves a value left through adjacent swaps until it fits.', cost: 'O(n²) worst-case time, O(n) for already sorted input; O(1) extra working space. Compare a sorted list with its reverse.' },
  { id: 'linear', number: '05', title: 'check each value. no sorting needed.', intro: 'Linear search checks the original list from left to right and stops at its first match. Positions start at zero.', cost: 'O(n) worst-case time; O(1) extra working space. Try a target at the start, at the end, and outside the list.' },
  { id: 'gcd', number: '06', title: 'the answer is in the remainder.', intro: 'Euclid’s algorithm finds the greatest common divisor: the largest positive integer dividing both numbers.', cost: 'Logarithmic number of remainder steps in the smaller positive input; O(1) extra working space. Try 48 and 18, then 17 and 13.' },
];
function NumberExercise({ exercise }) {
  const [input, setInput] = useState('8, 3, 6, 1, 5'), [target, setTarget] = useState('6');
  const [first, setFirst] = useState('48'), [second, setSecond] = useState('18'), [position, setPosition] = useState(0);
  const update = setter => event => { setter(event.target.value); setPosition(0); };
  let frames, error;
  try {
    if (exercise.id === 'gcd') {
      if (![first, second].every(value => /^\d{1,3}$/.test(value))) throw new Error('Enter two whole numbers from 0 to 999.');
      frames = gcdFrames(Number(first), Number(second));
    } else {
      const values = parseNumbers(input);
      if (exercise.id === 'linear') {
        if (!/^-?\d{1,3}$/.test(target)) throw new Error('Enter a whole-number target from -999 to 999.');
        frames = linearFrames(values, Number(target));
      } else frames = sortFrames(values, exercise.id);
    }
  } catch (issue) { error = issue.message; }
  const frame = frames?.[Math.min(position, frames.length - 1)];
  return <section className="interactive-module" id={`module-${exercise.number}`}><div className="module-heading"><p className="eyebrow">MODULE {exercise.number}</p><h2>{exercise.title}</h2><p>{exercise.intro}</p></div>{exercise.id === 'gcd' ? <div className="request-controls"><label>First number (a)<input inputMode="numeric" maxLength={3} value={first} onChange={update(setFirst)} /></label><label>Second number (b)<input inputMode="numeric" maxLength={3} value={second} onChange={update(setSecond)} /></label></div> : <div className="request-controls"><label>Numbers, separated by commas<input maxLength={100} value={input} onChange={update(setInput)} /></label>{exercise.id === 'linear' && <label>Target<input maxLength={4} value={target} onChange={update(setTarget)} /></label>}</div>}{error ? <p role="status" className="module-error">{error}</p> : <><div className="number-stage">{frame.items.map((value, index) => <span key={index} className={frame.active.includes(index) ? 'active-number' : ''}>{value}</span>)}</div><p aria-live="polite" className="step-explanation">{frame.text}</p><Controls position={position} count={frames.length} setPosition={setPosition} /></>}<p className="module-hint">{exercise.cost} These costs describe the algorithm; the visualizer also stores snapshots for stepping backwards.</p></section>;
}
const positions = { A: [70, 100], B: [190, 45], C: [190, 160], D: [320, 35], E: [320, 100], F: [430, 160], G: [430, 40] };
function BreadthSearch() {
  const [start, setStart] = useState('A'), [target, setTarget] = useState('F'), [position, setPosition] = useState(0);
  const frames = breadthFrames(start, target), frame = frames[position];
  return <section className="interactive-module" id="module-07"><div className="module-heading"><p className="eyebrow">MODULE 07</p><h2>explore one layer at a time.</h2><p>Breadth-first search finds a shortest path in this unweighted, undirected graph. Change the start and target; G is isolated so you can explore an unreachable result.</p></div><div className="request-controls">{[['Start', start, setStart], ['Target', target, setTarget]].map(([label, value, setter]) => <label key={label}>{label}<select value={value} onChange={event => { setter(event.target.value); setPosition(0); }}>{Object.keys(exampleGraph).map(node => <option key={node}>{node}</option>)}</select></label>)}</div><svg className="algorithm-graph" viewBox="0 0 500 210" role="img" aria-label={`Graph with edges A-B, A-C, B-D, B-E, C-F, E-F. G is isolated. Current node: ${frame.current || 'none'}. Discovered: ${frame.visited.join(', ')}.`}>{Object.entries(exampleGraph).flatMap(([from, neighbors]) => neighbors.filter(to => from < to).map(to => <line key={from + to} x1={positions[from][0]} y1={positions[from][1]} x2={positions[to][0]} y2={positions[to][1]} />))}{Object.entries(positions).map(([node, [x, y]]) => <g key={node} className={frame.path.includes(node) ? 'graph-path' : frame.current === node ? 'graph-current' : frame.visited.includes(node) ? 'graph-visited' : ''}><circle cx={x} cy={y} r="21" /><text x={x} y={y + 5} textAnchor="middle">{node}</text></g>)}</svg><p className="module-hint">Dark green = current node · pale green = discovered · outlined green = final path.</p><p className="step-explanation" aria-live="polite">{frame.text}</p><p>Queue, front → back: <strong>{frame.queue.join(' → ') || '(empty)'}</strong></p><p>Discovered: {frame.visited.join(', ')}</p><Controls position={position} count={frames.length} setPosition={setPosition} /><p className="module-hint">O(V + E) time and O(V) working space with an efficient queue; V is nodes and E is edges. This seven-node demo uses an array queue and retains frames for replay. Neighbor order breaks ties between equally short paths.</p></section>;
}
export default function AlgorithmExtras() { return <>{exercises.map(exercise => <NumberExercise key={exercise.id} exercise={exercise} />)}<BreadthSearch /></>; }
