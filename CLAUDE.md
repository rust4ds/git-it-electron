# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Git-it is an Electron desktop app that teaches Git and GitHub through interactive challenges. Users complete real Git/GitHub tasks and the app verifies their work. Supports multiple languages.

## Common Commands

```bash
npm install         # Install dependencies
npm start           # Build and run the app (runs prestart automatically)
npm test            # Lint with Standard JS (lib/*.js, lib/verify/*.js, menus/*.js, main.js)
npm run build-all   # Clean and rebuild all challenges and pages
npm run build-chals # Build challenge HTML from templates
npm run build-pages # Build non-challenge pages from templates
```

### Packaging
```bash
npm run pack-mac    # Package for macOS (arm64)
npm run pack-lin    # Package for Linux (x64)
npm run pack-win    # Package for Windows (ia32) - includes PortableGit unpacked
```
Output goes to `/out` directory.

### Development Flags
```bash
electron . --none   # Start with all challenges uncompleted
electron . --some   # Start with first 5 challenges completed
electron . --all    # Start with all challenges completed
```

## Architecture

### Main Process (`main.js`)
- Controls app lifecycle and BrowserWindow creation
- Stores user progress in `user-data.json` at `app.getPath('userData')`
- Uses IPC for dialog interactions and path communication
- Platform-specific menus: `menus/darwin-menu.js` (macOS), `menus/other-menu.js` (Windows/Linux)

### Challenge Verification (`lib/verify/`)
- Each challenge has a corresponding verification script (e.g., `commit_to_it.js`)
- Scripts use `lib/spawn-git.js` wrapper for cross-platform Git execution
- On Windows: prefers system Git, falls back to bundled PortableGit (at `assets/PortableGit`)

### Build System
- **Templates**: `layouts/` (Handlebars templates)
- **Content**: `resources/contents/<locale>/` (challenge content per language)
- **Partials**: `partials/` (shared HTML fragments)
- **Output**: `built/<locale>/challenges/` and `built/<locale>/pages/`
- Build scripts: `lib/build-challenges.js`, `lib/build-pages.js`

### Localization (`lib/locale.js`)
- Locale format: `<lang>-<LOCATION>` (e.g., `en-US`, `ja-JP`, `zh-TW`)
- Add new languages in `lib/locale.js` `available` object
- Translate files in `resources/contents/<locale>/`

## Code Style

- **Standard JS** (no semicolons, no ES6 syntax)
- Run `npm test` to check linting before commits
