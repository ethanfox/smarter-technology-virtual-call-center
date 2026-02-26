import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

interface ToastProps {
  message: string;
  visible: boolean;
  onDone: () => void;
  duration?: number;
}

export function Toast({ message, visible, onDone, duration = 3000 }: ToastProps) {
  const [stage, setStage] = useState<"enter" | "idle" | "exit" | "hidden">("hidden");

  useEffect(() => {
    if (visible) {
      setStage("enter");
      const idleTimer = setTimeout(() => setStage("idle"), 20);
      const exitTimer = setTimeout(() => setStage("exit"), duration);
      const hideTimer = setTimeout(() => {
        setStage("hidden");
        onDone();
      }, duration + 300);
      return () => {
        clearTimeout(idleTimer);
        clearTimeout(exitTimer);
        clearTimeout(hideTimer);
      };
    }
    setStage("hidden");
  }, [visible, duration, onDone]);

  if (stage === "hidden") return null;

  return (
    <div className={`toast-container ${stage === "enter" ? "toast-enter" : ""} ${stage === "exit" ? "toast-exit" : ""}`}>
      <AlertTriangle className="toast-icon" />
      <span className="toast-message">{message}</span>
    </div>
  );
}
