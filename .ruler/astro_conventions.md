# Astro Framework Conventions

This document outlines the conventions and best practices for working with the Astro framework in this project.

## Project Structure

- Use the default `src/pages`, `src/components`, and `src/layouts` folders.
- Use `src/content` and Astro Collections for structured content.
- Organize content by language (e.g., `content/blog/en/...`).
- Prefer file-based routing for pages and API endpoints.

## Components

- Use `.astro` components for layout and structure.
- Use framework components (e.g., `.vue`) only for dynamic interactivity.
- Co-locate styles in components; prefer `style` blocks scoped to the component.
- Name components in PascalCase (e.g., `HeroBanner.astro`).

## Content Management

- Use Astro Collections to validate and type content.
- Use Markdown/MDX for articles and rich content.
- Group articles in folders following the format `YYYY/MM/DD/slug`.
- Localize content using directory structure and `i18n` fields.

## Styling

- Use Tailwind CSS as the default utility-first CSS framework.
- Prefer component-scoped styles over global styles.
- Global styles should reside in `src/styles/global.css`.

## Markdown & MDX

- Use MDX only when interactivity is required.
- Keep frontmatter consistent and validated through Astro Collections.
- Use `Content` component to render markdown safely.

## Performance

- Avoid large JavaScript bundles — prefer partial hydration.
- Use `client:only` or `client:load` strategically.
- Optimize images with the `<Image />` component.

## SEO

- Use `<Head>` component to inject dynamic meta tags.
- Set canonical URLs, `og:` tags, and localized alternate links.
- Use structured data (JSON-LD) where appropriate.

## Testing & Linting

- Lint all markdown and Astro files using Biome.
- Validate collection schemas and frontmatter.
- Prefer unit tests for components with dynamic logic (e.g., Vue).

---

These conventions ensure consistency and maintainability across static site content, layout, and dynamic interactivity in Astro.
