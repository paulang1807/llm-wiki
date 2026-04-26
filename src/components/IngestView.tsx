import { useState } from 'react';

export default function IngestView() {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'link'>('upload');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [isIngesting, setIsIngesting] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const handleIngest = async (type: string, payload: any) => {
    setIsIngesting(true);
    setLog(prev => [...prev, `Starting ${type} ingestion...`]);
    try {
      const res = await fetch(`/api/ingest/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLog(prev => [...prev, `Success! Created ${data.path}`]);
    } catch (err: any) {
      setLog(prev => [...prev, `Error: ${err.message}`]);
    }
    setIsIngesting(false);
  };

  return (
    <div className="ingest-view">
      <div className="ingest-container">
        <h1 className="ingest-title">Ingestion Hub</h1>
        <p className="ingest-subtitle">Add new knowledge to your wiki. The AI will automatically process, format, and link your content.</p>
        
        <div className="ingest-tabs">
          <button className={`ingest-tab ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>
            <i className="fa-solid fa-file-arrow-up"></i> Upload Files
          </button>
          <button className={`ingest-tab ${activeTab === 'paste' ? 'active' : ''}`} onClick={() => setActiveTab('paste')}>
            <i className="fa-solid fa-paste"></i> Quick Note
          </button>
          <button className={`ingest-tab ${activeTab === 'link' ? 'active' : ''}`} onClick={() => setActiveTab('link')}>
            <i className="fa-solid fa-link"></i> Add Link
          </button>
        </div>

        <div className="ingest-content">
          {activeTab === 'upload' && (
            <div className="ingest-section">
              <div className="section-header">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Upload Documents</h2>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>The AI will parse your files and extract structured knowledge.</p>
              </div>
              <div className="dropzone">
                <i className="fa-solid fa-file-pdf" style={{ fontSize: '3rem', color: 'var(--accent)', marginBottom: '16px', opacity: 0.8 }}></i>
                <h3>Drag & Drop Files</h3>
                <p style={{ opacity: 0.6 }}>Supports PDF, Markdown, TXT, and DOCX</p>
                <button className="action-btn btn-primary" style={{ marginTop: '24px', width: 'auto', padding: '12px 32px' }}>
                  <i className="fa-solid fa-plus" style={{ marginRight: '8px' }}></i> Select Files
                </button>
              </div>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="ingest-section">
              <div className="section-header">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Quick Note</h2>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Perfect for meetings, thoughts, or quick snippets of information.</p>
              </div>
              <div className="metadata-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '8px' }}>
                <div className="input-group">
                  <label htmlFor="paste-title" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>TITLE (OPTIONAL)</label>
                  <input 
                    id="paste-title"
                    type="text" 
                    className="link-input" 
                    placeholder="Note title..." 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    style={{ padding: '12px 16px', fontSize: '0.9rem' }}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="paste-date" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>DATE (OPTIONAL)</label>
                  <input 
                    id="paste-date"
                    type="date" 
                    className="link-input" 
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                    style={{ padding: '12px 16px', fontSize: '0.9rem' }}
                  />
                </div>
              </div>
              <textarea 
                className="paste-area" 
                placeholder="Type or paste your notes here... The AI will automatically categorize and link them." 
                value={text} 
                onChange={e => setText(e.target.value)}
              />
              <button 
                className="action-btn btn-primary" 
                onClick={() => handleIngest('paste', { text, title, date })}
                disabled={!text || isIngesting}
                style={{ width: 'auto', padding: '12px 32px', alignSelf: 'flex-start' }}
              >
                {isIngesting ? <><i className="fa-solid fa-spinner fa-spin"></i> Ingesting...</> : <><i className="fa-solid fa-bolt"></i> Ingest Note</>}
              </button>
            </div>
          )}

          {activeTab === 'link' && (
            <div className="ingest-section">
              <div className="section-header">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Add Link</h2>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>The assistant will scrape the content and index it for your wiki.</p>
              </div>
              <div className="metadata-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '8px' }}>
                <div className="input-group">
                  <label htmlFor="link-title" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>TITLE (OPTIONAL)</label>
                  <input 
                    id="link-title"
                    type="text" 
                    className="link-input" 
                    placeholder="Page title..." 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    style={{ padding: '12px 16px', fontSize: '0.9rem' }}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="link-date" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '8px', display: 'block' }}>DATE (OPTIONAL)</label>
                  <input 
                    id="link-date"
                    type="date" 
                    className="link-input" 
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                    style={{ padding: '12px 16px', fontSize: '0.9rem' }}
                  />
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <i className="fa-solid fa-globe" style={{ position: 'absolute', left: '20px', top: '22px', color: 'var(--text-dim)' }}></i>
                <input 
                  type="text" 
                  className="link-input" 
                  placeholder="https://example.com/article" 
                  value={url} 
                  onChange={e => setUrl(e.target.value)}
                  style={{ paddingLeft: '50px' }}
                />
              </div>
              <button 
                className="action-btn btn-primary" 
                onClick={() => handleIngest('link', { url, title, date })}
                disabled={!url || isIngesting}
                style={{ width: 'auto', padding: '12px 32px', alignSelf: 'flex-start' }}
              >
                {isIngesting ? <><i className="fa-solid fa-spinner fa-spin"></i> Ingesting...</> : <><i className="fa-solid fa-link"></i> Ingest Link</>}
              </button>
            </div>
          )}
        </div>

        {log.length > 0 && (
          <div className="ingest-console">
            <div className="console-header">
              <div className="console-dot" style={{ background: '#ff5f56' }}></div>
              <div className="console-dot" style={{ background: '#ffbd2e' }}></div>
              <div className="console-dot" style={{ background: '#27c93f' }}></div>
              <span style={{ marginLeft: '12px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', opacity: 0.5 }}>INGESTION CONSOLE</span>
              <button 
                onClick={() => setLog([])} 
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.7rem', cursor: 'pointer' }}
              >
                CLEAR
              </button>
            </div>
            <div className="console-body">
              {log.map((line, i) => (
                <div key={i}><span style={{ opacity: 0.4, marginRight: '8px' }}>$</span> {line}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
