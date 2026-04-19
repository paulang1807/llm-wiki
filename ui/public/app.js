/**
 * LLM Wiki UI - Frontend Application Logic
 */

const state = {
  tree: [],
  pageIndex: {},
  currentPage: null,
  view: 'read', // 'read' or 'graph'
  graph: { nodes: [], edges: [] },
  history: []
};

// ── DOM Elements ──────────────────────────────────────────────

const elements = {
  wikiNav: document.getElementById('wikiNav'),
  pageView: document.getElementById('pageView'),
  welcome: document.getElementById('welcome'),
  welcomeGrid: document.getElementById('welcomeGrid'),
  pageTitle: document.getElementById('pageTitle'),
  breadcrumb: document.getElementById('breadcrumb'),
  markdownBody: document.getElementById('markdownBody'),
  tagList: document.getElementById('tagList'),
  confidenceBadge: document.getElementById('confidenceBadge'),
  searchInput: document.getElementById('searchInput'),
  searchResults: document.getElementById('searchResults'),
  sidebar: document.getElementById('sidebar'),
  sidebarToggle: document.getElementById('sidebarToggle'),
  btnRead: document.getElementById('btnRead'),
  btnGraph: document.getElementById('btnGraph'),
  graphView: document.getElementById('graphView'),
  graphCanvas: document.getElementById('graphCanvas'),
  relatedSection: document.getElementById('relatedSection'),
  relatedList: document.getElementById('relatedList'),
  sourcesSection: document.getElementById('sourcesSection'),
  sourcesList: document.getElementById('sourcesList'),
  metaSection: document.getElementById('metaSection'),
  metaList: document.getElementById('metaList'),
  infoWelcome: document.getElementById('infoWelcome'),
  statsText: document.getElementById('statsText')
};

// ── Initialization ───────────────────────────────────────────

async function init() {
  await Promise.all([
    loadTree(),
    loadIndex(),
    loadStats()
  ]);

  setupEventListeners();
  renderWelcomeGrid();

  // Load page from URL hash if present
  const hash = window.location.hash.slice(1);
  if (hash) {
    loadPage(hash);
  }

  // Handle back/forward buttons
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.path) {
      loadPage(e.state.path, false);
    }
  });
}

// ── API Calls ────────────────────────────────────────────────

async function loadTree() {
  const res = await fetch('/api/tree');
  state.tree = await res.json();
  renderNav(state.tree, elements.wikiNav);
}

async function loadIndex() {
  const res = await fetch('/api/index');
  state.pageIndex = await res.json();
}

async function loadStats() {
  const res = await fetch('/api/stats');
  const stats = await res.json();
  elements.statsText.textContent = `${stats.wikiPages} pages`;
}

async function loadPage(path, pushState = true) {
  try {
    const res = await fetch(`/api/page?path=${encodeURIComponent(path)}`);
    if (!res.ok) throw new Error('Page not found');
    const data = await res.json();
    
    state.currentPage = data;
    renderPage(data);

    if (pushState) {
      window.history.pushState({ path }, '', `#${path}`);
    }

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.path === path);
    });

    // Switch to read view if in graph
    if (state.view !== 'read') {
      setView('read');
    }
  } catch (err) {
    console.error(err);
  }
}

// ── Rendering ────────────────────────────────────────────────

function renderNav(tree, container, depth = 0) {
  container.innerHTML = '';
  tree.forEach(node => {
    if (node.type === 'dir') {
      const dirLabel = document.createElement('div');
      dirLabel.className = 'nav-item nav-dir';
      dirLabel.style.paddingLeft = `${20 + depth * 15}px`;
      dirLabel.textContent = node.name;
      container.appendChild(dirLabel);
      renderNav(node.children, container, depth + 1);
    } else {
      const item = document.createElement('div');
      item.className = 'nav-item';
      item.dataset.path = node.path;
      item.style.paddingLeft = `${20 + depth * 15}px`;
      item.innerHTML = `<span class="nav-icon">${getCategoryEmoji(node.title)}</span> ${node.title}`;
      item.addEventListener('click', () => loadPage(node.path));
      container.appendChild(item);
    }
  });
}

