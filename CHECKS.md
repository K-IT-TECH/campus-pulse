# Validation notes — CampusPulse

Checked 26 October 2026.

## Completed

- JavaScript syntax and local asset references checked.
- App opened in headless Chromium 153.0.8010.0 through a local server and directly as a local HTML file.
- Main create/update workflow and browser-storage persistence checked with automated browser interactions.
- No page-level JavaScript errors during the tested workflow.
- Responsive widths checked at 1365px, 390px and 320px, with no horizontal page overflow in the initial demo view.
- Form controls checked for an associated label or accessible name.
- Desktop and mobile screenshots inspected during preparation.
- Core state logic checked separately under Node using a small DOM adapter.

The collection's logic checks include known color-contrast ratios, unsafe text display, capacity limits, timer pause/resume and exactly-once completion, follow-up filtering, decimal parsing and 1,000 generated expense ledgers whose balances must settle exactly.

## Check your customized version

1. Create an event → save it → register locally → cancel the registration.
2. Reload and confirm your saved changes are still present.
3. Try an empty value, a very long title and an invalid number or URL where relevant.
4. Tab through the controls, open and close dialogs with the keyboard, and make sure focus is visible.
5. Check your own phone and desktop browser after changing CSS.
6. If you use export, open the downloaded file and verify its contents.

This is a focused starter-app check, not a complete browser-compatibility or accessibility audit. No cloud backend, real booking, payment or account flows were tested because none are implemented.

## Public release checks

- Backup/restore round trips, wrong-app and invalid-record rejection.
- Offline reload after service worker activation; cache isolation between apps.
- Desktop and narrow mobile layouts after adding data controls.
- CampusPulse calendar file formatting and escaping.
