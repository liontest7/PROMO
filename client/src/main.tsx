import { Buffer } from "buffer";
// @ts-ignore
import process from "process/browser";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Polyfill Buffer and process for Solana web3.js
if (typeof window !== "undefined") {
  window.global = window;
  // @ts-ignore
  window.Buffer = Buffer;
  // @ts-ignore
  window.process = process;
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(<App />);
