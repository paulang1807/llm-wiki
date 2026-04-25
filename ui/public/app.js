/**
 * LLM Wiki UI - Frontend Application Logic
 */

const state = {
  tree: [],
  pageIndex: {},
  currentPage: null,
  view: 'read', // 'read' or 'graph'
  graph: { nodes: [], edges: [] },
  history: [],
  ai: {
    isOpen: false,
    provider: 'gemini',
    geminiReady: false,
    messages: []
  },
  isEditing: false
};
function appendLog(msg, type) {
  if (!elements.ingestLog) return;
  const div = document.createElement('div');
  div.className = `log-entry ${type}`;
  div.textContent = msg;
  elements.ingestLog.appendChild(div);
  elements.ingestLog.scrollTop = elements.ingestLog.scrollHeight;
}

function showIngestConsole() {
  if (elements.ingestConsoleSection) {
    elements.ingestConsoleSection.classList.add('visible');
  }
}

function hideIngestConsole() {
  if (elements.ingestConsoleSection) {
    elements.ingestConsoleSection.classList.remove('visible');
  }
}

// ── DOM Elements ──────────────────────────────────────────────

const elements = {
  wikiNav: document.getElementById('wikiNav'),
  pageView: document.getElementById('pageView'),
  logo: document.getElementById('logo'),
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
  btnHelp: document.getElementById('btnHelp'),
  helpModal: document.getElementById('helpModal'),
  closeHelp: document.getElementById('closeHelp'),
  statsText: document.getElementById('statsText'),
  
  // Chat Elements
  btnAI: document.getElementById('btnAI'),
  chatDrawer: document.getElementById('chatDrawer'),
  chatClose: document.getElementById('chatClose'),
  chatMessages: document.getElementById('chatMessages'),
  chatInput: document.getElementById('chatInput'),
  btnChatSend: document.getElementById('btnChatSend'),
  btnProviderSettings: document.getElementById('btnProviderSettings'),
  providerStatus: document.getElementById('providerStatus'),
  chatSetup: document.getElementById('chatSetup'),
  btnSaveSetup: document.getElementById('btnSaveSetup'),
  selectProvider: document.getElementById('selectProvider'),
  geminiSetup: document.getElementById('geminiSetup'),
  ollamaSetup: document.getElementById('ollamaSetup'),
  
  // Management Elements
  btnNewPage: document.getElementById('btnNewPage'),
  btnEdit: document.getElementById('btnEdit'),
  btnArchive: document.getElementById('btnArchive'),
  editorView: document.getElementById('editorView'),
  editorPath: document.getElementById('editorPath'),
  editorTextarea: document.getElementById('editorTextarea'),
  btnSave: document.getElementById('btnSave'),
  btnCancel: document.getElementById('btnCancel'),
  
  // Ingestion Elements

  btnIngest: document.getElementById('btnIngest'),
  ingestView: document.getElementById('ingestView'),
  ingestDropZone: document.getElementById('ingestDropZone'),
  ingestFileInput: document.getElementById('ingestFileInput'),
  ingestUploadList: document.getElementById('ingestUploadList'),
  ingestFileList: document.getElementById('ingestFileList'),
  ingestEmptyState: document.getElementById('ingestEmptyState'),
  btnProcessInbox: document.getElementById('btnProcessInbox'),
  ingestResult: document.getElementById('ingestResult'),
  dropZone: document.getElementById('dropZone'),
  statusToast: document.getElementById('statusToast'),
  statusText: document.getElementById('statusText'),
  ingestLog: document.getElementById('ingestLog'),
  ingestConsoleSection: document.getElementById('ingestConsoleSection'),
  btnCancelConsole: document.getElementById('btnCancelConsole'),
  ingestPasteText: document.getElementById('ingestPasteText'),
  ingestPasteTitle: document.getElementById('ingestPasteTitle'),
  ingestPasteDate: document.getElementById('ingestPasteDate'),
  btnSavePaste: document.getElementById('btnSavePaste'),
  btnCancelPaste: document.getElementById('btnCancelPaste'),
  queueCount: document.getElementById('queueCount')
};

// ── Initialization ───────────────────────────────────────────

