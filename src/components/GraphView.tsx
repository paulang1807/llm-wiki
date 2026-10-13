import { useEffect, useState, useRef, useCallback } from 'react';
import ForceGraph2D, { ForceGraphMethods, NodeObject, LinkObject } from 'react-force-graph-2d';
import { PageNode, Edge } from '@/lib/types';

interface GraphViewProps {
  onSelectNode: (path: string) => void;
}

type GraphNode = NodeObject<PageNode & { connectionsCount?: number }>;
type GraphLink = LinkObject<PageNode & { connectionsCount?: number }, Edge>;

function getEndpointId(endpoint: string | number | GraphNode | undefined): string {
  if (!endpoint) return '';
  if (typeof endpoint === 'object') return String(endpoint.id || '');
  return String(endpoint);
}

export default function GraphView({ onSelectNode }: GraphViewProps) {
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: [], links: [] });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<ForceGraphMethods<GraphNode, GraphLink> | undefined>(undefined);

  useEffect(() => {
    fetch('/api/graph')
      .then(res => res.json())
      .then((data: { nodes?: PageNode[]; edges?: Edge[] }) => {
        if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) return;

        const nodes: GraphNode[] = data.nodes.map(n => ({ ...n, connectionsCount: 0 }));
        const links: GraphLink[] = data.edges.map(e => ({ ...e }));

        links.forEach(e => {
          const sourceId = getEndpointId(e.source);
          const targetId = getEndpointId(e.target);
          const source = nodes.find(n => n.id === sourceId);
          const target = nodes.find(n => n.id === targetId);
          if (source) source.connectionsCount = (source.connectionsCount || 0) + 1;
          if (target) target.connectionsCount = (target.connectionsCount || 0) + 1;
        });
        setGraphData({ nodes, links });
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 800,
          height: containerRef.current.clientHeight || 600
        });
      }
    };

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        updateSize();
      });
      observer.observe(el);
    }

    const rafId = requestAnimationFrame(updateSize);
    window.addEventListener('resize', updateSize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateSize);
      observer?.disconnect();
    };
  }, []);

  // Dynamic Color Generator
  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      intuit: '#00d1ff',
      databricks: '#ff3621',
      mlops: '#10b981',
      qliksense: '#8b5cf6'
    };

    if (!cat) return '#94a3b8';
    const lowerCat = cat.toLowerCase();
    if (colors[lowerCat]) return colors[lowerCat];

    // Hash-based color for unknown categories
    let hash = 0;
    for (let i = 0; i < lowerCat.length; i++) {
      hash = lowerCat.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${Math.abs(hash % 360)}, 70%, 60%)`;
  };

  const isValidGraphTag = (tag: string) => {
    const cleaned = tag.trim().replace(/^#+/, '').trim();
    if (cleaned.length < 2) return false;
    if (cleaned.toLowerCase() === 'needs-linking' || cleaned.toLowerCase() === 'needs-tagging') return false;
    const alphaNum = cleaned.match(/[a-z0-9]/gi);
    return Boolean(alphaNum && alphaNum.length >= 2);
  };

  const uniqueCategories = new Set<string>();
  graphData.nodes.forEach(n => {
    if (n.category && isValidGraphTag(n.category)) {
      uniqueCategories.add(n.category);
    } else if (n.tags && n.tags.length) {
      n.tags.filter(isValidGraphTag).forEach((t: string) => uniqueCategories.add(t));
    }
  });

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    setHoverNode(node);
  }, []);

  const centerGraph = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50);
    }
  };

  const hoverMeaningfulTags = hoverNode?.tags?.filter(isValidGraphTag) ?? [];

  return (
    <div className="graph-view" ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeId="id"
        nodeLabel=""
        onNodeHover={handleNodeHover}
        onNodeClick={(node) => {
          if (node.id) onSelectNode(String(node.id));
        }}
        backgroundColor="transparent"
        linkColor={(link) => {
          const sourceId = getEndpointId(link.source);
          const targetId = getEndpointId(link.target);
          const isLinked = hoverNode && (sourceId === hoverNode.id || targetId === hoverNode.id);
          return isLinked ? 'rgba(0, 209, 255, 0.4)' : 'rgba(255, 255, 255, 0.05)';
        }}
        linkWidth={(link) => {
          const sourceId = getEndpointId(link.source);
          const targetId = getEndpointId(link.target);
          const isLinked = hoverNode && (sourceId === hoverNode.id || targetId === hoverNode.id);
          return isLinked ? 2 : 1;
        }}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const isHovered = node === hoverNode;
          const label = node.title || String(node.id);
          const fontSize = 12 / globalScale;
          const radius = (node.connectionsCount ? 5 + Math.sqrt(node.connectionsCount) * 2 : 5) / (globalScale < 1 ? 1 : Math.sqrt(globalScale));
          const color = getCategoryColor(node.category);
          const x = node.x ?? 0;
          const y = node.y ?? 0;

          // Glow effect
          if (isHovered) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
          }

          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
          ctx.fill();

          // Reset shadow
          ctx.shadowBlur = 0;

          // Labels
          if (globalScale > 1.5 || isHovered) {
            ctx.font = `${fontSize}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = isHovered ? '#fff' : 'rgba(255, 255, 255, 0.6)';
            ctx.fillText(label, x, y + radius + 2);
          }
        }}
        nodeCanvasObjectMode={() => 'replace'}
      />

      <div className="graph-controls">
        <button className="graph-control-btn" onClick={centerGraph} title="Center Graph">
          <i className="fa-solid fa-expand"></i>
        </button>
      </div>

      <div className="graph-stats-overlay animate-up">
        <div className="graph-stats-title">KNOWLEDGE GRAPH</div>
        <div className="graph-stats-counts">{graphData.nodes.length} nodes &middot; {graphData.links.length} connections</div>
      </div>

      {uniqueCategories.size > 0 && (
        <div className="graph-legend animate-fade">
          <div className="graph-legend-title">LEGEND</div>
          <div className="legend-items">
            {Array.from(uniqueCategories).sort().map(category => (
              <div key={category} className="legend-item">
                <div className="dot" style={{ background: getCategoryColor(category) }}></div>
                <span>{category}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {hoverNode && (
        <div className="graph-tooltip" style={{
          top: '20px',
          right: '20px',
          left: 'auto',
          transform: 'none',
          display: 'block',
          width: '300px'
        }}>
          <div className="graph-tooltip-title">{hoverNode.title}</div>
          <div className="graph-tooltip-tags">
            {hoverMeaningfulTags.length > 0 ? (
              hoverMeaningfulTags.map((t: string) => (
                <span key={t} className="graph-tooltip-tag" style={{ background: getCategoryColor(t) + '22', color: getCategoryColor(t) }}>{t}</span>
              ))
            ) : (
              <span className="graph-tooltip-tag" style={{ background: getCategoryColor(hoverNode.category) + '22', color: getCategoryColor(hoverNode.category) }}>{hoverNode.category}</span>
            )}
          </div>
          <div className="graph-tooltip-meta">
            <i className="fa-solid fa-link"></i> {hoverNode.connectionsCount || 0} connection{hoverNode.connectionsCount !== 1 ? 's' : ''}
          </div>
          {hoverNode.snippet && <div className="graph-tooltip-snippet">{hoverNode.snippet}</div>}
          <div className="graph-tooltip-footer">Click to navigate</div>
        </div>
      )}

      <div className="graph-footer-hint">
        <span><i className="fa-solid fa-mouse"></i> Drag to pan</span>
        <span><i className="fa-solid fa-arrows-up-down"></i> Scroll to zoom</span>
        <span><i className="fa-solid fa-hand-pointer"></i> Click to open</span>
      </div>
    </div>
  );
}
