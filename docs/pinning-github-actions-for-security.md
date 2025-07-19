# 🔒 How to Pin GitHub Actions to a Specific Hash

## Why Pin Actions?

Using a floating tag (e.g. `v4`, `@main`) for a third-party GitHub Action can expose you to supply chain attacks. If the tag is repointed by a compromised maintainer, malicious code may execute in your workflows. Pinning to a full commit hash ensures immutability.

## Methods to Find a Commit Hash

### 1. `git ls-remote`

Without cloning the repo:

```bash
# Replace URL and tag as needed
git ls-remote --tags https://github.com/codecov/codecov-action.git v4
```

Output:

```text
b9fd7d16f6d7d1b5d2bec1a2887e65ceed900238 refs/tags/v4
```

Use the full hash (`b9fd7d16f6d7d1b5d2bec1a2887e65ceed900238`).

### 2. GitHub Web Interface

1. Open the action’s repo (e.g. `https://github.com/codecov/codecov-action`).
2. Select **Tags** or **Releases**.
3. Click the short hash beside your tag.
4. Copy the full commit hash from the commit page.

### 3. GitHub CLI (`gh`)

Query the Git API:

```bash
# Replace owner/repo and tag
gh api repos/codecov/codecov-action/git/ref/tags/v4
```

Sample JSON response:

```json
{
  "ref": "refs/tags/v4",
  "object": {
    "sha": "b9fd7d16f6d7d1b5d2bec1a2887e65ceed900238",
    "type": "commit"
  }
}
```

## How to Update Your Workflow File

Once you have the commit hash, update your workflow `.yml` file.

**Before (insecure):**

```yaml
- name: Upload coverage reports to Codecov
  uses: codecov/codecov-action@v4
```

**After (secure):**

Replace the `@v4` tag with `@` followed by the full commit hash. You can add a comment to remember which version it corresponds to.

```yaml
- name: Upload coverage reports to Codecov
  # Pinned to v4 hash for security
  uses: codecov/codecov-action@b9fd7d16f6d7d1b5d2bec1a2887e65ceed900238
```

By following these steps, you ensure that your workflows are more secure and your dependencies are predictable.
