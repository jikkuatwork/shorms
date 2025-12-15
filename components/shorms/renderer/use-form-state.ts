/**
 * Shorms Renderer - Form State Management Hook
 * Manages form values, dirty state, history, and suggestions
 */

import { useState, useCallback, useRef, useMemo } from 'react'
import type {
  FormStateAPI,
  FormValues,
  FieldSuggestionState,
  PageBadges,
  HistoryEntry,
  FieldChange,
  ShormsSchema,
  ValidationResult,
} from './types'

interface UseFormStateOptions {
  schema: ShormsSchema
  initialValues?: FormValues
  maxHistorySize?: number
  onDirtyStateChange?: (isDirty: boolean, dirtyFields: string[]) => void
}

interface FormStateInternal {
  values: FormValues
  initialValues: FormValues
  suggestions: Map<string, FieldSuggestionState>
  validations: Map<string, ValidationResult>

  // History tracking
  history: HistoryEntry[]
  historyIndex: number

  // Dirty tracking
  dirtyFields: Set<string>

  // Draft tracking
  lastSavedAt?: number
  lastSavedValues?: FormValues

  // Job tracking
  activeJobId?: string
  expectingFields: Set<string>
  loadingFields: Set<string>

  // Metadata
  metadata: {
    startedAt: number
    submittedAt?: number
    duration?: number
    aiAssistedFields: Set<string>
    userEditedFields: Set<string>
  }
}

