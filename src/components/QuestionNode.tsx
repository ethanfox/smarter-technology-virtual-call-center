import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { MessageSquare, Trash2 } from "lucide-react";

export type QuestionNodeData = {
  question: string;
  onDelete?: (id: string) => void;
};

type QuestionNodeType = Node<QuestionNodeData, "question">;

export function QuestionNode({ id, data }: NodeProps<QuestionNodeType>) {
  return (
    <div className="question-node group">
      <Handle type="target" position={Position.Top} className="handle" />
      <div className="question-node-header">
        <MessageSquare className="question-node-icon" />
        <span className="question-node-label">Question</span>
        {data.onDelete && (
          <button
            onClick={() => data.onDelete!(id)}
            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer"
            aria-label="Delete node"
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>
      <div className="question-node-divider" />
      <div className="question-node-body">
        <p>{data.question}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="handle" />
    </div>
  );
}
