## Commit Charter

### General Rules

- **Language**: Use strictly English for all commit messages
- **Clarity**: Concise and descriptive messages
- **Format**: Follow the Conventional Commits convention
- **Tools**: Use the VS Code extension `adam-bender.commit-message-editor`

### Commit Format

#### Required Structure

```
<type>(<scope>): <description>

<body>

<breaking_change>
<footer>
<NOCI>

@chlbri:bri_lvi@icloud.com
```

#### Available Commit Types

| Type       | Description                                | Version Impact |
| ---------- | ------------------------------------------ | -------------- |
| `feat`     | New feature                                | Minor version  |
| `fix`      | Standard bug fix                           | Patch version  |
| `hotfix`   | Critical bug fix                           | Patch version  |
| `docs`     | Documentation modification/addition        | Patch version  |
| `build`    | Build file modifications                   | No versioning  |
| `chore`    | Maintenance tasks                          | No versioning  |
| `ci`       | CI/CD modifications (Travis, Circle, etc.) | No versioning  |
| `perf`     | Performance improvements                   | Patch version  |
| `refactor` | Refactoring without additions/fixes        | No versioning  |
| `revert`   | Revert to a previous commit                | Patch version  |
| `style`    | Code style modifications                   | No versioning  |
| `test`     | Adding/removing tests                      | Patch version  |

#### Scope (optional)

Scope of the change, for example:

- `(parser)`: Parser modifications
- `(cli)`: Command-line interface modifications
- `(deps)`: Dependency modifications
- `(config)`: Configuration modifications

#### Description

- **Length**: Maximum 50 characters
- **Style**: Present imperative ("add" not "added")
- **Capitalization**: First letter lowercase
- **Punctuation**: No trailing period

#### Body (optional)

- **Length**: Maximum 200 words
- **Language**: English required
- **Format**: Lines of maximum 72 characters
- **Content**: Explain the "why" and "how"

#### Breaking Changes

- **Format**: `BREAKING CHANGE: <description>`
- **Required**: For all breaking changes
- **Impact**: Triggers a major version bump

#### Footer

- **References**: Issues, PRs, etc.
- **Co-authors**: `Co-authored-by: name <email>`
- **Signature**: `@chlbri:bri_lvi@icloud.com` (required)

#### Special Flags

- `_NO_CI`: Skip CI/CD builds
- Use sparingly

### Commit Examples

#### New Feature

```
feat(cli): add lint script support

Added support for a third required script (lint)
in the CLI configuration. Enables complete code
validation with test → build → lint.

@chlbri:bri_lvi@icloud.com
```

#### Bug Fix

```
fix(orchestrator): resolve rollback failure on script timeout

Fixed the rollback mechanism that was not executing
correctly on script validation timeout.

Fixes #42

@chlbri:bri_lvi@icloud.com
```

#### Breaking Change

```
feat(api): restructure dependency state interface

BREAKING CHANGE: DependencyState interface now requires
semverSign field and renames dependencyType to type.

Migration guide:
- Add semverSign: '^' | '~' | 'exact'
- Rename dependencyType → type

@chlbri:bri_lvi@icloud.com
```

#### Documentation

```
docs: update valibot integration guide

Added complete documentation for Valibot integration
with schema examples and validation patterns.

@chlbri:bri_lvi@icloud.com
```

#### Critical Hotfix

```
hotfix(security): patch dependency vulnerability

Urgent fix for a security vulnerability in
dependencies. Immediate application required.

CVE-2023-12345

@chlbri:bri_lvi@icloud.com
```

### VS Code Configuration

#### Extension Installation

```bash
code --install-extension adam-bender.commit-message-editor
```

#### Usage

1. Command palette: `Commit Message Editor: Open Editor`
2. Icon in the SCM bar
3. Automatic configuration via `.github/vsix.commit-message-editor.json`

#### Configuration Files

- **Documentation**: `.github/commit-message-editor.md`
- **Configuration**: `.github/vsix.commit-message-editor.json`

### Commit Validation

#### Automatic Checks

- Conventional Commits format
- Description length
- Signature presence
- Valid commit types

#### Recommended Tools

- `commitizen`: Interactive commit assistant
- `commitlint`: Automatic message validation
- `husky`: Git hooks for pre-commit validation

### Special Cases

#### Merge Commits

```
merge: integrate feature branch into main

Merge of the feature/lint-script-support branch
with merge conflict resolution.

@chlbri:bri_lvi@icloud.com
```

#### Revert Commits

```
revert: "feat(cli): add experimental flag parsing"

This reverts commit 1234567890abcdef.
Cause: Performance regression in production.

@chlbri:bri_lvi@icloud.com
```

#### Release Commits

```
chore(release): bump version to 2.1.0

Release notes:
- New lint script support
- Enhanced rollback mechanism
- Performance improvements

@chlbri:bri_lvi@icloud.com
```

### Best Practices

1. **Atomic commits**: One commit = one logical change
2. **Test before commit**: Always verify that tests pass
3. **Interactive rebase**: Clean up history before push
4. **Descriptive messages**: Explain context and motivations
5. **Reference issues**: Link commits to resolved problems

### What to Avoid

❌ **Vague messages**

```
fix: bug fix
update: changes
```

❌ **Messages too long**

```
feat: add a very long description that exceeds the 50 character limit and makes it hard to read
```

❌ **Mixed languages**

```
feat: add nouvelle fonctionnalité for parsing
```

❌ **Commits too large**

```
feat: add 15 new features and fix 10 bugs
```

### Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=adam-bender.commit-message-editor)
- [Project Configuration](vsix.commit-message-editor.json)
- [Full Documentation](commit-message-editor.md)

## Context: Enhanced Dependency State Management

**Current Feature**: 002-spec-validate-bullet - Enhanced dependency state
management and rollback mechanism

**Tech Stack**:

- Language: TypeScript 5.x with Node.js >= 22
- Framework: cmd-ts, execa, semver parsing utilities
- Storage: In-memory state management during the upgrade process (no
  persistent storage)
- Project Type: Single library - CLI tool with service-layer architecture

**Key Components**:

- DependencyStateManager: Central state management service
- PackageManagerAdapter: Abstraction for npm/yarn/pnpm/bun
- ScriptConfig: Typed configuration for script execution
- Rollback mechanism: Atomic operations with full restoration

**Recent Changes**:

- Added dependency state tracking with semver operator preservation
- Implemented automatic rollback on script execution failure
- Enhanced CLI with configurable test/build/lint script support
- Added package manager adapter pattern for multi-PM compatibility
