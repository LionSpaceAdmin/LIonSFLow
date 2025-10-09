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

        logs.push(`Executing node: ${node.data.label || node.id} (Type: ${node.type})`);
        executed.add(nodeId);

        // Simulate async work
        await new Promise(resolve => setTimeout(resolve, 150));
        logs.push(`Node ${node.data.label || node.id} finished.`);
        
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
