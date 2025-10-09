'use server';
/**
 * @fileOverview A Genkit flow for starting or stopping a GCP VM instance.
 *
 * - toggleGcpVmInstance - A function that simulates toggling a VM's state.
 * - ToggleGcpVmInstanceInput - The input type for the function.
 * - ToggleGcpVmInstanceOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ToggleGcpVmInstanceInputSchema = z.object({
  projectId: z.string().describe('The ID of the GCP project.'),
  zone: z.string().describe('The zone where the VM instance resides.'),
  instanceName: z.string().describe('The name of the VM instance.'),
  action: z.enum(['start', 'stop']).describe('The action to perform (start or stop).'),
});
export type ToggleGcpVmInstanceInput = z.infer<typeof ToggleGcpVmInstanceInputSchema>;

const ToggleGcpVmInstanceOutputSchema = z.object({
  status: z.string().describe('The result of the toggle operation.'),
});
export type ToggleGcpVmInstanceOutput = z.infer<typeof ToggleGcpVmInstanceOutputSchema>;

export async function toggleGcpVmInstance(
  input: ToggleGcpVmInstanceInput
): Promise<ToggleGcpVmInstanceOutput> {
  return toggleGcpVmInstanceFlow(input);
}

const toggleGcpVmInstanceFlow = ai.defineFlow(
  {
    name: 'toggleGcpVmInstanceFlow',
    inputSchema: ToggleGcpVmInstanceInputSchema,
    outputSchema: ToggleGcpVmInstanceOutputSchema,
  },
  async (input) => {
    const { projectId, zone, instanceName, action } = input;
    // This is a mocked response.
    // In a real implementation, this would call the GCP Compute Engine API.
    const message = `Simulated action: Successfully sent command to '${action}' instance '${instanceName}' in project '${projectId}' and zone '${zone}'.`;
    
    return {
      status: message,
    };
  }
);
