# ECHO — EVERY WEBSITE. DECODED.
### Brand: VR DEVELOPMENTS
> *"One URL. An Entire Digital Universe."*

---

## 🌟 Executive Overview

**ECHO** is a futuristic Website Intelligence & Source Code Inspection Studio built by **VR DEVELOPMENTS**. It enables engineers, designers, researchers, and non-developers to retrieve, decode, analyze, and visualize real frontend source code, design systems, DOM hierarchies, and color palettes without simulated or fabricated code.

---

## 🚀 Core Features & Studio Modules

1. **Modular Source-Code Retrieval Engine**
   - **Direct Browser Fetch**: Initiates direct cross-origin retrieval with CORS headers.
   - **Local Environment Relay**: High-speed proxy middleware embedded in the dev server.
   - **Public Relay Fallbacks**: Legitimate public mirrors (`AllOrigins`, `CodeTabs`, `CorsProxy`).
   - **GitHub Raw Repository Endpoint**: Automatic detection of GitHub repositories to fetch raw frontend files.
   - **Manual Source Import**: 1-click raw HTML markup pasting and local `.html` file drop-zone.
   - **Verified Sample Presets**: Instant 1-click analysis for pre-verified endpoints (Wikipedia, W3C, Example.com, Hacker News, Dev.to).

2. **Transparent Diagnostic Audit**
   - Every network stage, strategy attempt, response status code, and latency measurement is recorded in the live telemetry stream.
   - Honest classification of assets: `RETRIEVED`, `DISCOVERED_ONLY`, `USER_PROVIDED`, `INFERRED`, or `UNAVAILABLE`.

3. **Workspace Explorer & Source IDE**
   - Categorized file hierarchy (`index.html`, `stylesheets/`, `scripts/`, `assets/`, `manifest.json`).
   - Full code viewer with line numbers, search within file, word-wrap toggle, copy-to-clipboard, and individual file download.

4. **Brand Intelligence & Design Tokens**
   - Font family detection (Google Fonts, `@font-face`, and inline declarations).
   - Live rendered preview of heading typography scale (H1 through H6 with font sizes, weights, line-heights).
   - Extracted button designs and call-to-action tokens.
   - Border radius and box-shadow token cards.
   - CSS custom properties (`--*`) table.

5. **Color Palette Studio**
   - HEX, RGB, and HSL extraction with occurrence frequency.
   - Color role categorizer (`background`, `text`, `accent`, `border`).
   - WCAG accessibility contrast ratings (`AAA`, `AA`, `FAIL`) computed against pure black and white.
   - 1-Click exports: CSS Custom Properties, Tailwind CSS config, JSON, and SCSS variables.

6. **Visual Website Structure**
   - **DOM Tree Inspector**: Expandable nested tree of HTML nodes with search and attribute inspector.
   - **Resource Relationship Graph**: Connected SVG node-link graph between document root, CSS, JS, and media assets.
   - **Component Architecture Map**: Visual breakdown of `<header>`, `<main>`, and `<footer>` zones.

7. **Content & Accessibility Explorer**
   - Headings outline tree (H1-H6).
   - Readable body text extractor with word count and estimated reading time.
   - Hyperlink auditor (internal vs external links table).
   - Media & image alternative text accessibility audit (flags missing alt attributes).

8. **Global Search**
   - Instant search across all source code lines, CSS selectors, JS function names, DOM IDs, color HEXes, headings, and URLs.

9. **Export Center (JSZip)**
   - 1-Click structured ZIP archive generation:
     - `source/` (only retrieved files)
     - `colors/` (`palette.json`, `tokens.css`, `tailwind.config.js`, `_tokens.scss`)
     - `reports/` (`website-info.json`, `analysis-report.txt`, `full-intelligence.json`)
     - `retrieval-manifest.json` (honest audit manifest)

10. **Local Project Vault (IndexedDB)**
    - 100% private in-browser persistent database.
    - Save, rename, star, and delete past analyses.
    - **Side-by-Side Comparison**: Compare any two websites across latency, asset counts, color tokens, word count, and security headers.
    - Vault backup export (JSON) and backup restoration.

11. **Cybernetic UX & Web Audio SFX**
    - High-tech dark obsidian & electric yellow palette (`#0A0B0E`, `#FEE75C`, `#00F0FF`).
    - Web Audio API synthesized cybernetic sound effects (optional toggle with mute persistence).
    - Keyboard shortcuts: `1-9` for tab navigation, `Ctrl/Cmd + K` for search, `Esc` to close modals.

---

## 🛡️ "Never Overflow The Workplace" Architecture

The application strictly implements zero-overflow layout containment:
- `html, body, #root`: `100vw`, `100vh`, `overflow: hidden !important`.
- Flexbox layouts with `min-h-0` and `min-w-0` on all children, preventing long strings or code lines from expanding the parent containers.
- Tables use `table-fixed` and text uses `break-all` / `truncate`.
- Code editors and trees scroll independently within their designated bounding panes.
- Filesystem snapshots remain under 600 KB (well within the 128 MB snapshot cap).

---

## 🧪 Testing & Verification

Automated unit tests verify:
- URL validation and normalization
- Color extraction, luminance calculation, and WCAG contrast ratios
- HTML document parsing and metadata extraction
- JSZip manifest compliance

Run tests:
```bash
npx vitest run
```
*All 14 tests pass cleanly.*

Build for GitHub Pages production:
```bash
npm run build
```
*(Produces static bundle in `dist/` with relative asset paths ready for GitHub Pages).*
