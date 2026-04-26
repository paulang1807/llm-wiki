import { useState, useEffect } from 'react';

interface HealthIssue {
  id: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  file: string;
  details?: any;
  fixable: boolean;
}

export default function HealthView() {
  const [issues, setIssues] = useState<HealthIssue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [repairingId, setRepairingId] = useState<string | null>(null);
  const [repairMessage, setRepairMessage] = useState<{ id: string, text: string } | null>(null);

  const scan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setIssues(data);
    } catch (err) {
      console.error(err);
    }
    setIsScanning(false);
  };

  const repair = async (issue: HealthIssue) => {
    setRepairingId(issue.id);
    try {
      const res = await fetch('/api/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issue)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIssues(prev => prev.filter(i => i.id !== issue.id));
        setRepairMessage(null);
      } else if (data.message) {
        setRepairMessage({ id: issue.id, text: data.message });
      }
    } catch (err) {
      console.error(err);
    }
    setRepairingId(null);
  };

  useEffect(() => {
    scan();
  }, []);

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'high': return '#f87171';
      case 'medium': return '#fbbf24';
      default: return '#60a5fa';
    }
  };

  return (
    <div className="health-view animate-fade">
      <div className="health-container">
        <div className="health-header">
          <div>
            <h1 className="health-title">Knowledge Health</h1>
            <p className="health-subtitle">Identify and repair broken links, orphans, and stale content.</p>
          </div>
          <button 
            className={`action-btn ${isScanning ? 'disabled' : ''}`} 
            onClick={scan} 
            disabled={isScanning}
            style={{ width: 'auto', padding: '12px 24px' }}
          >
            <i className={`fa-solid fa-arrows-rotate ${isScanning ? 'fa-spin' : ''}`}></i>
            {isScanning ? 'Scanning...' : 'Re-scan'}
          </button>
        </div>

        <div className="health-summary-grid">
          <div className="health-stat-card">
            <div className="stat-value">{issues.length}</div>
            <div className="stat-label">Total Issues Found</div>
          </div>
          <div className="health-stat-card">
            <div className="stat-value" style={{ color: '#f87171' }}>
              {issues.filter(i => i.severity === 'high').length}
            </div>
            <div className="stat-label">Critical Issues</div>
          </div>
          <div className="health-stat-card">
            <div className="stat-value" style={{ color: '#6366f1' }}>
              {issues.filter(i => i.fixable).length}
            </div>
            <div className="stat-label">Auto-fixable</div>
          </div>
        </div>

        <div className="health-issues-list">
          {issues.length === 0 && !isScanning ? (
            <div className="health-empty-state">
              <i className="fa-solid fa-shield-heart" style={{ fontSize: '3rem', color: '#10b981', marginBottom: '16px' }}></i>
              <h3>Your Knowledge is Healthy</h3>
              <p>No broken links or orphans detected.</p>
            </div>
          ) : (
            issues.map(issue => (
              <div key={issue.id} className="health-issue-item glass">
                <div className="issue-severity-bar" style={{ background: getSeverityColor(issue.severity) }}></div>
                <div className="issue-content">
                  <div className="issue-main">
                    <div className="issue-type-badge">{issue.type.replace('_', ' ')}</div>
                    <div className="issue-message">{issue.message}</div>
                    <div className="issue-file">
                      <i className="fa-solid fa-file-lines"></i> {issue.file}
                    </div>
                  </div>
                  {issue.fixable && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <button 
                        className="repair-btn" 
                        onClick={() => repair(issue)}
                        disabled={repairingId === issue.id}
                      >
                        {repairingId === issue.id ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wrench"></i>}
                        Repair
                      </button>
                      {repairMessage?.id === issue.id && (
                        <div className="repair-feedback animate-slide-in">
                          <i className="fa-solid fa-circle-info"></i>
                          {repairMessage.text}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
