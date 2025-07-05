import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  site: 'https://placeholder.example.com/docs', // TODO: Update with actual deployment URL
  integrations: [
    starlight({
      title: 'My Project Documentation',
      contentDir: '../../../../docs',
      sidebar: [
        {
          label: 'Documentation',
          items: [
            { label: 'Clean Code', link: '/clean_code/' },
            { label: 'GitHub Actions Workflows', link: '/github-actions-workflows/' },
            { label: 'Liquibase Migration Completed', link: '/liquibase-migration-completed/' },
            { label: 'Liquibase YAML vs XML', link: '/liquibase-yaml-vs-xml/' },
            { label: 'Pinning GitHub Actions for Security', link: '/pinning-github-actions-for-security/' },
            { label: 'Tasks', link: '/tasks/' },
          ],
        },
        {
          label: 'Landing Page',
          items: [
            { label: 'Frontend Project Color Palette', link: '/landing/frontend-project-color-palette/' },
          ],
        },
        {
          label: 'API Reference',
          items: [
            { label: 'Thryve API', link: '/api/thryve/' },
          ],
        },
      ],
    }),
  ],
});
