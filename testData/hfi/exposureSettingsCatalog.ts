/**
 * US-DLR-011 — Exposure Settings (Limits, Sub-limits, Expiry, Requests & Visibility)
 * Source: US-DLR-011_TestCases_v1_0.xlsx
 */

export interface ExposureSettingsCase {
  id: string;
  title: string;
  type: string;
  priority: string;
  ac: string;
}

export const EXPOSURE_SETTINGS_CASES: ExposureSettingsCase[] = [
  { id: "TC-001", title: "Verify Exposure KPI cards render on page load", type: "UI", priority: "High", ac: "AC-1" },
  { id: "TC-002", title: "Verify KPI values are the consolidated Normal + Adhoc position with expiry from the Normal limit", type: "Positive", priority: "High", ac: "AC-1" },
  { id: "TC-003", title: "Verify Normal Limit block displays all required fields", type: "UI", priority: "High", ac: "AC-2" },
  { id: "TC-004", title: "Verify Normal Limit block values match LOS source data", type: "Positive", priority: "High", ac: "AC-2" },
  { id: "TC-005", title: "Verify Adhoc Limit block displays all required fields when granted", type: "UI", priority: "High", ac: "AC-2" },
  { id: "TC-006", title: "Verify Adhoc Limit block values match LOS source data", type: "Positive", priority: "High", ac: "AC-2" },
  { id: "TC-007", title: "Verify the Adhoc Limit block is not shown when no adhoc limit is granted", type: "Negative", priority: "High", ac: "AC-23" },
  { id: "TC-008", title: "Verify the Normal Limit block extends to fill the space when no adhoc limit exists", type: "UI", priority: "Medium", ac: "AC-23" },
  { id: "TC-009", title: "Verify Normal and Adhoc limits both display correctly when an adhoc limit is issued", type: "UI", priority: "High", ac: "AC-24" },
  { id: "TC-010", title: "Verify Pending Limit Requests table displays all required columns", type: "UI", priority: "High", ac: "AC-3" },
  { id: "TC-011", title: "Verify Pending Limit Requests values match LOS source data", type: "Positive", priority: "High", ac: "AC-3" },
  { id: "TC-012", title: "Verify search by Request ID filters the Pending Limit Requests table", type: "Positive", priority: "Medium", ac: "AC-3" },
  { id: "TC-013", title: "Verify filtering Pending Limit Requests by branch works correctly", type: "Positive", priority: "Medium", ac: "AC-3" },
  { id: "TC-014", title: "Verify filtering Pending Limit Requests by status works correctly", type: "Positive", priority: "Medium", ac: "AC-3" },
  { id: "TC-015", title: "Verify search/filter with no matching requests shows 'No data available'", type: "Negative", priority: "Low", ac: "AC-3, AC-19" },
  { id: "TC-016", title: "Verify the Adhoc Limit Request modal shows the context strip and all form fields", type: "UI", priority: "High", ac: "AC-4" },
  { id: "TC-017", title: "Verify the Adhoc Amount field shows helper text clarifying it is a temporary increment", type: "UI", priority: "Medium", ac: "AC-4" },
  { id: "TC-018", title: "Verify the Limit Renewal modal shows the context strip and all form fields", type: "UI", priority: "High", ac: "AC-5" },
  { id: "TC-019", title: "Verify the Requested Limit field shows helper text and the Credit review SLA is indicated", type: "UI", priority: "Medium", ac: "AC-5" },
  { id: "TC-020", title: "Verify Submit for Review on Adhoc Limit Request shows a confirmation pop-up", type: "Positive", priority: "High", ac: "AC-6" },
  { id: "TC-021", title: "Verify Submit for Review on Limit Renewal shows a confirmation pop-up", type: "Positive", priority: "High", ac: "AC-6" },
  { id: "TC-022", title: "Verify confirming submission sends the Adhoc Limit Request to LOS and it appears Under Review", type: "Positive", priority: "High", ac: "AC-7" },
  { id: "TC-023", title: "Verify confirming submission sends the Limit Renewal request to LOS and it appears Under Review", type: "Positive", priority: "High", ac: "AC-7" },
  { id: "TC-024", title: "Verify a confirmation message is displayed after successful submission", type: "UI", priority: "Medium", ac: "AC-7" },
  { id: "TC-025", title: "Verify Cancel on the Adhoc/Limit Renewal modal closes it without creating a request", type: "Positive", priority: "High", ac: "AC-8" },
  { id: "TC-026", title: "Verify Cancel on the confirmation pop-up returns the dealer to the form", type: "Positive", priority: "Medium", ac: "AC-10" },
  { id: "TC-027", title: "Verify Submit for review is blocked when required fields are missing", type: "Negative", priority: "High", ac: "Frontend Req" },
  { id: "TC-028", title: "Verify Submit for review is blocked without a Supporting Document", type: "Negative", priority: "High", ac: "Frontend Req" },
  { id: "TC-029", title: "Verify LOS submission failure is communicated and the request can be retried", type: "Edge", priority: "Medium", ac: "Backend Integration – Submit Adhoc/Renewal" },
  { id: "TC-030", title: "Verify the Visibility Preference section displays all required elements", type: "UI", priority: "High", ac: "AC-11" },
  { id: "TC-031", title: "Verify the dealer can change Shared Portion % using the slider", type: "Positive", priority: "High", ac: "AC-12" },
  { id: "TC-032", title: "Verify the dealer can select a preset instead of dragging the slider", type: "Alternate", priority: "Medium", ac: "AC-12" },
  { id: "TC-033", title: "Verify the dealer can key in a percentage or an equivalent amount directly", type: "Positive", priority: "Medium", ac: "AC-12" },
  { id: "TC-034", title: "Verify Shared and Held Back amounts recompute immediately when the percentage changes", type: "Positive", priority: "High", ac: "AC-13" },
  { id: "TC-035", title: "Verify Save changes persists the new percentage and updates Last Updated", type: "Positive", priority: "High", ac: "AC-14" },
  { id: "TC-036", title: "Verify an unsaved percentage change reverts when the dealer leaves the section", type: "Negative", priority: "Medium", ac: "AC-15" },
  { id: "TC-037", title: "Verify the visibility indicator shows 'Conservative' for 10–35%", type: "UI", priority: "Medium", ac: "AC-21" },
  { id: "TC-038", title: "Verify the visibility indicator shows 'Balanced' for >35–80%", type: "UI", priority: "Medium", ac: "AC-21" },
  { id: "TC-039", title: "Verify the visibility indicator shows 'High Visibility' for >80–100%", type: "UI", priority: "Medium", ac: "AC-21" },
  { id: "TC-040", title: "Verify the dealer cannot set OEM visibility below the 10% minimum", type: "Negative", priority: "High", ac: "AC-22" },
  { id: "TC-041", title: "Verify a first-time dealer login requires setting the OEM shared percentage before proceeding", type: "Negative", priority: "High", ac: "AC-20" },
  { id: "TC-042", title: "Verify setting the OEM percentage on first login unblocks the rest of the portal", type: "Positive", priority: "High", ac: "AC-20" },
  { id: "TC-043", title: "Verify a near-expiry limit is reflected in the days-remaining indicator", type: "UI", priority: "Medium", ac: "AC-16" },
  { id: "TC-044", title: "Verify a fully-utilised limit is reflected in the % utilised indicator", type: "UI", priority: "Medium", ac: "AC-16" },
  { id: "TC-045", title: "Verify repayments are adjusted against adhoc limits first, then standard limits", type: "Positive", priority: "High", ac: "AC-17" },
  { id: "TC-046", title: "Verify source system unavailability shows the standard connectivity validation message", type: "Negative", priority: "High", ac: "AC-18" },
  { id: "TC-047", title: "Verify a section with no data shows 'No data available.'", type: "UI", priority: "Medium", ac: "AC-19" },
  { id: "TC-048", title: "Verify changing branch scope refreshes the exposure position and requests", type: "Alternate", priority: "High", ac: "A4, Filters Bar" },
  { id: "TC-049", title: "Verify a dealer cannot view exposure/limit data for a branch outside their authorised scope", type: "Security", priority: "High", ac: "Preconditions" },
  { id: "TC-050", title: "Verify the page loads within an acceptable response time with a large pending requests list", type: "NFR", priority: "Medium", ac: "NFR" },
];

export function getExposureSettingsCase(
  id: string,
): ExposureSettingsCase | undefined {
  return EXPOSURE_SETTINGS_CASES.find((c) => c.id === id);
}