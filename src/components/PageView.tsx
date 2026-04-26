import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PageViewProps {
  filePath: string;
  onRefresh: () => void;
  onClose: () => void;
}

export default function PageView({ filePath, onRefresh, onClose }: PageViewProps) {
  const [content, setContent] = useState<string>('');
  const [frontmatter, setFrontmatter] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/page?path=${encodeURIComponent(filePath)}&t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        setContent(data.content || '');
        setFrontmatter(data.frontmatter || {});
        setEditContent(data.content || '');
        setEditTitle(data.frontmatter?.title || '');
        setEditDate(data.frontmatter?.last_updated || new Date().toISOString());
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setContent('Error loading page content.');
        setIsLoading(false);
      });
  }, [filePath]);

  const handleSave = async () => {
    const res = await fetch('/api/page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: filePath,
        content: editContent,
        frontmatter: {
          ...frontmatter,
          title: editTitle,
          last_updated: editDate
        }
      })
    });
    if (res.ok) {
      setIsEditing(false);
      onRefresh();
      // Reload current data
      const data = await res.json();
      // Need to re-fetch or use returned data
      fetch(`/api/page?path=${encodeURIComponent(filePath)}&t=${Date.now()}`)
        .then(r => r.json())
        .then(d => {
          setContent(d.content);
          setFrontmatter(d.frontmatter);
        });
    }
  };

  const handleArchive = async () => {
    if (!confirm('Are you sure you want to archive this page?')) return;
    const res = await fetch(`/api/page?path=${encodeURIComponent(filePath)}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      onRefresh();
      onClose();
    }
  };

  if (isLoading) {
    return <div className="page-view"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="page-view animate-fade">
      <div className="markdown-body animate-up">
        {isEditing ? (
          <div className="editor-view">
            <h2 style={{ marginBottom: '24px' }}>Edit Knowledge</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label className="info-label">Title</label>
                <input 
                  type="text" 
                  className="action-btn"
                  value={editTitle} 
                  onChange={e => setEditTitle(e.target.value)}
                  style={{ width: '100%', textAlign: 'left', padding: '12px' }}
                />
              </div>
              <div>
                <label className="info-label">Last Updated</label>
                <input 
                  type="text" 
                  className="action-btn"
                  value={editDate} 
                  onChange={e => setEditDate(e.target.value)}
                  style={{ width: '100%', textAlign: 'left', padding: '12px' }}
                />
              </div>
            </div>
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              className="action-btn"
              style={{ flex: 1, minHeight: '500px', textAlign: 'left', padding: '24px', fontFamily: 'var(--font-mono)', lineHeight: '1.6' }}
            />
            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <button className="action-btn btn-primary" onClick={handleSave} style={{ width: 'auto', padding: '12px 32px' }}>Save Changes</button>
              <button className="action-btn" onClick={() => setIsEditing(false)} style={{ width: 'auto' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        )}
      </div>
      
      <div className="info-panel">
        <div className="info-section animate-up" style={{ animationDelay: '0.1s' }}>
          <div className="info-label">Metadata</div>
          <div className="info-item">
            <i className="fa-solid fa-heading" style={{ color: 'var(--accent)', opacity: 0.8 }}></i>
            <span>{frontmatter.title || 'Untitled'}</span>
          </div>
          <div className="info-item">
            <i className="fa-solid fa-folder" style={{ color: 'var(--accent)', opacity: 0.8 }}></i>
            <span>{frontmatter.category || 'Uncategorized'}</span>
          </div>
          <div className="info-item">
            <i className="fa-solid fa-calendar-day" style={{ color: 'var(--accent)', opacity: 0.8 }}></i>
            <span>{frontmatter.last_updated || 'No date'}</span>
          </div>
          {frontmatter.tags && frontmatter.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {frontmatter.tags.map((tag: string) => (
                <span key={tag} style={{ fontSize: '0.7rem', padding: '4px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '100px', color: 'var(--text-dim)' }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="info-section animate-up" style={{ animationDelay: '0.2s' }}>
          <div className="info-label">Management</div>
          <button className="action-btn" onClick={() => setIsEditing(true)}>
            <i className="fa-solid fa-pen-to-square"></i> Edit Content
          </button>
          <button className="action-btn btn-danger" onClick={handleArchive}>
            <i className="fa-solid fa-box-archive"></i> Archive Page
          </button>
        </div>

        <div className="info-section animate-up" style={{ animationDelay: '0.3s' }}>
          <div className="info-label">Properties</div>
          <div style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>Confidence</span>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{frontmatter.confidence ? `${frontmatter.confidence * 100}%` : 'N/A'}</span>
             </div>
             <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${(frontmatter.confidence || 0) * 100}%`, height: '100%', background: 'var(--accent)' }}></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
