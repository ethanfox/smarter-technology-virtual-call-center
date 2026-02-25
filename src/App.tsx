import { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Plus, Workflow, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { QuestionNode, type QuestionNodeData } from "@/components/QuestionNode";
import "./App.css";

const isMac = navigator.platform.toUpperCase().includes("MAC");

const PREDEFINED_QUESTIONS = [
  "What percentage does the plan cover for co-insurance on diagnostic lab services?",
  "What is the annual deductible amount for in-network providers?",
  "Does the plan require prior authorization for specialist visits?",
  "What is the out-of-pocket maximum for the current plan year?",
  "Are telehealth visits covered under this plan?",
  "What is the copay amount for primary care physician visits?",
  "Does the plan cover out-of-network emergency services?",
  "What prescription drug tiers are included in the formulary?",
];

const NODE_SPACING_Y = 200;

const initialNodes: Node<QuestionNodeData>[] = [
  {
    id: "1",
    type: "question",
    position: { x: 0, y: 0 },
    data: { question: PREDEFINED_QUESTIONS[0] },
  },
  {
    id: "2",
    type: "question",
    position: { x: 0, y: NODE_SPACING_Y },
    data: { question: PREDEFINED_QUESTIONS[0] },
  },
];

function makeEdge(sourceId: string, targetId: string): Edge {
  return {
    id: `e${sourceId}-${targetId}`,
    source: sourceId,
    target: targetId,
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#9333ea",
      width: 20,
      height: 20,
    },
    style: { stroke: "#9333ea", strokeWidth: 2 },
  };
}

const initialEdges: Edge[] = [makeEdge("1", "2")];

const NODE_HEIGHT_ESTIMATE = 100;

function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { setCenter, getZoom } = useReactFlow();

  const nodeTypes = useMemo(() => ({ question: QuestionNode }), []);

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setEdges((prevEdges) => {
        const incoming = prevEdges.find((e) => e.target === nodeId);
        const outgoing = prevEdges.find((e) => e.source === nodeId);

        const filtered = prevEdges.filter(
          (e) => e.source !== nodeId && e.target !== nodeId,
        );

        if (incoming && outgoing) {
          return [...filtered, makeEdge(incoming.source, outgoing.target)];
        }
        return filtered;
      });

      setNodes((prevNodes) => prevNodes.filter((n) => n.id !== nodeId));
    },
    [setNodes, setEdges],
  );

  const handleQuestionChange = useCallback(
    (nodeId: string, question: string) => {
      setNodes((prevNodes) =>
        prevNodes.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, question } } : n,
        ),
      );
    },
    [setNodes],
  );

  const nodesWithCallbacks = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onDelete: handleDeleteNode,
          onQuestionChange: handleQuestionChange,
        },
      })),
    [nodes, handleDeleteNode, handleQuestionChange],
  );

  const rebuildEdgesFromOrder = useCallback(
    (orderedNodes: Node<QuestionNodeData>[]) => {
      const newEdges: Edge[] = [];
      for (let i = 0; i < orderedNodes.length - 1; i++) {
        newEdges.push(makeEdge(orderedNodes[i].id, orderedNodes[i + 1].id));
      }
      setEdges(newEdges);
    },
    [setEdges],
  );

  const handleNodeDragStop = useCallback(
    (_event: React.MouseEvent, _draggedNode: Node) => {
      setNodes((prevNodes) => {
        const sorted = [...prevNodes].sort(
          (a, b) => a.position.y - b.position.y,
        );
        rebuildEdgesFromOrder(sorted);
        return sorted;
      });
    },
    [setNodes, rebuildEdgesFromOrder],
  );

  const panToNode = useCallback(
    (position: { x: number; y: number }) => {
      requestAnimationFrame(() => {
        setCenter(position.x + 150, position.y + NODE_HEIGHT_ESTIMATE / 2, {
          zoom: getZoom(),
          duration: 500,
        });
      });
    },
    [setCenter, getZoom],
  );

  const handleAddNode = useCallback(() => {
    setNodes((prevNodes) => {
      const newId = String(Date.now());
      const questionIndex = prevNodes.length % PREDEFINED_QUESTIONS.length;

      if (prevNodes.length === 0) {
        const pos = { x: 0, y: 0 };
        panToNode(pos);
        return [
          {
            id: newId,
            type: "question",
            position: pos,
            data: { question: PREDEFINED_QUESTIONS[questionIndex] },
          },
        ];
      }

      const lastNode = prevNodes[prevNodes.length - 1];
      const pos = {
        x: lastNode.position.x,
        y: lastNode.position.y + NODE_SPACING_Y,
      };

      const newNode: Node<QuestionNodeData> = {
        id: newId,
        type: "question",
        position: pos,
        data: { question: PREDEFINED_QUESTIONS[questionIndex] },
      };

      // setEdges((prevEdges) => [...prevEdges, makeEdge(lastNode.id, newId)]);
      panToNode(pos);

      return [...prevNodes, newNode];
    });
  }, [setNodes, setEdges, panToNode]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "n" && (isMac ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        handleAddNode();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleAddNode]);

  // Add this - rebuilds edges whenever nodes change
  useEffect(() => {
    rebuildEdgesFromOrder(nodes);
  }, [nodes]);

  return (
    <ReactFlow
      nodes={nodesWithCallbacks}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeDragStop={handleNodeDragStop}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.5, maxZoom: 0.85 }}
      proOptions={{ hideAttribution: true }}
    >
      <Panel position="top-left" className="header-panel">
        <h1 className="header-title">Workflow Builder</h1>
      </Panel>
      <Panel position="top-right" className="header-panel">
        <Button onClick={handleAddNode} className="add-node-btn">
          <Plus className="size-4" />
          Add Node
          <Kbd className="hidden sm:inline-flex bg-white/20 text-white/70 border-white/20 ml-1">
            {isMac ? <Command className="size-2.5" /> : "Ctrl"} N
          </Kbd>
        </Button>
      </Panel>
      <Background
        variant={BackgroundVariant.Dots}
        gap={20}
        size={1.5}
        color="#d1d5db"
      />
      {nodes.length === 0 && (
        <div className="empty-state">
          <Workflow
            className="size-10 text-muted-foreground/50"
            strokeWidth={1.5}
          />
          <p className="empty-state-title">No nodes yet</p>
          <p className="empty-state-description">
            Click <strong>+ Add Node</strong> to start building your workflow.
          </p>
        </div>
      )}
    </ReactFlow>
  );
}

export default function App() {
  return (
    <div className="app-container">
      <ReactFlowProvider>
        <WorkflowBuilder />
      </ReactFlowProvider>
    </div>
  );
}
