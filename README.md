# Common Ground

An interactive field guide to Common Criteria CC:2022 Part 2, Revision 1, based on the attached CCMB-2022-11-002 document.

## Run

Requires Node.js 18 or newer. No dependencies or build step.

```sh
npm start
```

The app listens on port 3000, or `$PORT`. Run `npm test` for catalogue and HTTP checks.

## Guide

Browse 11 classes and 74 families. Expand families and components to read all 284 elements. Search by identifier or text, filter by class, and star elements to save them locally in your browser. Source links open the included original PDF at the relevant page. FCS_CKM.4 is retained and explicitly marked deprecated; the catalogue contains 155 active components plus this deprecated entry.

Family descriptions are editorial plain-language explanations. Element explanations expand TSF/TOE and summarize bracketed operations as specified options or values. Original wording, assignments, selections, dependencies, and source pages remain available. The guide is a navigation aid, not a substitute for normative wording when writing evaluation requirements. Annex application notes are available in the original PDF, not reproduced as separate requirements.

The app runs without external services. Optional Google fonts have local serif and sans-serif fallbacks. Saved elements stay on the current browser/device.

`public/catalogue.json` was extracted from the supplied PDF with `pdftotext -layout`. `scripts/extract.py` documents the extraction and expects the text at `/tmp/cc.txt`.

## GitHub Pages

`.github/workflows/pages.yaml` tests the catalogue and publishes `public/` on every push to `main`, or on manual dispatch. All site assets use relative paths, so the guide works under the repository's Pages path. No server or build step is needed on Pages.

The workflow attempts to enable Pages automatically. If repository permissions or organization policy prevent this, an administrator must select **GitHub Actions** under **Settings → Pages → Build and deployment → Source**, then rerun the workflow.

## Project workspace

Open **Projects** to create a named project with a description and TOE boundary. Use the active-project selector to choose where catalogue selections go. Families offer bulk selection of their active components; using an individual element includes its entire parent component and all its elements. Deprecated FCS_CKM.4 cannot be newly selected.

Within a project, switch between the selected scope and the full catalogue. Record element status, notes, evidence references, and assignment/selection completions. Operation reviews and dependency reviews are separate from implementation progress. Dependencies are displayed for manual review; alternatives and hierarchical substitutions are not automatically resolved. Removing a component preserves its notes and offers undo.

Projects and existing reading bookmarks stay in local browser storage on the current site origin. They are not synchronized or sent to GitHub. Export each project as JSON for a complete editable backup, or Markdown for review. JSON import previews the project and creates a new copy. Invalid schemas, unknown IDs, unsupported editions, and files over 2 MB are rejected. Imported deprecated components are flagged. If storage fails, the app shows a persistent warning, keeps the current session in memory, and supports export. Corrupt stored project records are not overwritten.

## Development validation

The site itself remains dependency-free and can still run with `npm start`. For the development test tools:

```sh
npm ci
npm test
npx playwright install chromium
npm run test:browser
```

If Chromium is already installed, use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:browser`. Browser tests start an isolated server on port 3100. The Pages workflow installs the locked test dependencies and runs both the model/catalogue tests and browser checks before deployment.

The UI includes a full-name mobile class selector, persistent expansion state, stable class-navigation focus, selected-class announcements, search highlighting and hierarchy counts, a skip link, and higher-contrast reading text. See `docs/project-and-ui-audit.md` for the original audit and implementation record.
