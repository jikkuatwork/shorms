# Changelog

All notable changes to Shorms will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.1] - 2025-12-18

### Added
- **Field editing panel**: Added edit functionality with side sheet panel for field configuration
  - Label, name, description editing
  - Field-specific settings (placeholder, default values, choices for selects/radios/combobox)
  - Validation settings (required, min/max, regex, custom error messages)
  - File size limits for file upload fields
- **Syntax highlighting**: Added Shiki-based code highlighting to documentation pages
  - GitHub light/dark themes with automatic switching
  - Copy-to-clipboard button on hover
  - Support for all common programming languages

### Changed
- **Logo**: Updated to use `currentColor` for proper light/dark mode rendering
- **Navigation**: Enhanced docs/changelog page headers with consistent layout
  - Logo button links to home
  - Dropdown menu with descriptions (Docs, Changelog, GitHub)
  - Theme toggle on all pages
- **Field descriptions**: Standardized to under 30 characters for sidebar/command palette
  - Input: "Single line text entry"
  - Textarea: "Multi-line text entry"
  - Select: "Dropdown selection"
  - etc.
- **Dropdown menus**: Added icons and descriptions to navigation dropdowns

### Fixed
- **Delete functionality**: Fixed field delete button not working in controlled mode
  - Added `onDelete` callback prop propagation through Field → SortableField → Builder
  - Falls back to Zustand store when callback not provided (backward compatible)

## [0.3.0] - 2025-12-17

### Changed
- **API Simplification**: Default exports are now shadcn-styled components
  - `Builder` (was `ShadcnBuilder`)
  - `Renderer` (was `ShadcnRenderer`)
  - `Viewer` (was `ShadcnViewer`)
- **Headless namespace** for custom UI implementations: `Headless.Builder`, `Headless.Renderer`, `Headless.Viewer`

### Removed
- **Legacy code cleanup**: Removed 36 files (~6,900 lines) of legacy code
  - `app/original/` - Old Zustand-based version (preserved in `legacy` branch)
  - `app/test-renderer/` - Replaced by `/using-library/` demos
  - 20 legacy components (form-editor, sidebars, code-gen, etc.)
  - Old documentation (COMPONENT_API.md, LLM_INTEGRATION.md)
  - Internal dev files (koder/plans, screenshots, session notes)

### Documentation
- Updated all docs and examples to use new API names
- Added "Updating" section to README for consumers
- Simplified README for library focus

---

## [Unreleased]

### Added
- **Library Demo Page Enhancements (2025-12-17)**:
  - Rebuilt `/using-library/` page with full Builder integration
  - ControlledFieldCommandPalette component for controlled state management
  - All navbar controls: Run Form, View, Clear, Export, Import, Theme toggle
  - Enhanced form submission toast showing data preview (first 3 fields)
  - Responsive button labels (icons-only on small screens, text on large)
  - Command palette button correctly positioned in PageTabs area
  - renderCommandPalette prop for Builder/PageTabs customization
- **Viewer Component Extraction (Phase 3 Complete)**:
  - Core Viewer component in `components/shorms/viewer/` with read-only display
  - ShadcnViewer wrapper with export and print functionality
  - Three view modes: detailed, compact, and summary
  - Support for displaying submission data alongside schema
  - Field display with validation rules and options
  - Statistics and metadata display
  - Viewer demo page at `/using-library/viewer-demo`
  - API documentation in `koder/viewer-design/VIEWER_API.md`
- **Documentation & Examples (Complete)**:
  - LIBRARY_USAGE.md - Comprehensive library usage guide (924 lines)
  - Code examples directory with 6 practical examples
  - Migration guide from Zustand FormEditor to controlled Builder
  - Common usage patterns (localStorage, API, build/preview toggle)
  - Updated README.md with library features and quick start examples
- **Builder Component Extraction (Phase 2 Complete)**:
  - Core Builder component in `components/shorms/builder/` with controlled API
  - ShadcnBuilder wrapper for high-level usage
  - useBuilderState hook for convenient state management
  - PageTabs component for page management with drag-drop
  - FieldLibrary component for field template selection
  - FormContext component for statistics and info display
  - Complete TypeScript type definitions
  - Builder demo page at `/using-library/builder-demo`
  - API documentation in `koder/builder-design/BUILDER_API.md`
  - Playwright E2E test suite: 6 passing tests, 8 manually verified
- **Renderer Component Extraction (Phase 1 Complete)**:
  - Core Renderer component in `components/shorms/renderer/` with full API Design v3.1.0 implementation
  - ShadcnRenderer wrapper with full shadcn/ui component styling
  - Schema adapter utilities for legacy format conversion (`lib/schema-adapter.ts`)
  - Playwright E2E testing infrastructure with 12 comprehensive tests
  - Integrated ShadcnRenderer into main app (replaces FormRunner in preview dialog)
- **Testing Infrastructure**:
  - Playwright configuration and test suite
  - Automated browser testing for all renderer features
  - Test coverage: rendering, validation, navigation, submission
- **Library Exports**:
  - Exported `Renderer` and `ShadcnRenderer` components
  - Exported `formPagesToSchema` and `schemaToFormPages` adapters
  - All TypeScript types for library usage

### Changed
- `/using-library/` page now mirrors root page functionality exactly
- ShadcnRenderer buttons now properly styled with shadcn/ui classes
- Command palette integrated into Builder PageTabs (not separate navbar button)
- Form submission toast enhanced with actual field data display
- Form preview dialog now uses ShadcnRenderer instead of FormRunner
- Updated index.ts with complete renderer exports

### Fixed
- Command palette button positioning in PageTabs (was missing in SM/MD modes)
- ShadcnRenderer navigation buttons styling (Previous/Next/Submit)
- Navbar overflow on small screens (made button text responsive)
- Number field validation now properly converts string values to numbers
- Added missing `name` attributes to form inputs for proper form handling
- Textarea fields now render correctly instead of as text inputs
- Field type attributes properly mapped (email, number types)

## [0.2.0] - 2025-12-15

### Library-Ready Beta Release

This release upgrades major dependencies and adds library support. Still in beta as compatibility testing continues.

### Breaking Changes
- Upgraded to Zod v4 (from v3) - Schema generation changes
- Upgraded to React 19 (from v18) - Component behavior changes
- Upgraded to Next.js 16 (from v14)

### Known Issues
- Email validation may be stricter in Zod v4
- Date field handling requires testing across different input formats

### Added
- **Library Exports**: Main index.ts exports types and utilities for external usage
- **Schema Versioning System**:
  - ShormsSchema interface with version field
  - validateSchema() - Validates schemas with forward compatibility
  - migrateSchema() - Migration utilities for future versions
  - SUPPORTED_FIELD_TYPES - Field type registry
  - Graceful handling of unknown field types
- **Testing Infrastructure**:
  - Vitest setup with 17 passing tests
  - Form schema generation tests
  - Example form compatibility tests
  - Versioning validation tests
- **Library Usage Documentation** (LIBRARY_USAGE.md)
- **Type Safety**: Full TypeScript support for all exports

### Changed
- Default values now provided for all form fields (prevents controlled/uncontrolled warnings)
- Form reset logic improved for dynamic field changes
- Package.json configured for library usage (main, types exports)

### Fixed
- React 19 controlled/uncontrolled input warnings
- Form state synchronization when fields are added/removed
- Zod v4 email validation compatibility

### Technical
- Zod: v3.23.8 → v4.1.13
- React: 18.x → 19.2.0
- Next.js: 14.2.16 → 16.0.4
- Added vitest, @testing-library/react for testing
- Simplified library structure (no monorepo complexity)

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
