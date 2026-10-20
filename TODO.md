# Engineering TODO

This list reflects the current repository state as of 2026-10-20. It is a working checklist, not a claim that every item has been tested.

## Recently completed
- [x] Make the first-run setup, intro wordmark, hero headline, and shared modals more viewport-safe. Merged in PR #86; the desktop build workflow passed.
- [x] Make task persistence failures explicit and treat configured Firestore as authoritative. Merged in PR #85; runtime behavior still needs verification against a real configured Firebase project.
- [x] Keep generation and preview status messages honest about what has and has not been compiled or deployed.
- [x] Capture a real built-workspace screenshot in CI for the README.

## Next priorities
- [ ] Run and fix `npm run lint` (TypeScript `tsc --noEmit`); record actual failures rather than relying on old error counts.
- [ ] Run a fresh production build and desktop package build after the latest merges.
- [ ] Exercise onboarding, template search, task modal, and the main workspace at narrow widths and short window heights using a browser test.
- [ ] Test task create/update/read/count against a real Firebase project, including permission errors, unavailable storage, and oversized task results.
- [ ] Harden staging preview file lookup: exact normalized paths only, correct MIME types, no HTML fallback for missing JS/CSS/assets, and an isolated preview security boundary.
- [ ] Verify the end-to-end generation path: prompt submission, task persistence, progress updates, generated file rendering, and an actually runnable preview.
- [ ] Audit user-facing buttons and integrations so unavailable actions are disabled or clearly report their implementation/configuration status.
- [ ] Audit release assets and documentation against the actual GitHub Releases page; avoid hard-coded versioned filenames unless verified.
- [ ] Review tracked build output and backup files (including `package.json.backup`) and remove only files confirmed to be accidental or obsolete.

## Validation rule
Do not mark an item complete until the corresponding command, automated check, or end-to-end test has actually passed.
