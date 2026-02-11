const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:5000";

const checks = [
  "/api/health",
  "/api/public/settings",
  "/api/public/executions?limit=1",
];

async function run() {
  const failures: string[] = [];

  for (const path of checks) {
    const url = `${baseUrl}${path}`;
    try {
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) {
        failures.push(`${path} -> HTTP ${res.status}`);
        continue;
      }
      await res.text();
      console.log(`OK ${path}`);
    } catch (error) {
      failures.push(`${path} -> ${(error as Error).message}`);
    }
  }

  if (failures.length > 0) {
    console.error("Smoke test failed:\n" + failures.map((f) => `- ${f}`).join("\n"));
    process.exit(1);
  }

  console.log("Smoke test passed");
}

run();
