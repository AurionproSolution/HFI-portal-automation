export const messages = {
  login: {
    welcomeText: /welcome/i,
    usernameRequired: /username|email|dealer/i,
    passwordRequired: /password/i,
    invalidCredentials: /invalid|incorrect|failed|unable/i,
    signIn: "Sign In",
  },
  dashboard: {
    loadedUrlPattern: /\/(dashboard|home|dealer|consumer|onboarding)/i,
  },
} as const;
