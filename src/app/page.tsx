"use client";

import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';

import Header from '@/components/layout/header';
import NodePalette from '@/components/workflow/node-palette';
import MainCanvas from '@/components/workflow/main-canvas';
import ConfigPanel from '@/components/workflow/config-panel';

export default function AuronHomePage() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground">
      <ReactFlowProvider>
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <ConfigPanel />
          <main className="flex-1 h-full relative">
            <MainCanvas />
          </main>
          <NodePalette />
        </div>
      </ReactFlowProvider>
    </div>
  );
}
