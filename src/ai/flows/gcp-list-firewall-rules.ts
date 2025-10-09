'use server';
/**
 * @fileOverview A Genkit flow for listing firewall rules of a GCP project.
 *
 * - listGcpFirewallRules - A function that simulates fetching firewall rules.
 * - ListGcpFirewallRulesInput - The input type for the function.
 * - ListGcpFirewallRulesOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ListGcpFirewallRulesInputSchema = z.object({
  projectId: z.string().describe('The ID of the GCP project.'),
});
export type ListGcpFirewallRulesInput = z.infer<typeof ListGcpFirewallRulesInputSchema>;

const ListGcpFirewallRulesOutputSchema = z.object({
  rules: z.string().describe('The list of firewall rules in JSON format.'),
});
export type ListGcpFirewallRulesOutput = z.infer<typeof ListGcpFirewallRulesOutputSchema>;

export async function listGcpFirewallRules(
  input: ListGcpFirewallRulesInput
): Promise<ListGcpFirewallRulesOutput> {
  return listGcpFirewallRulesFlow(input);
}

const listGcpFirewallRulesFlow = ai.defineFlow(
  {
    name: 'listGcpFirewallRulesFlow',
    inputSchema: ListGcpFirewallRulesInputSchema,
    outputSchema: ListGcpFirewallRulesOutputSchema,
  },
  async (input) => {
    // This is a mocked response.
    // In a real implementation, this would call the GCP Compute Engine API.
    const mockRules = [
      {
        name: 'default-allow-ssh',
        network: `projects/${input.projectId}/global/networks/default`,
        direction: 'INGRESS',
        priority: 65534,
        allowed: [{ IPProtocol: 'tcp', ports: ['22'] }],
        sourceRanges: ['0.0.0.0/0'],
      },
      {
        name: 'default-allow-rdp',
        network: `projects/${input.projectId}/global/networks/default`,
        direction: 'INGRESS',
        priority: 65534,
        allowed: [{ IPProtocol: 'tcp', ports: ['3389'] }],
        sourceRanges: ['0.0.0.0/0'],
      },
    ];

    return {
      rules: JSON.stringify(mockRules, null, 2),
    };
  }
);
