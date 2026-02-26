import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { Phone, Trash2, Pencil } from "lucide-react";
import { type NodeFieldConfig, formatUSPhone } from "@/components/SidePanel";

export type StartCallNodeData = {
  greetingMessage: string;
  timeoutDuration: number;
  phoneNumber: string;
  callbackNumber: string;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
};

export const startCallFieldConfig: NodeFieldConfig = {
  title: "Start Call",
  icon: Phone,
  fields: [
    {
      key: "greetingMessage",
      label: "Greeting Message",
      description: "The initial message the agent will say when the call connects.",
      type: "textarea",
    },
    {
      key: "timeoutDuration",
      label: "Timeout Duration (seconds)",
      description: "How long to wait before the call times out if unanswered.",
      type: "number",
    },
    {
      key: "phoneNumber",
      label: "Phone Number",
      description: "The phone number to dial.",
      type: "phone",
    },
    {
      key: "callbackNumber",
      label: "Callback Number",
      description: "The number shown as caller ID / used for callbacks.",
      type: "phone",
    },
  ],
};

export const startCallDefaults: Omit<StartCallNodeData, "onDelete" | "onEdit"> = {
  greetingMessage: "Hello, thank you for calling. How may I assist you today?",
  timeoutDuration: 30,
  phoneNumber: "",
  callbackNumber: "",
};

type StartCallNodeType = Node<StartCallNodeData, "startCall">;

export function StartCallNode({ id, data }: NodeProps<StartCallNodeType>) {
  return (
    <div className="start-call-node group">
      <Handle type="target" position={Position.Top} className="handle" />
      <div className="start-call-node-header">
        <Phone className="start-call-node-icon" />
        <span className="start-call-node-label">Start Call</span>
        <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {data.onEdit && (
            <button
              onClick={() => data.onEdit!(id)}
              className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Edit start call"
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
      <div className="start-call-node-divider" />
      <div className="start-call-node-body">
        <p className="start-call-node-greeting">{data.greetingMessage}</p>
        {data.phoneNumber && (
          <p className="start-call-node-detail">
            <Phone className="inline size-3 mr-1 opacity-60" />
            {formatUSPhone(data.phoneNumber)}
          </p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="handle" />
    </div>
  );
}
