'use server';
/**
 * @fileOverview A Genkit flow for fetching the IAM policy of a GCP resource.
 *
 * - getGcpIamPolicy - A function that simulates fetching the IAM policy.
 * - GetGcpIamPolicyInput - The input type for the getGcpIamPolicy function.
 * - GetGcpIamPolicyOutput - The return type for the getGcpIamPolicy function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetGcpIamPolicyInputSchema = z.object({
  resourceName: z.string().describe('The full resource name of the GCP resource.'),
});
export type GetGcpIamPolicyInput = z.infer<typeof GetGcpIamPolicyInputSchema>;

const GetGcpIamPolicyOutputSchema = z.object({
  policy: z.string().describe('The IAM policy in JSON format.'),
});
export type GetGcpIamPolicyOutput = z.infer<typeof GetGcpIamPolicyOutputSchema>;

export async function getGcpIamPolicy(
  input: GetGcpIamPolicyInput
): Promise<GetGcpIamPolicyOutput> {
  return getGcpIamPolicyFlow(input);
}

const getGcpIamPolicyFlow = ai.defineFlow(
  {
    name: 'getGcpIamPolicyFlow',
    inputSchema: GetGcpIamPolicyInputSchema,
    outputSchema: GetGcpIamPolicyOutputSchema,
  },
  async (input) => {
    // This is a mocked response.
    // In a real implementation, this would call the GCP Resource Manager API.
    const mockPolicy = {
      version: 1,
      bindings: [
        {
          role: 'roles/owner',
          members: ['user:example-user@gmail.com'],
        },
        {
          role: 'roles/viewer',
          members: ['serviceAccount:my-service-account@...gserviceaccount.com'],
        },
      ],
      etag: 'BwWqg-0-V_A=',
    };

    return {
      policy: JSON.stringify(mockPolicy, null, 2),
    };
  }
);
