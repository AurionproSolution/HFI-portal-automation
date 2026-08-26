/**
 * US-DLR-006 — Contact Info Update
 * Source: US-DLR-008_TestCases_v1.0.xlsx
 */

export interface ContactInfoCase {
  id: string;
  title: string;
  type: string;
  priority: string;
  ac: string;
}

export const CONTACT_INFO_CASES: ContactInfoCase[] = [
  { id: 'TC-001', title: 'Update panel opens with Current value (read-only), New value field and Send OTP action', type: 'Positive', priority: 'High', ac: 'AC-1' },
  { id: 'TC-002', title: 'Update panel launches correctly from Registered Email on Profile', type: 'Positive', priority: 'High', ac: 'AC-1, AC-13' },
  { id: 'TC-003', title: 'Update panel launches correctly from Registered Mobile on Profile', type: 'Positive', priority: 'High', ac: 'AC-1, AC-13' },
  { id: 'TC-004', title: 'Panel is inline (does not navigate away from Profile)', type: 'UI', priority: 'Medium', ac: 'AC-1' },
  { id: 'TC-005', title: 'Valid email address is accepted and Send OTP becomes enabled', type: 'Positive', priority: 'High', ac: 'AC-2' },
  { id: 'TC-006', title: 'Invalid email (missing @) blocks Send OTP with inline error', type: 'Negative', priority: 'High', ac: 'AC-2, E1' },
  { id: 'TC-007', title: 'Invalid email (missing domain) blocks Send OTP', type: 'Negative', priority: 'High', ac: 'AC-2, E1' },
  { id: 'TC-008', title: 'Email with leading / trailing spaces is handled per spec', type: 'Edge', priority: 'Medium', ac: 'AC-2' },
  { id: 'TC-009', title: 'Email input is case-insensitive on comparison', type: 'Edge', priority: 'Medium', ac: 'AC-2, AC-5' },
  { id: 'TC-010', title: 'Valid 10-digit mobile is accepted and Send OTP becomes enabled', type: 'Positive', priority: 'High', ac: 'AC-3' },
  { id: 'TC-011', title: '9-digit mobile is rejected as invalid', type: 'Negative', priority: 'High', ac: 'AC-3, E1' },
  { id: 'TC-012', title: '11+ digit mobile is rejected as invalid', type: 'Negative', priority: 'High', ac: 'AC-3, E1' },
  { id: 'TC-013', title: 'Mobile containing non-numeric characters is rejected', type: 'Negative', priority: 'High', ac: 'AC-3, E1' },
  { id: 'TC-014', title: 'Empty New value blocks Send OTP', type: 'Negative', priority: 'Medium', ac: 'AC-2, AC-3' },
  { id: 'TC-015', title: 'New email identical to current email is rejected with the correct message', type: 'Negative', priority: 'High', ac: 'AC-5' },
  { id: 'TC-016', title: 'New mobile identical to current mobile is rejected', type: 'Negative', priority: 'High', ac: 'AC-5' },
  { id: 'TC-017', title: 'Send OTP for email update delivers OTP to the correct channel', type: 'Positive', priority: 'High', ac: 'AC-4' },
  { id: 'TC-018', title: 'Send OTP for mobile update delivers OTP to the NEW mobile number', type: 'Positive', priority: 'High', ac: 'AC-4' },
  { id: 'TC-019', title: 'OTP entry field appears after Send OTP is clicked with correct validation elements', type: 'UI', priority: 'High', ac: 'AC-4' },
  { id: 'TC-020', title: 'Correct OTP within validity window applies the update', type: 'Positive', priority: 'High', ac: 'AC-6' },
  { id: 'TC-021', title: 'Updated email is reflected on Profile immediately and on the next visit', type: 'Positive', priority: 'High', ac: 'AC-6' },
  { id: 'TC-022', title: 'Updated mobile is reflected on Profile immediately and on the next visit', type: 'Positive', priority: 'High', ac: 'AC-6' },
  { id: 'TC-023', title: 'OTP is valid for 5 minutes from the time of send', type: 'Positive', priority: 'High', ac: 'AC-10' },
  { id: 'TC-024', title: 'Incorrect OTP shows attempts-remaining message', type: 'Negative', priority: 'High', ac: 'AC-7, E2' },
  { id: 'TC-025', title: 'Expired OTP (>5 minutes) is rejected', type: 'Negative', priority: 'High', ac: 'AC-10' },
  { id: 'TC-026', title: '3 unsuccessful OTP attempts trigger the 24-hour / Service Request message', type: 'Negative', priority: 'High', ac: 'AC-11, E3' },
  { id: 'TC-027', title: 'After 3 failures, dealer cannot retry the flow for 24 hours', type: 'Negative', priority: 'High', ac: 'AC-11' },
  { id: 'TC-028', title: 'Empty OTP submission is blocked without incrementing counter', type: 'Negative', priority: 'Medium', ac: 'AC-7' },
  { id: 'TC-029', title: 'Resend OTP is disabled for 60 seconds with a countdown timer visible', type: 'UI', priority: 'High', ac: 'AC-8' },
  { id: 'TC-030', title: 'Resend OTP re-enables after 60 seconds', type: 'Positive', priority: 'High', ac: 'AC-9' },
  { id: 'TC-031', title: 'A newly-sent OTP invalidates the previous one', type: 'Positive', priority: 'High', ac: 'AC-10' },
  { id: 'TC-032', title: 'Resend OTP flow still respects the 3-attempt verification limit', type: 'Negative', priority: 'High', ac: 'AC-11' },
  { id: 'TC-033', title: 'Resend OTP countdown resets on each Resend click', type: 'Positive', priority: 'Medium', ac: 'AC-8, AC-9' },
  { id: 'TC-034', title: 'Cancel closes the panel and no change is made', type: 'Alternate', priority: 'High', ac: 'AC-12, A1' },
  { id: 'TC-035', title: 'Cancel during OTP entry invalidates the pending OTP session', type: 'Security', priority: 'Medium', ac: 'AC-12' },
  { id: 'TC-036', title: 'Panel behavior (fields, validation, OTP flow) is consistent for email and mobile', type: 'Positive', priority: 'High', ac: 'AC-13' },
  { id: 'TC-037', title: 'OTP is never displayed in URL, logs or unencrypted client storage', type: 'Security', priority: 'High', ac: 'BR-Security' },
  { id: 'TC-038', title: 'OTP verification is transmitted over HTTPS/TLS', type: 'Security', priority: 'High', ac: 'BR-Security' },
  { id: 'TC-039', title: 'Direct API update without OTP is rejected', type: 'Security', priority: 'High', ac: 'AC-6' },
  { id: 'TC-040', title: 'Reuse of a verified OTP does not permit a second update', type: 'Security', priority: 'High', ac: 'AC-6, AC-10' },
  { id: 'TC-041', title: 'OTP notification failure (Sinch down) surfaces as a non-blocking retry', type: 'Negative', priority: 'High', ac: 'Backend - Send OTP' },
  { id: 'TC-042', title: 'Update flow can be retried after a notification failure without penalty', type: 'Positive', priority: 'Medium', ac: 'Backend - Send OTP' },
  { id: 'TC-043', title: 'Send OTP API - contract validation', type: 'Integration', priority: 'High', ac: 'AC-4, Backend' },
  { id: 'TC-044', title: 'Update registered email / mobile API - contract validation', type: 'Integration', priority: 'High', ac: 'AC-6, Backend' },
  { id: 'TC-045', title: 'Multiple browser tabs on the same update flow do not create OTP confusion', type: 'Edge', priority: 'Medium', ac: 'AC-4, AC-6' },
  { id: 'TC-046', title: 'OTP field only accepts the specified digit / character length', type: 'UI', priority: 'Medium', ac: 'AC-6' },
  { id: 'TC-047', title: 'Concurrent update on both Email and Mobile in same session', type: 'Edge', priority: 'Low', ac: 'AC-13' },
];

export function getContactInfoCase(id: string): ContactInfoCase | undefined {
  return CONTACT_INFO_CASES.find((c) => c.id === id);
}
