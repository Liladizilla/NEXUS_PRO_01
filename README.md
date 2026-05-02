# Odyseus AI – Autonomous Software Builder OS

Odyseus AI is a next-generation, autonomous software development platform designed to transform natural language prompts into production-ready, full-stack applications. It acts as an "AI Operating System" for software architecture, managing everything from initial design and component selection to deployment and real-time debugging.

## 🚀 Available Platforms

Odyseus AI is now available across multiple platforms:

- **[Desktop App](#-desktop-application)** - Native desktop experience for Windows, macOS, and Linux
- **[Web App](#-web-application)** - Browser-based access from any device
- **[Mobile App](#-mobile-application)** - Coming soon for iOS and Android

## ✨ Key Features

### 1. Autonomous Multi-Agent Orchestration
*   **Architect Agent:** Analyzes prompts to define the optimal tech stack and data schema.
*   **Frontend/Backend Agents:** Work in parallel (Parallel Synthesis) to build out the UI and server-side logic.
*   **Security Agent:** Automatically generates and validates Firestore security rules.
*   **DevOps Agent:** Manages the CI/CD pipeline and deployment status.

### 2. Next-Gen Project Builder
*   **Natural Language Interface:** Describe your app, and Odyseus handles the rest.
*   **Stack Customization:** Choose from modern frameworks like React (TanStack), Next.js, or Astro.
*   **Database Integration:** Seamlessly provisions Firestore with automated schema mapping.

### 3. Integrated AI Assistant (Odyseus AI)
*   **Dual-Mode Interface:** A unified widget for both real-time **Chat** support and a **Refinement Loop**.
*   **Context-Aware:** The assistant understands your project's current state and can help debug or extend features.
*   **Refine Tab:** Directly provide feedback to the AI to iterate on the current build.

### 4. Developer Tools & Observability
*   **Visual CI/CD Pipeline:** Track every stage of the build process—from synthesis to deployment—in real-time.
*   **Real-Time Debugger:** Inspect the "Neural Mesh" logs and step through the AI's decision-making process.
*   **Kanban Board:** Automatically generated task lists to track the progress of the autonomous agents.

### 5. Enterprise-Grade Security & Auth
*   **Firebase Integration:** Built-in authentication and secure database configuration.
*   **Type-Safe Architecture:** Ensures consistent data flow across the entire application.

---

## 🎨 Design Language: Glassmorphism 2.0

Odyseus AI features a high-fidelity, futuristic interface built on **Glassmorphism** principles:
*   **Translucent Surfaces:** Backdrop blurs and subtle borders create a sense of depth.
*   **Vibrant Accents:** A signature "Nexus Accent" (Cyan/Neon) guides the user's attention.
*   **Fluid Animations:** Powered by Framer Motion for a tactile, responsive feel.
*   **Responsive Layout:** A desktop-first precision design that adapts seamlessly to different workflows.

---

## 🛠️ Technical Stack

*   **Frontend:** React 18+, Vite, TypeScript.
*   **Styling:** Tailwind CSS (Utility-first, mobile-first).
*   **Animations:** Framer Motion (`motion/react`).
*   **State Management:** Zustand (for a lightweight, high-performance global store).
*   **Backend/Database:** Firebase (Authentication, Firestore).
*   **AI Engine:** Google Gemini 3.1 Pro via the `@google/genai` SDK.
*   **Icons:** Lucide React.

---

## 📂 Project Structure

```text
/src
  /components
    /features      # Core functional modules (AIChat, Debugger, Kanban, etc.)
    /ui            # Reusable atomic design components (Buttons, Cards, Modals)
  /core
    ai.ts          # Gemini API integration and prompt engineering
    firebase.ts    # Firebase initialization and Firestore helpers
    store.ts       # Zustand global state management
  /lib             # Utility functions and shared helpers
  /types           # Global TypeScript definitions
  App.tsx          # Main application entry and routing logic
  main.tsx         # React DOM mounting
```

---

## 🛠️ Getting Started

1.  **Environment Variables:**
    *   Ensure `GEMINI_API_KEY` is set in your environment.
    *   Firebase configuration should be present in `firebase-applet-config.json`.

2.  **Installation:**
    ```bash
    npm install
    ```

3.  **Development:**
    ```bash
    npm run dev
    ```

4.  **Build:**
    ```bash
    npm run build
    ```

---

## 🛡️ Security Rules

Odyseus AI automatically generates a `firestore.rules` file based on your project's `firebase-blueprint.json`. These rules implement:
*   **Default Deny:** All access is restricted unless explicitly allowed.
*   **Ownership Validation:** Users can only access their own data.
*   **Schema Enforcement:** Strict type and length checking for all document fields.

---

## 📈 Roadmap

*   **V2.0:** Support for mobile app generation (React Native).
*   **V2.1:** Advanced "Time Travel" debugging for AI logic.
*   **V2.2:** Multi-user collaborative architecting.

---

## 💻 Desktop Application

Odyseus AI is now available as a native desktop application built with Electron! This brings enhanced performance and native system integration to your development workflow.

### Features
- **Native Window Controls**: Minimize, maximize, and close buttons integrated into the app
- **System Integration**: Access to system information and native APIs
- **Persistent Settings**: Electron Store for local configuration
- **Built-in Server**: Embedded Express server for local development
- **Cross-Platform**: Available for Windows, macOS, and Linux

### Installation

Download the latest release for your platform from [GitHub Releases](https://github.com/Liladizilla/NEXUS_PRO_01/releases):

- **Windows**: `NexusPro-Setup-1.0.0.exe` (NSIS installer)
- **macOS**: `NexusPro-1.0.0.dmg` (Disk image)
- **Linux**: `NexusPro-1.0.0.AppImage` (AppImage)

### Building from Source

```bash
# Install dependencies
npm install

# Build the web application
npm run build

# Build desktop application
npm run electron:build
```

For more information, see [DESKTOP_README.md](DESKTOP_README.md).

---

## 📱 Mobile Application

Odyseus AI is coming to mobile devices! We're developing a cross-platform mobile application for iOS and Android using React Native.

### Planned Features
- AI-powered code generation on the go
- Project management from your phone
- Real-time debugging tools
- Push notifications for build status
- Biometric authentication
- Offline mode for core functionality

### Technology Stack
- **React Native** with **Expo**
- **Native Performance**: Near-native UI/UX
- **Code Sharing**: 70-80% shared with web version
- **Cross-Platform**: Single codebase for iOS and Android

### Timeline
- **Phase 1** (Weeks 1-4): Foundation & Setup
- **Phase 2** (Weeks 5-8): UI/UX Adaptation
- **Phase 3** (Weeks 9-16): Feature Implementation
- **Phase 4** (Weeks 17-20): Native Integration
- **Phase 5** (Weeks 21-24): Testing & Deployment

For detailed roadmap, see [MOBILE_ROADMAP.md](MOBILE_ROADMAP.md).

---

## 📈 Future Roadmap

*Architected by Odyseus AI.*
