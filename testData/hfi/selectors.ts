export const selectors = {
  loader:
    '[role="progressbar"], .animate-spin, [data-testid="loader"], [aria-busy="true"]',
  toast: '[role="alert"], [role="status"], .toast',
  formError: '[role="alert"], .text-destructive, .text-red-600',
  pagination: '[aria-label*="pagination" i], .pagination',
  tableRow: "table tbody tr",
  spinner: ".animate-spin",
} as const;
