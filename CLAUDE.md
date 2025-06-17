# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Yomikae** (よみかえ) is a Next.js application for writing Japanese text using traditional **Genko** (原稿) manuscript paper format. The app provides digital simulation of vertical Japanese writing with grid-based character placement.

Working directory: `/mnt/c/mycode/yomikae/yomikae/`

## Development Commands

```bash
# Development server with turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture

### Core Concept: Genko (原稿)
Traditional Japanese manuscript paper with:
- 20x20 character grid layout
- Vertical right-to-left writing (`writing-mode: vertical-rl`)
- Column-major text flow (top-to-bottom, then right-to-left columns)
- Yu Mincho font for authentic Japanese typography

### Editor Evolution
Four progressive editor implementations showing feature evolution:

1. **`/editor`** - Basic TextEditor with preview modes
2. **`/genko-editor`** - Side-by-side text input + genko preview
3. **`/genko-editor-2`** - Direct grid editing (single page)
4. **`/genko-editor-3`** - Multi-page manuscripts with column-wise editing

### Component Layers

**Text Input Components:**
- `TextEditor` - Basic textarea with grammar checking
- `GenkoTextEditor*` - Progressive genko editing implementations

**Preview Components:**
- `GenkoGridPreview` - Static grid display
- `EditableGenkoPreview*` - Interactive grid editing
- `GenkoMultiPagePreview` - Multi-page static preview

**Support Components:**
- `JapaneseMarkdownPreview` - Vertical Japanese markdown
- `GrammarChecker` - AI grammar checking via `/api/grammar-check`
- `GenkoCenterFoldMarker` - Traditional binding fold line

### Key Technical Patterns

**Coordinate Transformation:**
The most complex aspect is converting between column-major (Japanese writing flow) and row-major (CSS grid) coordinate systems for editing and display.

**State Management:**
- localStorage auto-save using `useAutoSave` hook
- Component-specific storage keys
- Evolution from single text string to multi-page arrays

**Styling:**
- Custom CSS properties for genko theming
- Vertical writing CSS (`writing-mode: vertical-rl`, `text-orientation: mixed`)
- Grid classes: `genko-cell`, `genko-grid`

## File Paths
Use `@/*` path alias for `src/*` imports as configured in tsconfig.json.