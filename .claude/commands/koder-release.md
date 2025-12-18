# Koder Release Command

Create a thoroughly verified release for the Shorms library.

## Arguments
- `$ARGUMENTS` - **Optional** override: `patch`, `minor`, `major`, or specific version like `0.3.2`
- If no argument provided, version is **auto-detected** from commit analysis

---

## Phase 0: Version Auto-Detection

**If `$ARGUMENTS` is empty or not provided**, analyze commits to determine version bump:

### 0.1 Get Commits Since Last Tag
```bash
git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"%s"
```

### 0.2 Analyze Commit Patterns

Scan each commit message for conventional commit prefixes:

| Pattern | Bump | Priority |
|---------|------|----------|
| `BREAKING CHANGE:` in body | **major** | 1 (highest) |
| `!:` after type (e.g., `feat!:`) | **major** | 1 |
| `feat:` or `feature:` | **minor** | 2 |
| `fix:` | **patch** | 3 |
| `perf:` | **patch** | 3 |
| `refactor:` | **patch** | 4 |
| `docs:` | **patch** | 4 |
| `style:` | **patch** | 4 |
| `test:` | **patch** | 4 |
| `chore:` | **patch** | 4 |
| `build:` | **patch** | 4 |
| `ci:` | **patch** | 4 |
| No prefix / other | **patch** | 5 (default) |

### 0.3 Determine Final Bump

Use the **highest priority** bump found:
- Any breaking change → `major`
- Any new feature → `minor`
- Only fixes/refactors/other → `patch`

### 0.4 Display Detection Result

```
╔════════════════════════════════════════════════════════════════╗
║                 VERSION AUTO-DETECTION                          ║
╠════════════════════════════════════════════════════════════════╣
║ Current Version: 0.3.1                                          ║
║ Detected Bump:   minor                                          ║
║ New Version:     0.4.0                                          ║
╠════════════════════════════════════════════════════════════════╣
║ ANALYSIS                                                        ║
║ ─────────────────                                               ║
║ ✓ 0 breaking changes                                           ║
║ ✓ 2 new features (feat:)                                       ║
║   • feat: Add field editing panel                              ║
║   • feat: Add syntax highlighting                              ║
║ ✓ 1 fix                                                        ║
║   • fix: Delete button not working                             ║
║ ✓ 3 other commits                                              ║
╠════════════════════════════════════════════════════════════════╣
║ Override? Enter 'patch', 'minor', 'major', or version number   ║
║ Press Enter to accept: minor → 0.4.0                           ║
╚════════════════════════════════════════════════════════════════╝
```

**Ask user:** Accept detected version or override?

- If user provides override → use that
- If user accepts (Enter/yes/y) → use detected version
- Store final version for Phase 6

---

## Phase 1: Pre-Flight Checks (STOP if any fail)

### 1.1 Repository State
```bash
git status --porcelain
```
- **MUST be clean** - No uncommitted changes allowed
- If dirty: List the uncommitted files and STOP. Ask user to commit or stash.

### 1.2 Build Verification
```bash
npm run build
```
- Build MUST succeed with zero errors
- If fails: Show error and STOP

### 1.3 Test Suite
```bash
npm run test
```
- All tests MUST pass
- If fails: Show failures and STOP

### 1.4 Version Consistency Check
Verify these files have MATCHING versions:
- `package.json` → `version` field
- `lib/version.ts` → `VERSION` constant
- `LIBRARY_USAGE.md` → Version in header

If mismatch found: Report the inconsistency and STOP.

---

## Phase 2: Change Analysis

### 2.1 Determine Last Release
```bash
git describe --tags --abbrev=0
```
Store as `$LAST_TAG` (e.g., `v0.3.1`)

### 2.2 Commits Since Last Release
```bash
git log $LAST_TAG..HEAD --oneline
```
- List all commits with hashes and messages
- Count total commits

### 2.3 Files Changed Since Last Release
```bash
git diff $LAST_TAG..HEAD --stat
```
- Show file change summary
- Highlight changes to key files:
  - `index.ts` - API exports (CRITICAL)
  - `types/*.ts` - Type definitions
  - `components/shorms/**` - Core components
  - `lib/**` - Utility functions

### 2.4 Detailed Change Categories
Analyze the diff and categorize changes into:

**API Changes (index.ts)**
```bash
git diff $LAST_TAG..HEAD -- index.ts
```
- New exports added?
- Exports removed?
- Export signatures changed?

**Component Changes**
```bash
git diff $LAST_TAG..HEAD -- "components/shorms/**/*.ts" "components/shorms/**/*.tsx"
```
- New props added to Builder/Renderer/Viewer?
- Props removed?
- Behavior changes?

**Type Changes**
```bash
git diff $LAST_TAG..HEAD -- "types/**/*.ts"
```
- New types exported?
- Type modifications?

---

## Phase 3: Documentation Verification

### 3.1 API Export Audit
Read `index.ts` and extract all exported items:
- Named exports (functions, types, constants)
- Default exports
- Namespace exports (Headless.*)

Cross-reference with `LIBRARY_USAGE.md`:
- Every export in index.ts should be documented
- Document any NEW exports not yet in docs
- Flag any documented items that no longer exist

### 3.2 CHANGELOG.md Review
Read `CHANGELOG.md` and check:
- Does `[Unreleased]` section exist?
- Does it contain entries for changes since last release?
- If [Unreleased] is empty but commits exist: WARN user

### 3.3 Example File Validation
For each file in `examples/*.json`:
- Parse JSON to verify valid
- Check schema version matches current

---

## Phase 4: Generate Release Summary

Create a comprehensive summary showing:

