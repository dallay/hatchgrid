# Project Structure

```plaintext
├───.github/
│   ├───ISSUE_TEMPLATE/
│   │   ├───backend_task.md
│   │   ├───frontend_view.md
│   │   └───full_feature_request.md
│   ├───actions/
│   │   ├───docker/
│   │   │   ├───backend/
│   │   │   │   ├───README.md
│   │   │   │   ├───action.yml
│   │   │   │   └───example-workflow.yml
│   │   │   ├───frontend-landing/
│   │   │   │   └───action.yml
│   │   │   ├───frontend-web/
│   │   │   │   └───action.yml
│   │   │   ├───security-scan/
│   │   │   │   ├───README.md
│   │   │   │   └───action.yml
│   │   │   └───README.md
│   │   └───setup/
│   │       ├───java/
│   │       │   └───action.yml
│   │       └───node/
│   │           └───action.yml
│   ├───workflows/
│   │   ├───backend-ci.yml
│   │   ├───cleanup-cache.yml
│   │   ├───deploy.yml
│   │   ├───frontend-ci.yml
│   │   ├───issue-labeler.yml
│   │   ├───monorepo-ci.yml
│   │   ├───semantic-pull-request.yml
│   │   └───test-pnpm.yml
│   ├───.DS_Store
│   ├───CODEOWNERS
│   ├───FUNDING.yml
│   ├───PULL_REQUEST_TEMPLATE.md
│   ├───auto_assign.yml 
│   ├───copilot-instructions.md
│   ├───dependabot.yml
│   ├───issue-labeler-config.yml
│   └───labeler.yml
├───.husky/
│   ├───_/
│   │   ├───.gitignore
│   │   ├───applypatch-msg
│   │   ├───commit-msg
│   │   ├───commit-msg.old
│   │   ├───h
│   │   ├───husky.sh
│   │   ├───post-applypatch
│   │   ├───post-checkout
│   │   ├───post-commit
│   │   ├───post-merge
│   │   ├───post-rewrite
│   │   ├───pre-applypatch
│   │   ├───pre-auto-gc
│   │   ├───pre-commit
│   │   ├───pre-commit.old
│   │   ├───pre-merge-commit
│   │   ├───pre-push
│   │   ├───pre-push.old
│   │   ├───pre-rebase
│   │   └───prepare-commit-msg
│   └───.DS_Store
├───.junie/
│   └───guidelines.md
├───.kiro/
│   ├───hooks/
│   │   ├───code-quality-analyzer.kiro.hook
│   │   ├───source-docs-sync.kiro.hook
│   │   ├───test-check-build.kiro.hook
│   │   └───translation-monitor-hook.kiro.hook
│   ├───specs/
│   │   └───docker-pipeline-restructure/
│   │       ├───design.md
│   │       ├───requirements.md
│   │       └───tasks.md
│   └───steering/
│       ├───product.md
│       ├───project-documentation.md
│       ├───structure.md
│       └───tech.md
├───client/
│   ├───apps/
│   │   ├───landing-page/
│   │   │   ├───.astro/
│   │   │   │   ├───collections/
│   │   │   │   │   └───...
│   │   │   │   ├───.DS_Store
│   │   │   │   ├───content-assets.mjs
│   │   │   │   ├───content-modules.mjs
│   │   │   │   ├───content.d.ts
│   │   │   │   ├───data-store.json
│   │   │   │   ├───settings.json
│   │   │   │   └───types.d.ts
│   │   │   ├───.vscode/
│   │   │   │   ├───extensions.json
│   │   │   │   ├───launch.json
│   │   │   │   └───settings.sample.json
│   │   │   ├───dist/
│   │   │   │   ├───_astro/
│   │   │   │   │   └───...
│   │   │   │   ├───admin/
│   │   │   │   │   └───...
│   │   │   │   ├───en/
│   │   │   │   │   └───...
│   │   │   │   ├───es/
│   │   │   │   │   └───...
│   │   │   │   ├───pricing-test/
│   │   │   │   │   └───...
│   │   │   │   ├───.DS_Store
│   │   │   │   ├───404.html
│   │   │   │   ├───android-icon.png
│   │   │   │   ├───apple-touch-icon.png
│   │   │   │   ├───favicon.ico
│   │   │   │   ├───favicon.png
│   │   │   │   ├───favicon.svg
│   │   │   │   ├───icon-192-maskable.png
│   │   │   │   ├───icon-192.png
│   │   │   │   ├───icon-512-maskable.png
│   │   │   │   ├───icon-512.png
│   │   │   │   ├───index.html
│   │   │   │   ├───manifest.json
│   │   │   │   ├───ogp.png
│   │   │   │   ├───robots.txt
│   │   │   │   ├───sitemap-0.xml
│   │   │   │   └───sitemap-index.xml
│   │   │   ├───docs/
│   │   │   │   ├───hero.svg
│   │   │   │   └───lighthouse.png
│   │   │   ├───node_modules/
│   │   │   │   ├───.astro/
│   │   │   │   │   └───...
│   │   │   │   ├───.bin/
│   │   │   │   │   └───...
│   │   │   │   ├───.vite/
│   │   │   │   │   └───...
│   │   │   │   ├───@astrojs/
│   │   │   │   │   └───...
│   │   │   │   ├───@hatchgrid/
│   │   │   │   │   └───...
│   │   │   │   ├───@iconify-json/
│   │   │   │   │   └───...
│   │   │   │   ├───@tailwindcss/
│   │   │   │   │   └───...
│   │   │   │   ├───@vee-validate/
│   │   │   │   │   └───...
│   │   │   │   └───@vueuse/
│   │   │   │       └───...
│   │   │   ├───public/
│   │   │   │   ├───admin/
│   │   │   │   │   └───...
│   │   │   │   ├───.DS_Store
│   │   │   │   ├───android-icon.png
│   │   │   │   ├───apple-touch-icon.png
│   │   │   │   ├───favicon.ico
│   │   │   │   ├───favicon.png
│   │   │   │   ├───favicon.svg
│   │   │   │   ├───icon-192-maskable.png
│   │   │   │   ├───icon-192.png
│   │   │   │   ├───icon-512-maskable.png
│   │   │   │   ├───icon-512.png
│   │   │   │   ├───manifest.json
│   │   │   │   └───ogp.png
│   │   │   ├───src/
│   │   │   │   ├───assets/
│   │   │   │   │   └───...
│   │   │   │   ├───components/
│   │   │   │   │   └───...
│   │   │   │   ├───composables/
│   │   │   │   │   └───...
│   │   │   │   ├───data/
│   │   │   │   │   └───...
│   │   │   │   ├───i18n/
│   │   │   │   │   └───...
│   │   │   │   ├───layouts/
│   │   │   │   │   └───...
│   │   │   │   ├───lib/
│   │   │   │   │   └───...
│   │   │   │   ├───models/
│   │   │   │   │   └───...
│   │   │   │   ├───pages/
│   │   │   │   │   └───...
│   │   │   │   ├───styles/
│   │   │   │   │   └───...
│   │   │   │   ├───utils/
│   │   │   │   │   └───...
│   │   │   │   ├───.DS_Store
│   │   │   │   ├───consts.ts
│   │   │   │   ├───content.config.ts
│   │   │   │   └───env.d.ts
│   │   │   ├───.DS_Store
│   │   │   ├───.gitignore
│   │   │   ├───.lycheeignore
│   │   │   ├───.npmrc
│   │   │   ├───Dockerfile
│   │   │   ├───README.md
│   │   │   ├───astro.config.mjs
│   │   │   ├───biome.json
│   │   │   ├───components.json
│   │   │   ├───nginx.conf
│   │   │   ├───package.json
│   │   │   ├───tsconfig.json
│   │   │   ├───vitest.config.ts
│   │   │   └───vitest.setup.ts
│   │   ├───web/
│   │   │   ├───.vscode/
│   │   │   │   └───extensions.json
│   │   │   ├───coverage/
│   │   │   │   ├───src/
│   │   │   │   │   └───...
│   │   │   │   ├───base.css
│   │   │   │   ├───block-navigation.js
│   │   │   │   ├───clover.xml
│   │   │   │   ├───coverage-final.json
│   │   │   │   ├───favicon.png
│   │   │   │   ├───index.html
│   │   │   │   ├───prettify.css
│   │   │   │   ├───prettify.js
│   │   │   │   ├───sort-arrow-sprite.png
│   │   │   │   └───sorter.js
│   │   │   ├───dist/
│   │   │   │   ├───assets/
│   │   │   │   │   └───...
│   │   │   │   ├───index.html
│   │   │   │   └───vite.svg
│   │   │   ├───node_modules/
│   │   │   │   ├───.bin/
│   │   │   │   │   └───...
│   │   │   │   ├───.tmp/
│   │   │   │   │   └───...
│   │   │   │   ├───.vite/
│   │   │   │   │   └───...
│   │   │   │   ├───.vite-temp/
│   │   │   │   ├───.vue-global-types/
│   │   │   │   │   └───...
│   │   │   │   ├───@hatchgrid/
│   │   │   │   │   └───...
│   │   │   │   ├───@iconify/
│   │   │   │   │   └───...
│   │   │   │   ├───@iconify-json/
│   │   │   │   │   └───...
│   │   │   │   ├───@internationalized/
│   │   │   │   │   └───...
│   │   │   │   ├───@pinia/
│   │   │   │   │   └───...
│   │   │   │   ├───@tailwindcss/
│   │   │   │   │   └───...
│   │   │   │   ├───@tanstack/
│   │   │   │   │   └───...
│   │   │   │   ├───@types/
│   │   │   │   │   └───...
│   │   │   │   ├───@unovis/
│   │   │   │   │   └───...
│   │   │   │   ├───@vee-validate/
│   │   │   │   │   └───...
│   │   │   │   ├───@vitejs/
│   │   │   │   │   └───...
│   │   │   │   ├───@vitest/
│   │   │   │   │   └───...
│   │   │   │   ├───@vue/
│   │   │   │   │   └───...
│   │   │   │   └───@vueuse/
│   │   │   │       └───...
│   │   │   ├───public/
│   │   │   │   └───vite.svg
│   │   │   ├───src/
│   │   │   │   ├───account/
│   │   │   │   │   └───...
│   │   │   │   ├───assets/
│   │   │   │   │   └───...
│   │   │   │   ├───components/
│   │   │   │   │   └───...
│   │   │   │   ├───config/
│   │   │   │   │   └───...
│   │   │   │   ├───dashboard/
│   │   │   │   │   └───...
│   │   │   │   ├───error/
│   │   │   │   │   └───...
│   │   │   │   ├───i18n/
│   │   │   │   │   └───...
│   │   │   │   ├───layouts/
│   │   │   │   │   └───...
│   │   │   │   ├───lib/
│   │   │   │   │   └───...
│   │   │   │   ├───router/
│   │   │   │   │   └───...
│   │   │   │   ├───security/
│   │   │   │   │   └───...
│   │   │   │   ├───services/
│   │   │   │   │   └───...
│   │   │   │   ├───stores/
│   │   │   │   │   └───...
│   │   │   │   ├───views/
│   │   │   │   │   └───...
│   │   │   │   ├───.DS_Store
│   │   │   │   ├───App.vue
│   │   │   │   ├───env.d.ts
│   │   │   │   ├───main.ts
│   │   │   │   ├───shims-vue.d.ts
│   │   │   │   ├───style.css
│   │   │   │   └───vite-env.d.ts
│   │   │   ├───.DS_Store
│   │   │   ├───.env
│   │   │   ├───.gitignore
│   │   │   ├───Dockerfile
│   │   │   ├───README.md
│   │   │   ├───biome.json
│   │   │   ├───components.d.ts
│   │   │   ├───components.json
│   │   │   ├───declarations.d.ts
│   │   │   ├───index.html
│   │   │   ├───nginx.conf
│   │   │   ├───package.json
│   │   │   ├───tsconfig.app.json
│   │   │   ├───tsconfig.json
│   │   │   ├───tsconfig.node.json
│   │   │   ├───tsconfig.vitest.json
│   │   │   ├───vite.config.ts
│   │   │   ├───vitest.config.ts
│   │   │   └───vitest.setup.ts
│   │   └───.DS_Store
│   ├───config/
│   │   ├───node_modules/
│   │   │   ├───.bin/
│   │   │   │   ├───jiti
│   │   │   │   ├───stylelint
│   │   │   │   ├───terser
│   │   │   │   ├───tsc
│   │   │   │   ├───tsserver
│   │   │   │   ├───vite
│   │   │   │   ├───vitest
│   │   │   │   └───yaml
│   │   │   ├───@codecov/
│   │   │   ├───@hatchgrid/
│   │   │   └───@tailwindcss/
│   │   ├───styles/
│   │   │   ├───global.css
│   │   │   └───index.css
│   │   ├───.DS_Store
│   │   ├───package.json
│   │   ├───stylelint.config.cjs
│   │   ├───tsconfig.json
│   │   ├───vite.config.shared.d.ts
│   │   ├───vite.config.shared.mjs
│   │   ├───vitest.config.shared.d.ts
│   │   └───vitest.config.shared.mjs
│   ├───packages/
│   │   ├───tsconfig/
│   │   │   ├───package.json
│   │   │   ├───tsconfig.base.json
│   │   │   ├───tsconfig.node.json
│   │   │   ├───tsconfig.strict.json
│   │   │   ├───tsconfig.strictest.json
│   │   │   └───tsconfig.vue.json
│   │   ├───utilities/
│   │   │   ├───coverage/
│   │   │   │   ├───src/
│   │   │   │   │   └───...
│   │   │   │   ├───base.css
│   │   │   │   ├───block-navigation.js
│   │   │   │   ├───clover.xml
│   │   │   │   ├───coverage-final.json
│   │   │   │   ├───favicon.png
│   │   │   │   ├───index.html
│   │   │   │   ├───prettify.css
│   │   │   │   ├───prettify.js
│   │   │   │   ├───sort-arrow-sprite.png
│   │   │   │   └───sorter.js
│   │   │   ├───dist/
│   │   │   │   ├───avatar/
│   │   │   │   │   └───...
│   │   │   │   ├───chunk/
│   │   │   │   │   └───...
│   │   │   │   ├───debounce/
│   │   │   │   │   └───...
│   │   │   │   ├───format-date/
│   │   │   │   │   └───...
│   │   │   │   ├───group-by/
│   │   │   │   │   └───...
│   │   │   │   ├───initials/
│   │   │   │   │   └───...
│   │   │   │   ├───is-equal/
│   │   │   │   │   └───...
│   │   │   │   ├───merge/
│   │   │   │   │   └───...
│   │   │   │   ├───offset-date/
│   │   │   │   │   └───...
│   │   │   │   ├───order-by/
│   │   │   │   │   └───...
│   │   │   │   ├───random-element/
│   │   │   │   │   └───...
│   │   │   │   ├───random-number/
│   │   │   │   │   └───...
│   │   │   │   ├───random-word/
│   │   │   │   │   └───...
│   │   │   │   ├───range/
│   │   │   │   │   └───...
│   │   │   │   ├───remove/
│   │   │   │   │   └───...
│   │   │   │   ├───sort-by/
│   │   │   │   │   └───...
│   │   │   │   ├───theme/
│   │   │   │   │   └───...
│   │   │   │   ├───index.d.ts
│   │   │   │   ├───index.d.ts.map
│   │   │   │   └───utilities.js
│   │   │   ├───node_modules/
│   │   │   │   ├───.bin/
│   │   │   │   │   └───...
│   │   │   │   ├───.vite/
│   │   │   │   │   └───...
│   │   │   │   ├───.vite-temp/
│   │   │   │   ├───@hatchgrid/
│   │   │   │   │   └───...
│   │   │   │   ├───@internationalized/
│   │   │   │   │   └───...
│   │   │   │   └───@vitest/
│   │   │   │       └───...
│   │   │   ├───src/
│   │   │   │   ├───avatar/
│   │   │   │   │   └───...
│   │   │   │   ├───chunk/
│   │   │   │   │   └───...
│   │   │   │   ├───debounce/
│   │   │   │   │   └───...
│   │   │   │   ├───format-date/
│   │   │   │   │   └───...
│   │   │   │   ├───group-by/
│   │   │   │   │   └───...
│   │   │   │   ├───initials/
│   │   │   │   │   └───...
│   │   │   │   ├───is-equal/
│   │   │   │   │   └───...
│   │   │   │   ├───merge/
│   │   │   │   │   └───...
│   │   │   │   ├───offset-date/
│   │   │   │   │   └───...
│   │   │   │   ├───order-by/
│   │   │   │   │   └───...
│   │   │   │   ├───random-element/
│   │   │   │   │   └───...
│   │   │   │   ├───random-number/
│   │   │   │   │   └───...
│   │   │   │   ├───random-word/
│   │   │   │   │   └───...
│   │   │   │   ├───range/
│   │   │   │   │   └───...
│   │   │   │   ├───remove/
│   │   │   │   │   └───...
│   │   │   │   ├───sort-by/
│   │   │   │   │   └───...
│   │   │   │   ├───theme/
│   │   │   │   │   └───...
│   │   │   │   ├───.DS_Store
│   │   │   │   └───index.ts
│   │   │   ├───.DS_Store
│   │   │   ├───.gitignore
│   │   │   ├───biome.json
│   │   │   ├───package.json
│   │   │   ├───tsconfig.build.json
│   │   │   ├───tsconfig.build.tsbuildinfo
│   │   │   ├───tsconfig.json
│   │   │   └───vite.config.ts
│   │   └───.DS_Store
│   └───.DS_Store
├───config/
│   ├───owasp/
│   │   └───owasp-suppression.xml
│   ├───.DS_Store
│   └───detekt.yml
├───docs/
│   ├───architecture/
│   │   ├───form-feature-folder-structure.png
│   │   ├───hexagonal-architecture.md
│   │   └───hexagonal-architecture.png
│   ├───authentication/
│   │   └───authentication.md
│   ├───conventions/
│   │   ├───.gitkeep
│   │   ├───README.md
│   │   ├───controller-pattern.md
│   │   ├───deprecation-policy.md
│   │   ├───i18n.md
│   │   ├───offline-first.md
│   │   ├───project-guidelines.md
│   │   ├───rest-api.md
│   │   ├───security.md
│   │   ├───swagger.md
│   │   └───uuid-strategy.md
│   ├───frontend/
│   │   ├───README.md
│   │   ├───TRANSLATION_INTEGRATION.md
│   │   ├───auth-store.md
│   │   └───layout-system.md
│   ├───landing/
│   │   ├───frontend-project-color-palette.md
│   │   ├───high-converting-pricing-page.jpeg
│   │   └───light-and-dark-colors.jpeg
│   ├───workflows/
│   │   ├───README.md
│   │   ├───ci-guide.md
│   │   ├───configuration-troubleshooting.md
│   │   ├───custom-actions.md
│   │   ├───docker-actions-migration-guide.md
│   │   ├───docker-actions.md
│   │   ├───docker-composition-actions.md
│   │   └───github-actions-workflows.md
│   ├───backend-internationalization-summary.md
│   ├───clean_code.md
│   ├───liquibase-migration-completed.md
│   ├───liquibase-yaml-vs-xml.md
│   ├───pinning-github-actions-for-security.md
│   ├───shared-modules.md
│   └───structure.md
├───gradle/
│   ├───wrapper/
│   │   ├───gradle-wrapper.jar
│   │   └───gradle-wrapper.properties
│   ├───.DS_Store
│   └───libs.versions.toml
├───infra/
│   ├───keycloak/
│   │   ├───realm-config/
│   │   │   ├───hatchgrid-realm.json
│   │   │   └───keycloak-health-check.sh
│   │   ├───themes/
│   │   └───keycloak-compose.yml
│   ├───postgresql/
│   │   ├───data/
│   │   │   ├───base/
│   │   │   │   ├───1/
│   │   │   │   │   └───...
│   │   │   │   ├───16384/
│   │   │   │   │   └───...
│   │   │   │   ├───16385/
│   │   │   │   │   └───...
│   │   │   │   ├───4/
│   │   │   │   │   └───...
│   │   │   │   └───5/
│   │   │   │       └───...
│   │   │   ├───global/
│   │   │   │   ├───1213
│   │   │   │   ├───1213_fsm
│   │   │   │   ├───1213_vm
│   │   │   │   ├───1214
│   │   │   │   ├───1232
│   │   │   │   ├───1233
│   │   │   │   ├───1260
│   │   │   │   ├───1260_fsm
│   │   │   │   ├───1260_vm
│   │   │   │   ├───1261
│   │   │   │   ├───1261_fsm
│   │   │   │   ├───1261_vm
│   │   │   │   ├───1262
│   │   │   │   ├───1262_fsm
│   │   │   │   ├───1262_vm
│   │   │   │   ├───2396
│   │   │   │   ├───2396_fsm
│   │   │   │   ├───2396_vm
│   │   │   │   ├───2397
│   │   │   │   ├───2671
│   │   │   │   ├───2672
│   │   │   │   ├───2676
│   │   │   │   ├───2677
│   │   │   │   ├───2694
│   │   │   │   ├───2695
│   │   │   │   ├───2697
│   │   │   │   ├───2698
│   │   │   │   ├───2846
│   │   │   │   ├───2847
│   │   │   │   ├───2964
│   │   │   │   ├───2965
│   │   │   │   ├───2966
│   │   │   │   ├───2967
│   │   │   │   ├───3592
│   │   │   │   ├───3593
│   │   │   │   ├───4060
│   │   │   │   ├───4061
│   │   │   │   ├───4175
│   │   │   │   ├───4176
│   │   │   │   ├───4177
│   │   │   │   ├───4178
│   │   │   │   ├───4181
│   │   │   │   ├───4182
│   │   │   │   ├───4183
│   │   │   │   ├───4184
│   │   │   │   ├───4185
│   │   │   │   ├───4186
│   │   │   │   ├───6000
│   │   │   │   ├───6001
│   │   │   │   ├───6002
│   │   │   │   ├───6100
│   │   │   │   ├───6114
│   │   │   │   ├───6115
│   │   │   │   ├───6243
│   │   │   │   ├───6244
│   │   │   │   ├───6245
│   │   │   │   ├───6246
│   │   │   │   ├───6247
│   │   │   │   ├───6302
│   │   │   │   ├───6303
│   │   │   │   ├───pg_control
│   │   │   │   ├───pg_filenode.map
│   │   │   │   └───pg_internal.init
│   │   │   ├───pg_commit_ts/
│   │   │   ├───pg_dynshmem/
│   │   │   ├───pg_logical/
│   │   │   │   ├───mappings/
│   │   │   │   ├───snapshots/
│   │   │   │   └───replorigin_checkpoint
│   │   │   ├───pg_multixact/
│   │   │   │   ├───members/
│   │   │   │   │   └───...
│   │   │   │   └───offsets/
│   │   │   │       └───...
│   │   │   ├───pg_notify/
│   │   │   ├───pg_replslot/
│   │   │   ├───pg_serial/
│   │   │   ├───pg_snapshots/
│   │   │   ├───pg_stat/
│   │   │   │   └───pgstat.stat
│   │   │   ├───pg_stat_tmp/
│   │   │   ├───pg_subtrans/
│   │   │   │   └───0000
│   │   │   ├───pg_tblspc/
│   │   │   ├───pg_twophase/
│   │   │   ├───pg_wal/
│   │   │   │   ├───archive_status/
│   │   │   │   ├───000000010000000000000002
│   │   │   │   └───000000010000000000000003
│   │   │   ├───pg_xact/
│   │   │   │   └───0000
│   │   │   ├───PG_VERSION
│   │   │   ├───pg_hba.conf
│   │   │   ├───pg_ident.conf
│   │   │   ├───postgresql.auto.conf
│   │   │   ├───postgresql.conf
│   │   │   └───postmaster.opts
│   │   ├───init-scripts/
│   │   │   ├───keycloak.sql
│   │   │   └───schema.sql
│   │   ├───.DS_Store
│   │   ├───.gitignore
│   │   └───postgresql-compose.yml
│   ├───ssl/
│   │   ├───localhost-key.pem
│   │   ├───localhost.p12
│   │   └───localhost.pem
│   ├───.DS_Store
│   ├───.gitignore
│   ├───README.md
│   ├───app.yml
│   ├───common.yml
│   └───generate-ssl-certificate.sh
├───server/
│   ├───thryve/
│   │   ├───bin/
│   │   │   ├───default/
│   │   │   ├───generated-sources/
│   │   │   │   └───annotations/
│   │   │   ├───generated-test-sources/
│   │   │   │   └───annotations/
│   │   │   ├───main/
│   │   │   │   ├───com/
│   │   │   │   │   └───...
│   │   │   │   ├───db/
│   │   │   │   │   └───...
│   │   │   │   ├───i18n/
│   │   │   │   ├───tls/
│   │   │   │   │   └───...
│   │   │   │   ├───.DS_Store
│   │   │   │   ├───application-dev.yml
│   │   │   │   ├───application-tls.yml
│   │   │   │   ├───application.yml
│   │   │   │   ├───banner.txt
│   │   │   │   └───logback-spring.xml
│   │   │   └───test/
│   │   │       ├───com/
│   │   │       │   └───...
│   │   │       ├───db/
│   │   │       │   └───...
│   │   │       ├───keycloak/
│   │   │       │   └───...
│   │   │       ├───ssl/
│   │   │       │   └───...
│   │   │       ├───.DS_Store
│   │   │       └───application-test.yml
│   │   ├───build/
│   │   │   ├───classes/
│   │   │   │   └───kotlin/
│   │   │   │       └───...
│   │   │   ├───generated-snippets/
│   │   │   ├───kotlin/
│   │   │   │   ├───compileKotlin/
│   │   │   │   │   └───...
│   │   │   │   └───compileTestKotlin/
│   │   │   │       └───...
│   │   │   ├───kover/
│   │   │   │   ├───bin-reports/
│   │   │   │   │   └───...
│   │   │   │   └───kover-jvm-agent-0.8.3.jar
│   │   │   ├───libs/
│   │   │   │   └───thryve-0.0.1-SNAPSHOT-plain.jar
│   │   │   ├───reports/
│   │   │   │   └───tests/
│   │   │   │       └───...
│   │   │   ├───resources/
│   │   │   │   ├───main/
│   │   │   │   │   └───...
│   │   │   │   └───test/
│   │   │   │       └───...
│   │   │   ├───test-results/
│   │   │   │   ├───integrationTest/
│   │   │   │   │   └───...
│   │   │   │   └───test/
│   │   │   │       └───...
│   │   │   └───tmp/
│   │   │       ├───integrationTest/
│   │   │       │   └───...
│   │   │       ├───jar/
│   │   │       │   └───...
│   │   │       ├───test/
│   │   │       │   └───...
│   │   │       └───unitTest/
│   │   ├───src/
│   │   │   ├───main/
│   │   │   │   ├───kotlin/
│   │   │   │   │   └───...
│   │   │   │   ├───resources/
│   │   │   │   │   └───...
│   │   │   │   └───.DS_Store
│   │   │   ├───test/
│   │   │   │   ├───kotlin/
│   │   │   │   │   └───...
│   │   │   │   ├───resources/
│   │   │   │   │   └───...
│   │   │   │   └───.DS_Store
│   │   │   └───.DS_Store
│   │   ├───.DS_Store
│   │   └───thryve.gradle.kts
│   └───.DS_Store
├───shared/
│   ├───common/
│   │   ├───bin/
│   │   │   ├───main/
│   │   │   │   └───com/
│   │   │   │       └───...
│   │   │   └───test/
│   │   │       └───com/
│   │   │           └───...
│   │   ├───build/
│   │   │   ├───classes/
│   │   │   │   └───kotlin/
│   │   │   │       └───...
│   │   │   ├───kotlin/
│   │   │   │   ├───compileKotlin/
│   │   │   │   │   └───...
│   │   │   │   └───compileTestKotlin/
│   │   │   │       └───...
│   │   │   ├───kover/
│   │   │   │   ├───bin-reports/
│   │   │   │   │   └───...
│   │   │   │   ├───.artifact
│   │   │   │   ├───jvm.artifact
│   │   │   │   └───kover-jvm-agent-0.8.3.jar
│   │   │   ├───libs/
│   │   │   │   └───common-1.15.1.jar
│   │   │   ├───reports/
│   │   │   │   ├───kover/
│   │   │   │   │   └───...
│   │   │   │   └───tests/
│   │   │   │       └───...
│   │   │   ├───test-results/
│   │   │   │   └───test/
│   │   │   │       └───...
│   │   │   ├───tmp/
│   │   │   │   ├───jar/
│   │   │   │   │   └───...
│   │   │   │   ├───koverCachedVerify/
│   │   │   │   │   └───...
│   │   │   │   └───test/
│   │   │   │       └───...
│   │   │   ├───20250714_10093590920820560813.compiler.options
│   │   │   ├───20250714_11561102583303573699.compiler.options
│   │   │   ├───20250714_11952295832801988776.compiler.options
│   │   │   ├───20250714_13520974102988339660.compiler.options
│   │   │   ├───20250714_14045496645242371158.compiler.options
│   │   │   ├───20250714_4044181981719997524.compiler.options
│   │   │   └───20250714_4821093188994093019.compiler.options
│   │   ├───src/
│   │   │   ├───main/
│   │   │   │   └───kotlin/
│   │   │   │       └───...
│   │   │   └───test/
│   │   │       └───kotlin/
│   │   │           └───...
│   │   ├───.DS_Store
│   │   └───build.gradle.kts
│   ├───spring-boot-common/
│   │   ├───bin/
│   │   │   ├───main/
│   │   │   │   ├───META-INF/
│   │   │   │   │   └───...
│   │   │   │   └───com/
│   │   │   │       └───...
│   │   │   └───test/
│   │   │       └───com/
│   │   │           └───...
│   │   ├───build/
│   │   │   ├───classes/
│   │   │   │   └───kotlin/
│   │   │   │       └───...
│   │   │   ├───kotlin/
│   │   │   │   ├───compileKotlin/
│   │   │   │   │   └───...
│   │   │   │   └───compileTestKotlin/
│   │   │   │       └───...
│   │   │   ├───kover/
│   │   │   │   ├───bin-reports/
│   │   │   │   │   └───...
│   │   │   │   ├───.artifact
│   │   │   │   ├───jvm.artifact
│   │   │   │   └───kover-jvm-agent-0.8.3.jar
│   │   │   ├───libs/
│   │   │   │   └───spring-boot-common-1.15.1.jar
│   │   │   ├───reports/
│   │   │   │   ├───kover/
│   │   │   │   │   └───...
│   │   │   │   └───tests/
│   │   │   │       └───...
│   │   │   ├───resources/
│   │   │   │   └───main/
│   │   │   │       └───...
│   │   │   ├───test-results/
│   │   │   │   └───test/
│   │   │   │       └───...
│   │   │   └───tmp/
│   │   │       ├───jar/
│   │   │       │   └───...
│   │   │       ├───koverCachedVerify/
│   │   │       │   └───...
│   │   │       └───test/
│   │   │           └───...
│   │   ├───src/
│   │   │   ├───main/
│   │   │   │   ├───kotlin/
│   │   │   │   │   └───...
│   │   │   │   └───resources/
│   │   │   │       └───...
│   │   │   └───test/
│   │   │       └───kotlin/
│   │   │           └───...
│   │   ├───.DS_Store
│   │   └───build.gradle.kts
│   └───.DS_Store
├───.DS_Store
├───.editorconfig
├───.env
├───.env.example
├───.gitattributes
├───.gitignore
├───.nvmrc
├───LICENSE
├───README.md
├───biome.json
├───commitlint.config.mjs
├───compose.yaml
├───gradle.properties
├───gradlew
├───gradlew.bat
├───lefthook.yml
├───package.json
├───pnpm-lock.yaml
├───pnpm-workspace.yaml
├───renovate.json
├───settings.gradle.kts
├───vitest.config.ts
└───vitest.setup.ts

```
