import { spawn } from "node:child_process";

const inputArgs = process.argv.slice(2);
const serverOnly = inputArgs[0] === "--server-only";
const appArg = inputArgs.find((arg) => arg.startsWith("--app="));
const appName = appArg?.split("=")[1] ?? "frontend";
const specs = serverOnly ? [] : inputArgs.filter((arg) => !arg.startsWith("--app="));
const previewUrl = "http://127.0.0.1:4173";
const appConfigs = {
  frontend: {
    viteConfig: "apps/frontend/vite.config.ts",
    env: {},
  },
};

if (!appConfigs[appName]) {
  console.error(`Unknown preview app "${appName}". Expected one of: ${Object.keys(appConfigs).join(", ")}`);
  process.exit(1);
}

function spawnCommand(command, args, options = {}) {
  return spawn(command, args, {
    shell: false,
    stdio: "inherit",
    windowsHide: true,
    ...options,
  });
}

function killTree(processId) {
  return new Promise((resolve) => {
    if (!processId) {
      resolve();
      return;
    }

    if (process.platform === "win32") {
      const killer = spawn("taskkill", ["/PID", String(processId), "/T", "/F"], {
        shell: false,
        stdio: "ignore",
        windowsHide: true,
      });
      killer.on("close", () => resolve());
      return;
    }

    try {
      process.kill(processId, "SIGTERM");
    } catch {
      // The process may have already exited.
    }
    resolve();
  });
}

async function waitForServer(child) {
  const deadline = Date.now() + 60_000;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Preview server exited early with code ${child.exitCode}`);
    }

    try {
      const response = await fetch(previewUrl);
      if (response.ok || response.status < 500) {
        return;
      }
    } catch {
      // Server is not ready yet.
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for ${previewUrl}`);
}

const preview = spawnCommand(process.execPath, [
  "node_modules/vite/bin/vite.js",
  "preview",
  "--config",
  appConfigs[appName].viteConfig,
  "--host",
  "127.0.0.1",
  "--port",
  "4173",
  "--strictPort",
]);

let exiting = false;

async function shutdownAndExit(code) {
  if (exiting) {
    return;
  }
  exiting = true;
  await killTree(preview.pid);
  process.exit(code);
}

process.on("SIGINT", () => void shutdownAndExit(130));
process.on("SIGTERM", () => void shutdownAndExit(143));

try {
  await waitForServer(preview);

  if (serverOnly) {
    await new Promise(() => {
      // Playwright owns this process in webServer mode and will terminate it.
    });
  }

  const playwright = spawnCommand(process.execPath, ["node_modules/@playwright/test/cli.js", "test", ...specs], {
    env: {
      ...process.env,
      ...appConfigs[appName].env,
      PLAYWRIGHT_NO_WEBSERVER: "1",
    },
  });

  playwright.on("close", (code) => {
    void shutdownAndExit(code ?? 1);
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  await shutdownAndExit(1);
}
