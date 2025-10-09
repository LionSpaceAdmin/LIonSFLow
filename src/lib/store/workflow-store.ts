import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import { AllNodeDefinitions } from '@/lib/node-definitions';

type WorkflowState = {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: Node) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  updateNodeConfig: (nodeId: string, data: any) => void;
};

const initialNodes: Node[] = [
  {
    id: 'trigger-1',
    type: 'custom',
    position: { x: 100, y: 200 },
    data: { label: 'New Telegram Message' },
  },
  {
    id: 'ai-1',
    type: 'custom',
    position: { x: 400, y: 150 },
    data: { label: 'Chat with Gemini' },
  },
  {
    id: 'action-1',
    type: 'custom',
    position: { x: 700, y: 200 },
    data: { label: 'Post to Discord' },
  },
];

// Set node types based on definitions
initialNodes.forEach(node => {
    const def = AllNodeDefinitions.find(d => d.name === node.data.label);
    if(def) {
        node.type = def.type;
    }
});
// Re-map to custom type wrapper
initialNodes.forEach(node => node.type = 'custom');


const initialEdges: Edge[] = [
    { id: 'e1-2', source: 'trigger-1', target: 'ai-1', animated: true },
    { id: 'e2-3', source: 'ai-1', target: 'action-1', animated: true },
];

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNodeId: null,

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },

  addNode: (node: Node) => {
    const def = AllNodeDefinitions.find(d => d.name === node.data.label);
    if (def) {
        node.type = def.type;
        const defaultParams = def.parameters.reduce((acc, param) => {
            acc[param.name] = param.defaultValue;
            return acc;
        }, {} as Record<string, any>);
        node.data = { ...node.data, ...defaultParams };
    }
    // Set back to custom wrapper
    node.type = 'custom';
    set({
      nodes: [...get().nodes, node],
    });
  },

  setSelectedNodeId: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId });
  },

  updateNodeConfig: (nodeId: string, data: any) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      }),
    });
  },
}));
