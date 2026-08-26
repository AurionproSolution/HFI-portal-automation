let stepCounter = 0;
const recentSteps: string[] = [];
const MAX_RECENT_STEPS = 20;

export function resetStepCounter(): void {
  stepCounter = 0;
  recentSteps.length = 0;
}

export function logTestStep(prefix: string, message: string): void {
  stepCounter += 1;
  const timestamp = new Date().toISOString();
  const line = `[STEP] [#${stepCounter}] [${timestamp}] [${prefix}] ${message}`;
  recentSteps.push(line);
  if (recentSteps.length > MAX_RECENT_STEPS) {
    recentSteps.shift();
  }
  console.log(line);
}

/** Last N logged steps — used by step-failure reporter for triage. */
export function getRecentTestSteps(): readonly string[] {
  return [...recentSteps];
}

/** Mask secrets in step logs. */
export function stepValueDisplay(label: string, value: string): string {
  if (/password|otp|token|secret/i.test(label)) {
    return "***";
  }
  return value;
}
