import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { MessageSquare } from "lucide-react";

export type QuestionNodeData = {
  question: string;
};

type QuestionNodeType = Node<QuestionNodeData, "question">;

export function QuestionNode({ data }: NodeProps<QuestionNodeType>) {
  return (
    <div className="question-node">
      <Handle type="target" position={Position.Top} className="handle" />
      <div className="question-node-header">
        <MessageSquare className="question-node-icon" />
        <span className="question-node-label">Question</span>
      </div>
      <div className="question-node-divider" />
      <div className="question-node-body">
        <p>{data.question}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="handle" />
    </div>
  );
}
