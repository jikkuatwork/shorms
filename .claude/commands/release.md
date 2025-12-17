# Release Command

Create a new release for Shorms library.

## Arguments
- `$ARGUMENTS` - Version bump type: `patch`, `minor`, `major`, or specific version like `0.3.1`

## Steps

1. **Determine new version**
   - Read current version from `package.json`
   - Calculate new version based on argument (patch: 0.0.x, minor: 0.x.0, major: x.0.0)
   - If specific version provided, use that

2. **Update version files**
   - `package.json` - bump the `version` field
   - `lib/version.ts` - update `VERSION` constant

3. **Update CHANGELOG.md**
   - Add new version section at top (after header, before [Unreleased])
   - Format: `## [x.y.z] - YYYY-MM-DD`
   - Move relevant items from [Unreleased] or add placeholder

4. **Update LIBRARY_USAGE.md**
   - Update version number in header section

5. **Build and test**
   - Run `npm run build` to verify no errors
   - If build fails, stop and report error

6. **Commit changes**
   - Stage all modified files
   - Commit with message: `release: vX.Y.Z`

7. **Create git tag**
   - Create annotated tag: `git tag -a vX.Y.Z -m "vX.Y.Z"`

8. **Push**
   - Push commits: `git push`
   - Push tags: `git push --tags`

9. **Report**
   - Show the new version
   - Show install command: `npm install github:jikkuatwork/shorms#vX.Y.Z`
   - Show update command: `npm run shorms:update`

## Files Updated
- `package.json` - version field
- `lib/version.ts` - VERSION constant (displayed in UI)
- `CHANGELOG.md` - new version section
- `LIBRARY_USAGE.md` - version in header

## Example Usage
```
/release patch     # 0.3.0 -> 0.3.1
/release minor     # 0.3.0 -> 0.4.0
/release major     # 0.3.0 -> 1.0.0
/release 0.3.5     # -> 0.3.5
```
