"use client";

import React, { useCallback, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowInstance,
  Node,
} from "reactflow";

import { useWorkflowStore } from "@/lib/store/workflow-store";
import CustomNode from "./custom-node";
import { AllNodeDefinitions } from "@/lib/node-definitions";

const nodeTypes = {
  custom: CustomNode,
  // We can add other specific types here if needed
  ...AllNodeDefinitions.reduce((acc, def) => {
    acc[def.type] = CustomNode;
    return acc;
  }, {} as Record<string, typeof CustomNode>)
};

const MainCanvas = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNodeId,
  } = useWorkflowStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) {
        return;
      }
      
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // The addNode function in the store will handle creating the full node object
      const partialNode = {
        id: '', // The store will generate a unique ID
        type: type, // This is the functional type
        position,
        data: {},
      };

      addNode(partialNode);
    },
    [screenToFlowPosition, addNode]
  );
  
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, [setSelectedNodeId]);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  // We need to map our state nodes to what ReactFlow expects, ensuring the 'type' is 'custom'
  const flowNodes = nodes.map(n => ({...n, type: 'custom'}));

  return (
    <div className="h-full w-full" ref={reactFlowWrapper} >
      <ReactFlow
        nodes={flowNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
      >
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <Background gap={16} />
      </ReactFlow>
    </div>
  );
};

export default MainCanvas;

    