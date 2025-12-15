# Plan: Shorms Library Refactoring

**Goal:** Transform Shorms from a standalone Next.js application into an installable library that can be integrated into other projects (specifically Onesource) as a git dependency.

**Status:** Partially Complete (dependencies upgraded, see plan 03 for component extraction)
**Created:** 2025-12-15
**Updated:** 2025-12-15

---

## Context & Problem Statement

### Current State
Shorms is a complete Next.js application with:
- Full app structure (`app/`, `pages/`, standalone deployment)
- ✅ Zod v4.1.13 (upgraded)
- ✅ React 19.2.0 (upgraded)
- Tailwind CSS v3.4.1
- ✅ Has index.ts with partial exports (types, utilities)
- ❌ Components not exported yet (see plan 03)

### Target Use Case
Onesource (and similar projects) need to:
1. Install Shorms as a git dependency: `"shorms": "github:jikkuatwork/shorms"`
2. Import and use three core functions:
   ```typescript
   import { Builder, Renderer, Viewer } from 'shorms'

   // 1. Build forms → returns JSON schema
   <Builder onSave={(schema) => saveToDb(schema)} />

   // 2. Render forms → returns form values
   <Renderer schema={schema} onSubmit={(values) => handleSubmit(values)} />

   // 3. Display submission data (read-only)
   <Viewer schema={schema} values={submissionData} />
   ```

### Blockers Identified

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| Zod v3 → v4 upgrade | **CRITICAL** | ✅ **DONE** | Upgraded to v4.1.13 |
| React 18 → 19 upgrade | **CRITICAL** | ✅ **DONE** | Upgraded to v19.2.0 |
| App structure (not library) | **CRITICAL** | 🔄 **IN PROGRESS** | See plan 03 for component extraction |
| No schema versioning | **HIGH** | ✅ **DONE** | Schema versioning system in place |
| Tailwind v3 → v4 | **MEDIUM** | ⏸️ **DEFERRED** | Will address when packaging |
| No tests | **HIGH** | ✅ **DONE** | Vitest with 17 passing tests |

---

## Design Decisions (Approved)

### 1. UI Refinements Timing
**Decision:** Perform UI refinements AFTER refactoring is complete.
**Rationale:** Structural changes first, visual polish second. Avoids redoing work.

### 2. Component Naming
**Decision:** Use short, clear names
```typescript
import { Builder, Renderer, Viewer } from 'shorms'
```
- `Builder` - Creates forms (returns JSON schema)
- `Renderer` - Renders forms for filling (returns form values)
- `Viewer` - Displays submitted data (read-only)

