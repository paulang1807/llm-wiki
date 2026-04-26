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

  // Category Colors
  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      intuit: '#58a6ff', databricks: '#3fb950', mlops: '#ff7b72',
      feature_selection: '#d2a8ff', mape: '#e3b341', xgboost: '#1f6feb',
      forecasting: '#238636', qliksense: '#bc8cff'
    };
    if (!cat) return '#8b949e';
    return colors[cat.toLowerCase()] || '#8b949e';
  };

  const uniqueTags = new Set<string>();
  graphData.nodes.forEach(n => {
    if (n.tags && n.tags.length) n.tags.forEach((t: string) => uniqueTags.add(t));
    else if (n.category) uniqueTags.add(n.category);
  });

  const handleNodeHover = useCallback((node: any) => {
    setHoverNode(node);
  }, []);

  return (
    <div className="graph-view" ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeId="id"
        nodeLabel=""
        onNodeHover={handleNodeHover}
        onNodeClick={(node) => onSelectNode(node.id)}
        backgroundColor="#0d1117"
        linkColor={(link) => {
          const isLinked = hoverNode && (link.source.id === hoverNode.id || link.target.id === hoverNode.id);
          return isLinked ? 'rgba(88, 166, 255, 0.5)' : 'rgba(130, 130, 130, 0.2)';
        }}
        linkWidth={(link) => {
          const isLinked = hoverNode && (link.source.id === hoverNode.id || link.target.id === hoverNode.id);
          return isLinked ? 1.5 : 0.8;
        }}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const isHovered = node === hoverNode;
          let nodeTag = node.category;
          if (node.tags && node.tags.length > 0) nodeTag = node.tags[0];
          
          ctx.fillStyle = getCategoryColor(nodeTag);
          ctx.beginPath();
          ctx.arc(node.x, node.y, isHovered ? 8 : 5, 0, 2 * Math.PI, false);
          ctx.fill();
        }}
      />

      <div className="graph-stats-overlay">
        <div className="graph-stats-title">KNOWLEDGE GRAPH</div>
        <div className="graph-stats-counts">{graphData.nodes.length} pages &middot; {graphData.links.length} connections</div>
      </div>

      {uniqueTags.size > 0 && (
        <div className="graph-legend" style={{ display: 'block' }}>
          <div className="graph-legend-title">TAGS</div>
          {Array.from(uniqueTags).sort().map(tag => (
            <div key={tag} className="legend-item">
              <div className="dot" style={{ background: getCategoryColor(tag) }}></div>
              <span>{tag}</span>
            </div>
          ))}
        </div>
      )}

      {hoverNode && (
        <div className="graph-tooltip" style={{ display: 'block', top: hoverNode.y + 20, left: hoverNode.x + 20 }}>
          <div className="graph-tooltip-title">{hoverNode.title}</div>
          <div className="graph-tooltip-tags">
            {(hoverNode.tags?.length ? hoverNode.tags : (hoverNode.category ? [hoverNode.category] : [])).map((t: string) => (
              <span key={t} className="graph-tooltip-tag">{t}</span>
            ))}
          </div>
          <div className="graph-tooltip-meta">{hoverNode.connectionsCount} connection{hoverNode.connectionsCount !== 1 ? 's' : ''}</div>
          {hoverNode.snippet && <div className="graph-tooltip-snippet">{hoverNode.snippet}</div>}
          <div className="graph-tooltip-footer">Click to select &middot; Right-click to open</div>
        </div>
      )}
      
      <div className="graph-footer-hint">Click to select &middot; Scroll to zoom &middot; Drag to pan</div>
    </div>
  );
}
