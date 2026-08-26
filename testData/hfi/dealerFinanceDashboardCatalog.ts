/**
 * US-DLR-007 — Dealer Finance Dashboard (Limit, Exposure & Action Items)
 * Source: US-DLR-006_TestCases_v1.0.xlsx
 */

export interface DealerFinanceDashboardCase {
  id: string;
  title: string;
  type: string;
  priority: string;
  ac: string;
}

export const DEALER_FINANCE_DASHBOARD_CASES: DealerFinanceDashboardCase[] = [
  { id: "TC-001", title: "Dashboard loads with default filters (All Branches Consolidated, 30D)", type: "Positive", priority: "High", ac: "AC-1, AC-15, Precondition" },
  { id: "TC-002", title: "Filter chips display all date range options (7D, 30D, MTD, 90D, YTD, Custom)", type: "UI", priority: "High", ac: "AC-15, FE-Req" },
  { id: "TC-003", title: "Branch selector lists only in-scope branches plus 'All Branches Consolidated'", type: "Security", priority: "High", ac: "AC-15, BR-Security" },
  { id: "TC-004", title: "Normal Limit card displays total, Used, Available, Limit Expiry and Days Left", type: "Positive", priority: "High", ac: "AC-1" },
  { id: "TC-005", title: "Normal Limit progress bar reflects Used vs Available proportion correctly", type: "UI", priority: "High", ac: "AC-1" },
  { id: "TC-006", title: "Normal Limit days-remaining countdown decrements correctly across days", type: "Edge", priority: "Medium", ac: "AC-1" },
  { id: "TC-007", title: "Adhoc Limit card displays total, Used, Available, Adhoc Validity and Days Left", type: "Positive", priority: "High", ac: "AC-1" },
  { id: "TC-008", title: "Adhoc Limit card renders correctly when no Adhoc limit is currently active", type: "Edge", priority: "Medium", ac: "AC-1" },
  { id: "TC-009", title: "Normal / Adhoc figures reflect only the OEM-visible portion (Limit Shared with OEM %)", type: "Positive", priority: "High", ac: "AC-2" },
  { id: "TC-010", title: "Limit Shared with OEM % = 100% shows the full sanctioned limit", type: "Edge", priority: "High", ac: "AC-2" },
  { id: "TC-011", title: "Limit Shared with OEM % = 0% renders a zero / minimum visibility state", type: "Edge", priority: "High", ac: "AC-2" },
  { id: "TC-012", title: "Default view when Limit Shared with OEM % has not been set", type: "Alternate", priority: "Medium", ac: "A2" },
  { id: "TC-013", title: "Post-load change of Limit Shared with OEM % requires reload to reflect", type: "Alternate", priority: "High", ac: "E3" },
  { id: "TC-014", title: "Dues section shows Normal, Adhoc and Overdue amounts sourced from LMS", type: "Positive", priority: "High", ac: "AC-17" },
  { id: "TC-015", title: "Overdue formula: Overdue = Normal overdue + Adhoc overdue", type: "Positive", priority: "High", ac: "AC-17" },
  { id: "TC-016", title: "Pay dues button navigates to Transaction History", type: "Positive", priority: "High", ac: "AC-3" },
  { id: "TC-017", title: "Pay dues behavior when no outstanding dues exist", type: "Edge", priority: "Medium", ac: "AC-3, AC-17" },
  { id: "TC-018", title: "All four Needs You Today cards are displayed with their figures", type: "Positive", priority: "High", ac: "AC-4" },
  { id: "TC-019", title: "Days to Nearest Tranche calculation is correct and derived from LMS", type: "Positive", priority: "High", ac: "AC-6" },
  { id: "TC-020", title: "Clicking Days to Nearest Tranche navigates to Purchase Orders & VINs", type: "Positive", priority: "High", ac: "AC-5" },
  { id: "TC-021", title: "POs Closest to Due Date counts POs expiring in the next 7 calendar days", type: "Positive", priority: "High", ac: "AC-7" },
  { id: "TC-022", title: "Clicking POs Closest to Due Date navigates to Purchase Orders & VINs", type: "Positive", priority: "High", ac: "AC-5" },
  { id: "TC-023", title: "Interest Repayment Dues shows count and sum of pending interest amounts", type: "Positive", priority: "High", ac: "AC-9" },
  { id: "TC-024", title: "Clicking Interest Repayment Dues navigates to Transaction History", type: "Positive", priority: "High", ac: "AC-8" },
  { id: "TC-025", title: "Limit Renewals Pending shows count of limits pending renewal from LOS", type: "Positive", priority: "High", ac: "AC-11" },
  { id: "TC-026", title: "Clicking Limit Renewals Pending navigates to Exposure Settings", type: "Positive", priority: "High", ac: "AC-10" },
  { id: "TC-027", title: "Needs You Today cards render zero / benign state when nothing needs attention", type: "Edge", priority: "Medium", ac: "AC-4" },
  { id: "TC-028", title: "PO Details table lists 5 POs with PO Number, Total, To Repay and Days Left", type: "Positive", priority: "High", ac: "AC-12" },
  { id: "TC-029", title: "PO Details sort order clarification (AC-13 vs main-course LIFO conflict)", type: "Positive", priority: "High", ac: "AC-13" },
  { id: "TC-030", title: "PO Details 'Open' link navigates to Purchase Orders & VINs", type: "Positive", priority: "High", ac: "AC-12" },
  { id: "TC-031", title: "PO Details when fewer than 5 POs exist - table shows all available", type: "Edge", priority: "Medium", ac: "AC-12" },
  { id: "TC-032", title: "PO Details empty state when no POs exist for scope", type: "Negative", priority: "High", ac: "AC-12, E2" },
  { id: "TC-033", title: "Donut chart displays the four overdue buckets with value and %", type: "Positive", priority: "High", ac: "AC-14" },
  { id: "TC-034", title: "Hovering over a segment shows details in the centre of the donut", type: "UI", priority: "High", ac: "AC-14" },
  { id: "TC-035", title: "Overdue POs count and value are called out separately", type: "UI", priority: "High", ac: "AC-14, E1" },
  { id: "TC-036", title: "Donut chart 'Open' link navigates to Purchase Orders & VINs", type: "Positive", priority: "Medium", ac: "AC-14" },
  { id: "TC-037", title: "Donut chart empty state when no POs exist for scope", type: "Negative", priority: "Medium", ac: "AC-14, E2" },
  { id: "TC-038", title: "Changing branch scope refreshes ALL dashboard sections", type: "Positive", priority: "High", ac: "AC-15" },
  { id: "TC-039", title: "Changing date-range chip refreshes ALL dashboard sections", type: "Positive", priority: "High", ac: "AC-15" },
  { id: "TC-040", title: "Custom date range picker applies correctly to all sections", type: "Positive", priority: "Medium", ac: "AC-15" },
  { id: "TC-041", title: "Consolidated view aggregates data across all branches", type: "Positive", priority: "High", ac: "AC-15" },
  { id: "TC-042", title: "Dashboard is read-only apart from Pay dues, Open links, and attention-card navigation", type: "UI", priority: "High", ac: "AC-16" },
  { id: "TC-043", title: "API attempts to modify limit / PO / exposure data from Dashboard endpoints are rejected", type: "Security", priority: "High", ac: "AC-16, BR-Security" },
  { id: "TC-044", title: "No data available for scope - 'No data to show' message", type: "Negative", priority: "High", ac: "E2" },
  { id: "TC-045", title: "LMS unavailable - graceful error state on limit/exposure/PO sections", type: "Negative", priority: "High", ac: "BE" },
  { id: "TC-046", title: "LOS unavailable - Limit Renewals Pending shows error state gracefully", type: "Negative", priority: "Medium", ac: "BE" },
  { id: "TC-047", title: "Limit Shared with OEM % cannot be adjusted from the Dashboard", type: "Positive", priority: "Medium", ac: "Out-of-scope" },
  { id: "TC-048", title: "Payment cannot be initiated directly from the Dashboard", type: "Positive", priority: "Medium", ac: "Out-of-scope, AC-3" },
  { id: "TC-049", title: "Dealer sees only their own data (multi-tenant isolation)", type: "Security", priority: "High", ac: "BR-Security" },
  { id: "TC-050", title: "Branch scoping is enforced server-side, not just at the UI", type: "Security", priority: "High", ac: "AC-15" },
  { id: "TC-051", title: "Dashboard load performance is within the agreed SLA", type: "NFR", priority: "Medium", ac: "BE" },
  { id: "TC-052", title: "Currency and percentage formatting consistent across the Dashboard", type: "UI", priority: "Medium", ac: "AC-1, AC-2, AC-14, AC-17" },
  { id: "TC-053", title: "Days-left rendering is consistent across cards (Normal, Adhoc, tranches, POs)", type: "UI", priority: "Medium", ac: "AC-1, AC-6, AC-7" },
  { id: "TC-054", title: "Concurrent tab / device access to Dashboard renders consistent data", type: "Edge", priority: "Low", ac: "AC-15" },
];

export function getDealerFinanceDashboardCase(
  id: string,
): DealerFinanceDashboardCase | undefined {
  return DEALER_FINANCE_DASHBOARD_CASES.find((c) => c.id === id);
}