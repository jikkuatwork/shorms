# Shorms API Design - Final v2
**Version:** 3.1.0
**Date:** 2025-12-15
**Philosophy:** Minimal API surface, maximum capability through state management

---

## Design Principles

1. **State-First Architecture** - Form state is managed by the library, exposed via API
2. **Validation ≠ Suggestion** - Different semantics, separate APIs
3. **Headless** - Pure logic, no UI dependencies
4. **Minimal but Complete** - Small API surface, powerful capabilities
5. **Extensible** - Custom field types, middleware patterns
6. **No Gotchas** - Clear contracts, predictable behavior

---

## Core Schema

### Form Field Definition

```typescript
interface FormField {
  id: string
  type: string                       // Extensible: any string is valid
  name: string                       // Key in form values
  label: string
  description?: string
  required?: boolean
  defaultValue?: any

  // Conditional rendering
  showIf?: ConditionalLogic | ((values: FormValues) => boolean)

  // Field dependencies (NEW)
  dependsOn?: string[]  // When these fields change, revalidate/re-suggest this field

  // Validation (checks correctness)
  validation?: FieldValidation

  // Suggestions (offers improvements)
  suggest?: FieldSuggestion

  // Field-type specific config
  config?: Record<string, any>

  // User metadata
  metadata?: Record<string, any>
}

type ConditionalLogic = {
  field: string
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan'
  value: any
} | {
  and: ConditionalLogic[]
} | {
  or: ConditionalLogic[]
}
```

---

## Validation API

**Purpose:** Check if user input is correct/valid

```typescript
interface FieldValidation {
  // Built-in validators
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: string | RegExp
  email?: boolean
  url?: boolean
  phone?: boolean | { defaultCountry?: string }

  // Custom sync validation
  validate?: (value: any, values: FormValues) => true | string

  // Async validation (API calls, external checks)
  validateAsync?: (
    value: any,
    context: ValidationContext
  ) => Promise<ValidationResult | true | string>

  // Debounce for async validation
  debounce?: number  // milliseconds, default: 500

  // Cache validation results (NEW)
  cacheResults?: boolean  // default: true (avoid redundant API calls)
  cacheTtl?: number       // seconds, default: 300 (5 minutes)
}

interface ValidationResult {
  valid: boolean
  message?: string
  severity?: 'error' | 'warning' | 'info'  // default: 'error'
  blocking?: boolean  // default: true if severity === 'error'

  // Auto-fix for common corrections (NEW - renamed from quickFix)
  autoFix?: any  // e.g., "stripe.com" → "https://stripe.com"
}

interface ValidationContext {
  fieldId: string
  allValues: FormValues
  schema: ShormsSchema
}
```

---

## Suggestion API

**Purpose:** Offer improvements or alternatives to user input

```typescript
interface FieldSuggestion {
  // Enable dual value system
  preserveBothValues?: boolean  // default: true

  // Minimum confidence to show (0-1)
  minConfidence?: number  // default: 0.7

  // Suggestion expiry (NEW)
  ttl?: number  // time-to-live in seconds, default: 3600 (1 hour)
}

// Renderer callback
interface RendererProps {
  // Single field suggestion
  onSuggest?: (
    fieldId: string,
    currentValue: any,
    context: FormValues
  ) => Promise<SuggestionResult>

  // Bulk suggestions (multiple files → multiple fields)
  onBulkSuggest?: (
    files: File[],
    schema: ShormsSchema,
    currentValues: FormValues
  ) => Promise<BulkSuggestResponse>  // Consistent return type
}

interface SuggestionResult {
  suggestedValue: any
  confidence?: number  // 0-1
  reason?: string      // explanation

  // Source tracking (NEW)
  source?: {
    type: 'document-analysis' | 'field-inference' | 'external-api' | 'ai-model'
    documentName?: string    // "pitch-deck.pdf"
    pageNumber?: number
    modelName?: string       // "claude-opus-4"
    extractedFrom?: string   // quote or snippet
  }

  metadata?: Record<string, any>
}

// Consistent return type (FIXED - no more ambiguous union)
interface BulkSuggestResponse {
  // For immediate results
  immediate?: {
    suggestions: Record<string, SuggestionResult>
  }

  // For long-running jobs (NEW: includes anticipatory loading)
  job?: {
    jobId: string
    affectedFields: string[]        // NEW: which fields will receive suggestions
    estimatedDuration?: number      // seconds
    estimatedFieldCount?: number    // how many fields we expect to fill
  }
}
```

