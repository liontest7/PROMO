import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

const roots = ["client/src", "server", "shared", "script"];
const exts = new Set([".ts", ".tsx", ".js", ".jsx", ".md"]);

const violations: string[] = [];

function hasConflictMarker(content: string): boolean {
  return /^(<{7}|={7}|>{7})/m.test(content);
}

function walk(dir: string) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist" || entry === "target" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else {
      const ext = full.slice(full.lastIndexOf("."));
      if (!exts.has(ext)) continue;
      const content = readFileSync(full, "utf8");
      if (hasConflictMarker(content)) {
        violations.push(`${full}: contains merge-conflict markers`);
      }

      const enforceTsIgnore = full.startsWith("server/") || full.startsWith("shared/") || full.startsWith("script/");
      if (enforceTsIgnore && full !== "script/lint-rules.ts" && /@ts-ignore/.test(content)) {
        violations.push(`${full}: contains @ts-ignore`);
      }
    }
  }
}

for (const root of roots) walk(root);

if (violations.length > 0) {
  console.error("Lint rules failed:\n" + violations.map((v) => `- ${v}`).join("\n"));
  process.exit(1);
}

console.log("Lint rules passed");
