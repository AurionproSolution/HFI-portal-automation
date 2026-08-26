/**
 * US-OEM-003 — Invoice Financing validation messages (AC-2 verbatim + UI patterns).
 */

export const invoiceFinancingMessages = {
  amountExceedsLimit: "The invoice(s) amount exceeds the available dealer limit.",
  incorrectFormat:
    "Incorrect field format used. Please retry using the correct formats.",
  mandatoryBlank: "Mandatory field(s) have been left blank. Please retry.",
  dealerUnavailable: "The dealer is not available in the system.",
  templateRequired: /xlsx template|expected.*template|template format/i,
  noData: /no data found|no data was found|zero records|nothing to upload/i,
  lmsUnavailable: /connectivity|could not be completed|unable to validate/i,
} as const;

/** US-OEM-002 — Dealer Limits dashboard messages (AC-5 verbatim). */
export const dealerLimitsMessages = {
  lmsOutage:
    "We're having trouble loading your data. We can't connect to one or more of the systems that provide this information. Please try again in a few minutes.",
  noDealers: /no dealers found|no dealer/i,
} as const;
