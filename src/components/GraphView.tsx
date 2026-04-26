import { useEffect, useState, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

interface GraphViewProps {
  onSelectNode: (path: string) => void;
}

export default function GraphView({ onSelectNode }: GraphViewProps) {
  const [graphData, setGraphData] = useState<{ nodes: any[], links: any[] }>({ nodes: [], links: [] });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoverNode, setHoverNode] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);

  useEffect(() => {
    fetch('/api/graph')
      .then(res => res.json())
      .then(data => {
        if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) return;
        
        // Compute connections
        data.nodes.forEach((n: any) => n.connectionsCount = 0);
        data.edges.forEach((e: any) => {
          const source = data.nodes.find((n: any) => n.id === e.source);
          const target = data.nodes.find((n: any) => n.id === e.target);
          if (source) source.connectionsCount++;
          if (target) target.connectionsCount++;
        });
        setGraphData({ nodes: data.nodes, links: data.edges });
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      });
    }
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

  const uniqueTags = new Set<string>();
  graphData.nodes.forEach(n => {
    if (n.tags && n.tags.length) n.tags.forEach((t: string) => uniqueTags.add(t));
    else if (n.category) uniqueTags.add(n.category);
  });

  const handleNodeHover = useCallback((node: any) => {
    setHoverNode(node);
  }, []);

  const centerGraph = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50);
    }
  };

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
        onNodeClick={(node) => onSelectNode(node.id)}
        backgroundColor="transparent"
        linkColor={(link) => {
          const isLinked = hoverNode && (link.source.id === hoverNode.id || link.target.id === hoverNode.id);
          return isLinked ? 'rgba(0, 209, 255, 0.4)' : 'rgba(255, 255, 255, 0.05)';
        }}
        linkWidth={(link) => {
          const isLinked = hoverNode && (link.source.id === hoverNode.id || link.target.id === hoverNode.id);
          return isLinked ? 2 : 1;
        }}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const isHovered = node === hoverNode;
          const label = node.title;
          const fontSize = 12 / globalScale;
          const radius = (node.connectionsCount ? 5 + Math.sqrt(node.connectionsCount) * 2 : 5) / (globalScale < 1 ? 1 : Math.sqrt(globalScale));
          const color = getCategoryColor(node.category || (node.tags && node.tags[0]));

          // Glow effect
          if (isHovered) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
          }

          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
          ctx.fill();

          // Reset shadow
          ctx.shadowBlur = 0;

          // Labels
          if (globalScale > 1.5 || isHovered) {
            ctx.font = `${fontSize}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = isHovered ? '#fff' : 'rgba(255, 255, 255, 0.6)';
            ctx.fillText(label, node.x, node.y + radius + 2);
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

      {uniqueTags.size > 0 && (
        <div className="graph-legend animate-fade">
          <div className="graph-legend-title">LEGEND</div>
          <div className="legend-items">
            {Array.from(uniqueTags).sort().map(tag => (
              <div key={tag} className="legend-item">
                <div className="dot" style={{ background: getCategoryColor(tag) }}></div>
                <span>{tag}</span>
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
            {(hoverNode.tags?.length ? hoverNode.tags : (hoverNode.category ? [hoverNode.category] : [])).map((t: string) => (
              <span key={t} className="graph-tooltip-tag" style={{ background: getCategoryColor(t) + '22', color: getCategoryColor(t) }}>{t}</span>
            ))}
          </div>
          <div className="graph-tooltip-meta">
            <i className="fa-solid fa-link"></i> {hoverNode.connectionsCount} connection{hoverNode.connectionsCount !== 1 ? 's' : ''}
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
