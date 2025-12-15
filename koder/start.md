# Bootstrap Chain

- this is a repo for Shorms, a local-first multi-page form builder
- the initial plan (koder/plans/01_shorms-initial.md) has been completed
- all 6 phases are done: branding, pagination, validation, import/export, runner, code gen
- recent refinements (Dec 15, 2025) include:
  - improved field IDs (nanoid), enhanced validation (min/max length/value, file size)
  - example forms in /examples, LLM integration docs
  - UI polish (header, tabs, spacing, empty states)
  - responsive sidebars (field library, form context) with width-based visibility
  - field command palette for quick field insertion
  - testing infrastructure (Vitest with 17 passing tests)
  - schema versioning system with forward compatibility
  - library exports (index.ts) for external usage
- **CURRENT PRIORITY**: Library refactoring (koder/plans/02_library-refactor.md)
  - Transform Shorms from app to installable library
  - Export three components: Builder, Renderer, Viewer
  - Plan is complete, ready for execution
- review koder/NEXT_SESSION.md for current state and next steps
- review the repo and give me a clear summary of what you understood
  before starting/resuming the work

## Files

- root of the repo has the code
- koder is a meta folder to guide dev
- koder/plans have plans
- koder/NEXT_SESSION.md has immediate next steps
- CLAUDE.md is symlinked to GEMINI.md, has quick to remember instructions
- CHANGELOG.md maintains changes in standard format

## Meta

- starting with koder/start.md, a Bootstrap Chain is created to provide LLM
  agent context to start the dev process

## Session Close Routine

**ONLY START THIS ROUTINE IF EXPLICITLY ASKED TO**

Follow these steps in order:

### 1. Clean Up Files
- Remove temporary files (*.tmp, *.log, .DS_Store)
- Remove build artifacts if not needed (but keep if part of deliverable)
- Keep: screenshots, documentation, test files, source code
- Run: `git status` to see what's changed

### 2. Update Bootstrap Chain
- Update this file (koder/start.md) if project status changed
- Update "recent refinements" section with latest work
- Update "CURRENT PRIORITY" if focus shifted

### 3. Update Documentation
- **CHANGELOG.md**: Add entry for completed work (follow Keep a Changelog format)
- **koder/NEXT_SESSION.md**: Document what was done, what's next, any blockers
- **README.md**: Update if features added/changed
- **CLAUDE.md**: Update only if core instructions changed

### 4. Review Changes
- Run: `git status` to see all modified and untracked files
- Run: `git diff` to review changes (optional but recommended)
- Verify all important work is saved

### 5. Stage All Changes
- Run: `git add -A` to stage everything (modified + untracked)
- Run: `git status` to confirm what will be committed

### 6. Commit
- Use descriptive commit message following format:
  ```
  type: brief description

  - Detailed change 1
  - Detailed change 2
  - Detailed change 3

  🤖 Generated with [Claude Code](https://claude.com/claude-code)

  Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
  ```
- Types: feat, fix, docs, refactor, test, chore
- Run: `git commit -m "$(cat <<'EOF' ... EOF)"`

### 7. Push
- Run: `git push`
- Verify push succeeded (check output)

### 8. Verify Completion
- Run: `git status` - should show "nothing to commit, working tree clean"
- Confirm all work is saved and pushed

### Rationale

- Best to restart sessions often
- LLMs lose quality as context grows
- Clean git state makes next session easier to resume
