import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { Plus, Workflow, Command, MessageSquare, Phone, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  QuestionNode,
  type QuestionNodeData,
  questionFieldConfig,
  questionDefaults,
} from "@/components/QuestionNode";
import {
  StartCallNode,
  type StartCallNodeData,
  startCallFieldConfig,
  startCallDefaults,
} from "@/components/StartCallNode";
import {
  EndCallNode,
  type EndCallNodeData,
} from "@/components/EndCallNode";
import { SidePanel, type NodeFieldConfig } from "@/components/SidePanel";
import { Toast } from "@/components/Toast";
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

const nodeFieldConfigs: Record<string, NodeFieldConfig> = {
  question: questionFieldConfig,
  startCall: startCallFieldConfig,
};

type AnyNodeData = QuestionNodeData | StartCallNodeData | EndCallNodeData;

const initialNodes: Node[] = [
  {
    id: "1",
    type: "question",
    position: { x: 0, y: 0 },
    data: { ...questionDefaults, question: PREDEFINED_QUESTIONS[0] },
  },
  {
    id: "2",
    type: "question",
    position: { x: 0, y: NODE_SPACING_Y },
    data: { ...questionDefaults, question: PREDEFINED_QUESTIONS[0] },
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

  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((message: string) => {
    setToastVisible(false);
    requestAnimationFrame(() => {
      setToastMessage(message);
      setToastVisible(true);
    });
  }, []);

  const nodeTypes = useMemo(
    () => ({ question: QuestionNode, startCall: StartCallNode, endCall: EndCallNode }),
    [],
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      if (editingNodeId === nodeId) setEditingNodeId(null);

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
    [setNodes, setEdges, editingNodeId],
  );

  const handleEditNode = useCallback((nodeId: string) => {
    setEditingNodeId(nodeId);
  }, []);

  const handleSaveNode = useCallback(
    (values: Record<string, unknown>) => {
      if (!editingNodeId) return;
      setNodes((prevNodes) =>
        prevNodes.map((n) =>
          n.id === editingNodeId
            ? { ...n, data: { ...n.data, ...values } }
            : n,
        ),
      );
    },
    [editingNodeId, setNodes],
  );

  const nodesWithCallbacks = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onDelete: handleDeleteNode,
          ...(node.type !== "endCall" && { onEdit: handleEditNode }),
        },
      })),
    [nodes, handleDeleteNode, handleEditNode],
  );

  const editingNode = editingNodeId
    ? nodes.find((n) => n.id === editingNodeId)
    : null;

  const editingConfig = editingNode?.type
    ? nodeFieldConfigs[editingNode.type]
    : null;

  const editingValues = editingNode
    ? Object.fromEntries(
        (editingConfig?.fields ?? []).map((f) => [
          f.key,
          (editingNode.data as Record<string, unknown>)[f.key],
        ]),
      )
    : {};

  const rebuildEdgesFromOrder = useCallback(
    (orderedNodes: Node[]) => {
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
        const startNodes = prevNodes.filter((n) => n.type === "startCall");
        const endNodes = prevNodes.filter((n) => n.type === "endCall");
        const middleNodes = prevNodes
          .filter((n) => n.type !== "startCall" && n.type !== "endCall")
          .sort((a, b) => a.position.y - b.position.y);

        const sorted = [...startNodes, ...middleNodes, ...endNodes];
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

  const handleAddNode = useCallback(
    (nodeType: "question" | "startCall" | "endCall") => {
      setDropdownOpen(false);

      if (nodeType === "startCall" && nodes.some((n) => n.type === "startCall")) {
        showToast("A workflow can only have one Start Call node.");
        return;
      }
      if (nodeType === "endCall" && nodes.some((n) => n.type === "endCall")) {
        showToast("A workflow can only have one End Call node.");
        return;
      }

      setNodes((prevNodes) => {
        const newId = String(Date.now());

        const buildData = (): AnyNodeData => {
          if (nodeType === "startCall") return { ...startCallDefaults };
          if (nodeType === "endCall") return {};
          const questionIndex =
            prevNodes.filter((n) => n.type === "question").length %
            PREDEFINED_QUESTIONS.length;
          return {
            ...questionDefaults,
            question: PREDEFINED_QUESTIONS[questionIndex],
          };
        };

        const newNode: Node = {
          id: newId,
          type: nodeType,
          position: { x: 0, y: 0 },
          data: buildData(),
        };

        let result: Node[];
        if (prevNodes.length === 0) {
          result = [newNode];
        } else if (nodeType === "startCall") {
          result = [newNode, ...prevNodes];
        } else if (nodeType === "endCall") {
          result = [...prevNodes, newNode];
        } else {
          const firstEndIndex = prevNodes.findIndex((n) => n.type === "endCall");
          if (firstEndIndex !== -1) {
            result = [
              ...prevNodes.slice(0, firstEndIndex),
              newNode,
              ...prevNodes.slice(firstEndIndex),
            ];
          } else {
            result = [...prevNodes, newNode];
          }
        }

        const baseX = prevNodes[0]?.position.x ?? 0;
        const repositioned = result.map((node, i) => ({
          ...node,
          position: { x: baseX, y: i * NODE_SPACING_Y },
        }));

        const addedIndex = repositioned.findIndex((n) => n.id === newId);
        panToNode(repositioned[addedIndex].position);

        return repositioned;
      });
    },
    [nodes, setNodes, setEdges, panToNode, showToast],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "n" && (isMac ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        setDropdownOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setDropdownOpen(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (dropdownOpen) {
      requestAnimationFrame(() => {
        const firstBtn = dropdownMenuRef.current?.querySelector<HTMLButtonElement>("button");
        firstBtn?.focus();
      });
    }
  }, [dropdownOpen]);

  const handleDropdownKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const items = dropdownMenuRef.current?.querySelectorAll<HTMLButtonElement>("button");
      if (!items?.length) return;
      const currentIndex = Array.from(items).indexOf(e.target as HTMLButtonElement);
      const nextIndex = e.shiftKey
        ? (currentIndex - 1 + items.length) % items.length
        : (currentIndex + 1) % items.length;
      items[nextIndex].focus();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as HTMLElement)
      ) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    rebuildEdgesFromOrder(nodes);
  }, [nodes]);

  return (
    <>
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
          <div className="add-node-dropdown-wrapper" ref={dropdownRef}>
            <Button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="add-node-btn"
            >
              <Plus className="size-4" />
              Add Node
              <Kbd className="hidden sm:inline-flex bg-white/20 text-white/70 border-white/20 ml-1">
                {isMac ? <Command className="size-2.5" /> : "Ctrl"} N
              </Kbd>
            </Button>
            {dropdownOpen && (
              <div className="add-node-dropdown" ref={dropdownMenuRef} onKeyDown={handleDropdownKeyDown}>
                <button
                  className="add-node-dropdown-item"
                  onClick={() => handleAddNode("startCall")}
                >
                  <Phone className="add-node-dropdown-item-icon green" />
                  Start Call
                </button>
                <button
                  className="add-node-dropdown-item"
                  onClick={() => handleAddNode("question")}
                >
                  <MessageSquare className="add-node-dropdown-item-icon purple" />
                  Question
                </button>
                <button
                  className="add-node-dropdown-item"
                  onClick={() => handleAddNode("endCall")}
                >
                  <PhoneOff className="add-node-dropdown-item-icon red" />
                  End Call
                </button>
              </div>
            )}
          </div>
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
      {editingConfig && (
        <SidePanel
          open={editingNodeId !== null}
          onClose={() => setEditingNodeId(null)}
          onSave={handleSaveNode}
          config={editingConfig}
          values={editingValues}
        />
      )}
      <Toast
        message={toastMessage}
        visible={toastVisible}
        onDone={() => setToastVisible(false)}
      />
    </>
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
