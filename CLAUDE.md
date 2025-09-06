# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

Notas Literárias is a browser extension that integrates Goodreads book ratings
directly into Amazon Brazil product pages. It's a TypeScript-based web extension
that works on both Firefox and Chrome/Chromium browsers.

## Development Commands

### Development

- `pnpm dev:firefox` - Start development server for Firefox
- `pnpm dev:chromium` - Start development server for Chromium-based browsers

### Building

- `pnpm build` - Build for both Firefox and Chromium (production)
- `pnpm build:firefox` - Build Firefox version only
- `pnpm build:chromium` - Build Chromium version only

### Linting and Formatting

- `pnpm lint:biome` - Lint code with Biome (runs automatically before build)
- `pnpm fix` - Auto-fix linting and formatting issues with Biome
- `pnpm fmt` - Format code (Biome + Prettier for HTML/MD files)

### Testing and Validation

- `pnpm lint:manifest` - Validate Firefox manifest with web-ext

### Release and Packaging

- `pnpm pack` - Create distributable ZIP/XPI packages
- `pnpm release` - Create a new release
- `pnpm changelog` - Update changelog with git-cliff

## Architecture

This is a cross-browser web extension with a modular architecture:

### Core Structure

- **`src/background/`** - Service worker that handles cross-origin requests to
  Goodreads
- **`src/content/`** - Content scripts that inject into Amazon pages
- **`src/shared/`** - Shared utilities, types, and configuration
- **`src/templates/`** - HTML templates for UI components

### Key Components

- **Content Script Flow**: Detects Amazon book pages → extracts ISBN/ASIN →
  requests Goodreads data → injects rating UI
- **Background Script**: Acts as proxy for Goodreads API calls due to CORS
  restrictions
- **Message Passing**: Uses `MessageType.SearchCode` and `MessageType.FetchURL`
  for content ↔ background communication

### Build System

- **Vite-based** with separate configs for content and background scripts
- **Multi-target builds** via `BROWSER` environment variable (firefox/chromium)
- **Auto-import** setup for webextension-polyfill via unplugin-auto-import
- **Cross-platform manifests** in `platforms/` directory

### Code Style

- **Biome** for linting and formatting (primary)
- **Prettier** for HTML/Markdown files
- **TypeScript strict mode** with 80-character line width
- **Portuguese comments** and log messages (project is Brazil-focused)

### Platform Support

- **Firefox**: Uses Manifest V3 with gecko-specific settings
- **Chromium**: Uses Manifest V3 with standard Chrome extension APIs
- **Target sites**: `*.amazon.com.br/*` (Brazil-specific)
- **External APIs**: `*.goodreads.com/*`

## Development Notes

- Uses `tsx` for running TypeScript scripts directly
- Web extension testing via `web-ext` tool
- Git hooks managed by Lefthook (`.lefthook.toml`)
- Release automation with git-cliff for changelog generation
- Icons in multiple sizes (16-128px) copied during build process

## Git Hooks Configuration

Lefthook runs parallel pre-commit hooks for optimal performance:

- **`fix:biome`** - Lint and format TypeScript/JavaScript/CSS/JSON files
- **`fmt:prettier`** - Format HTML/Markdown/YAML files
- **`lychee`** - Check for broken links in Markdown files (excludes
  CHANGELOG.md)

All hooks use `stage_fixed = true` to automatically stage formatted changes. The
`web-ext` tool handles auto-reload differently per browser:

- **Firefox**: Full auto-reload on code changes
- **Chromium/Chrome**: Manual reload required (press `R` in terminal or refresh
  in `chrome://extensions/`)
