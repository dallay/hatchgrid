// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
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
			logo: {
				src: './src/assets/logo.svg',
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/dallay/hatchgrid' }],
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
	],
});
