import type { Locator, Page } from "@playwright/test";

export class TableUtils {
  constructor(private readonly page: Page) {}

  rowByText(text: RegExp | string): Locator {
    return this.page.locator("tr").filter({ hasText: text }).first();
  }

  async rowCount(table: Locator): Promise<number> {
    return table.locator("tbody tr").count();
  }
}
