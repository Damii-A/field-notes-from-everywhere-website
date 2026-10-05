/**
 * The "How to send this newsletter" box at the top of every Weekly newsletter
 * in the Studio, so the weekly steps are always in front of the user (user,
 * 2026-10-05). Display only: the field it belongs to never holds a value.
 * Plain elements, so it needs no UI library of its own; colours follow the
 * Studio's theme.
 */
export const NEWSLETTER_STEPS = [
  "Check the articles below. Edit the subject line, intro, summaries and sign-off as you like; drag articles to reorder them, or remove any.",
  "Press Publish.",
  "Open the menu next to Publish (the ⌄ arrow) and press \"Create Resend draft\".",
  "In Resend, go to Broadcasts and open this week's draft. Preview it, then send it or schedule it for Wednesday 10am Eastern.",
  "Changed something afterwards? Edit it here, publish, and press \"Update Resend draft\" (same menu); it updates the same draft as long as it hasn't been sent or scheduled yet.",
];

export function NewsletterHowTo() {
  return (
    <div style={{ border: "1px solid var(--card-border-color, #ccc)", borderRadius: 6, padding: "12px 16px", lineHeight: 1.5, fontSize: 14 }}>
      <ol style={{ margin: 0, paddingLeft: 20 }}>
        {NEWSLETTER_STEPS.map((step) => (
          <li key={step} style={{ marginBottom: 6 }}>
            {step}
          </li>
        ))}
      </ol>
      <p style={{ margin: "8px 0 0" }}>Nothing is sent to readers until you send it in Resend.</p>
    </div>
  );
}
