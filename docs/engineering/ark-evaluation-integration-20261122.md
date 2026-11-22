# Ark evaluation integration gate — 2026-11-22

Source packages: task 37700, xyst 90671; vugh 90669; frore 90670. This is an integration worklist, NOT evidence of code integration.

## Candidate adoption
1. Audit existing misleading ability scores, career-level labels and missing-data=zero displays; remove or qualify unsupported inference without disrupting existing functionality.
2. Compare xyst's case/evidence workflow, vugh's PR evidence receipts, and frore's fact-vs-inference language; prefer small composable modules.
3. Require source URLs, capture times, sample coverage, uncertainty and explicit limitations for every public claim.

## Privacy and integrity gates
- No implied professional ranking from GitHub activity.
- LocalStorage, URL snapshots and Gist sharing are NOT cross-device identity, revocation or dispute infrastructure.
- Do not expose personal identifiers in residual audit records after withdrawal without a reviewed retention basis.
- Verify consent, attribution, redaction, authentication, revocation, exports and negative cases before shipping.

Status: review pending; no candidate code has been cherry-picked or merged.