**Example:**
```typescript
// Immediate results
return {
  immediate: {
    suggestions: {
      'company_name': { suggestedValue: 'Acme Corp', confidence: 0.95 }
    }
  }
}

// Long-running job with anticipatory loading
return {
  job: {
    jobId: 'job_abc123',
    affectedFields: ['company_name', 'founded_year', 'team_size', 'description'],
    estimatedDuration: 1200,  // 20 minutes
    estimatedFieldCount: 8
  }
}
```

---

## State Management API

**Core Insight:** Form state (values, suggestions, history) is managed by the library and exposed via API.

```typescript
interface RendererProps {
  // ... other props

  // Access form state
  formStateRef?: React.Ref<FormStateAPI>

  // Feature configuration (SIMPLIFIED - grouped related features)
  features?: {
    stateManagement?: boolean       // default: true (includes undo, dirty tracking)
    autoSave?: {
      enabled: boolean
      interval: number              // seconds, default: 30
    }
    backgroundJobs?: {
      blocking: boolean             // block form while processing
      pollInterval: number          // milliseconds, default: 2000
    }
  }

  maxHistorySize?: number           // default: 50

  // State change callbacks
  onDirtyStateChange?: (isDirty: boolean, dirtyFields: string[]) => void
  onUndo?: (entry: HistoryEntry) => void
  onRedo?: (entry: HistoryEntry) => void
}

interface FormStateAPI {
  // FIELD VALUES
  values: Record<string, any>  // current active values (user or suggested)
  getValue(fieldId: string): any
  setValue(fieldId: string, value: any): void

  // DIRTY STATE
  isDirty: boolean             // has any field changed?
  dirtyFields: Set<string>     // which fields changed?
  hasUnsavedChanges: boolean   // changed since last draft save?

  // VALIDATION STATE
  isValid: boolean             // all validations passed?
  errors: Record<string, string>  // fieldId → error message
  getFieldValidation(fieldId: string): ValidationResult | null

  // SUGGESTION STATE
  getSuggestionState(fieldId: string): FieldSuggestionState | null
  getPendingSuggestions(): string[]  // field IDs with unreviewed suggestions
  getSuggestionCount(): number
  getPageBadges(pageId: string): PageBadges

  // NEW: Anticipatory loading
  getExpectingFields(): string[]  // fields expecting suggestions
  getLoadingFields(): string[]    // fields currently loading

  // SUGGESTION ACTIONS
  acceptSuggestion(fieldId: string): void
  dismissSuggestion(fieldId: string): void
  toggleValue(fieldId: string): void  // toggle between user/suggested
  markAsReviewed(fieldId: string): void

  // NEW: Reset to original suggestion (if user edited it)
  resetToOriginalSuggestion(fieldId: string): void

  // BULK SUGGESTION ACTIONS
  acceptAllSuggestions(): void
  acceptAllOnPage(pageId: string): void
  dismissAllOnPage(pageId: string): void

  // HISTORY (undo/redo)
  canUndo: boolean
  canRedo: boolean
  undo(): void
  redo(): void
  clearHistory(): void

  // DRAFT STATE
  lastSavedAt?: number
  isDraftSaved: boolean

  // BACKGROUND JOBS (NEW)
  activeJobId?: string
  cancelJob(jobId: string): Promise<void>

  // FORM METADATA (NEW)
  metadata: {
    startedAt: number
    submittedAt?: number
    duration?: number           // milliseconds
    aiAssistedFields: string[]  // which fields used AI
    userEditedFields: string[]  // which fields user manually filled
  }

  // UTILITY METHODS
  reset(): void                // reset to initial values
  markClean(): void            // mark as saved (after draft save)
  getChanges(): FieldChange[]  // get all changes since initial/last save
}

// Field-level suggestion state (SIMPLIFIED - status enum instead of many booleans)
interface FieldSuggestionState {
  // Dual values
  userValue: any
  suggestedValue: any
  originalSuggestedValue: any  // NEW: preserve original even if user edits suggested
  activeValue: 'user' | 'suggested'
  suggestedValueModified: boolean  // NEW: track if user edited the suggestion

  // Status (SIMPLIFIED - single enum instead of multiple booleans)
  status: 'none' | 'expecting' | 'loading' | 'available' | 'reviewing' | 'accepted' | 'dismissed'

  // Metadata
  confidence: number
  reason: string
  timestamp: number
  expiresAt?: number  // NEW: suggestion expiry

  // Source tracking (NEW)
  source?: {
    type: string
    documentName?: string
    pageNumber?: number
  }

  // Error state
  error?: string
}

// Page-level badges (derived from field state)
interface PageBadges {
  errors: number      // blocking validation errors
  warnings: number    // non-blocking validation warnings
  suggestions: number // pending suggestions (not accepted/dismissed)
}

// History entry
interface HistoryEntry {
  timestamp: number
  type: 'field-edit' | 'accept-suggestion' | 'dismiss-suggestion' | 'toggle-value' | 'bulk-accept'
  fieldIds: string[]
  description: string  // human-readable: "Changed company name"
}

// Field change record
interface FieldChange {
  fieldId: string
  from: any
  to: any
  timestamp: number
  source: 'user' | 'suggested' | 'system'
}
```