async function init() {
  console.log('LLM Wiki: Initializing...');
  try {
    // Load initial data in parallel, but with individual catch blocks to prevent total failure
    await Promise.all([
      loadTree().catch(e => console.error('Failed to load tree:', e)),
      loadIndex().catch(e => console.error('Failed to load index:', e)),
      loadStats().catch(e => console.error('Failed to load stats:', e))
    ]);

    setupEventListeners();
    renderWelcomeGrid();
    checkAIStatus();
    console.log('LLM Wiki: Initialization complete.');
  } catch (err) {
    console.error('LLM Wiki: Critical initialization error:', err);
    // Fallback: at least enable events so the UI isn't dead
    setupEventListeners();
  }

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

async function loadTree(t = Date.now()) {
  const res = await fetch(`/api/tree?t=${t}`);
  state.tree = await res.json();
  console.log(`[REFRESH] Tree loaded at t=${t}: ${state.tree.length} top-level nodes.`);
  renderNav(state.tree, elements.wikiNav);
}

async function loadIndex(t = Date.now()) {
  const res = await fetch(`/api/index?t=${t}`);
  state.pageIndex = await res.json();
}

async function loadStats(t = Date.now()) {
  const res = await fetch(`/api/stats?t=${t}`);
  const stats = await res.json();
  elements.statsText.textContent = `${stats.wikiPages} pages`;
}

async function refreshUI() {
  const t = Date.now();
  console.log(`Refreshing UI (t=${t})...`);
  try {
    // Sequential await to avoid overwhelming the server and ensure data consistency
    await loadTree(t);
    await loadIndex(t);
    await loadStats(t);
    await renderWelcomeGrid(t);
    await loadIngestView(t);
    console.log(`UI Refresh complete (t=${t}).`);
  } catch (err) {
    console.error(`Refresh UI failed (t=${t}):`, err);
  }
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
  if (depth === 0) container.innerHTML = '';
  tree.forEach(node => {
    if (node.type === 'dir') {
      const dirLabel = document.createElement('div');
      dirLabel.className = 'nav-item nav-dir';
      dirLabel.style.paddingLeft = `${20 + depth * 15}px`;
      dirLabel.textContent = node.name.toUpperCase();
      container.appendChild(dirLabel);
      renderNav(node.children, container, depth + 1);
    } else {
      const item = document.createElement('div');
      item.className = 'nav-item';
      item.dataset.path = node.path;
      item.style.paddingLeft = `${20 + depth * 15}px`;
      item.innerHTML = `<span class="nav-icon">${getCategoryEmoji(node.title)}</span> ${node.title}`;
      item.onclick = () => {
        console.log('Navigating to:', node.path);
        loadPage(node.path);
      };
      container.appendChild(item);
    }
  });
}

function renderPage(data) {
  elements.welcome.style.display = 'none';
  elements.pageView.style.display = 'block';

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
  renderSources(data.frontmatter.sources || [], data.frontmatter.source_url);
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

function renderSources(sources, sourceUrl) {
  const hasSources = sources && sources.length > 0;
  const hasSourceUrl = !!sourceUrl;
  
  if (!hasSources && !hasSourceUrl) {
    elements.sourcesSection.style.display = 'none';
    return;
  }
  
  elements.sourcesSection.style.display = 'block';
  let html = '';
  
  if (hasSourceUrl) {
    html += `
      <div class="info-item">
        <a href="${sourceUrl}" target="_blank" class="info-link" title="${sourceUrl}" style="display: flex; align-items: center; gap: 6px; text-decoration: none;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          Original Source
        </a>
      </div>
    `;
  }
  
  if (hasSources) {
    html += sources.map(s => `
      <div class="info-item">
        <div class="info-link" title="${s}">📄 ${s.split('/').pop()}</div>
      </div>
    `).join('');
  }
  
  elements.sourcesList.innerHTML = html;
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

async function renderWelcomeGrid(t = Date.now()) {
  try {
    const res = await fetch(`/api/domains?t=${t}`);
    const domains = await res.json();
    
    if (domains.length === 0) {
      elements.welcomeGrid.innerHTML = `
        <div class="welcome-card empty">
          <div class="welcome-card-icon">📭</div>
          <div class="welcome-card-title">Empty Wiki</div>
          <div class="welcome-card-desc">Start by uploading notes to your inbox.</div>
        </div>
      `;
      return;
    }

    elements.welcomeGrid.innerHTML = domains.map(d => `
      <div class="welcome-card" onclick="navigateWiki('${d.path}')">
        <div class="welcome-card-icon">${d.icon}</div>
        <div class="welcome-card-title">${d.name}</div>
        <div class="welcome-card-desc">${d.desc}</div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to render welcome grid:', err);
    elements.welcomeGrid.innerHTML = '<p class="error">Failed to load domains.</p>';
  }
}

// ── Graph View ───────────────────────────────────────────────

let graphSimulation = null;
let graphListeners = []; // Track listeners so we can remove them on re-render

async function loadGraph() {
  const res = await fetch('/api/graph');
  const data = await res.json();
  // View Guard: If user switched away while fetching, don't render
  if (state.view !== 'graph') return;
  state.graph = data;
  renderGraph();
}

function renderGraph() {
  // Stop any existing simulation
  if (graphSimulation) {
    cancelAnimationFrame(graphSimulation);
    graphSimulation = null;
  }

  // Use an AbortController so all listeners from this render can be removed
  // cleanly when renderGraph is called again (no cloneNode shenanigans needed).
  if (renderGraph._abort) renderGraph._abort.abort();
  const abort = new AbortController();
  renderGraph._abort = abort;
  const sig = abort.signal;

  const cvs = elements.graphCanvas;
  const ctx = cvs.getContext('2d');

  // Wait one frame so display:block has been applied and clientWidth is valid
  requestAnimationFrame(() => {
    if (state.view !== 'graph') return;

    const dpr = window.devicePixelRatio || 1;
    const W = cvs.clientWidth || 800;
    const H = cvs.clientHeight || 600;
    cvs.width  = W * dpr;
    cvs.height = H * dpr;
    // Do NOT call ctx.scale(dpr, dpr) here — we handle DPR inside draw() instead

    // Build node objects with initial positions spread around center
    const nodes = (state.graph.nodes || []).map(n => ({
      ...n,
      x: (Math.random() - 0.5) * W * 0.5,
      y: (Math.random() - 0.5) * H * 0.5
    }));

    // Resolve edges to node references
    const edges = (state.graph.edges || []).map(e => ({
      source: nodes.find(n => n.id === e.source),
      target: nodes.find(n => n.id === e.target)
    })).filter(e => e.source && e.target);

    let transform = { x: W / 2, y: H / 2, k: 1 };
    let hoveredNode = null;

    // ── Draw ──────────────────────────────────────────────────
    function draw() {
      // Clear entire backing-store canvas (raw pixels)
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      // Fill background so canvas isn't transparent
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, cvs.width, cvs.height);
      ctx.save();
      // Scale for HiDPI then apply pan/zoom
      ctx.scale(dpr, dpr);
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      // Edges
      edges.forEach(e => {
        const linked = hoveredNode && (e.source === hoveredNode || e.target === hoveredNode);
        ctx.strokeStyle = linked ? '#58a6ff' : 'rgba(130,130,130,0.55)';
        ctx.lineWidth   = linked ? 2 : 1.2;
        ctx.beginPath();
        ctx.moveTo(e.source.x, e.source.y);
        ctx.lineTo(e.target.x, e.target.y);
        ctx.stroke();

        // Arrow head at 70% of edge
        if (transform.k > 0.4) drawArrow(e.source, e.target, linked);
      });

      // Nodes
      nodes.forEach(n => {
        const isHovered = n === hoveredNode;
        ctx.shadowBlur  = isHovered ? 14 : 0;
        ctx.shadowColor = '#58a6ff';
        ctx.fillStyle   = getCategoryColor(n.category);
        ctx.beginPath();
        ctx.arc(n.x, n.y, isHovered ? 8 : 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur  = 0;

        // Label
        if (transform.k > 0.7 || isHovered) {
          ctx.fillStyle = isHovered ? '#ffffff' : 'rgba(220,228,236,0.8)';
          ctx.font      = isHovered ? 'bold 11px Inter, sans-serif' : '10px Inter, sans-serif';
          ctx.fillText(n.title, n.x + 10, n.y + 4);
        }
      });

      ctx.restore();
    }

    function drawArrow(src, tgt, highlighted) {
      const dx   = tgt.x - src.x;
      const dy   = tgt.y - src.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 30) return;
      const angle = Math.atan2(dy, dx);
      const hl    = 8;
      const ax    = src.x + dx * 0.7;
      const ay    = src.y + dy * 0.7;
      ctx.strokeStyle = highlighted ? '#58a6ff' : 'rgba(130,130,130,0.55)';
      ctx.lineWidth   = highlighted ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - hl * Math.cos(angle - Math.PI / 6), ay - hl * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - hl * Math.cos(angle + Math.PI / 6), ay - hl * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    }

    // ── Physics ───────────────────────────────────────────────
    function simulate() {
      nodes.forEach(n => {
        if (!isFinite(n.x)) n.x = 0;
        if (!isFinite(n.y)) n.y = 0;

        // Gravity toward center
        n.x += (0 - n.x) * 0.008;
        n.y += (0 - n.y) * 0.008;

        // Node repulsion
        nodes.forEach(m => {
          if (m === n) return;
          const dx   = n.x - m.x;
          const dy   = n.y - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
          if (dist < 160) {
            const f = (160 - dist) / 1200;
            n.x += dx * f;
            n.y += dy * f;
          }
        });
      });

      // Edge spring attraction
      edges.forEach(e => {
        const dx   = e.target.x - e.source.x;
        const dy   = e.target.y - e.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
        const f    = (dist - 120) * 0.008;
        e.source.x += dx * f;
        e.source.y += dy * f;
        e.target.x -= dx * f;
        e.target.y -= dy * f;
      });

      draw();
      graphSimulation = requestAnimationFrame(simulate);
    }

    // ── Event Listeners ───────────────────────────────────────
    cvs.addEventListener('mousemove', e => {
      const rect = cvs.getBoundingClientRect();
      const mx   = (e.clientX - rect.left  - transform.x) / transform.k;
      const my   = (e.clientY - rect.top   - transform.y) / transform.k;
      hoveredNode = nodes.find(n => {
        const dx = n.x - mx, dy = n.y - my;
        return Math.sqrt(dx * dx + dy * dy) < 10;
      }) || null;
      cvs.style.cursor = hoveredNode ? 'pointer' : 'grab';
    }, { signal: sig });

    cvs.addEventListener('click', () => {
      if (hoveredNode) {
        cancelAnimationFrame(graphSimulation);
        graphSimulation = null;
        setView('read');
        loadPage(hoveredNode.id);
      }
    }, { signal: sig });

    cvs.addEventListener('wheel', e => {
      e.preventDefault();
      transform.k *= e.deltaY < 0 ? 1.08 : 0.93;
    }, { passive: false, signal: sig });

    let drag = null;
    cvs.addEventListener('mousedown', e => {
      drag = { startX: e.clientX - transform.x, startY: e.clientY - transform.y };
      cvs.style.cursor = 'grabbing';
    }, { signal: sig });
    cvs.addEventListener('mousemove', e => {
      if (!drag) return;
      transform.x = e.clientX - drag.startX;
      transform.y = e.clientY - drag.startY;
    }, { signal: sig });
    cvs.addEventListener('mouseup',    () => { drag = null; cvs.style.cursor = 'grab'; }, { signal: sig });
    cvs.addEventListener('mouseleave', () => { drag = null; }, { signal: sig });

    // Start simulation
    simulate();
  });
}

// ── Utils ────────────────────────────────────────────────────

function setupEventListeners() {
  elements.sidebarToggle.addEventListener('click', () => {
    elements.sidebar.style.display = elements.sidebar.style.display === 'none' ? 'block' : 'none';
  });

  // Logo click → go home
  elements.logo.addEventListener('click', goHome);

  elements.btnGraph.addEventListener('click', () => setView('graph'));
  elements.btnIngest.addEventListener('click', () => setView('ingest'));
  elements.btnRead.addEventListener('click', () => {
    // If on graph or ingest, go back to read view
    setView('read');
  });
  
  // AI Chat
  elements.btnAI.addEventListener('click', toggleChat);
  elements.chatClose.addEventListener('click', toggleChat);
  elements.btnChatSend.addEventListener('click', askAI);
  elements.btnProviderSettings.addEventListener('click', showSetup);
  elements.btnSaveSetup.addEventListener('click', saveSetup);
  elements.selectProvider.addEventListener('change', (e) => {
    elements.geminiSetup.style.display = e.target.value === 'gemini' ? 'block' : 'none';
    elements.ollamaSetup.style.display = e.target.value === 'ollama' ? 'block' : 'none';
  });
  
  // Management
  elements.btnNewPage.addEventListener('click', createNewPage);
  elements.btnEdit.addEventListener('click', toggleEdit);
  elements.btnArchive.addEventListener('click', archivePage);
  elements.btnSave.addEventListener('click', savePage);
  elements.btnCancel.addEventListener('click', () => setEditMode(false));
  
  // Help Modal
  if (elements.btnHelp) {
    elements.btnHelp.addEventListener('click', () => {
      elements.helpModal.showModal();
    });
  }
  if (elements.closeHelp) {
    elements.closeHelp.addEventListener('click', () => {
      elements.helpModal.close();
    });
  }
  if (elements.helpModal) {
    elements.helpModal.addEventListener('click', (e) => {
      const dialogDimensions = elements.helpModal.getBoundingClientRect();
      if (
        e.clientX < dialogDimensions.left ||
        e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top ||
        e.clientY > dialogDimensions.bottom
      ) {
        elements.helpModal.close();
      }
    });
  }
  // Ingestion (sidebar button still available as shortcut)

  // Ingest view drag/drop and file input are wired in loadIngestView()

  elements.chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askAI();
    }
  });

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
  elements.btnRead.classList.toggle('active',   view === 'read');
  elements.btnGraph.classList.toggle('active',  view === 'graph');
  elements.btnIngest.classList.toggle('active', view === 'ingest');

  // Hide all switchable views first
  elements.graphView.style.display  = 'none';
  elements.ingestView.style.display = 'none';

  if (view === 'read') {
    elements.pageView.style.display = state.currentPage ? 'block' : 'none';
    elements.welcome.style.display  = state.currentPage ? 'none'  : 'flex';
    if (graphSimulation) { cancelAnimationFrame(graphSimulation); graphSimulation = null; }
    if (renderGraph._abort) { renderGraph._abort.abort(); renderGraph._abort = null; }
  } else if (view === 'graph') {
    elements.pageView.style.display = 'none';
    elements.welcome.style.display  = 'none';
    elements.graphView.style.display = 'block';
    loadGraph();
  } else if (view === 'ingest') {
    elements.pageView.style.display  = 'none';
    elements.welcome.style.display   = 'none';
    elements.ingestView.style.display = 'block';
    if (graphSimulation) { cancelAnimationFrame(graphSimulation); graphSimulation = null; }
    if (renderGraph._abort) { renderGraph._abort.abort(); renderGraph._abort = null; }
    loadIngestView();
  }
}

function goHome() {
  // Stop graph/ingest if running
  if (graphSimulation) { cancelAnimationFrame(graphSimulation); graphSimulation = null; }
  if (renderGraph._abort) { renderGraph._abort.abort(); renderGraph._abort = null; }

  // Clear state
  state.currentPage = null;
  state.view = 'read';

  // Update UI
  elements.graphView.style.display  = 'none';
  elements.ingestView.style.display = 'none';
  elements.pageView.style.display   = 'none';
  elements.welcome.style.display    = 'flex';

  // Update button states
  elements.btnRead.classList.add('active');
  elements.btnGraph.classList.remove('active');
  elements.btnIngest.classList.remove('active');

  // Clear URL hash without triggering a page load
  window.history.pushState({}, '', '/');
}

window.goHome = goHome;

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
  switch ((cat || '').toLowerCase()) {
    case 'python':   return '#3b8fd4';  // blue
    case 'ml':       return '#e3b341';  // amber
    case 'genai':    return '#58a6ff';  // bright blue
    case 'concepts': return '#a371f7';  // purple
    case 'os':       return '#3fb950';  // green
    case 'meta':     return '#f78166';  // coral/red
    default:         return '#79c0ff';  // light blue fallback
  }
}

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// ── Management Logic ─────────────────────────────────────────

function setEditMode(active) {
  state.isEditing = active;
  elements.markdownBody.style.display = active ? 'none' : 'block';
  elements.editorView.style.display = active ? 'flex' : 'none';
  elements.btnEdit.style.display = active ? 'none' : 'block';
  elements.btnArchive.style.display = active ? 'none' : 'block';
  if (active && state.ai.isOpen) toggleChat(); // Close AI when editing
}

function toggleEdit() {
  if (!state.currentPage) return;
  elements.editorPath.value = state.currentPage.path;
  elements.editorPath.disabled = true;
  elements.editorTextarea.value = state.currentPage.raw;
  setEditMode(true);
}

function createNewPage() {
  state.currentPage = null;
  elements.pageView.style.display = 'block';
  elements.welcome.style.display = 'none';
  elements.pageTitle.textContent = 'New Wiki Page';
  elements.breadcrumb.textContent = 'root';
  elements.tagList.innerHTML = '';
  elements.confidenceBadge.style.display = 'none';
  
  elements.editorPath.value = '';
  elements.editorPath.disabled = false;
  elements.editorTextarea.value = '---\ntitle: New Page\nlast_updated: ' + new Date().toISOString().split('T')[0] + '\ncategory: meta\ntags: []\nconfidence: 1.0\n---\n\nWrite content here...';
  
  setEditMode(true);
}

async function savePage() {
  const path = elements.editorPath.value.trim();
  const content = elements.editorTextarea.value;
  
  if (!path) {
    alert('Path is required (e.g. category/my-page.md)');
    return;
  }

  elements.btnSave.disabled = true;
  elements.btnSave.textContent = 'Saving...';

  try {
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, content })
    });
    
    if (!res.ok) throw new Error('Failed to save');
    const resData = await res.json();
    
    setEditMode(false);
    
    // Refresh UI
    await refreshUI();
    loadPage(resData.path || path);
    
  } catch (err) {
    alert('Error saving page: ' + err.message);
  } finally {
    elements.btnSave.disabled = false;
    elements.btnSave.textContent = 'Save Changes';
  }
}

async function archivePage() {
  if (!state.currentPage) return;
  if (!confirm(`Are you sure you want to archive "${state.currentPage.frontmatter.title || state.currentPage.path}"?`)) return;

  try {
    const res = await fetch('/api/archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: state.currentPage.path })
    });
    
    if (!res.ok) throw new Error('Failed to archive');
    
    state.currentPage = null;
    elements.pageView.style.display = 'none';
    elements.welcome.style.display = 'flex';
    
    await Promise.all([loadTree(), loadIndex(), loadStats()]);
    
  } catch (err) {
    alert('Error archiving page: ' + err.message);
  }
}

// ── Ingestion Logic ──────────────────────────────────────────

const FILE_ICONS = { '.md': '📝', '.pdf': '📄', '.txt': '📃', '.rtf': '📋' };

function fileIcon(name) {
  const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
  return FILE_ICONS[ext] || '📎';
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

async function loadIngestView(t = Date.now()) {
  // ── Load inbox file list ─────────────────────────────────────
  try {
    const res = await fetch(`/api/inbox-files?t=${t}`);
    const files = await res.json();
    console.log(`[REFRESH] Inbox loaded at t=${t}: ${files.length} files.`);
    const list = elements.ingestFileList;

    if (files.length === 0) {
      list.innerHTML = '<div class="ingest-empty">Inbox is empty — upload files or place them in <code>raw/inbox/</code></div>';
    } else {
      list.innerHTML = files.map(f => `
        <div class="ingest-file-item">
          <span class="ingest-file-icon">${fileIcon(f.name)}</span>
          <span class="ingest-file-name">${f.name}</span>
          <span class="ingest-file-size">${formatSize(f.size)}</span>
        </div>`).join('');
    }
    elements.queueCount.textContent = `${files.length} file${files.length === 1 ? '' : 's'}`;
  } catch (e) {
    elements.ingestFileList.innerHTML = '<div class="ingest-empty">Could not read inbox.</div>';
  }

  // ── Drag & Drop on the ingest drop zone ──────────────────────
  const dz = elements.ingestDropZone;
  if (!dz) return;

  // Re-bind buttons because they might be inside a part of the DOM that was refreshed
  elements.btnProcessInbox = document.getElementById('btnProcessInbox');
  elements.ingestFileList = document.getElementById('ingestFileList');
  elements.queueCount = document.getElementById('queueCount');
  elements.ingestFileInput = document.getElementById('ingestFileInput');

  // Hide console if not currently processing
  if (!state.isProcessing) {
    hideIngestConsole();
  }

  dz.ondragover = e => {
    e.preventDefault();
    dz.classList.add('drag-over');
  };
  dz.ondragleave = e => {
    dz.classList.remove('drag-over');
  };
  dz.ondrop = async e => {
    e.preventDefault();
    dz.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files);
    if (files.length) await handleIngestFiles(files);
  };

  // ── File picker ───────────────────────────────────────────────
  elements.ingestFileInput.onchange = async e => {
    const files = Array.from(e.target.files);
    if (files.length) await handleIngestFiles(files);
    e.target.value = '';  // allow re-selecting same file
  };

  // ── Process inbox button ──────────────────────────────────────
  elements.btnProcessInbox.onclick = async () => {
    const result = elements.ingestResult;
    result.style.display = 'none';
    showIngestConsole();
    await ingestInbox();
  };

  // ── Paste note button (Single-Click Ingest) ──────────────────
  elements.btnSavePaste.onclick = async () => {
    const content = elements.ingestPasteText.value.trim();
    const title = elements.ingestPasteTitle.value.trim();
    const date = elements.ingestPasteDate.value;
    
    if (!content) return;

    showIngestConsole();
    elements.btnSavePaste.disabled = true;
    elements.btnSavePaste.textContent = 'Ingesting...';

    try {
      elements.ingestLog.innerHTML = '';
      appendLog('Connecting to AI ingestion stream...', 'info');
      const res = await fetch('/api/paste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title, date, ingestImmediate: true })
      });

      await processIngestionStream(res, elements.btnSavePaste);

      elements.ingestPasteText.value = '';
      elements.ingestPasteTitle.value = '';
      elements.ingestPasteDate.value = '';
    } catch (err) {
      alert('Error: ' + err.message);
      elements.btnSavePaste.disabled = false;
      elements.btnSavePaste.textContent = 'Save & Ingest';
    }
  };

  elements.btnCancelPaste.onclick = () => {
    elements.ingestPasteText.value = '';
    elements.ingestPasteTitle.value = '';
    elements.ingestPasteDate.value = '';
  };

  // ── Link ingestion button ────────────────────────────────────
  const btnSaveLink = document.getElementById('btnSaveLink');
  const btnCancelLink = document.getElementById('btnCancelLink');
  const ingestLinkUrl = document.getElementById('ingestLinkUrl');
  const ingestLinkDate = document.getElementById('ingestLinkDate');

  btnSaveLink.onclick = async () => {
    const url = ingestLinkUrl.value.trim();
    const date = ingestLinkDate.value;
    if (!url) return;

    showIngestConsole();
    elements.ingestLog.innerHTML = '';
    btnSaveLink.disabled = true;
    btnSaveLink.textContent = 'Fetching...';
    appendLog(`Connecting to AI ingestion stream for ${url}...`, 'info');

    try {
      const res = await fetch('/api/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, date, ingestImmediate: true })
      });

      await processIngestionStream(res, btnSaveLink);

      ingestLinkUrl.value = '';
      ingestLinkDate.value = '';
    } catch (err) {
      alert('Error: ' + err.message);
      btnSaveLink.disabled = false;
      btnSaveLink.textContent = 'Ingest Link';
    }
  };

  btnCancelLink.onclick = () => {
    ingestLinkUrl.value = '';
    ingestLinkDate.value = '';
  };

  // ── Console close button ──────────────────────────────────────
  if (elements.btnCancelConsole) {
    elements.btnCancelConsole.onclick = () => hideIngestConsole();
  }
}

// ── Tab Switching ──────────────────────────────────────────
function switchIngestTab(tab) {
  const tabs = document.querySelectorAll('.ingest-tab');
  const panes = document.querySelectorAll('.tab-pane');
  
  tabs.forEach(t => t.classList.remove('active'));
  panes.forEach(p => p.classList.remove('active'));
  
  if (tab === 'upload') {
    document.getElementById('tabUpload').classList.add('active');
    document.getElementById('contentUpload').classList.add('active');
  } else if (tab === 'paste') {
    document.getElementById('tabPaste').classList.add('active');
    document.getElementById('contentPaste').classList.add('active');
  } else if (tab === 'link') {
    document.getElementById('tabLink').classList.add('active');
    document.getElementById('contentLink').classList.add('active');
  }
}

async function handleIngestFiles(files) {
  const uploadList = elements.ingestUploadList;
  uploadList.innerHTML = '';

  for (const file of files) {
    const item = document.createElement('div');
    item.className = 'ingest-upload-item';
    item.innerHTML = `<span>${fileIcon(file.name)} ${file.name}</span><span class="ingest-uploading">Uploading…</span>`;
    uploadList.appendChild(item);

    try {
      await uploadFile(file);
      item.querySelector('.ingest-uploading').textContent = '✓ Added to inbox';
      item.querySelector('.ingest-uploading').className = 'ingest-upload-ok';
    } catch {
      item.querySelector('.ingest-uploading').textContent = '✗ Failed';
      item.querySelector('.ingest-uploading').className = 'ingest-upload-err';
    }
  }
  // Refresh file list after upload
  await loadIngestView();
}

async function handleDrop(e) {
  e.preventDefault();
  elements.dropZone.style.display = 'none';
  
  const files = Array.from(e.dataTransfer.files);
  if (files.length === 0) return;

  showToast(`Uploading ${files.length} file(s)...`);
  
  try {
    for (const file of files) {
      await uploadFile(file);
    }
    showToast('Starting Ingestion...');
    await ingestInbox();
  } catch (err) {
    showToast('Upload failed: ' + err.message);
    setTimeout(hideToast, 3000);
  }
}

async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });

  if (!res.ok) throw new Error('Failed to upload ' + file.name);
  return await res.json();
}

async function processIngestionStream(response, btnElement) {
  let finalResult = null;
  try {
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Server returned ${response.status}: ${errText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let partial = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = (partial + chunk).split('\n');
      partial = lines.pop();

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          if (data.FINAL_RESULT) finalResult = data;
          if (data.message) appendLog(data.message, data.type);
        } catch (e) {
          // If not JSON, just append as raw step
          appendLog(line, 'step');
        }
      }
    }

  } catch (err) {
    console.error('Ingestion stream error:', err);
    appendLog('Stream Error: ' + err.message, 'error');
    showToast('Ingestion failed.');
  } finally {
    state.isProcessing = false;
    if (btnElement) {
      btnElement.disabled = false;
      if (btnElement.id === 'btnSavePaste') btnElement.textContent = 'Save & Ingest';
      if (btnElement.id === 'btnSaveLink') btnElement.textContent = 'Ingest Link';
    }
    
    if (finalResult) {
      if (finalResult.processed > 0) {
        showToast(`Successfully ingested ${finalResult.processed} note(s)!`);
      } else if (finalResult.total_in_inbox === 0) {
        showToast('Inbox is empty.');
      }
    }
    
    setTimeout(hideToast, 4000);
    
    console.log('Ingestion finished, triggering primary refresh...');
    await new Promise(r => setTimeout(r, 1500));
    await refreshUI();
    
    for (let i = 1; i <= 3; i++) {
        const freshQueueCount = document.getElementById('queueCount');
        const countText = freshQueueCount ? freshQueueCount.textContent : 'unknown';
        if (countText !== '0 files') {
            console.log(`[RETRY ${i}] Inbox still not empty (${countText}), refreshing again...`);
            await new Promise(r => setTimeout(r, 2000));
            await refreshUI();
        } else {
            console.log(`[SUCCESS] Inbox reported empty after ${i-1} retries.`);
            break;
        }
    }
  }
}

async function ingestInbox() {
  if (state.isProcessing) return;
  state.isProcessing = true;
  
  showIngestConsole();
  elements.ingestLog.innerHTML = '';
  elements.ingestResult.style.display = 'none';
  if (elements.btnProcessInbox) elements.btnProcessInbox.disabled = true;
  
  appendLog('Connecting to AI ingestion stream...', 'info');

  try {
    const response = await fetch('/api/ingest-inbox', { method: 'POST' });
    await processIngestionStream(response, elements.btnProcessInbox);
  } catch (err) {
    console.error('ingestInbox error:', err);
    appendLog('Network Error: ' + err.message, 'error');
    state.isProcessing = false;
    if (elements.btnProcessInbox) elements.btnProcessInbox.disabled = false;
  }
}

function showToast(text) {
  elements.statusText.textContent = text;
  elements.statusToast.style.display = 'flex';
}

function hideToast() {
  elements.statusToast.style.display = 'none';
}

// ── AI Assistant Logic ───────────────────────────────────────

async function checkAIStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    state.ai.geminiReady = data.geminiReady;
    state.ai.provider = data.defaultProvider;
    updateProviderStatus();
  } catch (err) {
    console.error('Failed to check AI status:', err);
  }
}

function updateProviderStatus() {
  const p = state.ai.provider;
  const ready = p === 'gemini' ? state.ai.geminiReady : true;
  elements.providerStatus.innerHTML = `
    <span style="color: ${ready ? '#3fb950' : '#f85149'}">●</span> 
    Using ${p.charAt(0).toUpperCase() + p.slice(1)} ${!ready ? '(Unconfigured)' : ''}
  `;
}

function toggleChat() {
  state.ai.isOpen = !state.ai.isOpen;
  elements.chatDrawer.classList.toggle('open', state.ai.isOpen);
  if (state.ai.isOpen) {
    if (!state.ai.geminiReady && state.ai.provider === 'gemini') {
      showSetup();
    }
    setTimeout(() => elements.chatInput.focus(), 400);
  }
}

function showSetup() {
  elements.chatMessages.style.display = 'none';
  elements.chatSetup.style.display = 'block';
}

function saveSetup() {
  state.ai.provider = elements.selectProvider.value;
  // Local only update for now (won't persist to .env but works for sess)
  updateProviderStatus();
  elements.chatSetup.style.display = 'none';
  elements.chatMessages.style.display = 'flex';
}

async function askAI() {
  const text = elements.chatInput.value.trim();
  if (!text) return;

  // Add user message
  addMessage('user', text);
  elements.chatInput.value = '';
  elements.btnChatSend.disabled = true;

  // Add typing indicator
  const typingId = 'typing-' + Date.now();
  addMessage('ai', 'Thinking...', typingId);

  try {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: text,
        provider: state.ai.provider,
        model: state.ai.provider === 'ollama' ? document.getElementById('ollamaModel').value : null
      })
    });
    
    const data = await res.json();
    const typingEl = document.getElementById(typingId);
    
    if (data.error) {
      typingEl.innerHTML = `<span style="color:#f85149">Error: ${data.error}</span>`;
    } else {
      typingEl.innerHTML = `<div class="markdown-body">${marked.parse(data.answer)}</div>`;
      if (data.sources && data.sources.length > 0) {
        const sourcesHtml = `<div class="msg-sources">Sources: ${data.sources.join(', ')}</div>`;
        typingEl.innerHTML += sourcesHtml;
      }
    }
  } catch (err) {
    document.getElementById(typingId).textContent = 'Error: Failed to connect to server.';
  } finally {
    elements.btnChatSend.disabled = false;
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
  }
}

function addMessage(role, text, id = null) {
  const msg = document.createElement('div');
  msg.className = `message ${role}`;
  if (id) msg.id = id;
  msg.textContent = text;
  elements.chatMessages.appendChild(msg);
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

window.quickAsk = function(q) {
  if (!state.ai.isOpen) toggleChat();
  elements.chatInput.value = q;
  askAI();
};

// Start
init();
