import { useEffect, useState } from 'react';
import { TreeNode } from '@/lib/types';

interface SidebarProps {
  isOpen: boolean;
  onToggle?: () => void;
  onSelectFile: (path: string) => void;
  currentFile: string | null;
  treeVersion: number;
}

export default function Sidebar({ isOpen, onSelectFile, currentFile, treeVersion }: SidebarProps) {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch(`/api/tree?t=${Date.now()}`)
      .then(res => res.json())
      .then((data: TreeNode[]) => {
        if (Array.isArray(data)) setTree(data);
      })
      .catch(err => console.error('Failed to load tree:', err));
  }, [treeVersion]);

  const toggleDir = (dirKey: string) => {
    setExpandedDirs(prev => ({
      ...prev,
      [dirKey]: !prev[dirKey]
    }));
  };

  const renderTree = (items: TreeNode[], depth = 0, parentKey = ''): React.ReactNode[] => {
    let result: React.ReactNode[] = [];
    if (!Array.isArray(items)) return result;

    items.forEach((item, index) => {
      const nodeKey = parentKey + '-' + (item.path || item.name) + '-' + index;
      if (item.type === 'dir') {
        const isExpanded = expandedDirs[nodeKey] !== false; // Default true
        result.push(
          <div
            key={nodeKey + '-dir'}
            className="nav-item nav-dir"
            style={{ paddingLeft: `${24 + depth * 16}px`, cursor: 'pointer', pointerEvents: 'auto' }}
            onClick={() => toggleDir(nodeKey)}
          >
            <i className={`fa-solid ${isExpanded ? 'fa-chevron-down' : 'fa-chevron-right'}`} style={{ fontSize: '0.6rem', width: '12px', opacity: 0.5 }}></i>
            <i className={`fa-solid ${isExpanded ? 'fa-folder-open' : 'fa-folder'}`} style={{ color: isExpanded ? 'var(--accent)' : 'inherit' }}></i>
            {item.name}
          </div>
        );
        if (isExpanded && item.children) {
          result = result.concat(renderTree(item.children, depth + 1, nodeKey));
        }
      } else {
        result.push(
          <div
            key={nodeKey + '-file'}
            className={`nav-item ${currentFile === item.path ? 'active' : ''}`}
            style={{ paddingLeft: `${24 + depth * 16 + 24}px`, cursor: 'pointer' }}
            onClick={() => item.path && onSelectFile(item.path)}
          >
            <i className="fa-regular fa-file-lines" style={{ opacity: 0.7 }}></i>
            <span>{item.title || item.name}</span>
          </div>
        );
      }
    });
    return result;
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-section">
        <div className="sidebar-label">Tools</div>
        <div className={`nav-item ${currentFile === '__health__' ? 'active' : ''}`} onClick={() => onSelectFile('__health__')}>
          <i className="fa-solid fa-heart-pulse"></i> Knowledge Health
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">KNOWLEDGE BASE</div>
        <div className="nav-tree">
          {renderTree(tree)}
        </div>
      </div>
    </aside>
  );
}