---

## Draft Saving API

```typescript
interface RendererProps {
  // ... other props

  // Draft saving
  onSaveDraft?: (
    values: FormValues,
    changes: FieldChange[]
  ) => Promise<void>

  // Auto-save configuration (simplified)
  features?: {
    autoSave?: {
      enabled: boolean
      interval: number  // seconds
    }
  }

  // Load from draft
  initialValues?: FormValues
  initialJobId?: string  // resume background job
}
```

---

## Background Jobs API

```typescript
interface RendererProps {
  // ... other props

  // Poll for job progress
  onJobProgress?: (jobId: string) => Promise<BackgroundJob>

  // Job cancellation (NEW)
  onJobCancel?: (jobId: string) => Promise<void>

  // Resume previous job
  initialJobId?: string

  // Configuration
  features?: {
    backgroundJobs?: {
      blocking: boolean     // block form while job runs
      pollInterval: number  // milliseconds
    }
  }
}

interface BackgroundJob {
  jobId: string
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'partial' | 'cancelled'
  progress: number  // 0-1

  // Partial results (filled as job progresses)
  partialResults: Partial<FormValues>
  fieldsCompleted: string[]  // field IDs filled so far
  fieldsPending: string[]    // field IDs still processing

  // NEW: Updates since last poll (avoid missing intermediate states)
  newUpdates?: Array<{
    fieldId: string
    value: any
    confidence: number
    timestamp: number
  }>

  // Error handling
  errors?: Record<string, string>  // fieldId → error

  // Metadata
  startedAt: number
  estimatedTimeRemaining?: number  // seconds
  completedAt?: number
}
```

---

## Field Dependencies (NEW)

**Handle field interdependencies**

```typescript
interface FormField {
  // ... other props

  // NEW: Field dependencies
  dependsOn?: string[]  // When these fields change, revalidate/re-suggest this field
}

// Example: Phone validation depends on country
{
  type: 'INPUT',
  name: 'phone',
  label: 'Phone Number',
  dependsOn: ['country'],  // When country changes, revalidate phone
  validation: {
    validateAsync: async (phone, context) => {
      return validatePhone(phone, context.country)
    }
  }
}

// Example: Description suggestion depends on company name
{
  type: 'TEXTAREA',
  name: 'description',
  label: 'Product Description',
  dependsOn: ['company_name'],  // When company name changes, regenerate suggestion
  suggest: {
    preserveBothValues: true
  }
}

// Library behavior:
// - When dependency changes:
//   1. Clear cached validation
//   2. Revalidate if field has value
//   3. Clear suggestion if exists
//   4. Optionally re-suggest
```

---

## Cross-Field Validation (NEW)

**Validate multiple fields together**