function renderPage(data) {
  elements.welcome.style.display = 'none';
  elements.pageView.style.display = 'block';
  elements.infoWelcome.style.display = 'none';

  elements.pageTitle.textContent = data.frontmatter.title || data.path;
  elements.breadcrumb.textContent = data.path.split('/').slice(0, -1).join(' / ');

  // Frontmatter
  elements.tagList.innerHTML = (data.frontmatter.tags || [])
    .map(t => `<span class="tag">${t}</span>`).join('');
  
  const confidence = data.frontmatter.confidence || 0;
  elements.confidenceBadge.style.display = confidence ? 'flex' : 'none';
  elements.confidenceBadge.textContent = `${Math.round(confidence * 100)}% Confidence`;
  elements.confidenceBadge.style.color = confidence > 0.8 ? '#3fb950' : (confidence > 0.6 ? '#d29922' : '#f85149');

  // Body
  let html = marked.parse(data.body);
  
  // Resolve Wikilinks [[Title]] or [[Title|Display]]
  html = html.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, title, display) => {
    const cleanTitle = title.trim();
    const displayText = display ? display.trim() : cleanTitle;
    const path = state.pageIndex[cleanTitle] || state.pageIndex[cleanTitle.toLowerCase()];
    
    if (path) {
      return `<span class="wikilink" onclick="navigateWiki('${path}')">${displayText}</span>`;
    } else {
      return `<span class="wikilink-broken" title="Page not found">${displayText}</span>`;
    }
  });

  elements.markdownBody.innerHTML = html;
  elements.pageView.scrollTop = 0;

  // Sidebar Panels
  renderRelated(data.frontmatter.related || []);
  renderSources(data.frontmatter.sources || []);
  renderMeta(data.frontmatter);
}

function renderRelated(related) {
  if (!related || related.length === 0) {
    elements.relatedSection.style.display = 'none';
    return;
  }
  elements.relatedSection.style.display = 'block';
  elements.relatedList.innerHTML = related.map(link => {
    // extract from [[Link]]
    const title = link.replace(/[\[\]]/g, '');
    const path = state.pageIndex[title] || state.pageIndex[title.toLowerCase()];
    return `
      <div class="info-item">
        <a href="#" class="info-link" onclick="navigateWiki('${path || ''}')">
          ${getCategoryEmoji(title)} ${title}
        </a>
      </div>
    `;
  }).join('');
}

function renderSources(sources) {
  if (!sources || sources.length === 0) {
    elements.sourcesSection.style.display = 'none';
    return;
  }
  elements.sourcesSection.style.display = 'block';
  elements.sourcesList.innerHTML = sources.map(s => `
    <div class="info-item">
      <div class="info-link" title="${s}">📄 ${s.split('/').pop()}</div>
    </div>
  `).join('');
}

function renderMeta(fm) {
  elements.metaSection.style.display = 'block';
  elements.metaList.innerHTML = `
    <div class="info-item" style="color: var(--text-dim); font-size: 0.75rem;">
      Updated: ${fm.last_updated || 'Unknown'}<br>
      Category: ${fm.category || 'None'}<br>
      Stale: ${fm.stale ? '<span style="color:#f85149">Yes</span>' : 'No'}
    </div>
  `;
}

function renderWelcomeGrid() {
  const cards = [
    { title: 'Python', icon: '🐍', path: 'python/python-basics.md', desc: 'Core language, OOP, and testing.' },
    { title: 'Machine Learning', icon: '🤖', path: 'ml/ml-workflow.md', desc: 'Workflows, Algorithms, and Stats.' },
    { title: 'Generative AI', icon: '🧠', path: 'genai/llm-concepts.md', desc: 'LLMs, RAG, and Agents.' },
    { title: 'Statistics', icon: '📊', path: 'concepts/statistics-basics.md', desc: 'Foundations and ML math.' }
  ];

  elements.welcomeGrid.innerHTML = cards.map(c => `
    <div class="welcome-card" onclick="navigateWiki('${c.path}')">
      <div class="welcome-card-icon">${c.icon}</div>
      <div class="welcome-card-title">${c.title}</div>
      <div class="welcome-card-desc">${c.desc}</div>
    </div>
  `).join('');
}

// ── Graph View ───────────────────────────────────────────────

let graphSimulation = null;

async function loadGraph() {
  const res = await fetch('/api/graph');
  state.graph = await res.json();
  renderGraph();
}

