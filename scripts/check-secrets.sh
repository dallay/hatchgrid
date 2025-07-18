#!/usr/bin/env bash

set -e

if ! command -v gitleaks &> /dev/null; then
  echo "⚠️  gitleaks not found. Attempting to install..."

  if command -v brew &> /dev/null; then
    echo "🍺 Installing with Homebrew..."
    brew install gitleaks
  else
    echo "🌐 Installing from GitHub release..."
    ARCH=$(uname -m)
    OS=$(uname -s)
    VERSION=$(curl -s https://api.github.com/repos/gitleaks/gitleaks/releases/latest | grep tag_name | cut -d '"' -f 4)

    TARBALL="gitleaks_${VERSION#v}_${OS}_${ARCH}.tar.gz"
    URL="https://github.com/gitleaks/gitleaks/releases/download/${VERSION}/${TARBALL}"

    curl -sSL "$URL" | tar -xz
    chmod +x gitleaks
    sudo mv gitleaks /usr/local/bin
  fi

  echo "✅ gitleaks installed."
fi

echo "🔐 Running gitleaks scan..."
gitleaks detect --no-git -v --config=.gitleaks.toml