```typescript
interface ShormsSchema {
  version: string
  pages: FormPage[]

  // NEW: Schema-level validation for cross-field rules
  validation?: {
    crossField?: Array<{
      fields: string[]  // fields involved
      validate: (values: Pick<FormValues, string>) => ValidationResult | true | string
    }>
  }
}

// Example: Password confirmation
{
  validation: {
    crossField: [
      {
        fields: ['password', 'confirm_password'],
        validate: (values) => {
          if (values.password !== values.confirm_password) {
            return {
              valid: false,
              message: 'Passwords must match',
              severity: 'error',
              blocking: true
            }
          }
          return true
        }
      }
    ]
  }
}

// Example: Date range
{
  validation: {
    crossField: [
      {
        fields: ['start_date', 'end_date'],
        validate: (values) => {
          if (new Date(values.end_date) < new Date(values.start_date)) {
            return {
              valid: false,
              message: 'End date must be after start date',
              severity: 'error',
              blocking: true
            }
          }
          return true
        }
      }
    ]
  }
}
```

---

## Complete Example: Startup Application

```typescript
const startupSchema: ShormsSchema = {
  version: '3.1',
  pages: [
    {
      id: 'company',
      title: 'Company Information',
      fields: [
        {
          type: 'BULK_FILE_UPLOAD',
          name: 'company_materials',
          label: 'Upload Company Materials',
          description: 'Pitch deck, docs, videos - we\'ll analyze everything',
          config: {
            accept: ['pdf', 'pptx', 'docx', 'mp4', 'url'],
            multiple: true,
            maxFiles: 20
          }
        },
        {
          type: 'INPUT',
          name: 'company_name',
          label: 'Company Name',
          required: true,
          validation: {
            minLength: 2,
            validateAsync: async (name) => {
              const available = await checkAvailability(name)
              return available || 'Name already registered'
            },
            cacheResults: true,
            cacheTtl: 600  // cache for 10 minutes
          },
          suggest: {
            preserveBothValues: true,
            minConfidence: 0.8,
            ttl: 3600  // suggestion valid for 1 hour
          }
        },
        {
          type: 'FILE_UPLOAD',
          name: 'company_logo',
          label: 'Company Logo',
          validation: {
            validateAsync: async (fileUrl) => {
              const img = await loadImage(fileUrl)

              if (img.width < 200) {
                return {
                  valid: false,
                  severity: 'error',
                  blocking: true,
                  message: 'Logo must be at least 200x200px'
                }
              }

              if (img.aspectRatio !== 1) {
                return {
                  valid: true,
                  severity: 'warning',
                  blocking: false,
                  message: 'Logo is not square (recommended)',
                  autoFix: await cropToSquare(fileUrl)  // offer auto-fix
                }
              }

              return true
            }
          },
          suggest: {
            preserveBothValues: true
          }
        },
        {
          type: 'TEXTAREA',
          name: 'product_description',
          label: 'Product Description',
          required: true,
          dependsOn: ['company_name'],  // regenerate when company name changes
          validation: {
            minLength: 50,
            maxLength: 500
          },
          suggest: {
            preserveBothValues: true,
            minConfidence: 0.7,
            ttl: 7200  // 2 hours
          }
        }
      ]
    }
  ],

  // Cross-field validation
  validation: {
    crossField: [
      {
        fields: ['founded_year', 'funding_date'],
        validate: (values) => {
          if (values.funding_date && values.founded_year) {
            const fundingYear = new Date(values.funding_date).getFullYear()
            if (fundingYear < parseInt(values.founded_year)) {
              return {
                valid: false,
                message: 'Funding date cannot be before company founding',
                severity: 'error'
              }
            }
          }
          return true
        }
      }
    ]
  }
}

// Usage
function StartupApplicationForm() {
  const formStateRef = useRef<FormStateAPI>(null)

  return (
    <Renderer
      schema={startupSchema}
      onSubmit={handleSubmit}
      formStateRef={formStateRef}

      // Bulk analysis with anticipatory loading
      onBulkSuggest={async (files, schema, currentValues) => {
        const analysis = await api.startDeepResearch(files, schema)

        return {
          job: {
            jobId: analysis.jobId,
            affectedFields: analysis.fieldIds,  // UI shows loading on these fields
            estimatedDuration: analysis.eta,
            estimatedFieldCount: analysis.expectedCount
          }
        }
      }}

      // Poll for progress
      onJobProgress={async (jobId) => {
        return await api.getJobStatus(jobId)
      }}

      // Job cancellation
      onJobCancel={async (jobId) => {
        await api.cancelJob(jobId)
      }}

      // Single field suggestions with source tracking
      onSuggest={async (fieldId, value, context) => {
        if (fieldId === 'company_logo') {
          const cropped = await ai.cropToSquare(value)
          return {
            suggestedValue: cropped.url,
            confidence: 0.95,
            reason: 'Cropped to 1:1 ratio for optimal display',
            source: {
              type: 'ai-model',
              modelName: 'vision-ai-v2'
            }
          }
        }

        if (fieldId === 'product_description') {
          const improved = await ai.improveText(value, {
            companyName: context.company_name
          })
          return {
            suggestedValue: improved.text,
            confidence: improved.confidence,
            reason: 'Enhanced clarity and professional tone',
            source: {
              type: 'ai-model',
              modelName: 'claude-opus-4',
              extractedFrom: improved.changesExplanation
            }
          }
        }
      }}

      // Validation with caching
      onValidateAsync={async (value, fieldId, context) => {
        if (fieldId === 'company_name') {
          const available = await checkAvailability(value)
          return available || 'Name already taken'
        }
      }}

      // Features configuration
      features={{
        stateManagement: true,
        autoSave: {
          enabled: true,
          interval: 30
        },
        backgroundJobs: {
          blocking: true,
          pollInterval: 2000
        }
      }}

      // Draft saving
      onSaveDraft={async (values, changes) => {
        await api.saveDraft('startup-app', {
          values,
          changes,
          metadata: formStateRef.current?.metadata
        })
      }}

      // State callbacks
      onDirtyStateChange={(isDirty) => {
        if (isDirty) {
          window.onbeforeunload = () => "You have unsaved changes"
        } else {
          window.onbeforeunload = null
        }
      }}

      // Resume from saved job
      initialJobId={localStorage.getItem('jobId') || undefined}
    />
  )
}

// UI: Anticipatory loading
function Field({ fieldId }: { fieldId: string }) {
  const formState = useFormState()
  const isExpecting = formState.getExpectingFields().includes(fieldId)
  const isLoading = formState.getLoadingFields().includes(fieldId)

  if (isExpecting || isLoading) {
    return (
      <div className="field-anticipating">
        <label>{field.label}</label>
        <div className="shimmer-loading">
          <ShimmerEffect />
          <span>AI analyzing...</span>
        </div>
      </div>
    )
  }

  // ... normal field rendering
}

// UI: Suggestion with source
function SuggestionModal({ fieldId }: { fieldId: string }) {
  const suggestion = formState.getSuggestionState(fieldId)

  return (
    <Modal>
      <h3>AI Suggestion</h3>

      {/* Show source */}
      {suggestion.source && (
        <div className="suggestion-source">
          <small>
            From: {suggestion.source.documentName}
            {suggestion.source.pageNumber && ` (page ${suggestion.source.pageNumber})`}
          </small>
        </div>
      )}

      {/* Side-by-side comparison */}
      <div className="comparison">
        <div>
          <h4>Your Version</h4>
          <p>{suggestion.userValue}</p>
        </div>
        <div>
          <h4>AI Version ({suggestion.confidence * 100}%)</h4>
          <p>{suggestion.suggestedValue}</p>
        </div>
      </div>

      <p className="reason">{suggestion.reason}</p>

      <div className="actions">
        <Button onClick={() => formState.acceptSuggestion(fieldId)}>
          Use AI Version
        </Button>
        <Button onClick={() => formState.dismissSuggestion(fieldId)}>
          Keep Mine
        </Button>

        {/* If user previously accepted but edited */}
        {suggestion.suggestedValueModified && (
          <Button onClick={() => formState.resetToOriginalSuggestion(fieldId)}>
            Reset to Original AI Version
          </Button>
        )}
      </div>
    </Modal>
  )
}

// UI: Job progress with cancel
function JobProgressBanner({ jobId }: { jobId: string }) {
  const formState = useFormState()
  const [job, setJob] = useState<BackgroundJob>()

  return (
    <div className="job-progress">
      <h3>Analyzing your materials...</h3>
      <ProgressBar value={job.progress} />
      <p>{Math.round(job.progress * 100)}% complete</p>
      <p>~{job.estimatedTimeRemaining} seconds remaining</p>

      <div className="fields-status">
        <p>Completed: {job.fieldsCompleted.length} fields</p>
        <p>Pending: {job.fieldsPending.length} fields</p>
      </div>

      <Button onClick={() => formState.cancelJob(jobId)}>
        Cancel Analysis
      </Button>
    </div>
  )
}
```