### 3. Forward Compatibility (Unknown Field Types)
**Decision:** Graceful degradation with user warning
**Behavior:**
- Skip unknown field types (don't break form)
- Show warning banner: "This form uses features not supported in this version"
- Log details to console: `console.warn('Unknown field type: PHONE')`
- Remove unknown fields from validation schema

### 4. Form State Preservation
**Decision:** Memory by default, optional localStorage
```typescript
<Renderer
  persistTo="localStorage"  // Optional: 'memory' | 'localStorage' | 'sessionStorage'
  persistKey="form-draft-123"  // Required if persistTo set
  autoSaveInterval={30}  // Auto-save every N seconds
/>
```

### 5. Draft Saving
**Decision:** Support via callback
```typescript
<Renderer
  onSubmit={handleFinalSubmit}
  onSaveDraft={handleDraftSave}  // Optional
  showDraftButton={true}
/>
```
- Draft: Validates current page only
- Submit: Validates entire form

### 6. Custom Completion Messages
**Decision:** Parent controls via callbacks
```typescript
<Renderer
  onSubmit={handleSubmit}
  onSuccess={(result) => showToast("Submitted!")}
  onError={(error) => showToast(error.message)}
/>
```

### 7. File Upload Strategy
**Decision:** Immediate upload via callback (parent controls storage)
```typescript
<Renderer
  onFileUpload={async (file, fieldName) => {
    const url = await uploadToStorage(file)
    return url  // Return URL, not File object
  }}
/>
```
**Benefits:**
- No memory issues
- Fast submit (files already uploaded)
- Parent decides storage (S3, Supabase, etc.)

---

## Target Architecture

### Package Structure (Monorepo)
```
shorms/
├── packages/
│   ├── core/                    # @shorms/core - Pure logic, no UI
│   │   ├── src/
│   │   │   ├── types/           # TypeScript types
│   │   │   ├── validation/      # Zod schema generation
│   │   │   ├── versioning/      # Schema version management
│   │   │   └── index.ts         # Export all core utilities
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── react/                   # @shorms/react - React components
│   │   ├── src/
│   │   │   ├── Builder/         # Form builder component
│   │   │   ├── Renderer/        # Form runner component (renders forms for filling)
│   │   │   ├── Viewer/          # Read-only form display component
│   │   │   └── index.ts         # Export { Builder, Renderer, Viewer }
│   │   ├── package.json         # Has @shorms/core as dependency
│   │   └── tsconfig.json
│   │
│   └── builder-app/             # Current Shorms app (uses @shorms/react)
│       ├── app/
│       ├── components/          # App-specific components
│       ├── package.json         # Depends on @shorms/react
│       └── ...
│
├── package.json                 # Root workspace config
├── pnpm-workspace.yaml          # Workspace definition
└── turbo.json                   # Build orchestration (optional)
```

### Export API (Main Entry Point)
```typescript
// Main export from @shorms/react
export { Builder } from './Builder'
export { Renderer } from './Renderer'
export { Viewer } from './Viewer'

// Re-export types from @shorms/core
export type {
  ShormsSchema,
  FormPage,
  FormField,
  FieldType,
  ValidationRules
} from '@shorms/core'

// Re-export utilities from @shorms/core
export {
  generateZodSchema,
  validateSchema,
  migrateSchema
} from '@shorms/core'
```

---

## Phase 1: Preparation & Testing Infrastructure

**Objective:** Set up testing before making breaking changes.

### Tasks

1. **Install Testing Dependencies**
   ```bash
   npm install --save-dev vitest @testing-library/react @testing-library/jest-dom happy-dom
   ```

2. **Create Test Configuration**
   - Create `vitest.config.ts`
   - Set up test utilities in `test/setup.ts`

3. **Write Critical Tests** (Must pass before refactoring)
   - [ ] `lib/__tests__/form-schema.test.ts` - Test Zod schema generation
   - [ ] `lib/__tests__/field-generation.test.ts` - Test field ID/name generation
   - [ ] `components/__tests__/FormRunner.test.tsx` - Test form rendering
   - [ ] `components/__tests__/FormEditor.test.tsx` - Test form building
   - [ ] `examples/__tests__/schema-compatibility.test.ts` - Test example forms work

4. **Run Tests & Establish Baseline**
   ```bash
   npm run test
   ```
   All tests must pass before proceeding.

**Acceptance Criteria:**
- ✅ Test suite runs successfully
- ✅ All example forms validate correctly
- ✅ Core functionality has test coverage

---

## Phase 2: Dependency Upgrades

**Objective:** Upgrade to versions compatible with target projects (Onesource).

### 2.1 Upgrade Zod (v3.23.8 → v4.1.13)

**Breaking Changes in Zod v4:**
- `.refine()` signature changed
- `.transform()` behavior changed
- Error message format changed
- Some schema methods renamed

**Tasks:**
1. **Update package.json**
   ```bash
   npm install zod@^4.1.13
   ```

2. **Update Code (Files to check)**
   - [ ] `lib/form-schema.ts` - Main schema generation logic
   - [ ] `components/validation-settings.tsx` - Validation UI
   - [ ] `lib/generate-form-code.ts` - Code generation
   - [ ] All files using `z.refine()`, `z.transform()`

3. **Common Migration Patterns**
   ```typescript
   // OLD (v3)
   z.string().refine((val) => val.length > 5, "Too short")

   // NEW (v4)
   z.string().refine((val) => val.length > 5, {
     message: "Too short"
   })
   ```

4. **Test After Upgrade**
   ```bash
   npm run test
   npm run dev  # Manual testing
   ```

**Acceptance Criteria:**
- ✅ All tests pass with Zod v4
- ✅ Example forms still validate correctly
- ✅ Form builder still works
- ✅ Form preview still works

### 2.2 Upgrade React (18.x → 19.2.0)

**Breaking Changes in React 19:**
- New JSX transform required
- Some hooks behavior changed
- Ref handling changes

**Tasks:**
1. **Update package.json**
   ```bash
   npm install react@19.2.0 react-dom@19.2.0
   npm install --save-dev @types/react@^19 @types/react-dom@^19
   ```

2. **Update Next.js** (for compatibility)
   ```bash
   npm install next@16.0.4
   ```

3. **Update tsconfig.json** (if needed)
   ```json
   {
     "compilerOptions": {
       "jsx": "react-jsx"
     }
   }
   ```

4. **Test Components**
   - [ ] All hooks (useState, useEffect, useCallback, etc.) work
   - [ ] Form editor drag-and-drop works
   - [ ] Form preview works
   - [ ] No hydration warnings

**Acceptance Criteria:**
- ✅ All tests pass with React 19
- ✅ No console warnings
- ✅ Dev server runs without errors
- ✅ All interactive features work

### 2.3 Tailwind CSS Strategy

**Decision:** Make Tailwind a peer dependency (don't bundle it)

**Tasks:**
1. **Update package.json**
   ```json
   {
     "peerDependencies": {
       "tailwindcss": "^3.0.0 || ^4.0.0"
     }
   }
   ```

2. **Document CSS Requirements**
   - Create `CSS_INTEGRATION.md` explaining how parent projects should configure Tailwind
   - List required Tailwind classes used by Shorms components

**Acceptance Criteria:**
- ✅ Shorms components work with both Tailwind v3 and v4
- ✅ Parent project controls Tailwind version
- ✅ No CSS bundling in Shorms library

---

## Phase 3: Schema Versioning & Backward Compatibility

**Objective:** Ensure future changes don't break existing forms.

### Tasks

1. **Add Version Field to Schema**
   ```typescript
   // types/schema.ts
   export interface ShormsSchema {
     version: string          // "1.0", "1.1", etc.
     metadata?: {
       createdAt?: string
       createdBy?: string
       description?: string
     }
     pages: FormPage[]
   }
   ```

2. **Create Version Constants**
   ```typescript
   // lib/versioning/constants.ts
   export const SCHEMA_VERSION = "1.0"
   export const SUPPORTED_VERSIONS = ["1.0"]
   ```

3. **Create Migration System**
   ```typescript
   // lib/versioning/migrate.ts
   export function migrateSchema(
     schema: any,
     fromVersion: string,
     toVersion: string
   ): ShormsSchema {
     // Migration logic for future versions
   }
   ```

4. **Update Schema Generation**
   - All new schemas must include version field
   - Update export to include version

5. **Add Validation with Forward Compatibility**
   ```typescript
   // lib/versioning/validate.ts
   export const SUPPORTED_FIELD_TYPES = [
     'INPUT', 'TEXTAREA', 'EMAIL', 'NUMBER_INPUT',
     'SELECT', 'RADIO_GROUP', 'CHECKBOX', 'SWITCH',
     'COMBOBOX', 'SLIDER', 'DATE', 'FILE_UPLOAD'
   ]

   export function validateSchema(schema: any): {
     valid: boolean
     errors: string[]
     warnings: string[]
     unknownFieldTypes: string[]  // For forward compatibility
   } {
     const unknownTypes = new Set<string>()

     schema.pages?.forEach(page => {
       page.fields?.forEach(field => {
         if (!SUPPORTED_FIELD_TYPES.includes(field.type)) {
           unknownTypes.add(field.type)
         }
       })
     })

     return {
       valid: schema.version && schema.pages,
       errors: [],
       warnings: [],
       unknownFieldTypes: Array.from(unknownTypes)
     }
   }
   ```

6. **Add Field Type Registry** (for forward compatibility)
   ```typescript
   // lib/versioning/field-registry.ts
   export function isSupportedFieldType(type: string, version?: string): boolean {
     return SUPPORTED_FIELD_TYPES.includes(type)
   }

   export function getUnsupportedFields(schema: ShormsSchema): string[] {
     // Returns list of unsupported field types in schema
   }
   ```

**Acceptance Criteria:**
- ✅ All new forms have version field
- ✅ Old forms (without version) default to "1.0"
- ✅ Validation catches unsupported field types
- ✅ Migration system structure in place

---

## Phase 4: Monorepo Setup

**Objective:** Split code into packages for better organization.

### Tasks

1. **Initialize Workspace**
   ```bash
   npm install -g pnpm  # If not using npm workspaces
   ```

2. **Create Workspace Configuration**
   ```yaml
   # pnpm-workspace.yaml
   packages:
     - 'packages/*'
   ```

3. **Create Package Structure**
   ```bash
   mkdir -p packages/core/src packages/react/src packages/builder-app
   ```

4. **Setup @shorms/core Package**
   - Move types to `packages/core/src/types/`
   - Move validation logic to `packages/core/src/validation/`
   - Move versioning to `packages/core/src/versioning/`
   - Create `packages/core/package.json`:
     ```json
     {
       "name": "@shorms/core",
       "version": "1.0.0",
       "main": "./dist/index.js",
       "types": "./dist/index.d.ts",
       "exports": {
         ".": {
           "import": "./dist/index.js",
           "types": "./dist/index.d.ts"
         }
       }
     }
     ```

5. **Setup @shorms/react Package**
   - Move components to `packages/react/src/`
   - Create three main components:
     - `Builder/` (existing FormEditor + dependencies)
     - `Renderer/` (existing FormRunner)
     - `Viewer/` (new read-only component)
   - Create `packages/react/package.json`:
     ```json
     {
       "name": "@shorms/react",
       "version": "1.0.0",
       "main": "./dist/index.js",
       "types": "./dist/index.d.ts",
       "peerDependencies": {
         "react": "^18.0.0 || ^19.0.0",
         "react-dom": "^18.0.0 || ^19.0.0",
         "zod": "^3.0.0 || ^4.0.0"
       },
       "dependencies": {
         "@shorms/core": "workspace:*"
       }
     }
     ```

6. **Setup Builder App**
   - Keep existing app structure in `packages/builder-app/`
   - Update to import from `@shorms/react`:
     ```typescript
     import { Builder, Renderer } from '@shorms/react'
     ```

7. **Configure Build System**
   - Add `tsup` or `rollup` for building packages
   - Create build scripts in root `package.json`

**Acceptance Criteria:**
- ✅ Workspace installs correctly (`pnpm install`)
- ✅ Packages can reference each other
- ✅ Builder app uses library packages
- ✅ Build produces distributable files

---

## Phase 5: Component Refactoring

**Objective:** Create the three main export components.

### 5.1 Builder Component

**Source:** Current `FormEditor` + surrounding UI

**Tasks:**
1. **Extract as Standalone Component**
   ```typescript
   // packages/react/src/Builder/index.tsx
   export interface BuilderProps {
     onSave: (schema: ShormsSchema) => void | Promise<void>
     defaultSchema?: ShormsSchema
     allowedFieldTypes?: FieldType[]  // Optional: restrict field types
   }

   export function Builder({ onSave, defaultSchema }: BuilderProps) {
     // Existing FormEditor logic
   }
   ```

2. **Include Dependencies**
   - Sidebar (field palette)
   - Form canvas (drag-drop area)
   - Field editor (properties panel)
   - Page tabs

3. **Make Self-Contained**
   - Include all necessary UI components
   - No dependencies on app-specific code

**Acceptance Criteria:**
- ✅ Can be used without app wrapper
- ✅ Returns valid Shorms schema with version field
- ✅ All features work (pages, fields, validation)

### 5.2 Renderer Component

**Source:** Current `FormRunner`

**Tasks:**
1. **Rename and Export with Full Feature Set**
   ```typescript
   // packages/react/src/Renderer/index.tsx
   export interface RendererProps {
     // Core props
     schema: ShormsSchema
     onSubmit: (values: Record<string, any>) => void | Promise<void>
     initialValues?: Record<string, any>

     // Draft saving (Decision #5)
     onSaveDraft?: (values: Record<string, any>) => void | Promise<void>
     showDraftButton?: boolean

     // State persistence (Decision #4)
     persistTo?: 'memory' | 'localStorage' | 'sessionStorage'
     persistKey?: string  // Required if persistTo is set
     autoSaveInterval?: number  // Seconds, default: 30

     // File uploads (Decision #7)
     onFileUpload?: (file: File, fieldName: string) => Promise<string>

     // Completion callbacks (Decision #6)
     onSuccess?: (result: any) => void
     onError?: (error: Error) => void

     // Change tracking
     onChange?: (values: Record<string, any>) => void
   }

   export function Renderer({ schema, onSubmit, ...props }: RendererProps) {
     // Existing FormRunner logic + new features
   }
   ```

2. **Implement State Persistence**
   - Auto-save to localStorage/sessionStorage if configured
   - Restore on mount
   - Clear on successful submit

3. **Implement Draft Saving**
   - Show "Save Draft" button if `onSaveDraft` provided
   - Draft validates current page only
   - Submit validates entire form

4. **Implement File Upload Handling**
   - Call `onFileUpload` immediately when file selected
   - Show progress indicator
   - Store returned URL (not File object)
   - Handle upload errors gracefully

5. **Implement Forward Compatibility** (Decision #3)
   - Check field types against supported list
   - Skip unknown types with console warning
   - Show warning banner if unknown types detected
   - Remove unknown fields from validation

**Acceptance Criteria:**
- ✅ Renders multi-page forms correctly
- ✅ Validates using schema rules
- ✅ Calls onSubmit with form values
- ✅ Handles all known field types
- ✅ Gracefully skips unknown field types
- ✅ Draft saving works (if enabled)
- ✅ State persistence works (if enabled)
- ✅ File uploads work via callback
- ✅ Success/error callbacks fire correctly

### 5.3 Viewer Component (NEW)

**Purpose:** Display submitted form data in read-only mode

**Tasks:**
1. **Create New Component**
   ```typescript
   // packages/react/src/Viewer/index.tsx
   export interface ViewerProps {
     schema: ShormsSchema
     values: Record<string, any>
     mode?: 'compact' | 'detailed'  // Display format
     showEmptyFields?: boolean  // Show fields with no value
   }

   export function Viewer({ schema, values, mode = 'detailed' }: ViewerProps) {
     // Render form fields with values (non-editable)
     // Show field labels and submitted values
   }
   ```

2. **Implementation**
   - Loop through schema pages and fields
   - Display label + value for each field
   - Format values appropriately:
     - Dates: Human-readable format
     - Files: Show filename + download link
     - Booleans: Yes/No or checkmark
     - Arrays (multi-select): Comma-separated list
   - Support multi-page display with tabs
   - Handle missing/empty values gracefully
   - Apply forward compatibility (skip unknown field types)

**Acceptance Criteria:**
- ✅ Displays all field types correctly
- ✅ Shows labels and values clearly
- ✅ Handles missing/empty values gracefully
- ✅ Multi-page forms display with page navigation
- ✅ File URLs render as clickable links
- ✅ Responsive layout
- ✅ Skips unknown field types gracefully

---

## Phase 6: Documentation

**Objective:** Enable external projects to use Shorms.

### Tasks

1. **Create Installation Guide**
   ```markdown
   # INSTALLATION.md
   ## Install from Git
   npm install github:jikkuatwork/shorms

   ## Peer Dependencies
   - react ^18 || ^19
   - react-dom ^18 || ^19
   - zod ^3 || ^4
   ```

2. **Create API Documentation**
   ```markdown
   # API.md
   ## Builder
   ### Props
   - onSave: (schema) => void
   - defaultSchema?: ShormsSchema

   ## Renderer
   ### Props
   - schema: ShormsSchema
   - onSubmit: (values) => void
   - [additional props documented]

   ## Viewer
   ### Props
   - schema: ShormsSchema
   - values: Record<string, any>

   ### Examples
   [code examples for each component]
   ```

3. **Update LLM_INTEGRATION.md**
   - Update for new package structure
   - Update import paths
   - Add troubleshooting for dependency conflicts

4. **Create CHANGELOG.md Entry**
   ```markdown
   ## [2.0.0] - Library Refactor
   ### Breaking Changes
   - Restructured as monorepo
   - Upgraded to Zod v4
   - Upgraded to React 19
   ```

**Acceptance Criteria:**
- ✅ Clear installation instructions
- ✅ All three components documented
- ✅ TypeScript types documented
- ✅ Examples provided

---

## Phase 7: Testing & Validation

**Objective:** Ensure library works in real integration.

### Tasks

1. **Test in Onesource** (Real Integration)
   ```bash
   cd onesource
   npm install github:jikkuatwork/shorms#library-refactor
   ```

2. **Create Test Integration**
   - Simple page that imports and uses all three components
   - Verify no dependency conflicts
   - Verify CSS works correctly

3. **Performance Testing**
   - Check bundle size
   - Ensure no unnecessary bloat

4. **Browser Testing**
   - Test in Chrome, Firefox, Safari
   - Verify mobile responsiveness

**Acceptance Criteria:**
- ✅ Installs without errors in Onesource
- ✅ All three components render correctly
- ✅ No console errors/warnings
- ✅ Form submission works end-to-end

---

## Execution Order

```
1. Phase 1: Setup Tests (1 day)
   ↓
2. Phase 2.1: Upgrade Zod v4 (1 day)
   ↓
3. Phase 2.2: Upgrade React 19 (1 day)
   ↓
4. Phase 3: Add Schema Versioning (0.5 days)
   ↓
5. Phase 4: Setup Monorepo (1 day)
   ↓
6. Phase 5: Refactor Components (1 day)
   ↓
7. Phase 6: Documentation (0.5 days)
   ↓
8. Phase 7: Testing & Validation (1 day)

Total: ~6 days
```

---

## Rollback Plan

If critical issues arise:
1. **Git branch strategy:** Work in `library-refactor` branch
2. **Keep main stable:** Don't merge until fully tested
3. **Tag milestones:** Tag after each phase completion
4. **Document breaking changes:** Clear CHANGELOG

---

## Success Metrics

**Must Have:**
- ✅ Can install as `npm install github:jikkuatwork/shorms`
- ✅ All three components export and work
- ✅ No dependency conflicts with Onesource
- ✅ All existing features still work in builder app
- ✅ Example forms validate and render

**Nice to Have:**
- ✅ Bundle size < 500KB
- ✅ TypeScript autocomplete works
- ✅ Zero console warnings

---

## Post-Refactor Tasks

**Not part of this plan, but recommended:**
1. Publish to npm (for easier installation)
2. Add Storybook for component documentation
3. Create video tutorials
4. Build community examples
5. Set up CI/CD for automated testing

---

## Notes for Fresh Session

**Context Files to Read:**
1. This plan (02_library-refactor.md)
2. koder/NEXT_SESSION.md - Current state
3. koder/rough.md - Integration requirements
4. package.json - Current dependencies
5. LLM_INTEGRATION.md - Current integration guide

**Starting Point:**
Begin with Phase 1 (Testing Infrastructure). Do not skip directly to refactoring without tests.

**Key Principle:**
Each phase must pass its acceptance criteria before proceeding to the next phase. If tests fail after a change, fix before continuing.
