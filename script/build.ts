import path from "node:path";
import { rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { build as esbuild } from "esbuild";

const rootDir = path.resolve(import.meta.dirname, "..");
const distDir = path.join(rootDir, "dist");

const run = (command: string, args: string[]) =>
  new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      cwd: rootDir,
      env: { ...process.env, NODE_ENV: "production" },
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(" ")} failed with code ${code}`));
      }
    });
  });

const viteBin = path.join(
  rootDir,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "vite.cmd" : "vite",
);

async function build() {
  await rm(distDir, { recursive: true, force: true });

  await run(viteBin, ["build"]);

  await esbuild({
    entryPoints: [path.join(rootDir, "server", "index.ts")],
    outfile: path.join(distDir, "index.cjs"),
    bundle: true,
    platform: "node",
    target: "node18",
    format: "cjs",
    sourcemap: true,
    define: {
      "process.env.NODE_ENV": JSON.stringify("production"),
    },
    external: ["pg-native"],
  });
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
