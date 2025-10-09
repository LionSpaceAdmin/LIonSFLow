'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/translate-and-generate-image-telegram.ts';
import '@/ai/flows/summarize-telegram-messages.ts';
import '@/ai/flows/generate-instagram-captions.ts';
import '@/ai/flows/run-workflow.ts';
import '@/ai/flows/gcp-get-iam-policy.ts';
import '@/ai/flows/gcp-list-firewall-rules.ts';
import '@/ai/flows/gcp-toggle-vm-instance.ts';
