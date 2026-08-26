/**
 * US-DLR-010 — Transaction History (Ledger, Balances & Online Payments)
 * Source: US-DLR-010_TestCases_v1_0.xlsx
 */

export interface TransactionHistoryCase {
  id: string;
  title: string;
  type: string;
  priority: string;
  ac: string;
}

export const TRANSACTION_HISTORY_CASES: TransactionHistoryCase[] = [
  { id: "TC-001", title: "Verify Balance KPI cards render on page load", type: "UI", priority: "High", ac: "AC-1" },
  { id: "TC-002", title: "Verify KPI card values match LMS for the default 30-day filter", type: "Positive", priority: "High", ac: "AC-1" },
  { id: "TC-003", title: "Verify KPI values recalculate correctly when the period filter changes", type: "Positive", priority: "High", ac: "AC-1" },
  { id: "TC-004", title: "Verify Online Payments banner displays modes, dues, overdue and Pay Now", type: "UI", priority: "High", ac: "AC-2" },
  { id: "TC-005", title: "Verify Online Payments banner values match LMS source data", type: "Positive", priority: "High", ac: "AC-2" },
  { id: "TC-006", title: "Verify PO-wise ledger row displays all required columns", type: "UI", priority: "High", ac: "AC-3" },
  { id: "TC-007", title: "Verify PO row values match LMS source data", type: "Positive", priority: "High", ac: "AC-3" },
  { id: "TC-008", title: "Verify the ledger summary count (POs × entries) is correct", type: "UI", priority: "Medium", ac: "AC-3" },
  { id: "TC-009", title: "Verify expanding a PO row reveals entry-level columns", type: "UI", priority: "High", ac: "AC-4" },
  { id: "TC-010", title: "Verify entry-level values match LMS source data", type: "Positive", priority: "High", ac: "AC-4" },
  { id: "TC-011", title: "Verify collapsing an expanded PO hides its entries", type: "Alternate", priority: "Low", ac: "AC-4" },
  { id: "TC-012", title: "Verify the Status pill on ledger entries displays correctly for each defined status", type: "UI", priority: "Medium", ac: "AC-4" },
  { id: "TC-013", title: "Verify Pay Now directs the dealer to Worldline to continue payment", type: "Positive", priority: "High", ac: "AC-5" },
  { id: "TC-014", title: "Verify the Online Payment panel captures all required fields", type: "UI", priority: "High", ac: "Frontend Req" },
  { id: "TC-015", title: "Verify dealer can select a different Pay Against option instead of Outstanding dues", type: "Alternate", priority: "Medium", ac: "A3" },
  { id: "TC-016", title: "Verify Proceed to pay initiates real-time settlement for the entered details", type: "Positive", priority: "High", ac: "AC-6" },
  { id: "TC-017", title: "Verify dealer can make a part payment against outstanding dues", type: "Positive", priority: "Medium", ac: "Business Rule" },
  { id: "TC-018", title: "Verify Cancel on the Online Payment panel closes it without initiating payment", type: "Positive", priority: "High", ac: "AC-7" },
  { id: "TC-019", title: "Verify a reconciled payment updates the ledger and balances", type: "Positive", priority: "High", ac: "AC-8" },
  { id: "TC-020", title: "Verify an un-reconciled payment is not reflected until reconciliation completes", type: "Edge", priority: "Medium", ac: "Backend Integration" },
  { id: "TC-021", title: "Verify search by PO number filters the ledger", type: "Positive", priority: "Medium", ac: "AC-9" },
  { id: "TC-022", title: "Verify search by Transaction ID filters the ledger", type: "Positive", priority: "Medium", ac: "AC-9" },
  { id: "TC-023", title: "Verify search by reference filters the ledger", type: "Positive", priority: "Medium", ac: "AC-9" },
  { id: "TC-024", title: "Verify filtering by branch refreshes the ledger and KPIs", type: "Alternate", priority: "High", ac: "AC-9" },
  { id: "TC-025", title: "Verify changing the period filter refreshes the ledger and KPIs", type: "Alternate", priority: "High", ac: "AC-9" },
  { id: "TC-026", title: "Verify selecting a Custom period range refreshes the ledger and KPIs", type: "Alternate", priority: "Medium", ac: "AC-9" },
  { id: "TC-027", title: "Verify search with no matching records shows 'No data available'", type: "Negative", priority: "Low", ac: "AC-9, AC-14" },
  { id: "TC-028", title: "Verify Export downloads the ledger for the current scope and filters", type: "Positive", priority: "High", ac: "AC-10" },
  { id: "TC-029", title: "Verify Export with no active filters exports the full ledger for the current scope", type: "Edge", priority: "Medium", ac: "AC-10" },
  { id: "TC-030", title: "Verify Pay Now is unavailable and a nil-due state is shown when no dues are outstanding", type: "Negative", priority: "High", ac: "AC-11" },
  { id: "TC-031", title: "Verify a failed or cancelled payment at the gateway leaves dues outstanding with retry allowed", type: "Negative", priority: "High", ac: "AC-12" },
  { id: "TC-032", title: "Verify source system unavailability shows the standard connectivity validation message", type: "Negative", priority: "High", ac: "AC-13" },
  { id: "TC-033", title: "Verify unaffected sections continue to render when only one section's source is unavailable", type: "UI", priority: "Medium", ac: "AC-13, AC-14" },
  { id: "TC-034", title: "Verify a section with no data shows 'No data available.'", type: "UI", priority: "Medium", ac: "AC-14" },
  { id: "TC-035", title: "Verify Pay Now with a confirmed amount invokes the gateway with a unique transaction reference", type: "Positive", priority: "High", ac: "AC-15" },
  { id: "TC-036", title: "Verify Pay Now opens the payment process on a new browser tab", type: "Positive", priority: "High", ac: "AC-16" },
  { id: "TC-037", title: "Verify clicking Pay Now again opens another new tab with no restriction", type: "Alternate", priority: "Medium", ac: "AC-17" },
  { id: "TC-038", title: "Verify a declined payment leaves status Pending with dues outstanding", type: "Negative", priority: "High", ac: "AC-18" },
  { id: "TC-039", title: "Verify dealer can retry payment after a decline", type: "Positive", priority: "Medium", ac: "AC-18" },
  { id: "TC-040", title: "Verify a successful payment shows status 'Awaiting Confirmation'", type: "Positive", priority: "High", ac: "AC-19" },
  { id: "TC-041", title: "Verify closing the payment tab without completing marks the payment Cancelled", type: "Edge", priority: "Medium", ac: "AC-20" },
  { id: "TC-042", title: "Verify navigating away from the payment screen without completing marks it Cancelled", type: "Edge", priority: "Medium", ac: "AC-20" },
  { id: "TC-043", title: "Verify a payment outcome that arrives after the dealer left the page reflects correctly on reopen", type: "Positive", priority: "High", ac: "AC-21" },
  { id: "TC-044", title: "Verify the Consolidated / Branch toggle switches the ledger and KPI scope", type: "Alternate", priority: "High", ac: "Filters Bar" },
  { id: "TC-045", title: "Verify dealer arriving via the dashboard action lands directly on Transaction History", type: "Alternate", priority: "Medium", ac: "A5" },
  { id: "TC-046", title: "Verify Balance KPI cards are read-only", type: "UI", priority: "Low", ac: "Frontend Req" },
  { id: "TC-047", title: "Verify the Amount field only accepts valid positive numeric input", type: "Security", priority: "Medium", ac: "Frontend Req" },
  { id: "TC-048", title: "Verify a dealer cannot view ledger/balances for a branch outside their authorised scope", type: "Security", priority: "High", ac: "Preconditions" },
  { id: "TC-049", title: "Verify the page loads within an acceptable response time for a large ledger", type: "NFR", priority: "Medium", ac: "NFR" },
  { id: "TC-050", title: "Verify Proceed to pay is blocked when a required Online Payment field is missing", type: "Negative", priority: "High", ac: "Frontend Req" },
];

export function getTransactionHistoryCase(
  id: string,
): TransactionHistoryCase | undefined {
  return TRANSACTION_HISTORY_CASES.find((c) => c.id === id);
}
