/**
 * US-DLR-009 — Purchase Orders & VINs (Pay Against Sold VINs)
 * Source: US-DLR-009_TestCases_v1_0.xlsx
 */

export interface PurchaseOrdersVINsCase {
  id: string;
  title: string;
  type: string;
  priority: string;
  ac: string;
}

export const PURCHASE_ORDERS_VINS_CASES: PurchaseOrdersVINsCase[] = [
  { id: "TC-001", title: "Verify KPI cards render on page load", type: "UI", priority: "High", ac: "AC-1" },
  { id: "TC-002", title: "Verify KPI card values match LMS source data", type: "Positive", priority: "High", ac: "AC-1" },
  { id: "TC-003", title: "Verify data-load failure shows the standard connectivity error message", type: "Negative", priority: "High", ac: "AC-3" },
  { id: "TC-004", title: "Verify Retry option is available on data-load failure", type: "UI", priority: "High", ac: "AC-4" },
  { id: "TC-005", title: "Verify Retry successfully reloads data once source is available", type: "Edge", priority: "Medium", ac: "AC-4" },
  { id: "TC-006", title: "Verify empty section shows 'No data available' message", type: "UI", priority: "Medium", ac: "AC-5" },
  { id: "TC-007", title: "Verify marking a VIN as Sold updates only that field without a full page reload", type: "Positive", priority: "High", ac: "AC-2" },
  { id: "TC-008", title: "Verify other VIN rows and fields remain unaffected when one VIN is marked Sold", type: "Edge", priority: "Medium", ac: "AC-2" },
  { id: "TC-009", title: "Verify VIN Inventory Snapshot displays all required buckets", type: "UI", priority: "High", ac: "AC-6" },
  { id: "TC-010", title: "Verify VIN Inventory Snapshot values match LMS source data", type: "Positive", priority: "High", ac: "AC-6" },
  { id: "TC-011", title: "Verify a snapshot bucket with zero records shows 'No data available'", type: "UI", priority: "Low", ac: "AC-5, AC-6" },
  { id: "TC-012", title: "Verify expanding a PO row displays all VIN-level detail columns", type: "UI", priority: "High", ac: "AC-7" },
  { id: "TC-013", title: "Verify VIN row data matches the underlying source for every column", type: "Positive", priority: "High", ac: "AC-7" },
  { id: "TC-014", title: "Verify collapsing an expanded PO hides its VIN rows", type: "Alternate", priority: "Low", ac: "AC-7" },
  { id: "TC-015", title: "Verify PO grid displays a maximum of 50 records on one page", type: "Edge", priority: "High", ac: "AC-8" },
  { id: "TC-016", title: "Verify pagination boundary behaviour at exactly 50 and 51 records", type: "Edge", priority: "Medium", ac: "AC-8" },
  { id: "TC-017", title: "Verify marking a VIN as Sold makes it eligible for payment selection", type: "Positive", priority: "High", ac: "AC-9" },
  { id: "TC-018", title: "Verify a Sold, unpaid VIN's checkbox is selectable for payment", type: "Positive", priority: "High", ac: "AC-10" },
  { id: "TC-019", title: "Verify an In Stock / unsold VIN cannot be selected for payment", type: "Negative", priority: "High", ac: "AC-10, AC-14" },
  { id: "TC-020", title: "Verify Payment column shows 'Not Required' for an In Stock / unsold VIN", type: "UI", priority: "Medium", ac: "AC-14" },
  { id: "TC-021", title: "Verify Pay action is unavailable when zero Sold VINs are selected", type: "Negative", priority: "High", ac: "AC-15" },
  { id: "TC-022", title: "Verify selecting one Sold VIN enables the Pay action", type: "Positive", priority: "High", ac: "AC-11, AC-15" },
  { id: "TC-023", title: "Verify selecting multiple Sold VINs enables Pay and auto-calculates the total", type: "Positive", priority: "High", ac: "AC-11, AC-12" },
  { id: "TC-024", title: "Verify the auto-calculated total payable amount is not editable by the dealer", type: "Security", priority: "Medium", ac: "AC-12" },
  { id: "TC-025", title: "Verify Pay Now invokes Worldline with a unique transaction reference and amount", type: "Positive", priority: "High", ac: "AC-11, AC-21" },
  { id: "TC-026", title: "Verify Pay Now opens the payment journey in a new browser tab", type: "Positive", priority: "High", ac: "AC-22" },
  { id: "TC-027", title: "Verify clicking Pay Now again opens another new tab with no restriction", type: "Alternate", priority: "Medium", ac: "AC-23" },
  { id: "TC-028", title: "Verify a declined payment leaves status Pending with dues outstanding", type: "Negative", priority: "High", ac: "AC-24" },
  { id: "TC-029", title: "Verify dealer can retry payment after a decline", type: "Positive", priority: "Medium", ac: "AC-24" },
  { id: "TC-030", title: "Verify a successful payment shows status 'Awaiting Confirmation'", type: "Positive", priority: "High", ac: "AC-25" },
  { id: "TC-031", title: "Verify closing the payment tab without completing marks the payment Cancelled", type: "Edge", priority: "Medium", ac: "AC-26" },
  { id: "TC-032", title: "Verify navigating away from the payment screen without completing marks it Cancelled", type: "Edge", priority: "Medium", ac: "AC-26" },
  { id: "TC-033", title: "Verify a payment outcome that arrives after the dealer left the page reflects correctly on reopen", type: "Positive", priority: "High", ac: "AC-27" },
  { id: "TC-034", title: "Verify the Payment column displays all four defined statuses correctly", type: "UI", priority: "High", ac: "AC-20" },
  { id: "TC-035", title: "Verify Add Payment Details captures Amount Paid and UTR Number for a Sold VIN", type: "Positive", priority: "High", ac: "AC-13" },
  { id: "TC-036", title: "Verify Add Payment Details cannot be submitted without a payment confirmation document", type: "Negative", priority: "High", ac: "AC-13" },
  { id: "TC-037", title: "Verify Add Payment Details is unavailable for a VIN that is not marked Sold", type: "Negative", priority: "Medium", ac: "AC-13, AC-14" },
  { id: "TC-038", title: "Verify submitting Add Payment Details sends the record to the Ops console", type: "Positive", priority: "Medium", ac: "AC-18" },
  { id: "TC-039", title: "Verify document upload rejects disallowed file types and oversized files", type: "Edge", priority: "Low", ac: "AC-13" },
  { id: "TC-040", title: "Verify search by PO number (partial) filters the PO/VIN list", type: "Positive", priority: "Medium", ac: "AC-16" },
  { id: "TC-041", title: "Verify search by VIN (partial) filters the PO/VIN list", type: "Positive", priority: "Medium", ac: "AC-16" },
  { id: "TC-042", title: "Verify search by model returns matching PO/VIN records", type: "Positive", priority: "Medium", ac: "AC-16" },
  { id: "TC-043", title: "Verify search by UTR number returns matching PO/VIN records", type: "Positive", priority: "Medium", ac: "AC-16" },
  { id: "TC-044", title: "Verify search with no matching records shows 'No data available'", type: "Negative", priority: "Low", ac: "AC-16, AC-5" },
  { id: "TC-045", title: "Verify Export downloads the currently filtered PO/VIN list as CSV", type: "Positive", priority: "High", ac: "AC-17" },
  { id: "TC-046", title: "Verify Export with no active filters exports the full list as CSV", type: "Edge", priority: "Medium", ac: "AC-17" },
  { id: "TC-047", title: "Verify changing branch scope refreshes the page data", type: "Alternate", priority: "High", ac: "FE-Req" },
  { id: "TC-048", title: "Verify changing the date range filter refreshes the page data", type: "Alternate", priority: "Medium", ac: "FE-Req" },
  { id: "TC-049", title: "Verify a dealer cannot view PO/VIN data outside their authorised branch scope", type: "Security", priority: "High", ac: "Preconditions" },
  { id: "TC-050", title: "Verify KPI cards, snapshot and PO/VIN grid load within an acceptable response time", type: "NFR", priority: "Medium", ac: "NFR" },
];

export function getPurchaseOrdersVINsCase(
  id: string,
): PurchaseOrdersVINsCase | undefined {
  return PURCHASE_ORDERS_VINS_CASES.find((c) => c.id === id);
}
