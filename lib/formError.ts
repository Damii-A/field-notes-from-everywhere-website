/**
 * Turns a failed signup response into a message the reader can act on (the
 * APIs return e.g. "A valid email address is required"). The browser's own
 * validation already flags empty/malformed fields beside the field; this
 * covers what gets past it. Client-safe.
 */
export const GENERIC_FORM_ERROR = "Something went wrong — please try again.";

export async function formErrorMessage(res: Response): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  const error = body?.error ?? "";
  if (/email/i.test(error)) return "That email address doesn’t look right — please check it.";
  if (/name/i.test(error)) return "Please add your first name.";
  return GENERIC_FORM_ERROR;
}
