import os from "os";
import type { OrtoniReportConfig } from "ortoni-report";
import { getCurrentEnv, isCI } from "./env";

/** Ortoni HTML report settings — https://github.com/ortoniKC/ortoni-report */
export const ortoniReportConfig: OrtoniReportConfig = {
  open: isCI() ? "never" : "on-failure",
  folderPath: "ortoni-report",
  filename: "ortoni-report.html",
  title: "HFI Dealer Portal — Test Report",
  projectName: "HondaDealerAutomation",
  testType: "Regression",
  authorName: process.env.REPORT_AUTHOR?.trim() || os.userInfo().username,
  base64Image: false,
  stdIO: true,
  saveHistory: true,
  meta: {
    Environment: getCurrentEnv().toUpperCase(),
    Portal: "HFI Dealer Portal",
    Application: "Honda Financial Services",
  },
};