export function useFormState(options: UseFormStateOptions): FormStateAPI {
  const { schema, initialValues = {}, maxHistorySize = 50, onDirtyStateChange } = options

  // Initialize state
  const [state, setState] = useState<FormStateInternal>(() => {
    // Generate default values from schema
    const defaultValues: FormValues = {}
    schema.pages.forEach(page => {
      page.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          defaultValues[field.name] = field.defaultValue
        } else if (initialValues[field.name] !== undefined) {
          defaultValues[field.name] = initialValues[field.name]
        }
      })
    })

    return {
      values: { ...defaultValues, ...initialValues },
      initialValues: { ...defaultValues, ...initialValues },
      suggestions: new Map(),
      validations: new Map(),
      history: [],
      historyIndex: -1,
      dirtyFields: new Set(),
      expectingFields: new Set(),
      loadingFields: new Set(),
      metadata: {
        startedAt: Date.now(),
        aiAssistedFields: new Set(),
        userEditedFields: new Set(),
      },
    }
  })

  // Refs for callbacks
  const stateRef = useRef(state)
  stateRef.current = state

  // Helper: Add to history
  const addToHistory = useCallback((entry: HistoryEntry) => {
    setState(prev => {
      // Remove any future history if we're not at the end
      const newHistory = prev.history.slice(0, prev.historyIndex + 1)
      newHistory.push(entry)

      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift()
      }

      return {
        ...prev,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      }
    })
  }, [maxHistorySize])

  // Helper: Check if field is dirty
  const isFieldDirty = useCallback((fieldId: string): boolean => {
    const currentValue = stateRef.current.values[fieldId]
    const initialValue = stateRef.current.initialValues[fieldId]
    return currentValue !== initialValue
  }, [])

  // Core API: Get value
  const getValue = useCallback((fieldId: string): any => {
    return stateRef.current.values[fieldId]
  }, [])

  // Core API: Set value
  const setValue = useCallback((fieldId: string, value: any, source: 'user' | 'suggested' | 'system' = 'user') => {
    setState(prev => {
      const oldValue = prev.values[fieldId]

      // Skip if value hasn't changed
      if (oldValue === value) {
        return prev
      }

      const newValues = { ...prev.values, [fieldId]: value }
      const newDirtyFields = new Set(prev.dirtyFields)

      // Update dirty tracking
      if (value !== prev.initialValues[fieldId]) {
        newDirtyFields.add(fieldId)
      } else {
        newDirtyFields.delete(fieldId)
      }

      // Track source
      const newMetadata = { ...prev.metadata }
      if (source === 'user') {
        newMetadata.userEditedFields = new Set(prev.metadata.userEditedFields).add(fieldId)
      } else if (source === 'suggested') {
        newMetadata.aiAssistedFields = new Set(prev.metadata.aiAssistedFields).add(fieldId)
      }

      // Add to history
      const historyEntry: HistoryEntry = {
        timestamp: Date.now(),
        type: 'field-edit',
        fieldIds: [fieldId],
        description: `Changed ${fieldId}`,
      }

      // Notify dirty state change
      if (onDirtyStateChange && newDirtyFields.size !== prev.dirtyFields.size) {
        onDirtyStateChange(newDirtyFields.size > 0, Array.from(newDirtyFields))
      }

      return {
        ...prev,
        values: newValues,
        dirtyFields: newDirtyFields,
        metadata: newMetadata,
      }
    })

    // Add to history after state update
    addToHistory({
      timestamp: Date.now(),
      type: 'field-edit',
      fieldIds: [fieldId],
      description: `Changed ${fieldId}`,
    })
  }, [onDirtyStateChange, addToHistory])

  // Suggestion API: Get suggestion state
  const getSuggestionState = useCallback((fieldId: string): FieldSuggestionState | null => {
    return stateRef.current.suggestions.get(fieldId) || null
  }, [])

  // Suggestion API: Set suggestion state
  const setSuggestionState = useCallback((fieldId: string, suggestionState: FieldSuggestionState) => {
    setState(prev => {
      const newSuggestions = new Map(prev.suggestions)
      newSuggestions.set(fieldId, suggestionState)
      return { ...prev, suggestions: newSuggestions }
    })
  }, [])

  // Suggestion API: Accept suggestion
  const acceptSuggestion = useCallback((fieldId: string) => {
    const suggestion = stateRef.current.suggestions.get(fieldId)
    if (!suggestion) return

    // Set the suggested value as the active value
    setValue(fieldId, suggestion.suggestedValue, 'suggested')

    // Update suggestion state
    setSuggestionState(fieldId, {
      ...suggestion,
      activeValue: 'suggested',
      status: 'accepted',
    })

    // Add to history
    addToHistory({
      timestamp: Date.now(),
      type: 'accept-suggestion',
      fieldIds: [fieldId],
      description: `Accepted suggestion for ${fieldId}`,
    })
  }, [setValue, setSuggestionState, addToHistory])

  // Suggestion API: Dismiss suggestion
  const dismissSuggestion = useCallback((fieldId: string) => {
    const suggestion = stateRef.current.suggestions.get(fieldId)
    if (!suggestion) return

    // Update suggestion state
    setSuggestionState(fieldId, {
      ...suggestion,
      status: 'dismissed',
    })

    // Add to history
    addToHistory({
      timestamp: Date.now(),
      type: 'dismiss-suggestion',
      fieldIds: [fieldId],
      description: `Dismissed suggestion for ${fieldId}`,
    })
  }, [setSuggestionState, addToHistory])

  // Suggestion API: Toggle between user and suggested value
  const toggleValue = useCallback((fieldId: string) => {
    const suggestion = stateRef.current.suggestions.get(fieldId)
    if (!suggestion) return

    const newActiveValue = suggestion.activeValue === 'user' ? 'suggested' : 'user'
    const newValue = newActiveValue === 'user' ? suggestion.userValue : suggestion.suggestedValue

    setValue(fieldId, newValue, newActiveValue === 'suggested' ? 'suggested' : 'user')

    setSuggestionState(fieldId, {
      ...suggestion,
      activeValue: newActiveValue,
    })

    addToHistory({
      timestamp: Date.now(),
      type: 'toggle-value',
      fieldIds: [fieldId],
      description: `Toggled to ${newActiveValue} value for ${fieldId}`,
    })
  }, [setValue, setSuggestionState, addToHistory])

  // Suggestion API: Reset to original suggestion
  const resetToOriginalSuggestion = useCallback((fieldId: string) => {
    const suggestion = stateRef.current.suggestions.get(fieldId)
    if (!suggestion) return

    setSuggestionState(fieldId, {
      ...suggestion,
      suggestedValue: suggestion.originalSuggestedValue,
      suggestedValueModified: false,
    })

    if (suggestion.activeValue === 'suggested') {
      setValue(fieldId, suggestion.originalSuggestedValue, 'suggested')
    }
  }, [setSuggestionState, setValue])

  // Suggestion API: Mark as reviewed
  const markAsReviewed = useCallback((fieldId: string) => {
    const suggestion = stateRef.current.suggestions.get(fieldId)
    if (!suggestion) return

    setSuggestionState(fieldId, {
      ...suggestion,
      status: 'reviewing',
    })
  }, [setSuggestionState])

  // Bulk Suggestion API: Accept all suggestions
  const acceptAllSuggestions = useCallback(() => {
    const fieldIds: string[] = []

    stateRef.current.suggestions.forEach((suggestion, fieldId) => {
      if (suggestion.status === 'available' || suggestion.status === 'reviewing') {
        acceptSuggestion(fieldId)
        fieldIds.push(fieldId)
      }
    })

    addToHistory({
      timestamp: Date.now(),
      type: 'bulk-accept',
      fieldIds,
      description: `Accepted ${fieldIds.length} suggestions`,
    })
  }, [acceptSuggestion, addToHistory])

  // Bulk Suggestion API: Accept all on page
  const acceptAllOnPage = useCallback((pageId: string) => {
    const page = schema.pages.find(p => p.id === pageId)
    if (!page) return

    const fieldIds: string[] = []

    page.fields.forEach(field => {
      const suggestion = stateRef.current.suggestions.get(field.name)
      if (suggestion && (suggestion.status === 'available' || suggestion.status === 'reviewing')) {
        acceptSuggestion(field.name)
        fieldIds.push(field.name)
      }
    })

    addToHistory({
      timestamp: Date.now(),
      type: 'bulk-accept',
      fieldIds,
      description: `Accepted ${fieldIds.length} suggestions on page ${pageId}`,
    })
  }, [schema, acceptSuggestion, addToHistory])

  // Bulk Suggestion API: Dismiss all on page
  const dismissAllOnPage = useCallback((pageId: string) => {
    const page = schema.pages.find(p => p.id === pageId)
    if (!page) return

    page.fields.forEach(field => {
      const suggestion = stateRef.current.suggestions.get(field.name)
      if (suggestion && (suggestion.status === 'available' || suggestion.status === 'reviewing')) {
        dismissSuggestion(field.name)
      }
    })
  }, [schema, dismissSuggestion])

  // Validation API: Get field validation
  const getFieldValidation = useCallback((fieldId: string): ValidationResult | null => {
    return stateRef.current.validations.get(fieldId) || null
  }, [])

  // Validation API: Set field validation
  const setFieldValidation = useCallback((fieldId: string, validation: ValidationResult | null) => {
    setState(prev => {
      const newValidations = new Map(prev.validations)
      if (validation) {
        newValidations.set(fieldId, validation)
      } else {
        newValidations.delete(fieldId)
      }
      return { ...prev, validations: newValidations }
    })
  }, [])

  // History API: Undo
  const undo = useCallback(() => {
    // TODO: Implement undo logic
    // This would require storing snapshots of values/suggestions
    setState(prev => ({
      ...prev,
      historyIndex: Math.max(-1, prev.historyIndex - 1),
    }))
  }, [])

  // History API: Redo
  const redo = useCallback(() => {
    // TODO: Implement redo logic
    setState(prev => ({
      ...prev,
      historyIndex: Math.min(prev.history.length - 1, prev.historyIndex + 1),
    }))
  }, [])

  // History API: Clear history
  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      history: [],
      historyIndex: -1,
    }))
  }, [])

  // Utility API: Reset
  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      values: { ...prev.initialValues },
      dirtyFields: new Set(),
      suggestions: new Map(),
      validations: new Map(),
      history: [],
      historyIndex: -1,
    }))
  }, [])

  // Utility API: Mark clean
  const markClean = useCallback(() => {
    setState(prev => ({
      ...prev,
      lastSavedAt: Date.now(),
      lastSavedValues: { ...prev.values },
    }))
  }, [])

  // Utility API: Get changes
  const getChanges = useCallback((): FieldChange[] => {
    const changes: FieldChange[] = []
    const baseValues = stateRef.current.lastSavedValues || stateRef.current.initialValues

    Object.keys(stateRef.current.values).forEach(fieldId => {
      const currentValue = stateRef.current.values[fieldId]
      const baseValue = baseValues[fieldId]

      if (currentValue !== baseValue) {
        const suggestion = stateRef.current.suggestions.get(fieldId)
        const source = suggestion?.status === 'accepted' ? 'suggested' : 'user'

        changes.push({
          fieldId,
          from: baseValue,
          to: currentValue,
          timestamp: Date.now(),
          source,
        })
      }
    })

    return changes
  }, [])

  // Job API: Cancel job
  const cancelJob = useCallback(async (jobId: string) => {
    setState(prev => ({
      ...prev,
      activeJobId: prev.activeJobId === jobId ? undefined : prev.activeJobId,
    }))
  }, [])

  // Computed: Pending suggestions
  const getPendingSuggestions = useCallback((): string[] => {
    const pending: string[] = []
    stateRef.current.suggestions.forEach((suggestion, fieldId) => {
      if (suggestion.status === 'available' || suggestion.status === 'reviewing') {
        pending.push(fieldId)
      }
    })
    return pending
  }, [])

  // Computed: Suggestion count
  const getSuggestionCount = useCallback((): number => {
    return getPendingSuggestions().length
  }, [getPendingSuggestions])

  // Computed: Page badges
  const getPageBadges = useCallback((pageId: string): PageBadges => {
    const page = schema.pages.find(p => p.id === pageId)
    if (!page) {
      return { errors: 0, warnings: 0, suggestions: 0 }
    }

    let errors = 0
    let warnings = 0
    let suggestions = 0

    page.fields.forEach(field => {
      const validation = stateRef.current.validations.get(field.name)
      if (validation && !validation.valid) {
        if (validation.severity === 'error' && validation.blocking) {
          errors++
        } else if (validation.severity === 'warning') {
          warnings++
        }
      }

      const suggestion = stateRef.current.suggestions.get(field.name)
      if (suggestion && (suggestion.status === 'available' || suggestion.status === 'reviewing')) {
        suggestions++
      }
    })

    return { errors, warnings, suggestions }
  }, [schema])

  // Computed: Expecting fields
  const getExpectingFields = useCallback((): string[] => {
    return Array.from(stateRef.current.expectingFields)
  }, [])

  // Computed: Loading fields
  const getLoadingFields = useCallback((): string[] => {
    return Array.from(stateRef.current.loadingFields)
  }, [])

  // Computed: Is valid
  const isValid = useMemo(() => {
    let valid = true
    state.validations.forEach(validation => {
      if (!validation.valid && validation.blocking) {
        valid = false
      }
    })
    return valid
  }, [state.validations])

  // Computed: Errors
  const errors = useMemo(() => {
    const errorMap: Record<string, string> = {}
    state.validations.forEach((validation, fieldId) => {
      if (!validation.valid && validation.message) {
        errorMap[fieldId] = validation.message
      }
    })
    return errorMap
  }, [state.validations])

  // Computed: Metadata (convert Sets to arrays)
  const metadata = useMemo(() => ({
    ...state.metadata,
    aiAssistedFields: Array.from(state.metadata.aiAssistedFields),
    userEditedFields: Array.from(state.metadata.userEditedFields),
  }), [state.metadata])

  // Build and return the API
  return {
    // Values
    values: state.values,
    getValue,
    setValue,

    // Dirty state
    isDirty: state.dirtyFields.size > 0,
    dirtyFields: state.dirtyFields,
    hasUnsavedChanges: state.lastSavedAt
      ? state.dirtyFields.size > 0
      : state.dirtyFields.size > 0,

    // Validation
    isValid,
    errors,
    getFieldValidation,

    // Suggestions
    getSuggestionState,
    getPendingSuggestions,
    getSuggestionCount,
    getPageBadges,
    getExpectingFields,
    getLoadingFields,

    // Suggestion actions
    acceptSuggestion,
    dismissSuggestion,
    toggleValue,
    markAsReviewed,
    resetToOriginalSuggestion,

    // Bulk actions
    acceptAllSuggestions,
    acceptAllOnPage,
    dismissAllOnPage,

    // History
    canUndo: state.historyIndex >= 0,
    canRedo: state.historyIndex < state.history.length - 1,
    undo,
    redo,
    clearHistory,

    // Draft
    lastSavedAt: state.lastSavedAt,
    isDraftSaved: state.lastSavedAt !== undefined,

    // Jobs
    activeJobId: state.activeJobId,
    cancelJob,

    // Metadata
    metadata,

    // Utility
    reset,
    markClean,
    getChanges,
  }
}

// Internal helper for other hooks to update suggestion/validation state
export type FormStateUpdaters = {
  setSuggestionState: (fieldId: string, state: FieldSuggestionState) => void
  setFieldValidation: (fieldId: string, validation: ValidationResult | null) => void
  setExpectingFields: (fields: Set<string>) => void
  setLoadingFields: (fields: Set<string>) => void
  setActiveJobId: (jobId: string | undefined) => void
}
