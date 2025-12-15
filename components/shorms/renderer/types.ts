/**
 * Shorms Renderer - Type Definitions
 * Based on API Design v3.1.0
 */

import type { ReactNode } from 'react'

// ============================================================================
// Core Schema Types
// ============================================================================

export interface ShormsSchema {
  version: string
  pages: FormPage[]
  validation?: {
    crossField?: CrossFieldValidation[]
  }
  metadata?: Record<string, any>
}

export interface FormPage {
  id: string
  title?: string
  description?: string
  fields: FormField[]
}

export interface FormField {
  id: string
  type: string  // Extensible: any string is valid
  name: string  // Key in form values
  label: string
  description?: string
  required?: boolean
  defaultValue?: any

  // Conditional rendering
  showIf?: ConditionalLogic | ((values: FormValues) => boolean)

  // Field dependencies
  dependsOn?: string[]  // When these fields change, revalidate/re-suggest

  // Validation (checks correctness)
  validation?: FieldValidation

  // Suggestions (offers improvements)
  suggest?: FieldSuggestion

  // Field-type specific config
  config?: Record<string, any>

  // User metadata
  metadata?: Record<string, any>
}

export type ConditionalLogic =
  | {
      field: string
      operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan'
      value: any
    }
  | {
      and: ConditionalLogic[]
    }
  | {
      or: ConditionalLogic[]
    }

export type FormValues = Record<string, any>

// ============================================================================
// Validation Types
// ============================================================================

export interface FieldValidation {
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

  // Cache validation results
  cacheResults?: boolean  // default: true
  cacheTtl?: number       // seconds, default: 300 (5 minutes)
}

export interface ValidationContext {
  fieldId: string
  allValues: FormValues
  schema: ShormsSchema
}

export interface ValidationResult {
  valid: boolean
  message?: string
  severity?: 'error' | 'warning' | 'info'  // default: 'error'
  blocking?: boolean  // default: true if severity === 'error'
  autoFix?: any  // e.g., "stripe.com" → "https://stripe.com"
}

export interface CrossFieldValidation {
  fields: string[]  // fields involved
  validate: (values: Pick<FormValues, string>) => ValidationResult | true | string
}

// ============================================================================
// Suggestion Types
// ============================================================================

export interface FieldSuggestion {
  // Enable dual value system
  preserveBothValues?: boolean  // default: true

  // Minimum confidence to show (0-1)
  minConfidence?: number  // default: 0.7

  // Suggestion expiry
  ttl?: number  // time-to-live in seconds, default: 3600 (1 hour)
}

export interface SuggestionResult {
  suggestedValue: any
  confidence?: number  // 0-1
  reason?: string      // explanation

  // Source tracking
  source?: {
    type: 'document-analysis' | 'field-inference' | 'external-api' | 'ai-model'
    documentName?: string    // "pitch-deck.pdf"
    pageNumber?: number
    modelName?: string       // "claude-opus-4"
    extractedFrom?: string   // quote or snippet
  }

  metadata?: Record<string, any>
}

export interface BulkSuggestResponse {
  // For immediate results
  immediate?: {
    suggestions: Record<string, SuggestionResult>
  }

  // For long-running jobs (includes anticipatory loading)
  job?: {
    jobId: string
    affectedFields: string[]        // which fields will receive suggestions
    estimatedDuration?: number      // seconds
    estimatedFieldCount?: number    // how many fields we expect to fill
  }
}

// ============================================================================
// Field Suggestion State
// ============================================================================

export type SuggestionStatus =
  | 'none'         // No suggestion
  | 'expecting'    // Job started, field marked as affected
  | 'loading'      // Actively loading suggestion
  | 'available'    // Suggestion ready, user hasn't reviewed
  | 'reviewing'    // User is reviewing (modal open, etc.)
  | 'accepted'     // User accepted suggestion
  | 'dismissed'    // User dismissed suggestion

