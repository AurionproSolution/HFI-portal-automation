import { getBaseUrl, getLoginUrl } from "@config/env";

export const urls = {
  get baseUrl(): string {
    return getBaseUrl();
  },
  get loginUrl(): string {
    return getLoginUrl();
  },
  forgotPasswordPath: "/forgot-password",
  resetPasswordPath: "/reset-password",
  onboardingPath: "/onboarding",
} as const;
