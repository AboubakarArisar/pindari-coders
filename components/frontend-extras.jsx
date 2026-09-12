'use client';
import { useState } from 'react';

const modules = [
  { id: 'grid', title: 'give everything a place.', description: 'Change the number of columns and the gap. Six items fill the grid in row order.' },
  { id: 'box', title: 'what takes up the space?', description: 'Explore content, padding, and border. Switch box-sizing to see whether padding expands the box or reduces the content area.' },
  { id: 'shadow', title: 'a little depth goes a long way.', description: 'Move the shadow, soften its edges, and round the corners. Compare the result with the CSS below.' },
  { id: 'transform', title: 'move it without moving the layout.', description: 'Rotate, scale, and translate a card. The dashed outline shows its original layout space.' },
];
export const frontendExperiments = modules;
function Slider({ label, value, set, min, max, step = 1, unit = 'px' }) {
  return <label>{label} <output>{value}{unit}</output><input type="range" min={min} max={max} step={step} value={value} onChange={event => set(Number(event.target.value))} /></label>;
}
function Experiment({ module, index, children, code }) {
  const [copyStatus, setCopyStatus] = useState('');
  async function copy() {
    try { await navigator.clipboard.writeText(code); setCopyStatus('CSS copied.'); }
    catch { setCopyStatus('Copy unavailable. Select the CSS below to copy it manually.'); }
  }
  return <section className="interactive-module frontend-experiment" id={`frontend-${module.id}`}><div className="module-heading"><p className="eyebrow">EXPERIMENT 00{index + 4}</p><h2>{module.title}</h2><p>{module.description}</p></div>{children}<div className="frontend-code"><pre><code>{code}</code></pre><button className="text-button" onClick={copy}>copy CSS ↗</button><p role="status">{copyStatus}</p></div></section>;
}
function Grid() {
  const [columns, setColumns] = useState(3), [gap, setGap] = useState(16), [height, setHeight] = useState(80);
  const code = `.grid {\n  display: grid;\n  grid-template-columns: repeat(${columns}, minmax(0, 1fr));\n  gap: ${gap}px;\n  grid-auto-rows: ${height}px;\n}`;
  return <Experiment module={modules[0]} index={0} code={code}><div className="frontend-controls"><Slider label="Columns" value={columns} set={setColumns} min={1} max={4} unit=""/><Slider label="Gap" value={gap} set={setGap} min={0} max={32}/><Slider label="Row height" value={height} set={setHeight} min={40} max={120}/></div><div className="frontend-grid-canvas" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap, gridAutoRows: height }}>{Array.from({ length: 6 }, (_, index) => <div key={index}>0{index + 1}</div>)}</div><p className="module-hint">Each column gets an equal share of the available width after gaps. Unlike Flexbox, Grid controls rows and columns together.</p></Experiment>;
}
function BoxModel() {
  const [padding, setPadding] = useState(20), [border, setBorder] = useState(8), [sizing, setSizing] = useState('content-box');
  const outer = sizing === 'content-box' ? 180 + 2 * padding + 2 * border : 180;
  const content = sizing === 'content-box' ? 180 : 180 - 2 * padding - 2 * border;
  const code = `.box {\n  box-sizing: ${sizing};\n  width: 180px;\n  padding: ${padding}px;\n  border: ${border}px solid #92aa71;\n}`;
  return <Experiment module={modules[1]} index={1} code={code}><div className="frontend-controls"><label>box-sizing<select value={sizing} onChange={event => setSizing(event.target.value)}><option>content-box</option><option>border-box</option></select></label><Slider label="Padding" value={padding} set={setPadding} min={0} max={32}/><Slider label="Border" value={border} set={setBorder} min={0} max={16}/></div><div className="box-model-canvas"><div style={{ boxSizing: sizing, width: 180, padding, border: `${border}px solid #92aa71`, background: '#e8edbf' }}><div className="box-model-content">content</div></div></div><p aria-live="polite">Content width: <strong>{content}px</strong> · total width including padding and border: <strong>{outer}px</strong></p><p className="module-hint">Declared width stays at 180px. Dark green is the border, pale yellow is padding, and white is content. Margin would add space outside the border.</p></Experiment>;
}
function Shadow() {
  const [x, setX] = useState(8), [y, setY] = useState(12), [blur, setBlur] = useState(16), [radius, setRadius] = useState(16);
  const shadow = `${x}px ${y}px ${blur}px rgba(36, 52, 39, 0.28)`;
  return <Experiment module={modules[2]} index={2} code={`.card {\n  border-radius: ${radius}px;\n  box-shadow: ${shadow};\n}`}><div className="frontend-controls"><Slider label="Horizontal offset" value={x} set={setX} min={-24} max={24}/><Slider label="Vertical offset" value={y} set={setY} min={-24} max={24}/><Slider label="Blur" value={blur} set={setBlur} min={0} max={40}/><Slider label="Corner radius" value={radius} set={setRadius} min={0} max={60}/></div><div className="frontend-object-canvas"><div className="frontend-demo-card" style={{ borderRadius: radius, boxShadow: shadow }}><span aria-hidden="true">✳</span><strong>small ideas.<br/>a little dimension.</strong></div></div><p className="module-hint">Negative offsets move the shadow left or up. A zero blur produces a crisp edge. Shadows do not take up layout space.</p></Experiment>;
}
function Transform() {
  const [rotate, setRotate] = useState(0), [scale, setScale] = useState(1), [x, setX] = useState(0);
  const transform = `translateX(${x}px) rotate(${rotate}deg) scale(${scale})`;
  return <Experiment module={modules[3]} index={3} code={`.card {\n  transform: ${transform};\n  transform-origin: center;\n}`}><div className="frontend-controls"><Slider label="Rotation" value={rotate} set={setRotate} min={-45} max={45} unit="°"/><Slider label="Scale" value={scale} set={setScale} min={0.5} max={1.4} step={0.1} unit="×"/><Slider label="Horizontal movement" value={x} set={setX} min={-30} max={30}/></div><div className="frontend-object-canvas transform-canvas"><div className="transform-origin"><div className="frontend-demo-card" style={{ transform }}><span aria-hidden="true">↗</span><strong>same space.<br/>different position.</strong></div></div></div><p className="module-hint">Transforms change the appearance without making neighbors reflow. Functions compose from right to left here: scale, rotate, then translate.</p></Experiment>;
}
export default function FrontendExtras() { return <div className="wrap frontend-extra-modules"><Grid/><BoxModel/><Shadow/><Transform/></div>; }
