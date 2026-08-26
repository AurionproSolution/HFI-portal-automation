import type {
  FullConfig,
  FullResult,
  Reporter,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";
import { getRecentTestSteps } from "@utils/testStepLog";

/** Logs failing test steps to stdout for CI triage. */
class StepFailureReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult): void {
    if (result.status === "passed" || result.status === "skipped") {
      return;
    }
    const title = test.title;
    const error = result.error?.message?.split("\n")[0] ?? "unknown error";
    console.error(`[STEP-FAILURE] ${title} — ${error}`);
    const recent = getRecentTestSteps();
    if (recent.length > 0) {
      console.error("[STEP-FAILURE] Recent logged steps:");
      for (const step of recent.slice(-10)) {
        console.error(`  ${step}`);
      }
    }
  }

  onEnd(_result: FullResult): void {
    // no-op
  }
}

export default StepFailureReporter;