function renderGraph() {
  const canvas = elements.graphCanvas;
  const ctx = canvas.getContext('2d');
  
  // Set size
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  ctx.scale(dpr, dpr);

  const nodes = state.graph.nodes.map(n => ({ ...n, x: Math.random() * canvas.clientWidth, y: Math.random() * canvas.clientHeight }));
  const edges = state.graph.edges.map(e => ({
    source: nodes.find(n => n.id === e.source),
    target: nodes.find(n => n.id === e.target)
  })).filter(e => e.source && e.target);

  let transform = { x: canvas.clientWidth / 2, y: canvas.clientHeight / 2, k: 1 };
  let hoveredNode = null;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);

    // Edges
    ctx.strokeStyle = 'rgba(48, 54, 61, 0.5)';
    ctx.lineWidth = 1;
    edges.forEach(e => {
      ctx.beginPath();
      ctx.moveTo(e.source.x, e.source.y);
      ctx.lineTo(e.target.x, e.target.y);
      ctx.stroke();
    });

    // Nodes
    nodes.forEach(n => {
      ctx.fillStyle = getCategoryColor(n.category);
      ctx.beginPath();
      ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
      ctx.fill();
      
      if (transform.k > 0.8) {
        ctx.fillStyle = n === hoveredNode ? '#fff' : 'rgba(230, 237, 243, 0.7)';
        ctx.font = '10px Inter';
        ctx.fillText(n.title, n.x + 10, n.y + 4);
      }
    });

    ctx.restore();
  }

  // Animation loop (very simple physics)
  function simulate() {
    nodes.forEach(n => {
      // Pull to center
      n.x += (0 - n.x) * 0.01;
      n.y += (0 - n.y) * 0.01;
      
      // Repulsion
      nodes.forEach(other => {
        if (n === other) return;
        const dx = n.x - other.x;
        const dy = n.y - other.y;
        const dist = Math.sqrt(dx*dx + dy*dy) || 1;
        if (dist < 150) {
          const force = (150 - dist) / 1000;
          n.x += dx * force;
          n.y += dy * force;
        }
      });
    });
    
    edges.forEach(e => {
      const dx = e.target.x - e.source.x;
      const dy = e.target.y - e.source.y;
      const dist = Math.sqrt(dx*dx + dy*dy) || 1;
      const force = (dist - 100) * 0.01;
      e.source.x += dx * force;
      e.source.y += dy * force;
      e.target.x -= dx * force;
      e.target.y -= dy * force;
    });

    draw();
    graphSimulation = requestAnimationFrame(simulate);
  }

  simulate();

  // Mouse interactivity
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left - transform.x) / transform.k;
    const my = (e.clientY - rect.top - transform.y) / transform.k;
    
    hoveredNode = nodes.find(n => {
      const dx = n.x - mx;
      const dy = n.y - my;
      return Math.sqrt(dx*dx + dy*dy) < 10;
    });
    
    canvas.style.cursor = hoveredNode ? 'pointer' : 'grab';
  });

  canvas.addEventListener('click', () => {
    if (hoveredNode) {
      cancelAnimationFrame(graphSimulation);
      loadPage(hoveredNode.id);
    }
  });

  // Pan and zoom
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const scaleFactor = 1.05;
    if (e.deltaY < 0) transform.k *= scaleFactor;
    else transform.k /= scaleFactor;
  });
}

// ── Utils ────────────────────────────────────────────────────

function setupEventListeners() {
  elements.sidebarToggle.addEventListener('click', () => {
    elements.sidebar.style.display = elements.sidebar.style.display === 'none' ? 'block' : 'none';
  });

  elements.btnRead.addEventListener('click', () => setView('read'));
  elements.btnGraph.addEventListener('click', () => setView('graph'));

  // Search
  elements.searchInput.addEventListener('input', debounce(async (e) => {
    const val = e.target.value;
    if (val.length < 2) {
      elements.searchResults.style.display = 'none';
      return;
    }
    const res = await fetch(`/api/search?q=${encodeURIComponent(val)}`);
    const results = await res.json();
    renderSearchResults(results);
  }, 300));

  // Global Keybindings
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== elements.searchInput) {
      e.preventDefault();
      elements.searchInput.focus();
    }
    if (e.key === 'Escape') {
      elements.searchResults.style.display = 'none';
      elements.searchInput.blur();
    }
  });
}

function setView(view) {
  state.view = view;
  elements.btnRead.classList.toggle('active', view === 'read');
  elements.btnGraph.classList.toggle('active', view === 'graph');
  
  if (view === 'read') {
    elements.graphView.style.display = 'none';
    elements.pageView.style.display = state.currentPage ? 'block' : 'none';
    elements.welcome.style.display = state.currentPage ? 'none' : 'flex';
    if (graphSimulation) cancelAnimationFrame(graphSimulation);
  } else {
    elements.graphView.style.display = 'block';
    elements.pageView.style.display = 'none';
    elements.welcome.style.display = 'none';
    loadGraph();
  }
}

function renderSearchResults(results) {
  if (results.length === 0) {
    elements.searchResults.innerHTML = '<div class="search-result-item" style="color: var(--text-dim)">No results found</div>';
  } else {
    elements.searchResults.innerHTML = results.map(r => `
      <div class="search-result-item" onclick="navigateWiki('${r.path}')">
        <div class="search-result-title">${getCategoryEmoji(r.title)} ${r.title}</div>
        <div class="search-result-snippet">${r.snippet}</div>
      </div>
    `).join('');
  }
  elements.searchResults.style.display = 'block';
}

window.navigateWiki = function(path) {
  if (!path) return;
  elements.searchResults.style.display = 'none';
  elements.searchInput.value = '';
  loadPage(path);
};

function getCategoryEmoji(title) {
  const t = title.toLowerCase();
  if (t.includes('python')) return '🐍';
  if (t.includes('ml') || t.includes('machine learning')) return '🤖';
  if (t.includes('genai') || t.includes('llm')) return '🧠';
  if (t.includes('stat') || t.includes('prob')) return '📊';
  if (t.includes('overview') || t.includes('index')) return '📋';
  return '📄';
}

function getCategoryColor(cat) {
  switch (cat) {
    case 'python': return '#3776ab';
    case 'ml': return '#d29922';
    case 'genai': return '#58a6ff';
    case 'concepts': return '#8b949e';
    default: return '#30363d';
  }
}

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Start
init();
