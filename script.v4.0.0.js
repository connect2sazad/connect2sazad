'use strict';
const $ = (s) => document.querySelector(s);
const root = document.documentElement;
const STORAGE_KEY = 'sazad-portfolio-appearance-v4';

function escapeHTML(value = '') {
  return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
function safeURL(value = '') {
  const url = String(value).trim();
  return /^(https?:|mailto:|tel:)/i.test(url) || /^(?:\.\/)?assets\/[\w./%+() -]+$/i.test(url) ? url : '#';
}
async function getJSON(path) {
  const response = await fetch(`${path}?updated=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
async function getText(path) { const r = await fetch(`${path}?updated=${Date.now()}`, {cache:'no-store'}); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); }
function parsePost(source) {
  const parts = source.replace(/^\uFEFF/, '').match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/); if (!parts) throw new Error('Post front matter missing');
  const post = {tags:[], markdown:parts[2].trim()}; parts[1].split(/\r?\n/).forEach(line => { const i=line.indexOf(':'); if(i<0)return; const k=line.slice(0,i).trim(),v=line.slice(i+1).trim().replace(/^['"]|['"]$/g,''); post[k]=k==='tags'?v.replace(/^\[|\]$/g,'').split(',').map(x=>x.trim()).filter(Boolean):v; }); return post;
}
async function loadPosts() { const names=await getJSON('data/posts/index.json'); if(!Array.isArray(names))throw new Error('Post index must be a JSON array'); const posts=await Promise.all(names.map(async name=>{if(!/^[\w.-]+\.md$/.test(name))throw new Error('Invalid post filename');const p=parsePost(await getText(`data/posts/${name}`));p.slug=p.slug||name.replace(/\.md$/,'');return p;})); return posts.sort((a,b)=>String(b.date).localeCompare(String(a.date))); }
function resolveMarkdownURL(value = '', context = null, image = false) {
  const url = String(value).trim().replace(/^<|>$/g, '');
  if (/^(https?:|mailto:|tel:|data:image\/)/i.test(url) || url.startsWith('#')) return url;
  if (!context) return safeURL(url);
  const pathEnd = url.search(/[?#]/);
  const rawPath = pathEnd < 0 ? url : url.slice(0, pathEnd);
  const suffix = pathEnd < 0 ? '' : url.slice(pathEnd);
  const clean = rawPath.replace(/^\.\//, '').replace(/^\//, '');
  const encoded = clean.split('/').filter(Boolean).map(encodeURIComponent).join('/');
  return `${image ? context.rawBase : context.browseBase}/${encoded}${suffix}`;
}
function renderMarkdown(md = '', context = null) {
  const inline = source => {
    let value = escapeHTML(source);
    value = value.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g, (_, alt, url) => `<img src="${escapeHTML(resolveMarkdownURL(url, context, true))}" alt="${alt}" loading="lazy">`);
    value = value.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g, (_, label, url) => `<a href="${escapeHTML(resolveMarkdownURL(url, context, false))}" target="_blank" rel="noreferrer">${label}</a>`);
    return value.replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>');
  };
  return md.replace(/\r/g,'').split(/\n{2,}/).map(b=>{const h=b.match(/^(#{1,6})\s+([\s\S]+)$/);if(h){const n=Math.min(h[1].length+1,6);return `<h${n}>${inline(h[2])}</h${n}>`;}if(/^!\[.*\]\(.+\)$/.test(b))return `<figure>${inline(b)}</figure>`;if(b.startsWith('> '))return `<blockquote><p>${inline(b.replace(/^>\s?/gm,''))}</p></blockquote>`;if(/^[-*+]\s+/m.test(b))return `<ul>${b.split('\n').map(x=>`<li>${inline(x.replace(/^[-*+]\s+/,''))}</li>`).join('')}</ul>`;if(/^\d+[.)]\s+/m.test(b))return `<ol>${b.split('\n').map(x=>`<li>${inline(x.replace(/^\d+[.)]\s+/,''))}</li>`).join('')}</ol>`;if(b.startsWith('```'))return `<pre><code>${escapeHTML(b.replace(/^```[^\n]*\n?|```$/g,''))}</code></pre>`;return `<p>${inline(b.replace(/\n/g,' '))}</p>`;}).join('');
}

async function loadPortfolio() {
  if (!$('#hero-name')) return;
  try {
    const keys = ['site','about','focus','skills','experience','projects','certifications','presentations','education','contact'];
    const values = await Promise.all(keys.map(key => getJSON(`data/${key}.json`)));
    const data = Object.fromEntries(keys.map((key, index) => [key, values[index]]));
    const posts = await loadPosts();
    renderPortfolio(data, posts);
  } catch (error) {
    console.error(error);
    document.body.insertAdjacentHTML('afterbegin', '<div class="load-error">Content could not be loaded. Run a local web server instead of opening the HTML file directly.</div>');
  }
}
function renderPortfolio(data, posts) {
  const { site, about, focus = [], skills, experience, projects, certifications = [], presentations = [], education, contact } = data;
  $('#availability').textContent = site.availability;
  $('#hero-name').innerHTML = site.name.split(' ').map((p, i) => i ? `<span>${escapeHTML(p)}</span>` : escapeHTML(p)).join('<br>');
  $('#hero-role').textContent = site.role;
  $('#profile-image').src = site.profileImage;
  $('#hero-meta').innerHTML = `${escapeHTML(site.location)}<br>${site.languages.map(escapeHTML).join(' · ')}`;
  $('#hero-summary').textContent = site.summary;
  $('#about-heading').innerHTML = about.heading.map(escapeHTML).join('<br>');
  $('#about-copy').innerHTML = about.paragraphs.map(p => `<p>${escapeHTML(p)}</p>`).join('');
  $('#stat-grid').innerHTML = about.stats.map(s => `<div><strong>${escapeHTML(s.value)}</strong><span>${escapeHTML(s.label)}</span></div>`).join('');
  $('#focus-list').innerHTML = focus.map((item, i) => `<article><span>0${i+1}</span><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.description)}</p></article>`).join('');
  $('#skills-list').innerHTML = skills.map(s => `<div class="skill-row"><span>${escapeHTML(s.title)}</span><p>${s.items.map(escapeHTML).join(' · ')}</p></div>`).join('');
  $('#experience-list').innerHTML = experience.map(x => `<article><div class="time">${escapeHTML(x.period)}</div><div><h3>${escapeHTML(x.role)}</h3><h4>${escapeHTML(x.company)}</h4><p>${escapeHTML(x.description)}</p></div></article>`).join('');
  $('#projects-list').innerHTML = projects.map((p, i) => `<a class="project-card ${i === 0 ? 'featured-project' : ''}" href="project.html?id=${i}"><div class="project-top"><span>${String(i+1).padStart(2,'0')}</span><span>View embedded ${escapeHTML(p.platform)} repo ↗</span></div><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.description)}</p><div class="tags">${p.tags.map(t => `<span>${escapeHTML(t)}</span>`).join('')}</div></a>`).join('');
  renderCredentials(certifications, presentations);
  $('#education-list').innerHTML = education.map(e => `<div><span>${escapeHTML(e.period)}</span><h3>${escapeHTML(e.qualification)}</h3><p>${escapeHTML(e.institution)}</p></div>`).join('');
  $('#latest-posts').innerHTML = posts.slice(0, 3).map(postCard).join('');
  $('#contact-eyebrow').textContent = contact.eyebrow;
  $('#contact-links').innerHTML = contact.links.map(l => `<a href="${safeURL(l.url)}" ${l.url.startsWith('http') ? 'target="_blank" rel="noreferrer"' : ''}>${escapeHTML(l.label)} ↗</a>`).join('');
  $('#footer-name').textContent = site.name;
}
function renderCredentials(certifications, presentations) {
  $('#certification-count').textContent = String(certifications.length).padStart(2, '0');
  $('#presentation-count').textContent = String(presentations.length).padStart(2, '0');
  $('#certifications-list').innerHTML = certifications.length ? certifications.map(c => credentialCard(c, true)).join('') : '<div class="empty-card"><strong>Details coming soon.</strong><p>Add verified certifications in <code>data/certifications.json</code>. Nothing unverified has been published.</p></div>';
  $('#presentations-list').innerHTML = presentations.length ? presentations.map(p => credentialCard(p, false)).join('') : '<div class="empty-card"><strong>No presentations published yet.</strong></div>';
}
function credentialCard(item, certification) {
  const body = `<div class="credential-meta"><span>${escapeHTML(item.year || '')}</span><span>${escapeHTML(item.type || item.issuer || '')}</span></div><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.description || '')}</p>${certification && item.credentialId ? `<small>Credential: ${escapeHTML(item.credentialId)}</small>` : ''}`;
  return item.url ? `<a class="credential-card" href="${safeURL(item.url)}" target="_blank" rel="noreferrer">${body}<span class="card-arrow">View ↗</span></a>` : `<article class="credential-card">${body}</article>`;
}
function postCard(post) {
  return `<a class="post-card" href="post.html?slug=${encodeURIComponent(post.slug)}"><div class="post-meta"><span>${escapeHTML(post.category)}</span><span>${formatDate(post.date)}</span></div><h3>${escapeHTML(post.title)}</h3><p>${escapeHTML(post.excerpt)}</p><div class="post-footer"><span>${escapeHTML(post.readTime)}</span><span>Read article ↗</span></div></a>`;
}
function formatDate(date) {
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? escapeHTML(date) : parsed.toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'});
}

async function loadBlog() {
  if (!$('#all-posts')) return;
  try {
    const posts = await loadPosts();
    const categories = ['All', ...new Set(posts.map(p => p.category))];
    let active = 'All';
    const search = $('#post-search');
    $('#post-filters').innerHTML = categories.map(c => `<button type="button" data-filter="${escapeHTML(c)}" class="${c === 'All' ? 'active' : ''}">${escapeHTML(c)}</button>`).join('');
    const render = () => {
      const term = search.value.trim().toLowerCase();
      const filtered = posts.filter(p => (active === 'All' || p.category === active) && `${p.title} ${p.excerpt} ${p.tags.join(' ')}`.toLowerCase().includes(term));
      $('#all-posts').innerHTML = filtered.length ? filtered.map((p, i) => `<article class="blog-row"><div><span>${String(i+1).padStart(2,'0')}</span><span>${formatDate(p.date)}</span></div><a href="post.html?slug=${encodeURIComponent(p.slug)}"><h2>${escapeHTML(p.title)}</h2><p>${escapeHTML(p.excerpt)}</p><div class="tags">${p.tags.map(t => `<span>${escapeHTML(t)}</span>`).join('')}</div></a><span>${escapeHTML(p.readTime)} ↗</span></article>`).join('') : '<div class="empty-card">No matching posts.</div>';
    };
    $('#post-filters').addEventListener('click', e => { const b = e.target.closest('[data-filter]'); if (!b) return; active = b.dataset.filter; document.querySelectorAll('[data-filter]').forEach(x => x.classList.toggle('active', x === b)); render(); });
    search.addEventListener('input', render);
    render();
  } catch (error) { console.error(error); }
}

async function loadArticle() {
  if (!$('#article')) return;
  try {
    const slug = new URLSearchParams(location.search).get('slug');
    const posts = await loadPosts();
    const post = posts.find(p => p.slug === slug) || posts[0];
    document.title = `${post.title} — Sazad Ahemad`;
    const content = renderMarkdown(post.markdown);
    $('#article').innerHTML = `<header class="article-header"><div class="post-meta"><span>${escapeHTML(post.category)}</span><span>${formatDate(post.date)} · ${escapeHTML(post.readTime)}</span></div><h1>${escapeHTML(post.title)}</h1><p>${escapeHTML(post.excerpt)}</p><div class="tags">${post.tags.map(t => `<span>${escapeHTML(t)}</span>`).join('')}</div></header><div class="article-body">${content}</div>`;
  } catch (error) { console.error(error); }
}

async function loadProject() {
  if (!$('#project-viewer')) return;
  try {
    const projects = await getJSON('data/projects.json');
    const id = Number(new URLSearchParams(location.search).get('id'));
    const project = projects[Number.isInteger(id) && projects[id] ? id : 0];
    document.title = `${project.title} — Sazad Ahemad`;
    const repo = parseRepository(project.url);
    $('#project-viewer').innerHTML = `<header class="project-detail-header"><div class="post-meta"><span>${escapeHTML(project.platform)}</span><span>Embedded repository</span></div><h1>${escapeHTML(project.title)}</h1><p>${escapeHTML(project.description)}</p><div class="tags">${project.tags.map(t=>`<span>${escapeHTML(t)}</span>`).join('')}</div><a class="repo-external-link" href="${safeURL(project.url)}" target="_blank" rel="noreferrer">Open original repository ↗</a></header><section id="repo-embed" class="repo-embed"><div class="repo-loading">Loading repository details…</div></section>`;
    await renderRepository(repo, project.url);
  } catch (error) { console.error(error); $('#project-viewer').innerHTML = '<div class="load-error-inline">The project could not be loaded. Check the project JSON and repository URL.</div>'; }
}
function parseRepository(url) { const parsed=new URL(url); const parts=parsed.pathname.replace(/^\/+|\/+$/g,'').split('/'); if(parsed.hostname==='github.com'&&parts.length>=2)return{provider:'github',owner:parts[0],name:parts[1]}; if(parsed.hostname==='gitlab.com'&&parts.length>=2)return{provider:'gitlab',path:parts.join('/')}; throw new Error('Unsupported repository URL'); }
async function fetchRemoteJSON(url) { const response=await fetch(url,{cache:'no-store'}); if(!response.ok)throw new Error(`Repository API HTTP ${response.status}`); return response.json(); }
async function renderRepository(repo, originalURL) {
  const target=$('#repo-embed');
  try {
    let meta,files,readme='';
    if(repo.provider==='github'){const base=`https://api.github.com/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.name)}`;[meta,files]=await Promise.all([fetchRemoteJSON(base),fetchRemoteJSON(`${base}/contents`)]);try{const data=await fetchRemoteJSON(`${base}/readme`);readme=decodeURIComponent(escape(atob(data.content.replace(/\n/g,''))));}catch{}}
    else{const project=encodeURIComponent(repo.path);meta=await fetchRemoteJSON(`https://gitlab.com/api/v4/projects/${project}`);files=await fetchRemoteJSON(`https://gitlab.com/api/v4/projects/${project}/repository/tree?per_page=100`);try{const branch=encodeURIComponent(meta.default_branch||'main');const response=await fetch(`https://gitlab.com/api/v4/projects/${project}/repository/files/README.md/raw?ref=${branch}`,{cache:'no-store'});if(response.ok)readme=await response.text();}catch{}}
    const description=meta.description||'Public source-code repository',stars=meta.stargazers_count??meta.star_count??0,forks=meta.forks_count??0;
    const branch=meta.default_branch||'main';
    const context=repo.provider==='github'
      ? {browseBase:`https://github.com/${repo.owner}/${repo.name}/blob/${encodeURIComponent(branch)}`,rawBase:`https://raw.githubusercontent.com/${repo.owner}/${repo.name}/${encodeURIComponent(branch)}`}
      : {browseBase:`https://gitlab.com/${repo.path}/-/blob/${encodeURIComponent(branch)}`,rawBase:`https://gitlab.com/${repo.path}/-/raw/${encodeURIComponent(branch)}`};
    const fileRows=files.slice(0,100).map(file=>{const directory=file.type==='dir'||file.type==='tree';const path=file.path||file.name;const base=directory?context.browseBase.replace('/blob/','/tree/'):context.browseBase;const href=`${base}/${path.split('/').map(encodeURIComponent).join('/')}`;return `<a class="repo-file" href="${escapeHTML(href)}" target="_blank" rel="noreferrer"><span>${directory?'□':'—'}</span><span>${escapeHTML(file.name)}</span></a>`;}).join('');
    target.innerHTML=`<div class="repo-summary"><div><span>Repository</span><strong>${escapeHTML(repo.provider==='github'?`${repo.owner}/${repo.name}`:repo.path)}</strong></div><div><span>Stars</span><strong>${stars}</strong></div><div><span>Forks</span><strong>${forks}</strong></div></div><p class="repo-description">${escapeHTML(description)}</p><div class="repo-browser"><div class="repo-browser-head"><strong>Files</strong><a href="${safeURL(originalURL)}" target="_blank" rel="noreferrer">Browse on ${escapeHTML(repo.provider)} ↗</a></div>${fileRows}</div>${readme?`<section class="repo-readme"><div class="repo-browser-head"><strong>README.md</strong></div><div class="article-body">${renderMarkdown(readme,context)}</div></section>`:''}`;
  } catch(error) { console.error(error); target.innerHTML=`<div class="repo-fallback"><h2>Repository preview unavailable</h2><p>The repository may be private, moved, rate-limited, or blocking API access. You can still open the original repository.</p><a class="repo-external-link" href="${safeURL(originalURL)}" target="_blank" rel="noreferrer">Open repository ↗</a></div>`; }
}

const defaultPrefs = { theme: 'light', scale: 'default', radius: 'soft', motion: true };
function getPrefs() { try { return {...defaultPrefs, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')}; } catch { return {...defaultPrefs}; } }
function savePrefs(prefs) { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); }
function resolvedTheme(theme) { return theme === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme; }
function applyPrefs(prefs) {
  root.dataset.themeChoice = prefs.theme; root.dataset.theme = resolvedTheme(prefs.theme); root.dataset.scale = prefs.scale; root.dataset.radius = prefs.radius; root.dataset.motion = prefs.motion ? 'on' : 'off';
  if ($('#motion-toggle')) $('#motion-toggle').checked = prefs.motion;
  const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = root.dataset.theme === 'dark' ? '#0a0a0a' : '#ffffff';
  document.querySelectorAll('[data-theme-option],[data-scale],[data-radius]').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-theme-option="${prefs.theme}"]`)?.classList.add('active'); document.querySelector(`[data-scale="${prefs.scale}"]`)?.classList.add('active'); document.querySelector(`[data-radius="${prefs.radius}"]`)?.classList.add('active');
}
function updatePrefs(patch) { const prefs = {...getPrefs(), ...patch}; savePrefs(prefs); applyPrefs(prefs); }
function setupAppearance() {
  applyPrefs(getPrefs());
  $('#theme-toggle')?.addEventListener('click', () => updatePrefs({theme: root.dataset.theme === 'dark' ? 'light' : 'dark'}));
  $('#customize-open')?.addEventListener('click', () => $('#customizer')?.showModal());
  document.querySelectorAll('[data-theme-option]').forEach(b => b.addEventListener('click', () => updatePrefs({theme:b.dataset.themeOption})));
  document.querySelectorAll('[data-scale]').forEach(b => b.addEventListener('click', () => updatePrefs({scale:b.dataset.scale})));
  document.querySelectorAll('[data-radius]').forEach(b => b.addEventListener('click', () => updatePrefs({radius:b.dataset.radius})));
  $('#motion-toggle')?.addEventListener('change', e => updatePrefs({motion:e.target.checked}));
  $('#reset-appearance')?.addEventListener('click', () => { savePrefs(defaultPrefs); applyPrefs(defaultPrefs); });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (getPrefs().theme === 'system') applyPrefs(getPrefs()); });
}

document.querySelectorAll('#year').forEach(el => el.textContent = new Date().getFullYear());
setupAppearance();
loadPortfolio();
loadBlog();
loadArticle();
loadProject();
