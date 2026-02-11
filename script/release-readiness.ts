type Severity = "PASS" | "WARN" | "FAIL";

type Result = {
  name: string;
  severity: Severity;
  details: string;
};

const baseUrl = process.env.READINESS_BASE_URL || process.env.SMOKE_BASE_URL || "";
const network = (process.env.SOLANA_NETWORK || "").toLowerCase();

const requiredEnv = [
  "DATABASE_URL",
  "SESSION_SECRET",
  "RPC_URL",
  "PLATFORM_WALLET_PRIVATE_KEY",
  "TOKEN_MINT_ADDRESS",
  "SOLANA_NETWORK",
] as const;

async function checkHttp(path: string, expected: number): Promise<Result> {
  if (!baseUrl) {
    return {
      name: `HTTP ${path}`,
      severity: "WARN",
      details: "Skipped: READINESS_BASE_URL/SMOKE_BASE_URL is not set",
    };
  }

  const url = `${baseUrl}${path}`;

  try {
    const res = await fetch(url, { method: "GET" });
    if (res.status !== expected) {
      return {
        name: `HTTP ${path}`,
        severity: "FAIL",
        details: `Expected ${expected}, got ${res.status}`,
      };
    }

    return {
      name: `HTTP ${path}`,
      severity: "PASS",
      details: `Status ${res.status}`,
    };
  } catch (error) {
    return {
      name: `HTTP ${path}`,
      severity: "FAIL",
      details: (error as Error).message,
    };
  }
}

function checkEnvironment(): Result[] {
  const results: Result[] = [];

  for (const key of requiredEnv) {
    const value = process.env[key];
    if (!value || value.trim() === "") {
      results.push({
        name: `ENV ${key}`,
        severity: "FAIL",
        details: "Missing or empty",
      });
    } else {
      results.push({
        name: `ENV ${key}`,
        severity: "PASS",
        details: "Configured",
      });
    }
  }

  if (!network) {
    results.push({
      name: "SOLANA_NETWORK value",
      severity: "FAIL",
      details: "Must be set to devnet or mainnet",
    });
  } else if (network !== "devnet" && network !== "mainnet") {
    results.push({
      name: "SOLANA_NETWORK value",
      severity: "FAIL",
      details: `Unsupported value: ${network}`,
    });
  } else {
    results.push({
      name: "SOLANA_NETWORK value",
      severity: "PASS",
      details: network,
    });
  }

  const nodeEnv = process.env.NODE_ENV || "";
  if (!nodeEnv) {
    results.push({
      name: "NODE_ENV",
      severity: "WARN",
      details: "Unset (recommended: production in deployed env)",
    });
  } else {
    results.push({
      name: "NODE_ENV",
      severity: "PASS",
      details: nodeEnv,
    });
  }

  return results;
}

function printResults(results: Result[]) {
  for (const result of results) {
    const icon = result.severity === "PASS" ? "✅" : result.severity === "WARN" ? "⚠️" : "❌";
    console.log(`${icon} ${result.name}: ${result.details}`);
  }
}

async function run() {
  const envResults = checkEnvironment();
  const httpResults = await Promise.all([
    checkHttp("/api/health", 200),
    checkHttp("/api/public/settings", 200),
    checkHttp("/api/public/executions?limit=1", 200),
    checkHttp("/api/admin/stats", 403),
  ]);

  const all = [...envResults, ...httpResults];
  printResults(all);

  const failCount = all.filter((r) => r.severity === "FAIL").length;
  if (failCount > 0) {
    console.error(`\nReadiness check failed with ${failCount} blocking issue(s).`);
    process.exit(1);
  }

  console.log("\nReadiness check completed without blocking issues.");
}

run();
