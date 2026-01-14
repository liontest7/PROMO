import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Polyfill Buffer globally before any other imports that might depend on it
import { Buffer } from "buffer";
if (typeof window !== "undefined") {
  (window as any).global = window;
  (window as any).Buffer = Buffer;
}

createRoot(document.getElementById("root")!).render(<App />);
