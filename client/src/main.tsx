import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Final Buffer injection attempt from multiple potential sources
if (typeof window !== "undefined") {
  window.global = window;
  // @ts-ignore
  window.Buffer = window.Buffer || (window as any).buffer?.Buffer;
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(<App />);
