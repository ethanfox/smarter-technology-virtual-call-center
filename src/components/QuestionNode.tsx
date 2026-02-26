import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { MessageSquare, Trash2, Pencil } from "lucide-react";
import type { NodeFieldConfig } from "@/components/SidePanel";

export type QuestionNodeData = {
  question: string;
  maxRetries: number;
  transcriptionModel: string;
  llmModel: string;
  temperature: number;
  maxTokens: number;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
};

export const questionFieldConfig: NodeFieldConfig = {
  title: "Question",
  icon: MessageSquare,
  fields: [
    {
      key: "question",
      label: "Prompt",
      type: "textarea",
    },
    {
      key: "maxRetries",
      label: "Max Retries",
      description:
        "How many do you want the agent to retry the question until the variables are extracted successfully?",
      type: "number",
    },
    {
      key: "transcriptionModel",
      label: "Transcription Model",
      description: "Which transcription model do you want to use?",
      type: "select",
      options: [
        { label: "Deepgram", value: "deepgram" },
        { label: "Whisper", value: "whisper" },
        { label: "Azure Speech", value: "azure_speech" },
      ],
    },
    {
      key: "llmModel",
      label: "LLM Model",
      description:
        "Which LLM model do you want to use to process these questions?",
      type: "select",
      options: [
        { label: "ChatGPT-5", value: "chatgpt-5" },
        { label: "ChatGPT-4o", value: "chatgpt-4o" },
        { label: "Claude 4", value: "claude-4" },
      ],
    },
    {
      key: "temperature",
      label: "Temperature",
      type: "number",
    },
    {
      key: "maxTokens",
      label: "Max Tokens",
      type: "number",
    },
  ],
};

export const questionDefaults: Omit<QuestionNodeData, "onDelete" | "onEdit"> = {
  question: "",
  maxRetries: 3,
  transcriptionModel: "deepgram",
  llmModel: "chatgpt-5",
  temperature: 0.5,
  maxTokens: 200,
};

type QuestionNodeType = Node<QuestionNodeData, "question">;

export function QuestionNode({ id, data }: NodeProps<QuestionNodeType>) {
  return (
    <div className="question-node group">
      <Handle type="target" position={Position.Top} className="handle" />
      <div className="question-node-header">
        <MessageSquare className="question-node-icon" />
        <span className="question-node-label">Question</span>
        <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {data.onEdit && (
            <button
              onClick={() => data.onEdit!(id)}
              className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Edit question"
            >
              <Pencil className="size-3.5" />
            </button>
          )}
          {data.onDelete && (
            <button
              onClick={() => data.onDelete!(id)}
              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer"
              aria-label="Delete node"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      </div>
      <div className="question-node-divider" />
      <div className="question-node-body">
        <p>{data.question}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="handle" />
    </div>
  );
}
