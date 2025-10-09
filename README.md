# LionsFlow 🦁

## The official Control Plane for the lionsofzion-official.org organization

LionsFlow is an internal platform designed to streamline and automate the management of the GCP (Google Cloud Platform) environment for the `lionsofzion-official.org` organization. It provides a visual, flow-based interface for building, executing, and managing complex workflows, enabling authorized teams to interact with GCP resources in a secure and intuitive way.

### Core Technologies

- **Framework:** [Next.js](https://nextjs.org/) 15 (with App Router)
- **UI:** [React](https://react.dev/) 19 & [shadcn/ui](https://ui.shadcn.com/)
- **Backend & AI:** [Firebase Genkit](https://firebase.google.com/docs/genkit)
- **Database:** [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Deployment:** [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)

### Key Features

- **Visual Workflow Builder:** A drag-and-drop canvas for constructing workflows from a library of pre-built nodes.
- **Server-Side Execution:** Workflows are executed securely on the backend, managed by Firebase App Hosting and Genkit.
- **GCP Integration:** A growing library of nodes for interacting with GCP services, from reading IAM policies to managing VM instances.
- **AI-Powered Nodes:** Built-in nodes for generative AI tasks, including:
    - **Image Generation:** Create images from text prompts.
    - **Text Translation:** Translate text between languages.
    - **Sentiment Analysis:** Determine the sentiment of a piece of text.
    - **Entity Extraction:** Extract structured data from text.
- **Access Control:** The application is protected by a global password for internal use.
- **Data Persistence:** Workflows are saved and loaded from a central Firestore database.

### Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/LionSpaceAdmin/LIonSFLow.git
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up your environment variables:**
    Create a `.env` file in the root of the project and add your GCP and Firebase configuration.
4.  **Run the development server:**
    ```bash
    npm run dev
    ```

This will start the Next.js development server and the Genkit development server. You can now access the application at `http://localhost:9002`.
