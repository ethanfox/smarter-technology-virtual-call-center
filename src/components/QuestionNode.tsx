import { useState, useRef, useEffect } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { MessageSquare, Trash2, Pencil, CornerDownLeft } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";

export type QuestionNodeData = {
  question: string;
  onDelete?: (id: string) => void;
  onQuestionChange?: (id: string, question: string) => void;
};

type QuestionNodeType = Node<QuestionNodeData, "question">;

export function QuestionNode({ id, data }: NodeProps<QuestionNodeType>) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data.question);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editing]);

  const commitEdit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== data.question) {
      data.onQuestionChange?.(id, trimmed);
    } else {
      setDraft(data.question);
    }
    setEditing(false);
  };

  return (
    <div className="question-node group">
      <Handle type="target" position={Position.Top} className="handle" />
      <div className="question-node-header">
        <MessageSquare className="question-node-icon" />
        <span className="question-node-label">Question</span>
        <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {data.onQuestionChange && !editing && (
            <button
              onClick={() => setEditing(true)}
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
        {editing ? (
          <div className="flex flex-col gap-1.5">
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  commitEdit();
                }
                if (e.key === "Escape") {
                  setDraft(data.question);
                  setEditing(false);
                }
              }}
              className="question-node-textarea nodrag nowheel"
              rows={3}
            />
            <div className="flex items-center justify-end gap-1 text-muted-foreground">
              <Kbd><CornerDownLeft className="size-2.5" /></Kbd>
              <span className="text-[11px]">to save</span>
            </div>
          </div>
        ) : (
          <p
            className="cursor-text"
            onDoubleClick={() => data.onQuestionChange && setEditing(true)}
          >
            {data.question}
          </p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="handle" />
    </div>
  );
}
