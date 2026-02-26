import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type FieldType = "text" | "textarea" | "number" | "select" | "phone";

export interface FieldDefinition {
  key: string;
  label: string;
  description?: string;
  type: FieldType;
  options?: { label: string; value: string }[];
}

export interface NodeFieldConfig {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: FieldDefinition[];
}

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: Record<string, unknown>) => void;
  config: NodeFieldConfig;
  values: Record<string, unknown>;
}

export function SidePanel({
  open,
  onClose,
  onSave,
  config,
  values,
}: SidePanelProps) {
  const [draft, setDraft] = useState<Record<string, unknown>>(values);

  useEffect(() => {
    setDraft(values);
  }, [values]);

  const updateField = (key: string, value: unknown) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  const Icon = config.icon;

  return (
    <>
      {open && (
        <div className="side-panel-backdrop" onClick={onClose} />
      )}
      <div className={`side-panel ${open ? "side-panel-open" : ""}`}>
        <div className="side-panel-header">
          <div className="side-panel-title">
            <Icon className="size-5 text-muted-foreground" />
            <span>{config.title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Close panel"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="side-panel-body">
          {config.fields.map((field) => (
            <div key={field.key} className="side-panel-field">
              <label className="side-panel-label">{field.label}</label>
              {field.description && (
                <p className="side-panel-description">{field.description}</p>
              )}
              {renderField(field, draft[field.key], (v) =>
                updateField(field.key, v),
              )}
            </div>
          ))}
        </div>

        <div className="side-panel-footer">
          <Button variant="outline" onClick={onClose} className="cursor-pointer">
            Close
          </Button>
          <Button onClick={handleSave} className="side-panel-save-btn cursor-pointer">
            Save
          </Button>
        </div>
      </div>
    </>
  );
}

export function formatUSPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function renderField(
  field: FieldDefinition,
  value: unknown,
  onChange: (value: unknown) => void,
) {
  switch (field.type) {
    case "textarea":
      return (
        <textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="side-panel-textarea"
          rows={4}
        />
      );
    case "number":
      return (
        <input
          type="number"
          value={(value as number) ?? 0}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="side-panel-input"
        />
      );
    case "select":
      return (
        <select
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="side-panel-select"
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    case "phone":
      return (
        <input
          type="tel"
          placeholder="(555) 123-4567"
          value={formatUSPhone((value as string) ?? "")}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
            onChange(digits);
          }}
          className="side-panel-input"
        />
      );
    case "text":
    default:
      return (
        <input
          type="text"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="side-panel-input"
        />
      );
  }
}
