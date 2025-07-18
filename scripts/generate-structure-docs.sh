#!/usr/bin/env bash

set -e

echo "# Project Structure\n\n\`\`\`plaintext" > docs/structure.md
npx --yes tree-extended \
  -max=5 \
  -max-show-not-empty \
  -gitignore \
  -ignore node_modules,build,.git,public >> docs/structure.md
echo "\`\`\`" >> docs/structure.md
