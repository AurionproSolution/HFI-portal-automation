/**
 * US-DLR-005 — Profile (Dealer Info, Branches & Key Connects)
 * Source: US-DLR-007_TestCases_v1.0.xlsx
 */

export interface ProfileCase {
  id: string;
  title: string;
  type: string;
  priority: string;
  ac: string;
}

export const PROFILE_CASES: ProfileCase[] = [
  { id: "TC-001", title: "Profile page loads with all four sections rendered", type: "Positive", priority: "High", ac: "AC-1, AC-4, AC-6, AC-7" },
  { id: "TC-002", title: "Branch scope filter defaults to 'All Branches'", type: "UI", priority: "Medium", ac: "Precondition" },
  { id: "TC-003", title: "Dealer Information card displays all 8 fields sourced from the master record", type: "Positive", priority: "High", ac: "AC-1" },
  { id: "TC-004", title: "All fields except Registered Email and Registered Mobile are read-only", type: "Positive", priority: "High", ac: "AC-2" },
  { id: "TC-005", title: "Registered Email shows an Update action next to it", type: "UI", priority: "High", ac: "AC-2" },
  { id: "TC-006", title: "Registered Mobile shows an Update action next to it", type: "UI", priority: "High", ac: "AC-2" },
  { id: "TC-007", title: "Last Login timestamp is displayed in IST and matches the previous session", type: "Positive", priority: "Medium", ac: "AC-1" },
  { id: "TC-008", title: "GSTIN is displayed in the correct format (15-character alphanumeric)", type: "UI", priority: "Medium", ac: "AC-1" },
  { id: "TC-009", title: "Onboarded date is displayed in the specified format", type: "UI", priority: "Medium", ac: "AC-1" },
  { id: "TC-010", title: "Update action next to Registered Email launches the Contact Info Update flow", type: "Positive", priority: "High", ac: "AC-3, A1" },
  { id: "TC-011", title: "Update action next to Registered Mobile launches the Contact Info Update flow", type: "Positive", priority: "High", ac: "AC-3, A1" },
  { id: "TC-012", title: "Return from Contact Info Update lands back on Profile with refreshed values", type: "Alternate", priority: "Medium", ac: "A1" },
  { id: "TC-013", title: "Dealer Branches table displays all 9 columns per branch", type: "Positive", priority: "High", ac: "AC-4" },
  { id: "TC-014", title: "Branch Status pill = 'Active' reflects source system status", type: "Positive", priority: "High", ac: "AC-5" },
  { id: "TC-015", title: "Branch Status pill = 'Pending' reflects source system status", type: "Positive", priority: "High", ac: "AC-5, E1" },
  { id: "TC-016", title: "Branch Status pill = 'Inactive' reflects source system status", type: "Positive", priority: "High", ac: "AC-5, E1" },
  { id: "TC-017", title: "Dealer Branches sort order is defined and consistent", type: "UI", priority: "Medium", ac: "AC-4" },
  { id: "TC-018", title: "Branches section is not displayed when dealer has no branches", type: "Positive", priority: "Medium", ac: "AC-9" },
  { id: "TC-019", title: "Key Connects table displays all 6 columns per employee", type: "Positive", priority: "High", ac: "AC-6" },
  { id: "TC-020", title: "Key Connects section is not displayed when dealer has no recorded key contacts", type: "Positive", priority: "Medium", ac: "AC-9" },
  { id: "TC-021", title: "Key Connects respects the branch filter (if applicable)", type: "Positive", priority: "Medium", ac: "Filter behavior" },
  { id: "TC-022", title: "L1 and L2 contacts displayed with name, role, phone and email", type: "Positive", priority: "High", ac: "AC-7" },
  { id: "TC-023", title: "First active L1 and first active L2 shown when FOS Connects map to different managers", type: "Positive", priority: "High", ac: "AC-7, Step 6" },
  { id: "TC-024", title: "L2 not available - only L1 shown gracefully", type: "Edge", priority: "Medium", ac: "AC-7, AC-9" },
  { id: "TC-025", title: "Both L1 and L2 unavailable - Escalation panel is not displayed", type: "Edge", priority: "Medium", ac: "AC-9" },
  { id: "TC-026", title: "L1 / L2 contact phone and email are correctly formatted for click-to-call and mailto", type: "UI", priority: "Medium", ac: "AC-7" },
  { id: "TC-027", title: "Dealer master (DFS / LOS) unavailable - system-down message displayed", type: "Negative", priority: "High", ac: "AC-8" },
  { id: "TC-028", title: "LOS unavailable - Escalation Matrix panel shows system-down message", type: "Negative", priority: "High", ac: "AC-8" },
  { id: "TC-029", title: "Partial outage - Dealer master OK but Branches source down", type: "Negative", priority: "Medium", ac: "AC-8" },
  { id: "TC-030", title: "System-down message wording matches SDD exactly", type: "UI", priority: "High", ac: "AC-8" },
  { id: "TC-031", title: "AC-8 vs AC-9 distinction - system down vs data does not exist", type: "Negative", priority: "High", ac: "AC-8, AC-9" },
  { id: "TC-032", title: "All Profile fields except Update actions are read-only in UI", type: "UI", priority: "High", ac: "AC-2, Business Rule" },
  { id: "TC-033", title: "API attempts to write to Profile data are rejected server-side", type: "Security", priority: "High", ac: "Business Rule" },
  { id: "TC-034", title: "Dealer sees only their own profile data (multi-tenant isolation)", type: "Security", priority: "High", ac: "BR-Security" },
  { id: "TC-035", title: "Escalation Matrix is scoped to the authenticated dealership only", type: "Security", priority: "High", ac: "AC-7, BR-Security" },
  { id: "TC-036", title: "Unauthenticated access to Profile page or API is denied", type: "Security", priority: "High", ac: "Precondition" },
  { id: "TC-037", title: "Get Dealer Profile API - contract validation", type: "Integration", priority: "High", ac: "AC-1, AC-4, AC-6" },
  { id: "TC-038", title: "Get Escalation Matrix API - contract validation", type: "Integration", priority: "High", ac: "AC-7" },
  { id: "TC-039", title: "Long dealer names, addresses, and email IDs are handled gracefully", type: "Edge", priority: "Low", ac: "AC-1, AC-4, AC-6" },
  { id: "TC-040", title: "Email and phone are displayed in a consistent format", type: "UI", priority: "Low", ac: "AC-1, AC-4, AC-6, AC-7" },
  { id: "TC-041", title: "Special characters in employee / branch names render correctly (Unicode)", type: "Edge", priority: "Low", ac: "AC-4, AC-6" },
  { id: "TC-042", title: "Profile page load performance is within the agreed SLA", type: "NFR", priority: "Medium", ac: "AC-1" },
  { id: "TC-043", title: "Section rendering is not blocked by another section's failure", type: "Positive", priority: "High", ac: "AC-8, AC-9" },
];

export function getProfileCase(id: string): ProfileCase | undefined {
  return PROFILE_CASES.find((c) => c.id === id);
}