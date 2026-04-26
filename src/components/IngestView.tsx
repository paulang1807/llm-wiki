import { useState } from 'react';

export default function IngestView() {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'link'>('upload');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
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
              <div className="dropzone">
                <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '3rem', color: 'var(--accent)', marginBottom: '16px' }}></i>
                <h3>Drag & Drop Files Here</h3>
                <p>Supports .pdf, .md, .txt, .docx, .html</p>
                <button className="action-btn btn-primary" style={{ marginTop: '16px' }}>Select Files</button>
              </div>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="ingest-section">
              <textarea 
                className="paste-area" 
                placeholder="Paste your notes or text here..." 
                value={text} 
                onChange={e => setText(e.target.value)}
              />
              <button 
                className="action-btn btn-primary" 
                onClick={() => handleIngest('paste', { text })}
                disabled={!text || isIngesting}
              >
                {isIngesting ? 'Ingesting...' : 'Ingest Note'}
              </button>
            </div>
          )}

          {activeTab === 'link' && (
            <div className="ingest-section">
              <input 
                type="text" 
                className="link-input" 
                placeholder="https://example.com/article" 
                value={url} 
                onChange={e => setUrl(e.target.value)}
              />
              <button 
                className="action-btn btn-primary" 
                onClick={() => handleIngest('link', { url })}
                disabled={!url || isIngesting}
              >
                {isIngesting ? 'Ingesting...' : 'Ingest Link'}
              </button>
            </div>
          )}
        </div>

        {log.length > 0 && (
          <div className="ingest-console" style={{ marginTop: '24px', background: 'var(--bg-dark)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ color: 'var(--text-dim)', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>CONSOLE</div>
            {log.map((line, i) => (
              <div key={i} style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>{line}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
