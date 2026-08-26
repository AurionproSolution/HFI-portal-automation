/**
 * US-OEM-003 — Invoice Financing (Invoice Upload & Validation – Maker)
 * Source: US-OEM-003_TestCases_v1_0.xlsx
 */

export interface InvoiceFinancingCase {
  id: string;
  title: string;
  type: string;
  priority: string;
  ac: string;
}

export const INVOICE_FINANCING_CASES: InvoiceFinancingCase[] = [
  { id: "TC-001", title: "Verify Download XLSX Template returns the correct invoice-upload template", type: "UI", priority: "High", ac: "Table1 – UI Changes" },
  { id: "TC-002", title: "Verify each uploaded record is validated against dealer existence in LMS", type: "Positive", priority: "High", ac: "AC-1" },
  { id: "TC-003", title: "Verify each uploaded record is validated for product type", type: "Positive", priority: "High", ac: "AC-1" },
  { id: "TC-004", title: "Verify each uploaded record is validated for Invoice Number uniqueness", type: "Positive", priority: "High", ac: "AC-1" },
  { id: "TC-005", title: "Verify each uploaded record is validated against the dealer's available limit", type: "Positive", priority: "High", ac: "AC-1" },
  { id: "TC-006", title: "Verify each uploaded record is validated for all mandatory fields being populated", type: "Positive", priority: "High", ac: "AC-1" },
  { id: "TC-007", title: "Verify the exact error message when invoice amount exceeds the available dealer limit", type: "Negative", priority: "High", ac: "AC-2" },
  { id: "TC-008", title: "Verify the exact error message when a field is in an incorrect format", type: "Negative", priority: "High", ac: "AC-2" },
  { id: "TC-009", title: "Verify the exact error message when a mandatory field is left blank", type: "Negative", priority: "High", ac: "AC-2" },
  { id: "TC-010", title: "Verify the exact error message and reference for a duplicate Invoice Number", type: "Negative", priority: "High", ac: "AC-2" },
  { id: "TC-011", title: "Verify the exact error message for an inactive or incorrect dealer code", type: "Negative", priority: "High", ac: "AC-2" },
  { id: "TC-012", title: "Verify validation errors are displayed against each individual record on the main page", type: "UI", priority: "High", ac: "AC-2" },
  { id: "TC-013", title: "Verify a valid record creates a financing request routed to the Checker Queue", type: "Positive", priority: "High", ac: "AC-3" },
  { id: "TC-014", title: "Verify multiple valid records in one batch each create individual financing requests", type: "Positive", priority: "High", ac: "AC-3" },
  { id: "TC-015", title: "Verify an uploaded invoice carries no VIN / PO at this stage", type: "UI", priority: "Medium", ac: "AC-4" },
  { id: "TC-016", title: "Verify an uploaded invoice appears in My Uploads with the correct status", type: "UI", priority: "High", ac: "AC-4" },
  { id: "TC-017", title: "Verify KPI cards (Total / Uploaded / Failed) reflect the current uploaded set", type: "UI", priority: "High", ac: "AC-5" },
  { id: "TC-018", title: "Verify KPI counts update correctly after a new upload batch", type: "Positive", priority: "High", ac: "AC-5" },
  { id: "TC-019", title: "Verify correcting and re-uploading a failed invoice re-validates it as a new record", type: "Positive", priority: "High", ac: "AC-6" },
  { id: "TC-020", title: "Verify a re-uploaded corrected invoice is validated fresh, not blocked by its earlier failed attempt", type: "Edge", priority: "Medium", ac: "AC-6" },
  { id: "TC-021", title: "Verify the Audit and Tracking log displays the latest 50 actions", type: "UI", priority: "Medium", ac: "AC-7" },
  { id: "TC-022", title: "Verify 'Invoice batch uploaded' appears in the Audit and Tracking log", type: "Positive", priority: "Medium", ac: "AC-7" },
  { id: "TC-023", title: "Verify 'LMS sync cycle complete' appears in the Audit and Tracking log", type: "Positive", priority: "Medium", ac: "AC-7" },
  { id: "TC-024", title: "Verify only sprint-developed actions appear in the Audit and Tracking log", type: "Edge", priority: "Low", ac: "AC-7" },
  { id: "TC-025", title: "Verify LMS sync occurs at the configured 5-minute interval", type: "Positive", priority: "Medium", ac: "AC-8" },
  { id: "TC-026", title: "Verify the Invoices tab header shows Total Batches, Total Invoices, Uploaded and Failed", type: "UI", priority: "High", ac: "AC-9" },
  { id: "TC-027", title: "Verify Invoices tab header values match the underlying batch and invoice data", type: "Positive", priority: "High", ac: "AC-9" },
  { id: "TC-028", title: "Verify Export downloads the grid as CSV per the selected filters", type: "Positive", priority: "High", ac: "AC-10" },
  { id: "TC-029", title: "Verify Export with no filters applied exports the full grid as CSV", type: "Edge", priority: "Medium", ac: "AC-10" },
  { id: "TC-030", title: "Verify View Details in the Product/Model column opens a child window with Model, Variant, Quantity", type: "Positive", priority: "High", ac: "AC-11" },
  { id: "TC-031", title: "Verify the child window's product/model details match the uploaded record's data", type: "Positive", priority: "Medium", ac: "AC-11" },
  { id: "TC-032", title: "Verify the Invoice Batches grid Status column shows only Uploaded or Failed", type: "UI", priority: "Medium", ac: "AC-12" },
  { id: "TC-033", title: "Verify Download against a specific batch downloads that batch's details as CSV", type: "Positive", priority: "High", ac: "AC-13" },
  { id: "TC-034", title: "Verify the downloaded batch CSV contains only that batch's records", type: "Negative", priority: "Medium", ac: "AC-13" },
  { id: "TC-035", title: "Verify My Uploads search filters by Invoice Number / Dealer", type: "Alternate", priority: "Medium", ac: "A1 – Alternate Course" },
  { id: "TC-036", title: "Verify My Uploads filter by status (Uploaded / Failed) works correctly", type: "Alternate", priority: "Medium", ac: "A1 – Alternate Course" },
  { id: "TC-037", title: "Verify upload is rejected when the file is not in the XLSX template format", type: "Negative", priority: "High", ac: "Table2 – Validation Rules" },
  { id: "TC-038", title: "Verify upload is rejected when the file is empty or has no data rows", type: "Negative", priority: "Medium", ac: "Edge" },
  { id: "TC-039", title: "Verify a batch with a mix of valid and invalid records processes each record independently", type: "Edge", priority: "High", ac: "AC-1, AC-2, AC-3" },
  { id: "TC-040", title: "Verify VIN / PO columns, if present in an uploaded file, are ignored at this stage", type: "Negative", priority: "Low", ac: "AC-4, Out of Scope" },
  { id: "TC-041", title: "Verify an already-uploaded invoice record cannot be edited directly and requires re-upload for correction", type: "Negative", priority: "Medium", ac: "Out of Scope" },
  { id: "TC-042", title: "Verify a Maker cannot upload or view invoices for a dealer outside their authorised scope", type: "Security", priority: "High", ac: "Preconditions" },
  { id: "TC-043", title: "Verify a large batch upload (500+ records) processes all records without failure", type: "Edge", priority: "Medium", ac: "NFR" },
  { id: "TC-044", title: "Verify upload and validation of a large batch completes within an acceptable response time", type: "NFR", priority: "Medium", ac: "NFR" },
  { id: "TC-045", title: "Verify duplicate Invoice Numbers within the same uploaded batch are flagged", type: "Negative", priority: "High", ac: "AC-2" },
  { id: "TC-046", title: "Verify the dealer's available-limit check reflects the latest LMS sync data", type: "Positive", priority: "Medium", ac: "AC-1, AC-8" },
  { id: "TC-047", title: "Verify Download XLSX Template is available even before any upload has occurred", type: "UI", priority: "Low", ac: "Preconditions" },
  { id: "TC-048", title: "Verify upload validation fails gracefully with a clear message when LMS is unavailable", type: "Negative", priority: "High", ac: "Exception – E1 / robustness" },
  { id: "TC-049", title: "Verify a fully valid record with all business fields populated is accepted", type: "Positive", priority: "High", ac: "AC-1" },
  { id: "TC-050", title: "Verify an invalid Invoice Date format is rejected with the correct-format error message", type: "Negative", priority: "Medium", ac: "AC-2" },
];

export function getInvoiceFinancingCase(
  id: string,
): InvoiceFinancingCase | undefined {
  return INVOICE_FINANCING_CASES.find((c) => c.id === id);
}