export interface FieldSuggestionState {
  // Dual values
  userValue: any
  suggestedValue: any
  originalSuggestedValue: any  // preserve original even if user edits suggested
  activeValue: 'user' | 'suggested'
  suggestedValueModified: boolean  // track if user edited the suggestion

  // Status
  status: SuggestionStatus

  // Metadata
  confidence: number
  reason: string
  timestamp: number
  expiresAt?: number  // suggestion expiry

  // Source tracking
  source?: {
    type: string
    documentName?: string
    pageNumber?: number
    modelName?: string
    extractedFrom?: string
  }

  // Error state
  error?: string
}

// ============================================================================
// Background Jobs
// ============================================================================

export interface BackgroundJob {
  jobId: string
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'partial' | 'cancelled'
  progress: number  // 0-1

  // Partial results (filled as job progresses)
  partialResults: Partial<FormValues>
  fieldsCompleted: string[]  // field IDs filled so far
  fieldsPending: string[]    // field IDs still processing

  // Updates since last poll (avoid missing intermediate states)
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

// ============================================================================
// State Management API
// ============================================================================

export interface FormStateAPI {
  // FIELD VALUES
  values: Record<string, any>  // current active values (user or suggested)
  getValue(fieldId: string): any
  setValue(fieldId: string, value: any, source?: 'user' | 'suggested' | 'system'): void

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

  // Anticipatory loading
  getExpectingFields(): string[]  // fields expecting suggestions
  getLoadingFields(): string[]    // fields currently loading

  // SUGGESTION ACTIONS
  acceptSuggestion(fieldId: string): void
  dismissSuggestion(fieldId: string): void
  toggleValue(fieldId: string): void  // toggle between user/suggested
  markAsReviewed(fieldId: string): void

  // Reset to original suggestion (if user edited it)
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

  // BACKGROUND JOBS
  activeJobId?: string
  cancelJob(jobId: string): Promise<void>

  // FORM METADATA
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

export interface PageBadges {
  errors: number      // blocking validation errors
  warnings: number    // non-blocking validation warnings
  suggestions: number // pending suggestions (not accepted/dismissed)
}

export interface HistoryEntry {
  timestamp: number
  type: 'field-edit' | 'accept-suggestion' | 'dismiss-suggestion' | 'toggle-value' | 'bulk-accept'
  fieldIds: string[]
  description: string  // human-readable: "Changed company name"
}

export interface FieldChange {
  fieldId: string
  from: any
  to: any
  timestamp: number
  source: 'user' | 'suggested' | 'system'
}

// ============================================================================
// Renderer Props
// ============================================================================

export interface RendererFeatures {
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

export interface RendererProps {
  // Core
  schema: ShormsSchema
  onSubmit: (values: FormValues) => void | Promise<void>

  // State access
  formStateRef?: React.Ref<FormStateAPI>

  // Feature configuration
  features?: RendererFeatures
  maxHistorySize?: number           // default: 50

  // Suggestions
  onSuggest?: (
    fieldId: string,
    currentValue: any,
    context: FormValues
  ) => Promise<SuggestionResult>

  onBulkSuggest?: (
    files: File[],
    schema: ShormsSchema,
    currentValues: FormValues
  ) => Promise<BulkSuggestResponse>

  // Background jobs
  onJobProgress?: (jobId: string) => Promise<BackgroundJob>
  onJobCancel?: (jobId: string) => Promise<void>

  // Draft saving
  onSaveDraft?: (
    values: FormValues,
    changes: FieldChange[]
  ) => Promise<void>

  // Load from draft
  initialValues?: FormValues
  initialJobId?: string  // resume background job

  // State change callbacks
  onDirtyStateChange?: (isDirty: boolean, dirtyFields: string[]) => void
  onUndo?: (entry: HistoryEntry) => void
  onRedo?: (entry: HistoryEntry) => void

  // Custom rendering (optional)
  renderField?: (field: FormField, value: any, onChange: (value: any) => void) => ReactNode
  renderPage?: (page: FormPage, children: ReactNode) => ReactNode
  renderProgress?: (current: number, total: number, progress: number) => ReactNode
}
