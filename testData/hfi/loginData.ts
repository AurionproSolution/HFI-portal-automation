import { getCredentials } from "@config/env";

export interface LoginUser {
  username: string;
  password: string;
  dealerCode?: string;
  description: string;
}

const credentials = (): {
  username: string;
  password: string;
  dealerCode: string;
} => {
  try {
    return getCredentials();
  } catch {
    return { username: "", password: "", dealerCode: "" };
  }
};

export const loginData = {
  validUser(): LoginUser {
    const c = credentials();
    return {
      username: c.username,
      password: c.password,
      dealerCode: c.dealerCode,
      description: "Valid dealer from ACTIVE_DEALER / dealers.json",
    };
  },

  tc004ReturningUser(): { dealerId: string; password: string; description: string } {
    const { dealerCode, password } = credentials();
    return {
      dealerId: dealerCode,
      password,
      description: "Returning user — Dealer ID from ACTIVE_DEALER / dealers.json",
    };
  },

  invalidUsername: {
    username: "INVALID_USER_XYZ",
    password: "Secure@Pass3",
    description: "Invalid username",
  },

  invalidPassword: {
    username: "",
    password: "wrong-password-xyz",
    description: "Invalid password",
  },

  emptyUsername: {
    username: "",
    password: "Secure@Pass3",
    description: "Empty username",
  },

  emptyPassword: {
    username: "DL00009",
    password: "",
    description: "Empty password",
  },

  emptyBoth: {
    username: "",
    password: "",
    description: "Empty username and password",
  },
} as const;
