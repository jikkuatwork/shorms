# Plan: Component Extraction with Clean API
**Goal:** Extract Renderer, Builder, and Viewer components with the API we designed, use them in the current app, and keep iterating.

**Status:** Not Started
**Created:** 2025-12-15
**API Reference:** `koder/API_DESIGN.md`

---

## Strategy

**Phase 1: Extract as Files (Now)**
- Extract components into `components/shorms/` namespace
- Implement API from design document
- Replace current implementation in the app
- Continue refining in-place (fast iteration)

**Phase 2: Package for Distribution (Later)**
- Once components are stable
- Add build configuration
- Make installable via git URL
- Write installation docs

---

## Current State

### What Exists
```
components/
├── form-editor.tsx          (Builder - needs extraction)
├── form-runner.tsx          (Renderer - needs extraction)
├── field.tsx
├── field-library-sidebar.tsx
├── form-context-sidebar.tsx
└── [other app-specific components]

lib/
├── form-schema.ts           (utilities - already library code)
├── versioning/              (schema versioning - done)
└── [other utilities]

types/
├── field.ts                 (types - already library code)
└── [other types]

index.ts                     (partial exports - types & utils only)
```

### What's Needed
```
components/
├── shorms/                  (NEW - library components namespace)
│   ├── renderer/
│   │   ├── renderer.tsx
│   │   ├── use-form-state.ts
│   │   ├── use-validation.ts
│   │   ├── use-suggestions.ts
│   │   └── types.ts
│   ├── builder/
│   │   ├── builder.tsx
│   │   └── types.ts
│   └── viewer/
│       ├── viewer.tsx
│       └── types.ts
├── form-editor.tsx          (KEEP temporarily, migrate to shorms/builder)
├── form-runner.tsx          (KEEP temporarily, migrate to shorms/renderer)
└── [app-specific components stay]

index.ts                     (UPDATE - export Renderer, Builder, Viewer)
```

---

## Phase 1: Renderer Extraction (Priority 1)

**Goal:** Extract FormRunner as `components/shorms/renderer/` with clean API

### Step 1.1: Create Renderer Structure
```
components/shorms/renderer/
├── renderer.tsx              (main component)
├── use-form-state.ts         (state management hook)
├── use-validation.ts         (validation logic)
├── use-suggestions.ts        (suggestion logic)
├── use-background-job.ts     (job polling)
└── types.ts                  (local types)
```

### Step 1.2: Implement Core API
Implement props from API design:
- `schema: ShormsSchema`
- `onSubmit: (values) => void`
- `formStateRef?: Ref<FormStateAPI>`
- `features?: { stateManagement, autoSave, backgroundJobs }`

### Step 1.3: Implement State Management
Create `use-form-state.ts` hook:
- Field values tracking
- Dirty state tracking
- History for undo/redo
- Suggestion state (dual values)
- Form metadata

### Step 1.4: Implement Validation
Create `use-validation.ts` hook:
- Sync validation
- Async validation with caching
- Cross-field validation
- Field dependencies (dependsOn)

### Step 1.5: Implement Suggestions
Create `use-suggestions.ts` hook:
- Single field suggestions
- Bulk suggestions
- Anticipatory loading (affectedFields)
- Dual value system
- Suggestion expiry (ttl)

### Step 1.6: Implement Background Jobs
Create `use-background-job.ts` hook:
- Job polling
- Progress tracking
- Partial results
- Job cancellation

### Step 1.7: Use in App
Replace FormRunner with new Renderer:
```typescript
// app/page.tsx
import { Renderer } from '@/components/shorms/renderer'

// Old:
// <FormRunner schema={schema} />

// New:
<Renderer
  schema={schema}
  onSubmit={handleSubmit}
  formStateRef={formStateRef}
  features={{
    stateManagement: true,
    autoSave: { enabled: true, interval: 30 }
  }}
/>
```

### Step 1.8: Export from index.ts
```typescript
// index.ts
export { Renderer } from './components/shorms/renderer'
export type { FormStateAPI, RendererProps } from './components/shorms/renderer/types'
```

---

## Phase 2: Builder Extraction (Priority 2)

**Goal:** Extract FormEditor as `components/shorms/builder/`

### Step 2.1: Create Builder Structure
```
components/shorms/builder/
├── builder.tsx               (main component)
├── use-builder-state.ts      (form building state)
└── types.ts                  (local types)
```

