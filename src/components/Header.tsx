import { ViewType } from "@/app/page";

interface HeaderProps {
  view: ViewType;
  setView: (view: ViewType) => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  onToggleSidebar: () => void;
}

export default function Header({ view, setView, onToggleChat, isChatOpen, onToggleSidebar }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <button className="sidebar-toggle" onClick={onToggleSidebar}>
          <i className="fa-solid fa-bars"></i>
        </button>
        <div className="logo" onClick={() => setView('welcome')}>
          <i className="fa-solid fa-brain logo-icon"></i> LLM Wiki
        </div>
      </div>
      <div className="header-right">
        <div className="search-box">
          <i className="fa-solid fa-search search-icon"></i>
          <input type="text" placeholder="Search knowledge base..." id="searchInput" />
        </div>
        <button className={`view-btn ${view === 'welcome' || view === 'read' ? 'active' : ''}`} onClick={() => setView('welcome')} title="Page View">
          <i className="fa-solid fa-book-open"></i>
        </button>
        <button className={`view-btn ${view === 'graph' ? 'active' : ''}`} onClick={() => setView('graph')} title="Graph View">
          <i className="fa-solid fa-diagram-project"></i>
        </button>
        <button className={`view-btn ${view === 'ingest' ? 'active' : ''}`} onClick={() => setView('ingest')} title="Ingestion Hub">
          <i className="fa-solid fa-cloud-arrow-up"></i>
        </button>
        <button className={`ai-btn ${isChatOpen ? 'active' : ''}`} onClick={onToggleChat}>
          <i className="fa-solid fa-robot"></i> Assistant
        </button>
      </div>
    </header>
  );
}
