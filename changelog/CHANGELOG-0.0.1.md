# CHANGELOG 0.0.1

## 0.0.1

Initial release of HTML-Sheet2YAML, a browser-based tool that converts spreadsheet data into YAML.

### Added

- Single-page converter for CSV, XLSX, ODS, and public Google Sheets, running entirely in the browser.
- Drag-and-drop / click-to-upload file import with SheetJS workbook parsing.
- Google Sheet URL loading, including conversion of normal sheet links to exportable XLSX URLs.
- “Try demo Google Sheet” button that fills a sample public spreadsheet URL and loads it.
- Filename detection from the `Content-Disposition` response header (including RFC 5987 `filename*`).
- Per-sheet YAML preview with tab switching, copy-to-clipboard, and per-sheet / download-all actions.
- English and Traditional Chinese (`zh-TW`) UI via client-side i18n.
- PWA shell assets (`manifest.json`, favicon) for installable app metadata.
- Modular frontend structure (`core`, `services`, `ui`, `utils`) with Tailwind-based layout.
- Playwright E2E coverage for smoke checks, file import, i18n, PWA, and the demo URL button.
- Podman Compose–based E2E test infrastructure and GitHub Actions workflow.

### Documentation

- Added bilingual project documentation (`README.md` and `README_zh_tw.md`).
- Added changelog index and versioned changelog structure.
