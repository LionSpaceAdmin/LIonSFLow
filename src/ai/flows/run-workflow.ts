'use server';
/**
 * @fileOverview A Genkit flow for running a workflow definition.
 *
 * - runWorkflow - A function that takes a workflow structure and simulates its execution.
 * - RunWorkflowInput - The input type for the runWorkflow function.
 * - RunWorkflowOutput - The return type for the runWorkflow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { AllNodeDefinitions } from '@/lib/node-definitions';

// Import executable node functions
import { getGcpIamPolicy } from './gcp-get-iam-policy';

// Map node types to their executable functions
const nodeFunctionRegistry: Record<string, (input: any) => Promise<any>> = {
  'gcp-get-iam-policy': getGcpIamPolicy,
  // Add other executable node functions here as they are created
};


const NodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.record(z.any()),
});
export type Node = z.infer<typeof NodeSchema>;

const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional().nullable(),
  targetHandle: z.string().optional().nullable(),
});
export type Edge = z.infer<typeof EdgeSchema>;

const RunWorkflowInputSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
});
export type RunWorkflowInput = z.infer<typeof RunWorkflowInputSchema>;

const RunWorkflowOutputSchema = z.object({
  executionResult: z.string(),
  nodeCount: z.number(),
  edgeCount: z.number(),
  logs: z.array(z.string()),
});
export type RunWorkflowOutput = z.infer<typeof RunWorkflowOutputSchema>;

export async function runWorkflow(
  input: RunWorkflowInput
): Promise<RunWorkflowOutput> {
  return runWorkflowFlow(input);
}

const runWorkflowFlow = ai.defineFlow(
  {
    name: 'runWorkflowFlow',
    inputSchema: RunWorkflowInputSchema,
    outputSchema: RunWorkflowOutputSchema,
  },
  async (input) => {
    const { nodes, edges } = input;
    const logs: string[] = [];

    logs.push('Workflow execution started.');
    logs.push(`Processing ${nodes.length} nodes and ${edges.length} edges.`);

    const nodeMap = new Map<string, Node>(nodes.map(node => [node.id, node]));
    const adjList = new Map<string, string[]>();
    edges.forEach(edge => {
      if (!adjList.has(edge.source)) {
        adjList.set(edge.source, []);
      }
      adjList.get(edge.source)!.push(edge.target);
    });
    
    // Find trigger nodes (nodes with no incoming edges)
    const incomingEdges = new Set(edges.map(edge => edge.target));
    const triggerNodes = nodes.filter(node => !incomingEdges.has(node.id));

    if (triggerNodes.length === 0) {
      logs.push('Error: No trigger node found. A workflow must have at least one node with no incoming connections.');
    } else {
      logs.push(`Found ${triggerNodes.length} trigger node(s). Starting execution...`);
      
      const executed = new Set<string>();
      const nodeOutputs = new Map<string, any>();

      // Recursive execution function
      const executeNode = async (nodeId: string) => {
        if (executed.has(nodeId)) {
          return;
        }
        
        const node = nodeMap.get(nodeId);
        if (!node) {
          logs.push(`Error: Node with ID ${nodeId} not found.`);
          return;
        }

        const nodeDef = AllNodeDefinitions.find(def => def.type === node.type);
        const nodeLabel = node.data.label || nodeDef?.name || node.id;
        
        logs.push(`Executing node: "${nodeLabel}" (Type: ${node.type})`);

        // Gather inputs from preceding nodes
        const inputEdges = edges.filter(edge => edge.target === nodeId);
        let nodeInputData = { ...node.data }; // Start with parameters from config panel

        for (const edge of inputEdges) {
          const sourceNodeOutput = nodeOutputs.get(edge.source);
          if (sourceNodeOutput && edge.sourceHandle && edge.targetHandle) {
             const outputValue = sourceNodeOutput[edge.sourceHandle];
             nodeInputData[edge.targetHandle] = outputValue;
             logs.push(`- Passing output "${edge.sourceHandle}" from source to input "${edge.targetHandle}". Value: ${JSON.stringify(outputValue)}`);
          }
        }
        
        let output = {};
        const execute = nodeFunctionRegistry[node.type];
        if (execute) {
          try {
            logs.push(`- Calling associated function with input: ${JSON.stringify(nodeInputData)}`);
            output = await execute(nodeInputData);
            logs.push(`- Function returned: ${JSON.stringify(output)}`);
          } catch (e: any) {
            logs.push(`- Error executing node function for "${nodeLabel}": ${e.message}`);
            // Stop execution of this branch on error
            return; 
          }
        } else {
          logs.push(`- No executable function registered for type "${node.type}". Skipping.`);
        }

        nodeOutputs.set(nodeId, output);
        executed.add(nodeId);
        logs.push(`Node "${nodeLabel}" finished.`);
        
        const nextNodeIds = adjList.get(nodeId) || [];
        for (const nextNodeId of nextNodeIds) {
          await executeNode(nextNodeId);
        }
      };

      for (const triggerNode of triggerNodes) {
        await executeNode(triggerNode.id);
      }
    }

    const result = `התהליך הורץ בהצלחה עם ${nodes.length} צמתים ו-${edges.length} חיבורים.`;
    logs.push('Workflow execution finished.');

    return {
      executionResult: result,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      logs: logs,
    };
  }
);

    