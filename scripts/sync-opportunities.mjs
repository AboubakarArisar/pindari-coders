import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const PROJECT = 'uffqpes0';
const API_VERSION = '2026-09-13';
const DAY = 86400000;
const MAX_AGE = 30 * DAY;
const SKILLS = ['React', 'Next.js', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java', 'C#', 'PHP', 'Go', 'Flutter', 'React Native', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'SQL', 'PostgreSQL', 'MongoDB', 'Figma', 'Machine Learning', 'Data Science'];

function text(value, limit = 420) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/&(?:nbsp|amp|quot|#39);/g, match => ({ '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&#39;': "'" }[match] || ' ')).replace(/\s+/g, ' ').trim().slice(0, limit);
}

function url(value) {
  try { const parsed = new URL(value); return ['http:', 'https:'].includes(parsed.protocol) && !parsed.username && !parsed.password ? parsed.href : ''; }
  catch { return ''; }
}

function date(value, fallback = Date.now()) {
  const parsed = typeof value === 'number' ? (value < 1e12 ? value * 1000 : value) : Date.parse(value);
  return new Date(Number.isFinite(parsed) ? parsed : fallback).toISOString();
}

function experience(value) {
  const source = text(value).toLowerCase();
  if (/\b(intern|internship|trainee|apprentice)\b/.test(source)) return 'Internship';
  if (/\b(entry[- ]level|graduate|fresher)\b/.test(source)) return 'Entry level';
  if (/\b(junior|jr\.?)\b/.test(source)) return 'Junior';
  if (/\b(senior|sr\.?|staff|principal|lead|manager|director|head of|vp)\b/.test(source)) return 'Experienced';
  return 'Any experience';
}

function domain(value) {
  const source = text(value).toLowerCase();
  if (/\b(ai|machine learning|ml engineer|data scien|data analy|llm|computer vision)\b/.test(source)) return 'AI & data';
  if (/\b(ios|android|flutter|react native|mobile)\b/.test(source)) return 'Mobile';
  if (/\b(devops|cloud|site reliability|sre|platform engineer|kubernetes|docker)\b/.test(source)) return 'DevOps & cloud';
  if (/\b(design|figma|ui\/ux|ux|product designer)\b/.test(source)) return 'Design';
  if (/\b(frontend|front-end|react|next\.js|vue|angular|css)\b/.test(source)) return 'Frontend';
  if (/\b(backend|back-end|node\.js|python|java|php|golang|\.net|database)\b/.test(source)) return 'Backend';
  return 'General tech';
}

function skills(value) {
  const source = text(value, 5000).toLowerCase();
  return SKILLS.filter(skill => source.includes(skill.toLowerCase())).slice(0, 6);
}

function makeId(source, externalId) {
  return `opportunity-${source.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${createHash('sha256').update(String(externalId)).digest('hex').slice(0, 20)}`;
}

async function requestJson(input, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(input, { ...options, signal: controller.signal, headers: { Accept: 'application/json', 'User-Agent': 'PindariCoders-Opportunity-Radar/1.0', ...options.headers } });
    if (!response.ok) throw new Error(`${new URL(input).hostname} returned ${response.status}`);
    return await response.json();
  } finally { clearTimeout(timeout); }
}

