"use client";

import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';

import Header from '@/components/layout/header';
import NodePalette from '@/components/workflow/node-palette';
import MainCanvas from '@/components/workflow/main-canvas';
import ConfigPanel from '@/components/workflow/config-panel';
import LogsPanel from '@/components/workflow/logs-panel';

export default function AuronHomePage() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <ConfigPanel />
          <main className="flex-1 h-full relative">
            <ReactFlowProvider>
              <MainCanvas />
            </ReactFlowProvider>
          </main>
          <NodePalette />
          <LogsPanel />
        </div>
    </div>
  );
}
