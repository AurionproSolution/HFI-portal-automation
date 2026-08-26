import { test } from "@playwright/test";
import { requireModule } from "../invoice-financing/invoiceFinancing.helpers";

test.describe("Invoice Financing UI probe @probe", () => {
  test("dump invoice financing UI structure", async ({ page }) => {
    const inv = await requireModule(page);
    await inv.openInvoicesTab();

    const searchVisible = await inv.myUploadsSearchInput
      .isVisible()
      .catch(() => false);
    const batchRow = page
      .locator("tr, [role='row']")
      .filter({ hasText: /OEM-BATCH-/i })
      .first();
    const batchVisible = await batchRow.isVisible().catch(() => false);

    console.log("searchVisible", searchVisible);
    console.log("batchVisible", batchVisible);

    if (batchVisible) {
      await batchRow.click();
      await page.waitForTimeout(2000);
    }

    const viewDetails = page.getByRole("button", { name: /view details/i });
    console.log("viewDetailsCount", await viewDetails.count());

    const search = page.getByPlaceholder(/search/i).first();
    if (await search.isVisible().catch(() => false)) {
      await search.fill("OEM-BATCH-9");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(1500);
      console.log("after search OEM-BATCH-9:", (await inv.getPageText()).includes("OEM-BATCH-9"));
    }

    const text = await inv.getPageText();
    console.log("--- PAGE TEXT SNIPPET ---");
    console.log(text.slice(0, 5000));
  });
});
