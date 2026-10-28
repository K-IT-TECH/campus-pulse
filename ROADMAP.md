# Develop CampusPulse

Keep changes small and test one feature at a time.

## Version 1.1 — your first upgrade

Add an event editing form.

Write a one-paragraph user story, add the smallest useful implementation, and verify that existing data still loads. Explain the change in `MY_CHANGES.md`.

## Version 1.2 — more capability

Add a real database, user login and server-checked capacity.

Add validation, loading/empty/error states where relevant, and a keyboard-friendly flow. If a new data model is needed, plan a migration before changing saved records.

## Version 2 — a larger project

Create unique tickets and a verified QR check-in flow.

When you introduce a backend, validate writes on the server, scope records to the signed-in user and keep API secrets out of browser code. A static GitHub Pages site cannot itself run your server.

## A prompt you can reuse

> I am developing the CampusPulse starter in this folder. Read README.md and app.js first. My next feature is: [choose one concrete feature above]. Keep the existing visual design and working behavior. Do not replace the entire project. Explain the files you will change, implement the smallest useful change, preserve existing saved data, and test the affected flows. Tell me what changed in beginner-friendly language and update MY_CHANGES.md with facts only.

## Portfolio story

Be ready to explain the problem, one design decision, one edge case, and one feature you personally added. Show the working app alongside the source code.
