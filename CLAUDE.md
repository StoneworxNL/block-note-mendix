# BlockNote widget

Mendix pluggable widget (web) that wraps the [BlockNote](https://github.com/TypeCellOS/BlockNote) block editor. Public
repo, published on the Mendix Marketplace by Stoneworx.

## Before you start

Check open PRs and branches first (`gh api repos/StoneworxNL/block-note-mendix/pulls`) and build on them; work is
often already in progress there, and PRs are frequently stacked (each one based on the previous PR's branch).

## Build and test

-   Node 22 (22.18 or later). Install with `npm ci`.
-   `npm run lint`, `npm test` (Jest), `npm run release` (production .mpk in `dist/<version>/`).
-   `npm run build` is a development build and also copies the widget into the Mendix app at `config.projectPath`
    (`../../`). It does **not** include `LICENSE` or `dependencies.txt`; always ship the `release` build.
-   The release output is `dist/<version>/stoneworx.BlockNote.mpk`. It contains `LICENSE` (copied from the repo root)
    and the generated `dependencies.txt` with the license text of every bundled package. CI checks both are there.
-   `rollup.config.mjs` wraps the Mendix default config (Rollup 4 option moves, React DOM client shim, BlockNote CSS
    import stripping, emoji locale trimming). Keep the Mendix plugins in the list: the license plugin lives there.
-   The live demo is https://block-note-demo-sandbox.mxapps.io/ (the demo app lives in Mendix Team Server, not here).

## Releasing a new version

Bump the version in both `package.json` and `src/package.xml`, and describe the change in the PR and release notes.

## Compliance

-   No secrets, credentials, internal URLs or customer data in the repo (CI runs gitleaks on the full history).
-   Bundled (production) dependencies must be MIT, MIT-0, ISC, BSD-2/3-Clause, 0BSD, Apache-2.0, Python/PSF-2.0,
    CC0-1.0 or BlueOak-1.0.0 (the `Compliance` workflow checks this).
-   Exception: `@blocknote/core`, `@blocknote/react` and `@blocknote/mantine` are MPL-2.0. That is allowed because they
    are bundled unmodified and their license text ships in `dependencies.txt`. If you ever patch BlockNote's own
    source, those changes must be published.
-   Never add `@blocknote/xl-*` packages (AI, multi-column, PDF/DOCX/ODT export, …): they are GPL-3.0 or commercial.
    The `Compliance` workflow fails if one is in the production tree.
-   Several entries in `dependencies` (js-yaml, svgo, minimatch, lodash, …) are only there to force patched versions of
    transitive packages; they are not bundled. They belong in `overrides`.