---

## API Summary

### Core Interfaces (13 total - minimal!)

```typescript
// Schema
FormField
FieldValidation
FieldSuggestion
ConditionalLogic

// Results
ValidationResult
SuggestionResult
BulkSuggestResponse  // NEW: consistent return type
BackgroundJob

// State
FormStateAPI
FieldSuggestionState
PageBadges
HistoryEntry
FieldChange
```

### Key Improvements in v2

| Feature | Improvement | Value |
|---------|-------------|-------|
| **Anticipatory Loading** | `affectedFields` in job response | High - better UX |
| **Consistent Returns** | `BulkSuggestResponse` (not union) | High - no ambiguity |
| **Field Status** | Single enum vs 7 booleans | High - simpler state |
| **Validation Caching** | `cacheResults`, `cacheTtl` | High - fewer API calls |
| **Suggestion Expiry** | `ttl`, `expiresAt` | Medium - data freshness |
| **Source Tracking** | `source` in suggestions | Medium - transparency |
| **Field Dependencies** | `dependsOn` array | High - auto-revalidation |
| **Cross-Field Validation** | Schema-level validation | High - complex rules |
| **Job Cancellation** | `cancelJob()`, `onJobCancel` | High - user control |
| **Suggestion Reset** | `resetToOriginalSuggestion()` | Medium - undo edits |
| **Form Metadata** | Track AI vs user fields | Medium - analytics |
| **Grouped Config** | `features` object | Low - cleaner API |
| **Auto-fix** | Renamed from `quickFix` | Low - clarity |

