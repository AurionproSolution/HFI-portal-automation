/**
 * US-DLR-008 — Collateral (Read-only View)
 * Source: US-DLR-005_TestCases_v1.0.xlsx (official Excel — Collateral module)
 */

export interface CollateralCase {
  id: string;
  title: string;
  type: string;
  priority: string;
  ac: string;
}

export const COLLATERAL_CASES: CollateralCase[] = [
  { id: "TC-001", title: "Collateral page loads with default 'All Branches' scope and all KPI cards visible", type: "Positive", priority: "High", ac: "AC-1" },
  { id: "TC-002", title: "Breadcrumb, page title and description are displayed correctly", type: "UI", priority: "Medium", ac: "FE-Req" },
  { id: "TC-003", title: "Total Collateral Value equals sum of collateral values across active securities and shows pledged count", type: "Positive", priority: "High", ac: "AC-1" },
  { id: "TC-004", title: "Total Collateral Value = 0 with 0 pledged when no active securities exist", type: "Edge", priority: "Medium", ac: "AC-1" },
  { id: "TC-005", title: "Active Collateral KPI counts only securities with status = Active", type: "Positive", priority: "High", ac: "AC-1" },
  { id: "TC-006", title: "Expiring Soon shows count of securities expiring within 30 days", type: "Positive", priority: "High", ac: "AC-1, AC-4" },
  { id: "TC-007", title: "Expiring Soon count = 0 when no security is within 30 days", type: "Positive", priority: "Medium", ac: "AC-1" },
  { id: "TC-008", title: "Coverage Ratio % is computed as Collateral Value / Total Loan Amount", type: "Positive", priority: "High", ac: "AC-2" },
  { id: "TC-009", title: "Coverage Ratio > 100% (over-collateralized) is displayed correctly", type: "Edge", priority: "Medium", ac: "AC-2" },
  { id: "TC-010", title: "Coverage Ratio when Total Loan Amount = 0 is handled gracefully (no divide-by-zero)", type: "Edge", priority: "High", ac: "AC-2" },
  { id: "TC-011", title: "Security expiring on day 30 boundary is included in Expiring Soon (inclusive)", type: "Edge", priority: "High", ac: "AC-4" },
  { id: "TC-012", title: "Security expiring on day 31 is NOT included in Expiring Soon", type: "Edge", priority: "High", ac: "AC-4" },
  { id: "TC-013", title: "Security expiring today (day 0) is displayed correctly", type: "Edge", priority: "Medium", ac: "AC-4" },
  { id: "TC-014", title: "Security already past expiry (expiry < today) is shown with appropriate status", type: "Edge", priority: "Medium", ac: "AC-4" },
  { id: "TC-015", title: "Each pledged security is listed under Collateral Securities as a type-specific card", type: "Positive", priority: "High", ac: "AC-3" },
  { id: "TC-016", title: "Bank Guarantee card shows type-specific fields", type: "UI", priority: "High", ac: "AC-3" },
  { id: "TC-017", title: "Fixed Deposit card shows type-specific fields", type: "UI", priority: "High", ac: "AC-3" },
  { id: "TC-018", title: "Property Mortgage card shows type-specific fields", type: "UI", priority: "High", ac: "AC-3" },
  { id: "TC-019", title: "Corporate Guarantee card shows type-specific fields", type: "UI", priority: "High", ac: "AC-3" },
  { id: "TC-020", title: "Status pill on each card reflects the LOS-returned status", type: "UI", priority: "High", ac: "AC-3, AC-4" },
  { id: "TC-021", title: "Progress indicator and 'X days left' visible on each expiring security", type: "UI", priority: "High", ac: "AC-4" },
  { id: "TC-022", title: "Item count next to Collateral Securities matches the number of cards rendered", type: "UI", priority: "Medium", ac: "AC-3" },
  { id: "TC-023", title: "Selecting a specific branch refreshes KPI cards and Collateral Securities list", type: "Positive", priority: "High", ac: "AC-1, FE-Req" },
  { id: "TC-024", title: "Switching back to 'All Branches' restores the aggregate view", type: "Positive", priority: "Medium", ac: "AC-1" },
  { id: "TC-025", title: "Only branches within the dealer's scope are selectable in the filter", type: "Security", priority: "High", ac: "FE-Req, BR-Security" },
  { id: "TC-026", title: "Empty state is shown when no collateral exists for the selected scope", type: "Positive", priority: "High", ac: "AC-6, E1" },
  { id: "TC-027", title: "No Add / Edit / Delete / Release / Audit / Revaluation actions are available on the page", type: "UI", priority: "High", ac: "AC-5" },
  { id: "TC-028", title: "API attempts to write / modify collateral are rejected server-side", type: "Security", priority: "High", ac: "AC-5, BR-Security" },
  { id: "TC-029", title: "No editable fields on any KPI card or collateral card", type: "UI", priority: "Medium", ac: "AC-5" },
  { id: "TC-030", title: "LOS updates to collateral (add / update / release) reflect on page refresh", type: "Integration", priority: "High", ac: "BE" },
  { id: "TC-031", title: "LMS-provided expiry information is reflected on the card", type: "Integration", priority: "High", ac: "BE" },
  { id: "TC-032", title: "LOS unavailable - page shows a graceful, non-blocking error state", type: "Negative", priority: "High", ac: "BE" },
  { id: "TC-033", title: "LMS unavailable while LOS available - securities render with graceful expiry fallback", type: "Negative", priority: "Medium", ac: "BE" },
  { id: "TC-034", title: "Page-data-load API contract validation", type: "Integration", priority: "High", ac: "BE" },
  { id: "TC-035", title: "VIN-level / vehicle-stock collateral does NOT appear on this page", type: "Positive", priority: "High", ac: "Out-of-scope" },
  { id: "TC-036", title: "Add / Release / Revaluation actions are absent, aligned with the read-only scope", type: "Positive", priority: "Medium", ac: "Out-of-scope, AC-5" },
  { id: "TC-037", title: "Dealer only sees their own collateral records", type: "Security", priority: "High", ac: "BR-Security" },
  { id: "TC-038", title: "Branch scoping is enforced server-side, not just via the UI filter", type: "Security", priority: "High", ac: "AC-1, BR-Security" },
  { id: "TC-039", title: "Unauthenticated access to the Collateral page or API is denied", type: "Security", priority: "High", ac: "Precondition" },
  { id: "TC-040", title: "Large number of securities renders with pagination or virtual scroll", type: "NFR", priority: "Medium", ac: "AC-3" },
  { id: "TC-041", title: "Multiple securities of the same type render as separate cards", type: "Positive", priority: "Medium", ac: "AC-3" },
  { id: "TC-042", title: "Card sort order is defined and consistent (e.g. by expiry ascending)", type: "UI", priority: "Low", ac: "AC-3" },
  { id: "TC-043", title: "Page load performance is within the agreed SLA", type: "NFR", priority: "Medium", ac: "BE" },
  { id: "TC-044", title: "Currency and percentage formatting applied consistently across the page", type: "UI", priority: "Medium", ac: "AC-1, AC-2" },
];

export function getCollateralCase(id: string): CollateralCase | undefined {
  return COLLATERAL_CASES.find((c) => c.id === id);
}