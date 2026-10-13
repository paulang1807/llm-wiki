import { useState, useEffect, useRef } from "react";
import { ViewType, SearchResult } from "@/lib/types";

interface HeaderProps {
  view: ViewType;
  setView: (view: ViewType) => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  onToggleSidebar: () => void;
  onSelectFile?: (path: string) => void;
}

export default function Header({ view, setView, onToggleChat, isChatOpen, onToggleSidebar, onSelectFile }: HeaderProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) {
          setResults(data);
          setIsOpen(true);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
        }
      }
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectResult = (path: string) => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    onSelectFile?.(path);
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="sidebar-toggle" onClick={onToggleSidebar}>
          <i className="fa-solid fa-bars"></i>
        </button>
        <div className="logo" onClick={() => setView('welcome')}>
          <i className="fa-solid fa-brain logo-icon"></i> <span>LLM Wiki</span>
        </div>
      </div>
      <div className="header-right">
        <div className="search-box" ref={searchBoxRef}>
          <i className="fa-solid fa-search search-icon"></i>
          <input
            type="text"
            placeholder="Search knowledge base..."
            id="searchInput"
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              if (!val.trim()) {
                setResults([]);
                setIsOpen(false);
              }
            }}
            onFocus={() => {
              if (query.trim() && results.length > 0) setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsOpen(false);
                (e.currentTarget as HTMLInputElement).blur();
              } else if (e.key === 'Enter' && results.length > 0) {
                handleSelectResult(results[0].path);
              }
            }}
          />
          {isOpen && query.trim() && (
            <div className="search-results-dropdown" role="listbox">
              {results.length === 0 ? (
                <div className="search-result-empty">No matching notes found.</div>
              ) : (
                results.map((r) => (
                  <div
                    key={r.path}
                    className="search-result-item"
                    role="option"
                    aria-selected={false}
                    onClick={() => handleSelectResult(r.path)}
                  >
                    <div className="search-result-title">{r.title}</div>
                    {r.category && <div className="search-result-category">{r.category}</div>}
                    {r.snippet && <div className="search-result-snippet">{r.snippet}</div>}
                  </div>
                ))
              )}
            </div>
          )}
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
          <i className="fa-solid fa-robot"></i> <span>Assistant</span>
        </button>
      </div>
    </header>
  );
}
