const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:5000";

type Check = {
  path: string;
  expectedStatus?: number;
};

const checks: Check[] = [
  { path: "/api/health", expectedStatus: 200 },
  { path: "/api/public/settings", expectedStatus: 200 },
  { path: "/api/public/executions?limit=1", expectedStatus: 200 },
  // unauthenticated admin should be blocked by session middleware
  { path: "/api/admin/stats", expectedStatus: 403 },
];

async function run() {
  const failures: string[] = [];

  for (const check of checks) {
    const url = `${baseUrl}${check.path}`;
    try {
      const res = await fetch(url, { method: "GET", credentials: "include" as RequestCredentials });
      const expected = check.expectedStatus ?? 200;
      if (res.status !== expected) {
        failures.push(`${check.path} -> HTTP ${res.status} (expected ${expected})`);
        continue;
      }
      await res.text();
      console.log(`OK ${check.path} -> ${res.status}`);
    } catch (error) {
      failures.push(`${check.path} -> ${(error as Error).message}`);
    }
  }

  if (failures.length > 0) {
    console.error("Staging smoke test failed:\n" + failures.map((f) => `- ${f}`).join("\n"));
    process.exit(1);
  }

  console.log("Staging smoke test passed");
}

run();
