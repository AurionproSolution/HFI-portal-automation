import { getBaseUrl, getTestEnvironment, type TestEnvironment } from "./env";

export interface EnvironmentConfig {
  name: TestEnvironment;
  baseUrl: string;
  description: string;
}

const environmentMeta: Record<
  TestEnvironment,
  Omit<EnvironmentConfig, "baseUrl">
> = {
  dev: { name: "dev", description: "Development environment" },
  qat: { name: "qat", description: "QA / test environment" },
  sit: { name: "sit", description: "System integration testing" },
  uat: { name: "uat", description: "User acceptance testing" },
  prod: { name: "prod", description: "Production (read-only automation)" },
};

export function getEnvironmentConfig(): EnvironmentConfig {
  const name = getTestEnvironment();
  return {
    ...environmentMeta[name],
    baseUrl: getBaseUrl(),
  };
}
