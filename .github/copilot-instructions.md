# Copilot Instructions for mdtopdf

## Project Overview
This is a frontend-only Markdown-to-PDF converter built with React 19, TypeScript, and Vite. It features a live markdown editor with real-time preview and uses the browser's native print-to-PDF functionality for high-quality PDF generation with selectable text.

## Tech Stack
- **Framework**: React 19 (with StrictMode enabled)
- **Build Tool**: Vite 7
- **Language**: TypeScript 5.9 (strict mode)
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite` plugin
- **Markdown**: react-markdown with remark-gfm (GitHub Flavored Markdown)
- **Linting**: ESLint 9 with flat config format

## Key Architecture Decisions

### PDF Generation Strategy
- **Browser-native**: Uses `window.print()` instead of custom PDF libraries
- **Print CSS**: Leverages `@media print` queries to optimize output
- **Benefits**: Selectable text, clickable links, perfect typography, smaller file sizes
- **No dependencies** on jsPDF, pdfmake, or html2canvas

### Markdown Rendering
- Uses `react-markdown` for parsing and rendering
- `remark-gfm` plugin enables tables, strikethrough, task lists, and autolinks
- Custom prose styles in `src/index.css` for consistent typography
- Supports code blocks, lists, blockquotes, links, and tables

### TypeScript Configuration
- Uses **project references** pattern (`tsconfig.json` references `tsconfig.app.json` and `tsconfig.node.json`)
- App config uses `moduleResolution: "bundler"` with `verbatimModuleSyntax: true`
- Strict linting enabled: `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`

### Styling Setup
- Tailwind v4 is imported via `@import "tailwindcss"` in `src/index.css` (NOT the traditional `@tailwind` directives)
- Tailwind plugin registered in `vite.config.ts` as `tailwindcss()` from `@tailwindcss/vite`
- Custom prose styles for markdown rendering
- Print-specific styles with `@media print` for PDF optimization
- Uses `print:` utility classes for conditional styling

### ESLint Configuration
- Uses **flat config format** (`eslint.config.js`, not `.eslintrc`)
- Includes `eslint-plugin-react-hooks` with `recommended-latest` config
- Includes `eslint-plugin-react-refresh` for Vite-specific rules
- Configured with `globalIgnores(['dist'])` instead of `.eslintignore`

## Development Workflow

### Commands
```bash
npm run dev      # Start dev server with HMR at localhost:5173
npm run build    # TypeScript compile + Vite build
npm run lint     # Run ESLint across all .ts/.tsx files
npm run preview  # Preview production build
```

### Build Process
The `build` script runs `tsc -b` (TypeScript build mode with project references) before `vite build`. This ensures type-checking happens before bundling.

## Features Implementation

### Editor Features
- **Live Preview**: Split-pane interface with real-time markdown rendering
- **Load Markdown**: File input for importing `.md` files
- **Save Markdown**: Downloads current markdown as `.md` file
- **Export PDF**: Triggers browser print dialog for PDF generation

### Print Optimization
- Header and editor hidden with `print:hidden` utility
- Containers use `print:block` and `print:overflow-visible` to show all content
- Page margins set to 0.75in via `@page` rule
- Proper page break handling for headings, lists, and code blocks
- Orphans/widows control for better typography

## Coding Conventions

### File Organization
- Entry point: `src/main.tsx` (renders `App` into `#root`)
- Main component: `src/App.tsx` (functional component with default export)
- Global styles: `src/index.css` (Tailwind imports + custom prose styles + print styles)

### Component Patterns
- Use functional components with TypeScript (no PropTypes)
- Export components as default exports
- Fragment shorthand syntax preferred: `<>` instead of `<React.Fragment>`
- State management with React hooks (useState)
- File operations using FileReader API

### TypeScript Standards
- Enable all strict mode checks (already configured)
- Avoid `any` types where possible
- Use explicit return types for complex functions
- Leverage TypeScript's JSX type inference (`jsx: "react-jsx"`)

## Common Pitfalls
- Don't use old Tailwind v3 directives (`@tailwind base/components/utilities`) - v4 uses single `@import "tailwindcss"`
- Don't create `.eslintrc.*` files - this project uses flat config in `eslint.config.js`
- Don't bypass TypeScript strict checks - they're intentionally enabled
- Remember `tsc -b` runs before build, so type errors will block production builds
- When adding print styles, test with browser print preview (Ctrl+P / Cmd+P)
- Use `print:` prefix for print-specific Tailwind utilities

## Deployment
- Configured for GitHub Pages deployment via GitHub Actions
- Build output in `dist/` directory
- Base path set to repository name in `vite.config.ts` for GitHub Pages
- Deployed automatically on push to `main` branch