```
╔════════════════════════════════════════════════════════════════╗
║                    RELEASE SUMMARY                              ║
╠════════════════════════════════════════════════════════════════╣
║ Current Version: X.Y.Z                                          ║
║ New Version:     A.B.C                                          ║
║ Last Release:    vX.Y.Z (YYYY-MM-DD)                           ║
║ Commits:         N commits since last release                   ║
╠════════════════════════════════════════════════════════════════╣
║ FILES CHANGED                                                   ║
║ ─────────────────                                               ║
║ • index.ts          [API] - X additions, Y deletions           ║
║ • components/...    [COMPONENT] - ...                          ║
║ • lib/...           [UTILITY] - ...                            ║
╠════════════════════════════════════════════════════════════════╣
║ COMMIT HISTORY                                                  ║
║ ─────────────────                                               ║
║ abc123 feat: Add new feature                                   ║
║ def456 fix: Fix bug in renderer                                ║
║ ...                                                            ║
╠════════════════════════════════════════════════════════════════╣
║ SUGGESTED CHANGELOG ENTRIES                                     ║
║ ─────────────────                                               ║
║ ### Added                                                       ║
║ - [Inferred from commits/diffs]                                ║
║                                                                 ║
║ ### Changed                                                     ║
║ - [Inferred from commits/diffs]                                ║
║                                                                 ║
║ ### Fixed                                                       ║
║ - [Inferred from commits/diffs]                                ║
╠════════════════════════════════════════════════════════════════╣
║ DOCUMENTATION STATUS                                            ║
║ ─────────────────                                               ║
║ ✓ All API exports documented                                   ║
║ ✓ LIBRARY_USAGE.md version will be updated                     ║
║ ⚠ New export 'foo' needs documentation                         ║
╚════════════════════════════════════════════════════════════════╝
```

---

## Phase 5: User Confirmation

**STOP and ask user:**
> Based on the analysis above:
> 1. Does the suggested changelog look correct?
> 2. Are there any changes I should add or modify?
> 3. Should I proceed with the release?

If user says no or wants changes: Make requested modifications and re-confirm.
If user approves: Proceed to Phase 6.

---

## Phase 6: Execute Release

### 6.1 Calculate New Version
- Read current version from `package.json`
- Use version determined in Phase 0 (auto-detected or user override):
  - `patch`: 0.0.x increment
  - `minor`: 0.x.0 increment
  - `major`: x.0.0 increment
  - Specific version: Use as-is

### 6.2 Update Version Files
Update these files with new version:

**package.json**
```json
"version": "X.Y.Z"
```

**lib/version.ts**
```typescript
export const VERSION = 'X.Y.Z'
```

### 6.3 Update CHANGELOG.md
- Add new version section after header, before [Unreleased]:
```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- [Items from analysis]

### Changed
- [Items from analysis]

### Fixed
- [Items from analysis]
```
- Clear or update [Unreleased] section

### 6.4 Update LIBRARY_USAGE.md
Update the header section:
```markdown
**Version:** X.Y.Z
**Last Updated:** YYYY-MM-DD
```

### 6.5 Final Build Verification
```bash
npm run build
```
Must succeed - if not, STOP and report error.

### 6.6 Create Commit
```bash
git add package.json lib/version.ts CHANGELOG.md LIBRARY_USAGE.md
git commit -m "release: vX.Y.Z"
```

### 6.7 Create Tag
```bash
git tag -a vX.Y.Z -m "vX.Y.Z"
```

### 6.8 Push
```bash
git push && git push --tags
```

---

## Phase 7: Post-Release Report

Display final summary:

```
╔════════════════════════════════════════════════════════════════╗
║                    ✓ RELEASE COMPLETE                          ║
╠════════════════════════════════════════════════════════════════╣
║ Version: vX.Y.Z                                                ║
║ Date:    YYYY-MM-DD                                            ║
╠════════════════════════════════════════════════════════════════╣
║ INSTALL COMMANDS                                                ║
║ ─────────────────                                               ║
║ npm install github:jikkuatwork/shorms#vX.Y.Z                   ║
║                                                                 ║
║ UPDATE COMMAND (for existing installs)                          ║
║ ─────────────────                                               ║
║ npm update shorms                                               ║
╠════════════════════════════════════════════════════════════════╣
║ RELEASE CONTENTS                                                ║
║ ─────────────────                                               ║
║ • N commits included                                            ║
║ • M files changed                                               ║
║ • Key changes: [brief summary]                                  ║
╠════════════════════════════════════════════════════════════════╣
║ VERIFICATION                                                    ║
║ ─────────────────                                               ║
║ ✓ Build passing                                                ║
║ ✓ Tests passing                                                ║
║ ✓ Version files synced                                         ║
║ ✓ CHANGELOG updated                                            ║
║ ✓ LIBRARY_USAGE.md updated                                     ║
║ ✓ Git tag created and pushed                                   ║
╚════════════════════════════════════════════════════════════════╝
```

---

## Files Updated
- `package.json` - version field
- `lib/version.ts` - VERSION constant
- `CHANGELOG.md` - new version section with categorized changes
- `LIBRARY_USAGE.md` - version in header

## Critical Rules

1. **NEVER skip pre-flight checks** - A failed build or dirty repo = no release
2. **ALWAYS show change analysis** - User must see what's being released
3. **ALWAYS get confirmation** - Never auto-proceed past Phase 5
4. **ALWAYS verify API docs** - Flag undocumented exports
5. **ALWAYS run final build** - Catch any issues from version updates

## Example Usage
```
/koder-release           # Auto-detect from commits (recommended)
/koder-release patch     # Override: 0.3.1 -> 0.3.2
/koder-release minor     # Override: 0.3.1 -> 0.4.0
/koder-release major     # Override: 0.3.1 -> 1.0.0
/koder-release 0.4.0     # Override: -> 0.4.0
```
