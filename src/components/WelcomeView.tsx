import { useState, useEffect } from 'react';

interface WelcomeViewProps {
  onSelectFile: (path: string) => void;
}

export default function WelcomeView({ onSelectFile }: WelcomeViewProps) {
  const [domains, setDomains] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/domains')
      .then(res => res.json())
      .then(setDomains);
  }, []);
  return (
    <div className="welcome-container animate-fade">
      <div className="welcome-hero animate-up">
        <div className="welcome-icon">
          <i className="fa-solid fa-brain"></i>
        </div>
        <h1 className="welcome-title">LLM Wiki</h1>
        <p className="welcome-subtitle">A self-curating knowledge base powered by artificial intelligence.</p>
        
        <div className="welcome-grid">
          {domains.map(d => (
            <div key={d.name} className="welcome-card" onClick={() => onSelectFile(d.path)}>
              <div className="welcome-card-icon">{d.icon}</div>
              <div className="welcome-card-title">{d.name}</div>
              <div className="welcome-card-desc">{d.desc}</div>
              <div style={{ marginTop: '16px', fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600 }}>
                {d.pagesCount} PAGES <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }}></i>
              </div>
            </div>
          ))}
          {domains.length === 0 && (
            <div className="welcome-card" style={{ opacity: 0.5, cursor: 'default' }}>
              <div className="welcome-card-icon">📭</div>
              <div className="welcome-card-title">Empty Knowledge Base</div>
              <div className="welcome-card-desc">Start by ingesting documents to see your domain overview.</div>
            </div>
          )}
        </div>

        <div className="welcome-hint glass" style={{ padding: '16px 32px', borderRadius: '100px', display: 'inline-flex', alignItems: 'center' }}>
          <i className="fa-solid fa-lightbulb" style={{ marginRight: '12px', color: 'var(--accent)' }}></i>
          <span>Press <kbd>/</kbd> to search or <kbd>G</kbd> to view the knowledge graph.</span>
        </div>
      </div>
    </div>
  );
}
