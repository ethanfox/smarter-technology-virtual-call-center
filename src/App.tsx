import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Plus, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionNode, type QuestionNodeData } from "@/components/QuestionNode";
import "./App.css";

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

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const nodeTypes = useMemo(() => ({ question: QuestionNode }), []);

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setEdges((prevEdges) => {
        const incoming = prevEdges.find((e) => e.target === nodeId);
        const outgoing = prevEdges.find((e) => e.source === nodeId);

        const filtered = prevEdges.filter(
          (e) => e.source !== nodeId && e.target !== nodeId
        );

        if (incoming && outgoing) {
          return [...filtered, makeEdge(incoming.source, outgoing.target)];
        }
        return filtered;
      });

      setNodes((prevNodes) => prevNodes.filter((n) => n.id !== nodeId));
    },
    [setNodes, setEdges]
  );

  const handleQuestionChange = useCallback(
    (nodeId: string, question: string) => {
      setNodes((prevNodes) =>
        prevNodes.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, question } } : n
        )
      );
    },
    [setNodes]
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
    [nodes, handleDeleteNode, handleQuestionChange]
  );

  const handleAddNode = useCallback(() => {
    setNodes((prevNodes) => {
      const newId = String(Date.now());
      const questionIndex = prevNodes.length % PREDEFINED_QUESTIONS.length;

      if (prevNodes.length === 0) {
        return [
          {
            id: newId,
            type: "question",
            position: { x: 0, y: 0 },
            data: { question: PREDEFINED_QUESTIONS[questionIndex] },
          },
        ];
      }

      const lastNode = prevNodes[prevNodes.length - 1];

      const newNode: Node<QuestionNodeData> = {
        id: newId,
        type: "question",
        position: {
          x: lastNode.position.x,
          y: lastNode.position.y + NODE_SPACING_Y,
        },
        data: { question: PREDEFINED_QUESTIONS[questionIndex] },
      };

      setEdges((prevEdges) => [...prevEdges, makeEdge(lastNode.id, newId)]);

      return [...prevNodes, newNode];
    });
  }, [setNodes, setEdges]);

  return (
    <div className="app-container">
      <ReactFlow
        nodes={nodesWithCallbacks}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
      >
        <Panel position="top-left" className="header-panel">
          <h1 className="header-title">Workflow Builder</h1>
        </Panel>
        <Panel position="top-right" className="header-panel">
          <Button onClick={handleAddNode} className="add-node-btn">
            <Plus className="size-4" />
            Add Node
          </Button>
        </Panel>
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="#d1d5db" />
        {nodes.length === 0 && (
          <div className="empty-state">
            <Workflow className="size-10 text-muted-foreground/50" strokeWidth={1.5} />
            <p className="empty-state-title">No nodes yet</p>
            <p className="empty-state-description">
              Click <strong>+ Add Node</strong> to start building your workflow.
            </p>
          </div>
        )}
      </ReactFlow>
    </div>
  );
}
