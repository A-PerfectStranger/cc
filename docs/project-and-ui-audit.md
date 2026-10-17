# Project workspace and UI audit

Audited 2026-10-17 against remote `main` commit `ff73d33`.

## Result

A project workspace is feasible within the existing static GitHub Pages architecture. No backend is needed for a first version with browser-local projects and file export/import. The current application has catalogue browsing and global bookmarks only; bookmarks do not represent project scope, implementation progress, or dependency satisfaction.

Remote changes were fetched and fast-forwarded. The remote deleted and recreated the Pages workflow; its final contents match the previous deployment workflow. No application changes were present in those remote commits. This audit does not implement the proposed features or verify the live Pages deployment.

## Recommended project workflow

1. Add **Catalogue** and **Projects** as top-level destinations, preserving the existing bookmarks as personal reading references.
2. Create a project with a name, description, evaluated-product boundary (TOE), and catalogue edition. Show a project selector and an explicit active-project name when adding requirements from the catalogue.
3. Give each active component an **Add to project** control. A family action offers **Add all active components** and explains that a family groups components; selecting a family does not inherently mean every component is required. Show unchecked, partially selected, and fully selected family states, calculated from selected components.
4. An element-level **Use in project** action adds its entire parent component and explains the inclusion of the other elements. CC Part 2 section 7.1.4.3 requires the complete set of elements when selecting a component. Allow individual element notes, assignment/selection values, evidence links, and implementation status; do not represent an isolated element as a complete CC requirement selection.
5. Provide a project scope view grouped by class → family → component → element, with search, selected-only filtering, counts, component removal, and a summary of unfinished work. Removing a component removes its elements from scope; offer undo and preserve recoverable notes rather than silently losing work.
6. Keep **scope selection**, **implementation progress**, and **evaluation readiness** distinct. Suggested per-element statuses: Not started, In progress, Implemented, Verified. A verified checkbox does not establish Common Criteria certification or dependency satisfaction.
7. Support JSON export/import for a complete editable backup and Markdown export for human review. Include IDs, edition, original requirement text, source page, notes, operation completions, and unresolved review items. Validate imported schema, size, IDs, and statuses; preview import and offer a new project copy instead of overwriting existing work.
8. Persist changes locally and clearly state that projects belong to this browser and site origin. Show save failures and an export option. Multi-user collaboration, accounts, and cross-device synchronization require a later backend or explicit external storage integration.

## Common Criteria rules to preserve

- FCS_CKM.4 is deprecated. Keep it visible for reference, disable new selection, and link to FCS_CKM.6. Flag it if encountered in imported data.
- Keep normative wording and the original PDF available beside summaries. The current simplification replaces bracketed operations with a generic placeholder. This is a navigation aid, not enough detail to specify a project requirement: 236 of 284 elements contain bracketed text.
- Dependencies currently exist as unstructured text in `catalogue.json`. They contain AND requirements, OR alternatives, and hierarchical substitutions. For example, FCS_CKM.1 has multiple dependency groups, including an alternative between FCS_RBG.1 and FCS_RNG.1.
- For the initial workspace, display dependencies and a manual review state. Do not treat every referenced ID as mandatory or automatically add every alternative. Clearly label dependency satisfaction as not automatically validated.
- For a later automated checker, add reviewed structured `allOf`/`anyOf` dependency groups and explicit hierarchy metadata. Test alternatives and substitutions before claiming that a project is dependency-complete.
- Preserve originals when users complete assignments/selections; store user-entered completions separately, with a review status. Nested operations make regex-only replacement unsuitable as a validated requirement editor.

## Confirmed findings, ordered by priority