async function jooble(apiKey) {
  const data = await requestJson(`https://pk.jooble.org/api/${encodeURIComponent(apiKey)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keywords: 'developer', location: 'Pakistan', page: 1, ResultOnPage: 50, companysearch: false }) });
  if (!Array.isArray(data.jobs)) throw new Error('Jooble returned an unexpected response.');
  return data.jobs.map(job => {
    const publishedAt = date(job.updated), searchable = `${job.title} ${job.snippet}`;
    return { source: 'Jooble', externalId: job.id || job.link, title: text(job.title, 140), company: text(job.company, 100) || 'Company not listed', description: text(job.snippet), url: url(job.link), location: 'Pakistan', workMode: /remote/i.test(`${job.location} ${job.snippet}`) ? 'Remote' : 'On-site / hybrid', type: /intern/i.test(searchable) ? 'Internship' : text(job.type, 40) || 'Job', experience: experience(searchable), domain: domain(searchable), skills: skills(searchable), salary: text(job.salary, 80), publishedAt, expiresAt: new Date(Date.parse(publishedAt) + MAX_AGE).toISOString() };
  });
}

async function himalayas() {
  const collected = [];
  let cursor = '';
  for (let page = 0; page < 3; page++) {
    const endpoint = new URL('https://himalayas.app/jobs/api');
    endpoint.searchParams.set('limit', '20');
    if (cursor) endpoint.searchParams.set('cursor', cursor);
    const data = await requestJson(endpoint);
    if (!Array.isArray(data.jobs)) throw new Error('Himalayas returned an unexpected response.');
    collected.push(...data.jobs);
    cursor = data.nextCursor || '';
    if (!cursor) break;
  }
  return collected.filter(job => !job.locationRestrictions?.length).map(job => {
    const searchable = `${job.title} ${job.excerpt} ${(job.categories || []).join(' ')} ${(job.parentCategories || []).join(' ')}`;
    return { source: 'Himalayas', externalId: job.guid || job.applicationLink, title: text(job.title, 140), company: text(job.companyName, 100), description: text(job.excerpt || job.description), url: url(job.applicationLink), location: 'Worldwide', workMode: 'Remote', type: /intern/i.test(searchable) ? 'Internship' : text(job.employmentType, 40) || 'Job', experience: experience(`${job.seniority} ${job.title}`), domain: domain(searchable), skills: skills(`${searchable} ${job.description}`), salary: job.minSalary && job.maxSalary ? `${job.currency || ''} ${job.minSalary.toLocaleString()}–${job.maxSalary.toLocaleString()} ${job.salaryPeriod || ''}`.trim() : '', publishedAt: date(job.pubDate), expiresAt: job.expiryDate ? date(job.expiryDate) : new Date(Date.parse(date(job.pubDate)) + MAX_AGE).toISOString() };
  });
}

async function remoteOk() {
  const data = await requestJson('https://remoteok.com/api');
  if (!Array.isArray(data)) throw new Error('Remote OK returned an unexpected response.');
  return data.filter(job => job?.id && /^(|worldwide|anywhere|global|remote)$/i.test(text(job.location, 40))).map(job => {
    const searchable = `${job.position} ${(job.tags || []).join(' ')} ${job.description}`;
    return { source: 'Remote OK', externalId: job.id, title: text(job.position, 140), company: text(job.company, 100), description: text(job.description), url: url(job.url || job.apply_url), location: 'Worldwide', workMode: 'Remote', type: /intern/i.test(searchable) ? 'Internship' : 'Job', experience: experience(searchable), domain: domain(searchable), skills: skills(searchable), salary: text(job.salary_min && job.salary_max ? `${job.salary_min}–${job.salary_max}` : '', 80), publishedAt: date(job.date || job.epoch), expiresAt: new Date(Date.parse(date(job.date || job.epoch)) + MAX_AGE).toISOString() };
  });
}

function clean(items, now = Date.now()) {
  const seen = new Set();
  return items.filter(item => {
    const key = `${item.company}|${item.title}`.toLowerCase().replace(/\W/g, '');
    const fresh = Date.parse(item.publishedAt) >= now - MAX_AGE && Date.parse(item.expiresAt) >= now;
    if (!item.externalId || !item.title || !item.company || !item.description || !item.url || !fresh || item.experience === 'Experienced' || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map(item => ({ _id: makeId(item.source, item.externalId), _type: 'opportunity', ...item, lastSeenAt: new Date(now).toISOString() })).slice(0, 150);
}

async function save(items, token) {
  for (let start = 0; start < items.length; start += 50) {
    const mutations = items.slice(start, start + 50).map(item => ({ createOrReplace: item }));
    await requestJson(`https://${PROJECT}.api.sanity.io/v${API_VERSION}/data/mutate/production?returnIds=true`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ mutations }) });
  }
}

function selfTest() {
  assert.equal(experience('Junior React developer'), 'Junior');
  assert.equal(experience('Senior developer'), 'Experienced');
  assert.equal(domain('Flutter mobile engineer'), 'Mobile');
  assert.deepEqual(skills('React, TypeScript and PostgreSQL'), ['React', 'TypeScript', 'SQL', 'PostgreSQL']);
  assert.equal(date(1760000000000), '2025-10-09T08:53:20.000Z');
  assert.equal(clean([{ source: 'Test', externalId: 1, title: 'Junior Dev', company: 'Acme', description: 'Build useful things', url: 'https://example.com/job', publishedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + DAY).toISOString(), experience: 'Junior' }]).length, 1);
  console.log('Opportunity sync checks passed.');
}

async function main() {
  if (process.argv.includes('--check')) return selfTest();
  const token = process.env.SANITY_WRITE_TOKEN, joobleKey = process.env.JOOBLE_API_KEY;
  if (!token || !joobleKey) throw new Error('SANITY_WRITE_TOKEN and JOOBLE_API_KEY are required.');
  const results = await Promise.allSettled([jooble(joobleKey), himalayas(), remoteOk()]);
  const failed = results.filter(result => result.status === 'rejected');
  failed.forEach(result => console.error(result.reason instanceof Error ? result.reason.message : String(result.reason)));
  const items = clean(results.flatMap(result => result.status === 'fulfilled' ? result.value : []));
  if (!items.length) throw new Error('No usable opportunities were returned; Sanity was left unchanged.');
  await save(items, token);
  console.log(`Synced ${items.length} current opportunities from ${results.length - failed.length} sources.`);
}

main().catch(error => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
