// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator'
import mermaid from 'astro-mermaid';

// https://astro.build/config
export default defineConfig({
	integrations: [
    mermaid({
      theme: 'forest',
      autoTheme: true
    }),
		starlight({
			title: 'Hatchgrid',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
			sidebar: [
        {
          label: '🧭 Overview',
          autogenerate: { directory: 'overview' },
        },
        {
          label: '🚀 Quick Start Guide',
          autogenerate: { directory: 'quick-start' },
        },
        {
          label: '🧠 Core Concepts',
          autogenerate: { directory: 'core-concepts' },
        },
        {
          label: '💻 Developer Guide',
          autogenerate: { directory: 'developer-guide' },
        },
        {
          label: '⚙️ Configuration',
          autogenerate: { directory: 'configuration' },
        },
        {
          label: '📜 Conventions',
          autogenerate: { directory: 'conventions' },
        },
        {
          label: '🔒 Security',
          autogenerate: { directory: 'security' },
        },
        {
          label: '📚 Glossary',
          link: '/glossary',
        },
        {
          label: '🤝 Contributing',
          link: '/contributing',
        },
        {
          label: '📈 Changelog',
          link: '/changelog',
        },
			],
		}),
    starlightLinksValidator()
	],
});
