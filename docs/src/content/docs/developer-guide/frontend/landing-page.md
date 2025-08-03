---
title: Landing Page Documentation
description: Documentation for the Hatchgrid landing page application built with Astro.
---
# Landing Page Documentation

This document provides an overview of the Hatchgrid landing page application built with Astro.

## Overview

The landing page is built with Astro, a modern static site generator that allows for using multiple frontend frameworks together:

- **Framework**: Astro 5.11.1 with Vue components
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Astro CLI (powered by Vite)
- **Content**: Markdown/MDX content collections
- **Internationalization**: Built-in i18n routing

## Project Structure

```text
client/apps/landing-page/
├── .astro/                # Astro build cache and type definitions
├── public/                # Static assets served as-is
│   ├── admin/             # Admin configuration (Netlify CMS)
│   └── favicon.svg        # Site favicon
├── src/
│   ├── assets/            # Processed assets (images, SVGs)
│   ├── components/        # Reusable UI components
│   │   ├── ui/            # UI component library
│   │   └── sections/      # Page section components
│   ├── content/           # Content collections (blog, FAQ, etc.)
│   ├── i18n/              # Internationalization resources
│   ├── layouts/           # Page layout templates
│   ├── pages/             # Page routes (file-based routing)
│   │   └── [lang]/        # Localized routes
│   └── styles/            # Global styles and Tailwind config
├── astro.config.mjs       # Astro configuration
└── biome.json             # Biome linter/formatter configuration
```

## Biome Configuration

The landing page uses Biome for code formatting and linting. The configuration extends the client-level Biome configuration:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.1.2/schema.json",
  "extends": ["../../biome.json"],
  "files": {
    "ignoreUnknown": false,
    "includes": ["**/*.{ts,tsx,js,jsx,astro,vue}"]
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double"
    }
  },
  "overrides": [
    {
      "includes": ["**/*.astro"],
      "linter": {
        "rules": {
          "style": {
            "useConst": "off",
            "useImportType": "off"
          },
          "correctness": {
            "noUnusedVariables": "off",
            "noUnusedImports": "off"
          }
        }
      }
    }
  ]
}
```

Key features of this configuration:

- Extends the client-level Biome configuration
- Targets TypeScript, JavaScript, Astro, and Vue files
- Uses tabs for indentation with a line width of 100 characters
- Uses double quotes for JavaScript strings
- Disables certain linting rules for Astro files to accommodate Astro's unique syntax

## Content Management

The landing page uses Astro's content collections for managing structured content:

- **Blog**: Blog posts and articles
- **Authors**: Author information for blog posts
- **FAQ**: Frequently asked questions
- **Pricing**: Pricing information
- **Categories**: Content categorization
- **Tags**: Content tagging

## Internationalization

The landing page supports multiple languages through Astro's file-based routing:

- Routes are organized under `/[lang]/` directories
- Language detection and switching is handled automatically
- Translation files are stored in the `src/i18n/` directory

## Development Workflow

1. **Setup**: `pnpm install` in the workspace root
2. **Development**: `pnpm run dev:landing` to start dev server
3. **Building**: `pnpm run build:landing` for production build
4. **Preview**: `pnpm run preview:landing` to preview the production build

## Key Features

### Static Site Generation

- **Fast Loading**: Pre-rendered HTML for optimal performance
- **SEO Friendly**: Built-in SEO optimization
- **Content Collections**: Type-safe content management
- **Partial Hydration**: Interactive components only when needed

### Design System

- **Tailwind CSS**: Utility-first styling approach
- **Responsive Design**: Mobile-first responsive layouts
- **Dark Mode**: Built-in light/dark theme support
- **Accessibility**: WCAG compliance built-in

### Performance

- **Lighthouse Score**: 90+ on all metrics
- **Core Web Vitals**: Optimized for CWV metrics
- **Asset Optimization**: Automatic image optimization
- **Minimal JavaScript**: Only ship JS when needed

## Related Documentation

- [Biome Configuration](../conventions/biome-configuration.md) - Code formatting and linting standards
- [Frontend Project Color Palette](../landing/frontend-project-color-palette.md) - Color scheme documentation
