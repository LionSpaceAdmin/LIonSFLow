import { config } from 'dotenv';
config();

import '@/ai/flows/translate-and-generate-image-telegram.ts';
import '@/ai/flows/summarize-telegram-messages.ts';
import '@/ai/flows/generate-instagram-captions.ts';
import '@/ai/flows/run-workflow.ts';
