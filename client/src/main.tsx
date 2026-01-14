import { Buffer } from "buffer";
import process from "process";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Polyfill Buffer and process for Solana web3.js
if (typeof window !== "undefined") {
  window.global = window;
  window.Buffer = Buffer;
  window.process = process;
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(<App />);
