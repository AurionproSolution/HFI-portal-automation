/**
 * UC-ADM-001 — Admin Console validation messages (verbatim from test cases).
 */

export const adminConsoleMessages = {
  duplicateUsername:
    "Username already exists. Please provide a unique username.",
  onlyActiveTemplateWarning:
    "This is currently the only active template. Deactivating/deleting this will result in notifications not being sent for this event. Are you sure you want to proceed?",
  mandatoryFieldsBlank:
    /please fill in all (mandatory|required) fields/i,
  lastAdminBlocked: /at least one active admin|last remaining admin|cannot suspend|cannot delete/i,
  accountSuspended:
    /suspended|reach out to your it admin|reactivate your account/i,
  accessDenied: /access denied|not authorized|forbidden|permission/i,
  invalidUrl: /invalid url|valid url|enter a valid url/i,
} as const;
