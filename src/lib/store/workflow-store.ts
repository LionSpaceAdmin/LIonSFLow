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
  workflowId: string | null; // To track the current workflow in Firestore
  logs: string[];
  isLogsPanelOpen: boolean;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: Node) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  updateNodeConfig: (nodeId: string, data: any) => void;
  setWorkflow: (nodes: Node[], edges: Edge[]) => void;
  setWorkflowId: (id: string | null) => void;
  setLogs: (logs: string[]) => void;
  setLogsPanelOpen: (isOpen: boolean) => void;
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNodeId: null,
  workflowId: null,
  logs: [],
  isLogsPanelOpen: false,

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
      edges: addEdge({ ...connection, animated: true }, get().edges),
    });
  },

  addNode: (node: Node) => {
    const def = AllNodeDefinitions.find(d => d.type === node.type);
    
    // The node added to react-flow should be of 'custom' type to use our custom component
    const flowNode: Node = {
        id: `${node.type}-${Date.now()}`,
        type: 'custom', 
        position: node.position,
        data: { label: def?.name || 'Unknown Node' },
    };

    if (def) {
        // We store the actual functional type in our own state node
        const stateNode: Node = {
            ...flowNode,
            type: def.type, // The functional type
        };
        
        const defaultParams = def.parameters.reduce((acc, param) => {
            if (param.defaultValue !== undefined) {
                acc[param.name] = param.defaultValue;
            }
            return acc;
        }, {} as Record<string, any>);
        
        stateNode.data = { ...stateNode.data, ...defaultParams };

        set({
          nodes: [...get().nodes, stateNode],
        });
    }
  },

  setSelectedNodeId: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId });
  },

  updateNodeConfig: (nodeId: string, data: any) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          // Make sure to keep the label
          const new_data = { ...node.data, ...data };
          return { ...node, data: new_data };
        }
        return node;
      }),
    });
  },
  
  setWorkflow: (nodes: Node[], edges: Edge[]) => {
    // When loading a workflow, ensure the nodes are of type 'custom' for ReactFlow
    const customTypeNodes = nodes.map(n => ({...n, type: 'custom'}));
    set({ nodes: customTypeNodes, edges, selectedNodeId: null });
  },

  setWorkflowId: (id: string | null) => {
    set({ workflowId: id });
  },

  setLogs: (logs: string[]) => {
    set({ logs });
  },

  setLogsPanelOpen: (isOpen: boolean) => {
    set({ isLogsPanelOpen: isOpen });
  },
}));

    