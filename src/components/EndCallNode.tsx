import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { PhoneOff, Trash2 } from "lucide-react";

export type EndCallNodeData = {
  onDelete?: (id: string) => void;
};

type EndCallNodeType = Node<EndCallNodeData, "endCall">;

export function EndCallNode({ id, data }: NodeProps<EndCallNodeType>) {
  return (
    <div className="end-call-node group">
      <Handle type="target" position={Position.Top} className="handle" />
      <div className="end-call-node-header">
        <PhoneOff className="end-call-node-icon" />
        <span className="end-call-node-label">End Call</span>
        <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
    </div>
  );
}
