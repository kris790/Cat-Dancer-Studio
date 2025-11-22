# AI Cat Dancer Studio ⚡🐱

A specialized AI creative suite designed to generate 5-second, loopable videos of a dancing cat synchronized to a synthesized disco beat. This project demonstrates the power of combining **Google's Gemini 2.5**, **Veo 3.1**, and the **Web Audio API** to create a complete multimedia asset in minutes.

## 🚀 Overview

Built as a pragmatic MVP for a solo developer workflow, this application streamlines the animation pipeline into three simple steps:
1.  **Visuals**: Generates a consistent, stylistically simple character optimized for motion.
2.  **Motion**: Animates the static character using video generation models.
3.  **Audio**: Synthesizes a royalty-free, beat-synced disco loop in real-time.

## ✨ Key Features

*   **Text-to-Image**: Uses `gemini-2.5-flash-image` to create a 2D cartoon cat in a disco environment.
*   **Image-to-Video**: Uses `veo-3.1-fast-generate-preview` to apply "swaying and bobbing" dance motions.
*   **Procedural Audio**: A custom `AudioService` uses the browser's Web Audio API to generate music on the fly (no MP3 downloads required).
*   **Auto-Workflow**: Automatically transitions from generation to animation for a friction-less experience.
*   **Solo-Dev Friendly**: Built with React and Tailwind CSS for rapid iteration and ease of maintenance.

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript, Tailwind CSS
*   **AI Models**: 
    *   Image: `gemini-2.5-flash-image`
    *   Video: `veo-3.1-fast-generate-preview`
*   **SDK**: `@google/genai`
*   **Audio**: Native Web Audio API (Oscillators, Gain Nodes)

## 📋 Prerequisites

To use the video generation features (Veo model), you **must** have a valid Google Cloud Project API Key with billing enabled.

1.  Go to [Google AI Studio](https://aistudio.google.com/) or Google Cloud Console.
2.  Create an API Key in a project with billing enabled.
3.  Enter the key when prompted by the application.

## 📂 Project Structure

```text
/
├── index.html              # Entry HTML
├── index.tsx               # React Root
├── App.tsx                 # Main Application Logic & State
├── types.ts                # Shared TypeScript Interfaces
├── services/
│   ├── geminiService.ts    # Interaction with Google GenAI SDK
│   └── audioService.ts     # Web Audio API Synthesizer
├── components/
│   ├── Button.tsx          # Reusable UI Component
│   ├── LoadingOverlay.tsx  # Feedback for async operations
│   └── ErrorBoundary.tsx   # React Error Handling
└── metadata.json           # App Configuration
```

## 🎵 Audio System

The music is not a pre-recorded file. It is generated mathematically in real-time using `services/audioService.ts`. It constructs a 5-second loop consisting of:
*   **Kick**: Sine wave with pitch decay (120 BPM).
*   **Hi-Hat**: Filtered white noise on off-beats.
*   **Bass**: Sawtooth wave with a funky octave pattern.

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch.
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.

---

*Generated for the AI Cat Dancer Studio MVP.*
