# Bootstrap Chain

- this is a repo for Shorms, a local-first multi-page form builder
- the initial plan (koder/plans/01_shorms-initial.md) has been completed
- all 6 phases are done: branding, pagination, validation, import/export, runner, code gen
- recent refinements (Dec 15, 2025) include:
  - improved field IDs (nanoid), enhanced validation (min/max length/value, file size)
  - example forms in /examples, LLM integration docs
  - UI polish (header, tabs, spacing, empty states)
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

- ONLY START THIS ROUTINE IF EXPLICTLY ASKED TO
- clean up files
- update Bootstrap Chain
- update docs (README/CHANGELOG/CLAUDE/ koder/NEXT_SESSION)
- commit
- push
- prepare to restart the session

### Rationale

- its best to restart the session often
- llms lose quality as context goes up
