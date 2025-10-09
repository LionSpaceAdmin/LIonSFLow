# **App Name**: Auron: AI Automation Web

## Core Features:

- Visual Workflow Builder: A drag-and-drop canvas using reactflow to visually construct automation workflows.
- Node Palette: A searchable, categorized list of automation nodes (triggers, actions, logic, AI) for easy workflow construction.
- Real-time Configuration Panel: Contextual configuration panel that slides in to configure selected nodes.
- Gemini Integration: Nodes that leverage Google Gemini for text generation, summarization, and advanced reasoning as a tool within workflows.
- Imagen Integration: Nodes that use Imagen 2 to generate images from text prompts within workflows.
- Social Media Triggers: Trigger flows based on events from Telegram, Twitter, Instagram, and Discord using webhooks.
- Workflow Persistence: Save and load automation workflows to/from Cloud Firestore, including metadata like creation date and version.

## Style Guidelines:

- Primary color: A vibrant blue (#29ABE2) reflecting intelligence, automation, and the digital realm.
- Background color: A light, desaturated blue (#E5F6FD) for a clean and calming interface.
- Accent color: An analogous teal (#29E2A6), differing from the primary in both brightness and saturation, provides clear visual cues without clashing.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines and 'Inter' (sans-serif) for body text to provide a modern, technical feel with good readability.
- Consistent use of 'lucide-react' icons throughout the interface, emphasizing clarity and ease of understanding for different node types and actions.
- Persistent three-column layout (Node Palette, Canvas, Configuration Panel) optimized for desktop, ensuring easy access to all key functions.
- Subtle transitions and animations when dragging and dropping nodes, opening the configuration panel, and executing flows, enhancing user feedback and engagement.