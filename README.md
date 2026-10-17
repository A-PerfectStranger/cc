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