---

## Gotchas Addressed

### ✅ Fixed: Return Type Ambiguity
**Before:** `Promise<string | BulkSuggestionResult | JobMetadata>` (confusing!)
**After:** `Promise<BulkSuggestResponse>` (clear structure)

### ✅ Fixed: Too Many Booleans
**Before:** 7 separate booleans for field state
**After:** Single `status` enum + independent flags

### ✅ Fixed: Missing Job Cancellation
**Before:** No way to stop 20-minute job
**After:** `cancelJob()` method + `onJobCancel` callback

### ✅ Fixed: Validation Cache Miss
**Before:** Same input validated multiple times
**After:** `cacheResults` + `cacheTtl` options

### ✅ Fixed: Field Dependency Coupling
**Before:** No way to express field relationships
**After:** `dependsOn` array triggers auto-revalidation

### ✅ Fixed: Cross-Field Validation Gap
**Before:** Can't validate multiple fields together
**After:** Schema-level `crossField` validation

### ✅ Fixed: Stale Suggestions
**Before:** 8-hour-old suggestions still shown
**After:** `ttl` option + `expiresAt` tracking

### ✅ Fixed: Opaque Suggestions
**Before:** No idea where suggestion came from
**After:** `source` tracking with document/page info

---

## Implementation Phases

### Phase 1: Core MVP
1. Field rendering
2. Form state (values, dirty tracking)
3. Sync/async validation with caching
4. Single field suggestions
5. Dual value system

### Phase 2: Advanced State
6. Undo/redo
7. Draft saving
8. Suggestion state (status enum)
9. Field dependencies
10. Cross-field validation

### Phase 3: Background Jobs
11. Job support with consistent return type
12. Progress tracking + anticipatory loading
13. Job cancellation
14. Resumable jobs

### Phase 4: Polish
15. Field arrays
16. Calculated fields
17. Suggestion expiry
18. Source tracking
19. Form metadata
20. Custom field types

---

## Non-Goals (Explicitly Out of Scope)

1. **UI Components** - Headless library, UI is consumer's responsibility
2. **SSR** - Defer to v2, focus on client-side first
3. **Real-time Collaboration** - Complex, defer to future
4. **Schema Migrations** - Version field exists, migrations are manual
5. **Built-in Analytics** - Metadata exposed, tracking is consumer's job
6. **Accessibility Helpers** - UI concern, consumer implements

---

**Status:** Final Design v2 - Ready for Implementation
**Date:** 2025-12-15
**Changes from v1:** +8 features, fixed 8 gotchas, 0 regressions
**Next Steps:** Begin Phase 1 implementation
