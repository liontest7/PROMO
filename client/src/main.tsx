import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Check if Buffer is available globally from script tag or fallback
if (typeof window !== "undefined") {
  window.global = window;
  // @ts-ignore
  if (!window.Buffer && (window as any).buffer) {
    (window as any).Buffer = (window as any).buffer.Buffer;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(<App />);
