# Workflow Builder

A single-page React application that allows users to define workflows for LLM agents to make phone calls and collect information from insurers. Built as part of Smarter Technology's virtual call center design technologist take-home.

**[Run in StackBlitz](https://stackblitz.com/github/ethanfox/smarter-technology-virtual-call-center)** — no install required, runs directly in your browser. (Might need to refresh page while loading)

## Tech Stack

- **React 19** + TypeScript (via Vite)
- **React Flow** (`@xyflow/react`) — node-based workflow canvas
- **shadcn/ui** — UI components (Button)
- **Tailwind CSS v4** — utility-first styling
- **Lucide React** — icon set

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
npm install
npm run dev
```

The app will start at [http://localhost:5173](http://localhost:5173).

## Design Decisions

- **React Flow** (`@xyflow/react`) — Purpose-built for node-based UIs with built-in pan/zoom, drag-and-drop, edge routing, and a well-typed plugin system. Avoids reinventing canvas interactions from scratch and provides the same developer experience as Svelte Flow (both maintained by the xyflow team).
- **shadcn/ui** — Provides accessible, well-designed primitives (Button, Kbd) that are copied into the project rather than imported from a package. This means zero runtime dependency and full control over styling, which keeps the bundle lean and avoids version-lock concerns.
- **Tailwind CSS v4** — Utility-first styling that co-locates styles with markup, reducing context-switching. v4's Vite plugin eliminates config boilerplate.
- **Lucide React** — The icon set specified in the requirements. Tree-shakable, so only the icons actually used (MessageSquare, Trash2, Plus, etc.) end up in the bundle.
- **TypeScript** — Catches data shape issues at compile time, especially useful for React Flow's generic node/edge types.

## Usage

- The canvas displays **question nodes** connected by arrows in a sequence.
- Click the **+ Add Node** button (or press **Cmd+N** / **Ctrl+N**) to append a new question node to the end of the workflow.
- **Double-click** a question's text to edit it inline. Press **Enter** to save or **Escape** to cancel.
- **Drag** nodes vertically to reorder the sequence — edges reconnect automatically based on position.
- **Hover** over a node to reveal the edit and delete actions in the header.
- Delete all nodes to see the empty state prompt.
- Zoom and pan the canvas using scroll/pinch gestures.

## Beyond the MVP

These features go beyond the spec to demonstrate attention to real-world usability:

- **Node deletion** — A trash icon appears on hover in the node header. Deleting a node in the middle of the chain automatically reconnects the surrounding nodes, preserving the sequence.
- **Editable question text** — Double-click or use the pencil icon to inline-edit any question. A `Kbd` hint shows the Enter key shortcut for saving. This turns static display cards into a functional authoring tool.
- **Smooth pan animation** — Adding a node automatically pans the viewport to bring the new node into view with a 500ms animation, so users never lose context.
- **Empty state** — When all nodes are removed, a centered message with a workflow icon guides the user to add their first node.
- **Keyboard shortcuts** — `Cmd+N` (Mac) / `Ctrl+N` (Windows/Linux) to add a node, with a platform-aware `Kbd` badge inside the button. Enter to save edits, Escape to cancel.
- **Node reordering via drag** — Dragging a node above or below others in the vertical layout reorders the sequence and rebuilds all edges to match. This is essential for any real workflow builder.
- **Custom favicon** — Replaced the default Vite icon with a workflow-themed SVG.

## Project Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── button.tsx        # shadcn Button component
│   │   └── kbd.tsx           # shadcn Kbd component
│   └── QuestionNode.tsx      # Custom React Flow node
├── lib/
│   └── utils.ts              # shadcn utilities
├── App.tsx                   # Main application + workflow logic
├── App.css                   # Custom styles
├── index.css                 # Tailwind + shadcn theme
└── main.tsx                  # Entry point
```
