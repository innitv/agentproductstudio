import { pathToFileURL } from "node:url";
import {
  formatAgenticApprovalCommands,
  formatAgenticPreflight,
  formatAgenticReadiness,
  runWorkflowCli,
} from "./workflow-cli";

export {
  formatAgenticApprovalCommands,
  formatAgenticPreflight,
  formatAgenticReadiness,
  runWorkflowCli,
} from "./workflow-cli";

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runWorkflowCli().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}
