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

export type ViewType = 'welcome' | 'read' | 'graph' | 'ingest' | 'health';

export default function App() {
  const [view, setView] = useState<ViewType>('welcome');
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const loadPage = (path: string) => {
    if (path === '__health__') {
      setView('health');
      setCurrentFile('__health__');
      return;
    }
    setCurrentFile(path);
    setView('read');
  };

  const refreshTree = () => {
    // This will trigger a re-fetch in the Sidebar component if we pass a version/key
    // or we can just let Sidebar handle its own state if we provide a trigger.
    // For now, let's just use a simple counter to force re-render/re-fetch.
    setTreeVersion(v => v + 1);
  };

  const [treeVersion, setTreeVersion] = useState(0);

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

      {isChatOpen && (
        <ChatDrawer onClose={() => setIsChatOpen(false)} />
      )}
    </>
  );
}
