# Workflow Builder

A single-page React application that allows users to define workflows for LLM agents to make phone calls and collect information from insurers. Built as part of Smarter Technology's virtual call center design technologist take-home.

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

## Usage

- The canvas displays **question nodes** connected by arrows in a sequence.
- Click the **+ Add Node** button in the top-right corner to append a new question node to the end of the workflow.
- Nodes can be dragged to reposition them on the canvas.
- Zoom and pan the canvas using scroll/pinch gestures.

## Project Structure

```
src/
├── components/
│   ├── ui/
│   │   └── button.tsx        # shadcn Button component
│   └── QuestionNode.tsx      # Custom React Flow node
├── lib/
│   └── utils.ts              # shadcn utilities
├── App.tsx                   # Main application
├── App.css                   # Custom styles
├── index.css                 # Tailwind + shadcn theme
└── main.tsx                  # Entry point
```