### Step 2.2: Implement Core API
Implement props from API design:
- `onSave: (schema: ShormsSchema) => void`
- `defaultSchema?: ShormsSchema`
- `allowedFieldTypes?: string[]`

### Step 2.3: Use in App
Replace FormEditor with new Builder:
```typescript
// app/page.tsx
import { Builder } from '@/components/shorms/builder'

<Builder
  onSave={handleSave}
  defaultSchema={existingSchema}
/>
```

### Step 2.4: Export from index.ts
```typescript
// index.ts
export { Builder } from './components/shorms/builder'
export type { BuilderProps } from './components/shorms/builder/types'
```

---

## Phase 3: Viewer Extraction (Priority 3)

**Goal:** Create new `components/shorms/viewer/` component

### Step 3.1: Create Viewer Structure
```
components/shorms/viewer/
├── viewer.tsx                (main component)
└── types.ts                  (local types)
```

### Step 3.2: Implement Core API
Implement props from API design:
- `schema: ShormsSchema`
- `values: FormValues`
- `mode?: 'detailed' | 'compact' | 'summary'`
- `showEmptyFields?: boolean`

### Step 3.3: Use in App
Add Viewer to app (new feature):
```typescript
// app/view/[id]/page.tsx
import { Viewer } from '@/components/shorms/viewer'

<Viewer
  schema={schema}
  values={submissionData}
  mode="detailed"
/>
```

### Step 3.4: Export from index.ts
```typescript
// index.ts
export { Viewer } from './components/shorms/viewer'
export type { ViewerProps } from './components/shorms/viewer/types'
```

---

## Implementation Order

### Week 1: Renderer (MVP)
1. Create structure
2. Implement basic rendering (no state management yet)
3. Implement validation (sync + async)
4. Test in current app

### Week 2: Renderer (State Management)
5. Implement form state management
6. Implement undo/redo
7. Implement dirty tracking + draft saving
8. Test in current app

### Week 3: Renderer (Suggestions)
9. Implement suggestion system
10. Implement dual values
11. Implement bulk suggestions + jobs
12. Implement anticipatory loading
13. Test in current app

### Week 4: Builder + Viewer
14. Extract Builder from FormEditor
15. Create Viewer component
16. Update app to use all three
17. Final testing

---

## Benefits of This Approach

### ✅ Fast Iteration
- Components are just files in the repo
- Change and test immediately
- No build/publish cycle

### ✅ Real-World Testing
- Used in actual app from day one
- Find issues early
- Refine based on usage

### ✅ Clean API
- Implement the designed API
- No legacy constraints
- Proper separation of concerns

### ✅ Gradual Migration
- Old components stay temporarily
- Migrate page by page
- Low risk

### ✅ Easy to Package Later
- Components in `components/shorms/` namespace
- Clear boundary
- Just add build config when ready

---

## File Organization

### Library Code (Export These)
```
components/shorms/          → Library components
lib/                        → Library utilities
types/                      → Library types
index.ts                    → Library exports
```

### App Code (Don't Export)
```
app/                        → Next.js app
components/[other]          → App-specific components
stores/                     → App-specific state
```

---

## Acceptance Criteria

### Renderer Complete When:
- ✅ Implements all props from API design
- ✅ State management works (values, dirty, history)
- ✅ Validation works (sync, async, cross-field, caching)
- ✅ Suggestions work (single, bulk, dual values)
- ✅ Background jobs work (polling, cancellation)
- ✅ Used in app/page.tsx
- ✅ Old FormRunner can be deleted

### Builder Complete When:
- ✅ Implements all props from API design
- ✅ Can create/edit schemas
- ✅ Used in app
- ✅ Old FormEditor can be deleted

### Viewer Complete When:
- ✅ Implements all props from API design
- ✅ Displays submissions correctly
- ✅ Used in app for viewing submissions

---

## Future: Packaging (Separate Plan)

Once components are stable:
1. Add build configuration (tsup or rollup)
2. Configure package.json for git installation
3. Write installation docs
4. Test installation in separate project
5. Document peer dependencies

**Not doing now** - focus on extraction and refinement first.

---

**Status:** Ready to start
**First Task:** Create `components/shorms/renderer/` structure
**API Reference:** See `koder/API_DESIGN.md` for complete API specification
