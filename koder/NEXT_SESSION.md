# Next Session: Shorms - Future Enhancements

The initial Shorms roadmap (Phases 1-6) has been completed successfully.
The application is now a fully functional multi-page form builder with
advanced validation, JSON import/export, and code generation.

Database and sharing features have been removed to focus on local-first
development.

## Recent Updates (Session: Dec 15, 2025 - Library Refactor Planning)

### Library Refactoring Plan
- **Created comprehensive refactoring plan** (`koder/plans/02_library-refactor.md`)
- **Design decisions finalized** for library architecture:
  - Component naming: Builder, Renderer, Viewer (short, clear names)
  - State persistence: Memory by default, optional localStorage/sessionStorage
  - Draft saving: Separate callback with page-level validation
  - File uploads: Immediate upload via callback (parent controls storage)
  - Forward compatibility: Graceful degradation for unknown field types
  - UI refinements: Scheduled after refactoring is complete
- **Plan includes 7 implementation phases**:
  1. Testing infrastructure setup
  2. Dependency upgrades (Zod v4, React 19)
  3. Schema versioning & backward compatibility
  4. Monorepo setup (pnpm workspaces)
  5. Component refactoring (Builder, Renderer, Viewer)
  6. Documentation
  7. Testing & validation in Onesource
- **Status**: Plan complete, ready for execution in fresh session

### Previous Session (Dec 15, 2025 - Refinement)

### Core Improvements
- **Field ID System**: Replaced Math.random() with nanoid for collision-resistant unique IDs
- **Enhanced Validation**:
  - Min/max length validation for text fields (INPUT, TEXTAREA, EMAIL)
  - Min/max value validation for number fields (NUMBER_INPUT, SLIDER)
  - File size validation for FILE_UPLOAD fields (in MB)
  - Improved validation UI in field editor
- **Example Forms**: Created 3 comprehensive sample forms in `/examples`:
  - contact-form.json - Single-page contact form
  - user-registration.json - Multi-page registration wizard
  - feedback-survey.json - Customer feedback survey
- **LLM Integration**: Created comprehensive documentation (LLM_INTEGRATION.md)
- **UI Refinements**:
  - Redesigned header with visual hierarchy and backdrop blur
  - Improved page tab styling with better active states
  - Enhanced form editor spacing and layout
  - Polished empty states with icons
  - Better footer design

### Previous Updates (Earlier Dec 2025)
- Fixed Next.js cache issues and 404 static asset errors
- Fixed React hydration warning for dnd-kit (SSR/client mismatch)
- Added file upload field type with validation
- Implemented JSON-first workflow (removed Code tab)
- Added drag-and-drop page reordering
- Implemented inline tab editing (double-click)
- Changed import to auto-load on file selection (no extra button)
- Widened right sidebar for better editing experience

## Current State

✅ **Complete**

- Multi-page form builder with page management
- Drag-and-drop page reordering with inline editing
- Advanced validation (regex, min/max length/value, file size, required, custom messages)
- Form preview with Form Runner
- JSON import/export (file-based, auto-loading)
- Code generation for single and multi-page forms
- Local state management (Zustand + localStorage)
- File upload field type with size validation
- Unique field IDs using nanoid
- Example form templates (3 comprehensive examples)
- LLM integration documentation
- Polished UI with modern design
- SSR-compatible with proper hydration

## Suggestions for Next Session

### IMMEDIATE PRIORITY: Library Refactoring
**Execute the refactoring plan in `koder/plans/02_library-refactor.md`**

The plan is complete and ready for execution. Start with:
1. Read `koder/plans/02_library-refactor.md` for full context
2. Begin with Phase 1: Testing Infrastructure
3. Follow phases sequentially (each phase has acceptance criteria)

**Goal**: Transform Shorms from standalone app to installable library with exports:
```typescript
import { Builder, Renderer, Viewer } from 'shorms'
```

### Future Enhancements (After Refactoring)
- **UI Refinements**: Per design decision, do visual polish AFTER refactoring
- **Conditional Logic**: Show/hide fields based on other field values
- **Field Duplication**: Quick duplicate button for fields
- **Undo/Redo**: History management for builder actions
- **Form Templates**: Pre-built templates for common use cases

## Potential Future Enhancements

### Additional Field Types

- OTP Input (with auto-focus)
- Phone Number Input (with country codes)
- Multi-select dropdown
- Rich text editor field
- Color picker field
- Rating/Stars field

### UX Improvements

- Undo/Redo functionality
- Keyboard shortcuts
- Form templates/presets
- Theme customization for generated forms
- Field duplication
- Bulk field operations
- Search/filter fields in large forms

### Code Generation

- TypeScript type generation from schema
- React Native component generation
- Vue/Svelte component generation
- API endpoint generation for form submission
- Email template generation for form responses

### Validation

- Conditional validation rules
- Cross-field validation
- Async validation (API checks)
- Custom validation functions

### Export Options

- PDF form preview
- HTML standalone form
- Markdown documentation
- CSV schema export

### Developer Experience

- Component preview in different themes
- Accessibility checker
- Performance optimizer
- Bundle size analyzer for generated code
