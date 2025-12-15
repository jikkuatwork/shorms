# Changelog

All notable changes to Shorms will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planning
- **Library Refactoring Plan** (koder/plans/02_library-refactor.md)
  - Comprehensive 7-phase plan to transform Shorms into installable library
  - Design decisions finalized for component API (Builder, Renderer, Viewer)
  - Strategy for dependency upgrades (Zod v4, React 19)
  - Monorepo structure with @shorms/core and @shorms/react packages
  - Forward compatibility strategy for unknown field types
  - State persistence, draft saving, and file upload patterns defined

### Added
- Unique field ID generation using nanoid (collision-resistant)
- Enhanced validation system:
  - Min/max length validation for text fields (INPUT, TEXTAREA, EMAIL)
  - Min/max value validation for number fields (NUMBER_INPUT, SLIDER)
  - File size validation for FILE_UPLOAD fields (in MB)
- Comprehensive example forms in `/examples` directory:
  - contact-form.json - Single-page contact form
  - user-registration.json - Multi-page registration wizard
  - feedback-survey.json - Customer feedback survey
- LLM Integration documentation (LLM_INTEGRATION.md)
- Validation settings UI for min/max constraints
- Better empty state messaging with icons

### Changed
- Redesigned header with visual hierarchy, title, and backdrop blur
- Improved page tab styling with shadows and better active states
- Enhanced form editor spacing and layout (max-width, better padding)
- Polished footer design
- Updated field name generation for better uniqueness
- Improved validation error messages with better defaults

### Removed
- Database functionality (Turso/libSQL, Drizzle ORM)
- Form sharing via API registry
- CLI integration component
- All backend dependencies

## [0.1.0] - 2025-12-15

### Added
- **Multi-Page Forms**: Create wizards with multiple pages
- **Page Management**: Add, delete, rename, and navigate between pages
- **Advanced Validation**:
  - Regex pattern validation for text fields
  - Custom error messages per field
  - Required field enforcement
- **Form Preview**: Live preview mode with Form Runner component
- **JSON Import/Export**: Save and restore form schemas locally
- **Code Generation**:
  - Single-page form components
  - Multi-page form components with navigation logic
  - Zod schema generation with validation rules
- **Form Runner**: Standalone component for rendering multi-page forms
  - Step-by-step navigation
  - Per-page validation
  - Progress indicator
- **Validation Settings**: UI for configuring field validation rules
- **Local Storage**: Automatic persistence of form state

### Changed
- Refactored data model from flat field list to paginated structure
- Updated all components to support multi-page architecture
- Switched package manager from pnpm to npm

### Technical
- Built with Next.js 14, React 18, TypeScript 5
- Form state management with Zustand + Immer
- Drag-and-drop with dnd-kit
- UI components from shadcn/ui
- Form validation with Zod
- Form handling with React Hook Form
