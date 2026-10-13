import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Frontmatter } from '@/lib/types';

interface PageViewProps {
  filePath: string;
  onRefresh: () => void;
  onClose: () => void;
  onSelectFile: (path: string) => void;
}

export default function PageView({ filePath, onRefresh, onClose, onSelectFile }: PageViewProps) {
  const [content, setContent] = useState<string>('');
  const [frontmatter, setFrontmatter] = useState<Frontmatter>({});
  const [index, setIndex] = useState<Record<string, string>>({});
  const [loadedPath, setLoadedPath] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [isSourceHovered, setIsSourceHovered] = useState(false);

  const isLoading = loadedPath !== filePath;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/page?path=${encodeURIComponent(filePath)}&t=${Date.now()}`)
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load page');
        }
        return data;
      })
      .then(data => {
        if (cancelled) return;
        setContent(data.content || '');
        setFrontmatter(data.frontmatter || {});
        setIndex(data.index || {});
        setEditContent(data.content || '');
        setEditTitle(data.frontmatter?.title || '');
        setEditDate(data.frontmatter?.last_updated || new Date().toISOString().split('T')[0]);
        setLoadedPath(filePath);
      })
      .catch(err => {
        if (cancelled) return;
        console.error(err);
        setContent('Error loading page content.');
        setLoadedPath(filePath);
      });

    return () => {
      cancelled = true;
    };
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
      fetch(`/api/page?path=${encodeURIComponent(filePath)}&t=${Date.now()}`)
        .then(r => r.json())
        .then(d => {
          setContent(d.content || '');
          setFrontmatter(d.frontmatter || {});
          setIndex(d.index || {});
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
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              a: (props) => {
                const { href = '', children, ...rest } = props;
                const isBroken = href === '#broken-link';
                const isInternal = !href.startsWith('http') && !isBroken;
                
                if (isBroken) {
                  return (
                    <span style={{ textDecoration: 'underline', color: 'var(--text-dim)', cursor: 'help' }} title="Linked page not found">
                      {children}
                    </span>
                  );
                }

                return (
                  <a 
                    {...rest}
                    href={href}
                    onClick={(e) => {
                      if (isInternal) {
                        e.preventDefault();
                        onSelectFile(decodeURIComponent(href));
                      }
                    }}
                    style={{ color: 'var(--accent)', textDecoration: 'none', borderBottom: '1px solid transparent' }}
                    onMouseEnter={e => e.currentTarget.style.borderBottom = '1px solid var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.borderBottom = '1px solid transparent'}
                  >
                    {children}
                  </a>
                );
              }
            }}
          >
            {content.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_match, title, alias) => {
              const cleanTitle = title.trim();
              const display = (alias || title).trim();
              const resolvedPath = index[cleanTitle] || index[cleanTitle.toLowerCase()];
              return resolvedPath ? `[${display}](${encodeURI(resolvedPath)})` : `[${display}](#broken-link)`;
            })}
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
            <span>{frontmatter.category || filePath.split('/')[0] || 'Uncategorized'}</span>
          </div>
          <div className="info-item">
            <i className="fa-solid fa-calendar-day" style={{ color: 'var(--accent)', opacity: 0.8 }}></i>
            <span>{frontmatter.last_updated || 'No date'}</span>
          </div>
          {frontmatter.tags && (Array.isArray(frontmatter.tags) ? frontmatter.tags.length > 0 : typeof frontmatter.tags === 'string') && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {(Array.isArray(frontmatter.tags) ? frontmatter.tags : frontmatter.tags.split(',')).map((tag: string) => {
                const cleanTag = tag.trim().replace(/^#+/, '').trim().replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');
                const alphaNum = cleanTag.match(/[a-z0-9]/gi);
                if (cleanTag.length < 2 || !alphaNum || alphaNum.length < 2) return null;
                return (
                  <span key={cleanTag} style={{ fontSize: '0.7rem', padding: '4px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '100px', color: 'var(--text-dim)' }}>
                    #{cleanTag}
                  </span>
                );
              })}
            </div>
          )}
          {(() => {
            const sourceUrl = typeof frontmatter.source === 'string' ? frontmatter.source.trim() : '';
            const hasValidSource = sourceUrl.length > 0 && !['n/a', 'none', 'null', 'undefined'].includes(sourceUrl.toLowerCase());
            if (!hasValidSource) return null;
            return (
              <div
                className="info-item source-link-wrapper"
                style={{ marginTop: '16px', wordBreak: 'break-all' }}
                onMouseEnter={() => setIsSourceHovered(true)}
                onMouseOver={() => setIsSourceHovered(true)}
                onMouseLeave={() => setIsSourceHovered(false)}
                onFocus={() => setIsSourceHovered(true)}
                onBlur={() => setIsSourceHovered(false)}
              >
                <i className="fa-solid fa-link" style={{ color: 'var(--accent)', opacity: 0.8 }}></i>
                <a
                  href={sourceUrl}
                  title={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent)', fontSize: '0.8rem', textDecoration: 'underline' }}
                >
                  Source Link
                </a>
                <span
                  role="tooltip"
                  className={`source-link-tooltip${isSourceHovered ? ' visible' : ''}`}
                >
                  {sourceUrl}
                </span>
              </div>
            );
          })()}
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
          {(() => {
            const rawConf = frontmatter.confidence;
            const parsedConf = typeof rawConf === 'number' ? rawConf : typeof rawConf === 'string' ? parseFloat(rawConf) : NaN;
            const normalizedConf = !Number.isNaN(parsedConf) && parsedConf > 0
              ? (parsedConf > 1 ? Math.min(1, parsedConf / 100) : parsedConf)
              : 0.85;
            return (
              <div style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Confidence</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{`${Math.round(normalizedConf * 100)}%`}</span>
                </div>
                <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${normalizedConf * 100}%`, height: '100%', background: 'var(--accent)' }}></div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