| Priority          | Finding and evidence                                                                                                                                                                     | Recommended change                                                                                                                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| High              | Small text fails the WCAG AA 4.5:1 normal-text target in sampled browser styles: family description 3.28:1 at 11px; family ID 2.98:1 at 10px; intro text 3.49:1 at 12px.                 | Darken secondary text and IDs, increase main reading text toward 14–16px, and remeasure text and focus states. Keep the green palette. This was a targeted check, not a full accessibility conformance audit. |
| High              | Activating a focused class button replaces the navigation DOM; `document.activeElement` becomes BODY. Active class styling has no `aria-current` or equivalent selected-state semantics. | Keep navigation stable, update its state, preserve focus, and announce the active class with an appropriate accessible state.                                                                                 |
| High for projects | Storage writes fail silently and reads accept arbitrary JSON shapes. Current bookmarks have no export or project schema.                                                                 | Version and validate stored project data, validate bookmarks, show save errors, and provide export/import. Never silently imply persistence succeeded.                                                        |
| Medium            | Opening a family, searching, then clearing search leaves zero families expanded. Whole-result rendering discards reading state.                                                          | Store expansion by stable ID and restore it across filtering. Keep search-driven expansion separate from manually expanded sections.                                                                          |
| Medium            | At 390px width, inactive class names are hidden; navigation shows codes such as FIA. Saved becomes a star and count with no explicit accessible name.                                    | Provide a labeled mobile class selector or menu with full names. Give Saved an explicit accessible label and retain a visible label where space permits.                                                      |
| Medium            | Search result counts describe families only, even when the query targets one element; the entire results container is a live region.                                                     | Show family/component/element match counts, highlight matches, and use a small dedicated status region for announcements.                                                                                     |
| Medium            | Component summaries repeat a simplified first element, and generic operation placeholders hide project-specific choices.                                                                 | Provide distinct editorial component definitions and retain original operation prompts in the project editor. Make the difference between explanations and requirements visible.                              |
| Medium            | Existing automated tests cover catalogue shape/content, not browser workflows.                                                                                                           | Add browser coverage for filters, keyboard navigation, bookmarks, and project creation, switching, selection, removal, persistence, import/export, and storage errors.                                        |
| Low               | Hero, global statistics, and nested cards occupy substantial vertical space before useful work, especially on mobile.                                                                    | Keep the current guide landing page; use a compact project workspace with a sticky project toolbar, scope summary, and details panel or drawer.                                                               |
| Low               | External fonts depend on a Google Fonts request, though system fallbacks work.                                                                                                           | Self-host fonts if consistent offline typography is important; retain suitable fallback stacks.                                                                                                               |

## Suggested implementation structure

Stay with the dependency-free static app. Introduce a project model module with pure operations and tests, a storage adapter with validation/migrations, and separate catalogue/project render functions. Use hash navigation (for example `#projects` and `#project/<id>`) so direct links work on GitHub Pages without server rewrite rules.

A versioned project record should contain a stable project ID, name, description, TOE scope, catalogue edition, created/updated timestamps, selected component IDs, element annotations keyed by ID, and manual dependency-review notes. Derive family selection and element scope from component membership; do not maintain three independent selection lists that can disagree. Render user data as text or escape it, including imported names and notes. Keep existing bookmarks intact during migration.

## Implementation order and acceptance checks

1. Fix contrast, stable focus, accessible navigation labels, and expansion state. Verify keyboard traversal, visible focus, screen-reader labels, narrow screens, and no horizontal page overflow.
2. Add project model/storage, create/rename/switch flows, whole-component selection from any hierarchy level, deprecation handling, notes, progress, and removal with undo. Verify two projects do not affect each other and refresh restores the intended state.
3. Add validated JSON import/export and Markdown export. Test round trips, unknown IDs, malformed input, name/note HTML, storage errors, and preserving existing projects.
4. Add manual dependency review and prominent incomplete-operation indicators. Automate dependency resolution only after structured dependency data is reviewed and tested.

The app can continue to deploy `public/` through the existing Pages workflow. No credentials are needed for local projects. Project files should remain user-controlled exports rather than being automatically committed into the public repository.

## Validation performed

- Existing Node test suite: 3 passed, 0 failed.
- Chromium: loaded all 74 family cards; checked keyboard focus after class activation, navigation semantics, reading state after search reset, computed text contrast, and 390px mobile navigation.
- Inspected current catalogue relationships, bracketed operations, HTML, CSS, application state/storage handling, server, and Pages workflow.
- This is a feasibility and targeted UX/accessibility audit, not a complete security review or Common Criteria evaluation. No application code, project feature, or live deployment was changed by the audit.

## Implementation record — 2026-10-17

The audit recommendations are now implemented in the working tree:

- Added a versioned project model and validated local storage, hash-based project navigation, create/edit/switch flows, family bulk selection, component selection/removal/undo, element notes/evidence/status and operation completions, and manual dependency review.
- Added JSON backup/preview/import-as-copy and Markdown export. Unknown IDs, invalid statuses/editions, malformed and oversized imports are rejected. Imported deprecated selections remain visible as review issues; new deprecated selections are blocked. Scope removal retains annotations.
- Preserved personal bookmarks. Storage errors are visible, changes remain in memory, exports remain available, and corrupt project storage is protected from overwrite.
- Improved text contrast and reading sizes, keyboard focus and selected navigation semantics, mobile full-name class navigation, expansion restoration, search highlighting and counts, compact project summaries, and live announcements. Removed the external font request in favor of local system fonts.
- Component introductions now state their focus and family context rather than repeating the first element. Bracketed operation prompts remain visible in element explanations and original text.
- Added model and browser regression tests and gated Pages deployment on them.

Automatic dependency resolution and cross-device synchronization remain explicitly outside this first version. Dependency completeness is never inferred from implementation status. Project operation completions remain separately recorded free text; original normative requirements are preserved. This implementation is available locally; it has not been committed, pushed, or deployed by this task.
