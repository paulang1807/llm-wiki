"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import PageView from "@/components/PageView";
import IngestView from "@/components/IngestView";
import WelcomeView from "@/components/WelcomeView";
import Header from "@/components/Header";
import ChatDrawer from "@/components/ChatDrawer";
import HealthView from "@/components/HealthView";
import dynamic from 'next/dynamic';

const GraphView = dynamic(() => import('@/components/GraphView'), { ssr: false });

import { ViewType } from "@/lib/types";
export type { ViewType };

export default function App() {
  const [view, setView] = useState<ViewType>('welcome');
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [treeVersion, setTreeVersion] = useState(0);

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  const loadPage = (path: string) => {
    if (path === '__health__') {
      setView('health');
      setCurrentFile('__health__');
    } else {
      setCurrentFile(path);
      setView('read');
    }
    
    // Auto-close sidebar on mobile after selection
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  const refreshTree = () => {
    setTreeVersion(v => v + 1);
  };

  return (
    <>
      <Header 
        view={view} 
        setView={setView} 
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <div className="layout">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onSelectFile={loadPage}
          currentFile={currentFile}
          treeVersion={treeVersion}
        />
        
        <main className="main">
          {view === 'welcome' && <WelcomeView onSelectFile={loadPage} />}
          {view === 'read' && currentFile && (
            <PageView 
              filePath={currentFile} 
              onRefresh={refreshTree}
              onClose={() => {
                setCurrentFile(null);
                setView('welcome');
              }}
            />
          )}
          {view === 'graph' && <GraphView onSelectNode={loadPage} />}
          {view === 'ingest' && <IngestView />}
          {view === 'health' && <HealthView />}
        </main>
      </div>

      {/* Sidebar Backdrop for Mobile - Moved to end */}
      <div 
        className={`sidebar-backdrop ${isSidebarOpen ? 'visible' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
        style={{ cursor: 'pointer' }}
      />

      {isChatOpen && (
        <ChatDrawer onClose={() => setIsChatOpen(false)} />
      )}
    </>
  );
}
