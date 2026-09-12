'use client';
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import Link from 'next/link';

export default function RoadmapExplorer({ roadmap }) {
  const [selected, setSelected] = useState(0);
  const detail = useRef(null);
  const step = roadmap.steps[selected];
  function selectStep(index, focus = true) {
    setSelected(index);
    if (focus) {
      detail.current?.focus({ preventScroll: true });
      if (window.matchMedia('(max-width: 760px)').matches) detail.current?.scrollIntoView({ block: 'start' });
    }
  }
  useEffect(() => {
    if (!document.modelContext?.registerTool) return;
    const lifecycle = new AbortController();
    const tool = {
      name: 'open_roadmap_step',
      description: `Open a step in the visible ${roadmap.label} roadmap. Step numbers start at 1.`,
      inputSchema: { type: 'object', properties: { step: { type: 'integer', minimum: 1, maximum: roadmap.steps.length } }, required: ['step'], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        if (!input || typeof input !== 'object' || Object.keys(input).some(key => key !== 'step') || !Number.isInteger(input.step) || input.step < 1 || input.step > roadmap.steps.length) throw new Error(`Choose a step from 1 to ${roadmap.steps.length}.`);
        flushSync(() => setSelected(input.step - 1));
        return { step: input.step, title: roadmap.steps[input.step - 1].title };
      },
    };
    try { Promise.resolve(document.modelContext.registerTool(tool, { signal: lifecycle.signal })).catch(error => console.warn('Roadmap tool registration failed:', error)); }
    catch (error) { console.warn('Roadmap tool unavailable:', error); }
    return () => lifecycle.abort();
  }, [roadmap]);
  return <div className="roadmap-workspace">
    <section className="roadmap-map" aria-label={`${roadmap.label} learning sequence`}><div className="map-caption"><span className="eyebrow">THE PATH</span><span>select a step to explore</span></div><div className="map-start">start here</div><ol className="roadmap-nodes">
      {roadmap.steps.map((item, index) => <li key={item.title}><button className={`roadmap-node ${index === selected ? 'is-selected' : ''}`} aria-pressed={index === selected} aria-controls="step-detail" onClick={() => selectStep(index)}><span className="node-number">0{index + 1}</span><span><strong>{item.title}</strong><span className="node-topics">{item.topics.join(' · ')}</span></span><span aria-hidden="true">↗</span></button></li>)}
    </ol><div className="map-finish"><span aria-hidden="true">✳</span> something you can call yours.</div></section>
    <section className="step-detail" id="step-detail" ref={detail} tabIndex={-1} aria-labelledby="step-title"><div className="step-detail-top"><span className="eyebrow">STEP 0{selected + 1} / 0{roadmap.steps.length}</span><span className="tag">learn + build</span></div><h2 id="step-title">{step.title}</h2><p>{step.description}</p><div className="topic-chips" aria-label="Topics to learn">{step.topics.map(topic => <span key={topic}>{topic}</span>)}</div><div className="step-resources"><h3>start with these</h3>{step.resources.map(resource => resource.url.startsWith('/') ? <Link href={resource.url} key={resource.url}>{resource.title}<span aria-hidden="true">↗</span></Link> : <a href={resource.url} key={resource.url} target="_blank" rel="noopener noreferrer">{resource.title}<span aria-hidden="true">↗</span></a>)}</div><div className="step-checkpoint"><p className="eyebrow">MAKE IT CLICK</p><h3>a small thing to build.</h3><p>{step.task}</p></div><div className="step-navigation"><button onClick={() => selectStep(selected - 1, false)} disabled={selected === 0}>← previous</button>{selected < roadmap.steps.length - 1 ? <button onClick={() => selectStep(selected + 1, false)}>next step →</button> : <Link href="/roadmaps/">choose another path ↗</Link>}</div><p className="sr-only" role="status">Showing step {selected + 1}: {step.title}</p></section>
  </div>;
}
