/**
 * Shorms Renderer - Suggestions Hook
 * Handles single field and bulk suggestions with dual value system
 */

import { useCallback, useRef } from 'react'
import type {
  FormField,
  FormValues,
  SuggestionResult,
  FieldSuggestionState,
  FormStateAPI,
  ShormsSchema,
} from './types'

interface UseSuggestionsOptions {
  schema: ShormsSchema
  formState: FormStateAPI
  onSuggest?: (fieldId: string, currentValue: any, context: FormValues) => Promise<SuggestionResult>
}

export function useSuggestions(options: UseSuggestionsOptions) {
  const { schema, formState, onSuggest } = options

  // Track pending suggestions
  const pendingRef = useRef<Map<string, Promise<SuggestionResult>>>(new Map())

  // Build field map for quick lookup
  const fieldMap = useRef<Map<string, FormField>>(new Map())

  // Initialize field map
  if (fieldMap.current.size === 0) {
    schema.pages.forEach(page => {
      page.fields.forEach(field => {
        fieldMap.current.set(field.name, field)
      })
    })
  }

  // Helper: Check if suggestion is expired
  const isSuggestionExpired = useCallback((suggestion: FieldSuggestionState): boolean => {
    if (!suggestion.expiresAt) return false
    return Date.now() > suggestion.expiresAt
  }, [])

  // Helper: Create suggestion state from result
  const createSuggestionState = useCallback((
    fieldId: string,
    result: SuggestionResult,
    currentUserValue: any
  ): FieldSuggestionState => {
    const field = fieldMap.current.get(fieldId)
    const ttl = field?.suggest?.ttl || 3600 // default 1 hour

    return {
      userValue: currentUserValue,
      suggestedValue: result.suggestedValue,
      originalSuggestedValue: result.suggestedValue,
      activeValue: 'user', // Default to user value initially
      suggestedValueModified: false,
      status: 'available',
      confidence: result.confidence || 0,
      reason: result.reason || '',
      timestamp: Date.now(),
      expiresAt: Date.now() + (ttl * 1000),
      source: result.source,
    }
  }, [])

  // Core: Request single field suggestion
  const requestSuggestion = useCallback(async (fieldId: string): Promise<SuggestionResult | null> => {
    if (!onSuggest) {
      return null
    }

    const field = fieldMap.current.get(fieldId)
    if (!field || !field.suggest) {
      return null
    }

    const currentValue = formState.getValue(fieldId)
    const allValues = formState.values

    // Check if already pending
    const pending = pendingRef.current.get(fieldId)
    if (pending) {
      return await pending
    }

    // Update state to show loading
    const currentSuggestion = formState.getSuggestionState(fieldId)
    if (currentSuggestion) {
      // Update existing suggestion state
      const updatedState: FieldSuggestionState = {
        ...currentSuggestion,
        status: 'loading',
      }
      // This would be set via formState internal API
    }

    // Request suggestion
    const promise = onSuggest(fieldId, currentValue, allValues)
    pendingRef.current.set(fieldId, promise)

    try {
      const result = await promise

      // Check confidence threshold
      const minConfidence = field.suggest.minConfidence || 0.7
      if (result.confidence !== undefined && result.confidence < minConfidence) {
        return null
      }

      return result
    } catch (error) {
      console.error(`Error getting suggestion for ${fieldId}:`, error)
      return null
    } finally {
      pendingRef.current.delete(fieldId)
    }
  }, [onSuggest, formState])

  // Core: Apply suggestion result to form state
  const applySuggestionResult = useCallback((fieldId: string, result: SuggestionResult) => {
    const field = fieldMap.current.get(fieldId)
    if (!field) return

    const currentUserValue = formState.getValue(fieldId)
    const suggestionState = createSuggestionState(fieldId, result, currentUserValue)

    // This would be updated via formState internal API
    // For now, this is a placeholder for the actual implementation
    // The renderer component will handle setting this state
  }, [formState, createSuggestionState])

  // Core: Check if field should trigger suggestion
  const shouldTriggerSuggestion = useCallback((fieldId: string, newValue: any): boolean => {
    const field = fieldMap.current.get(fieldId)
    if (!field || !field.suggest) {
      return false
    }

    const currentSuggestion = formState.getSuggestionState(fieldId)

    // Don't trigger if already loading or expecting
    if (currentSuggestion?.status === 'loading' || currentSuggestion?.status === 'expecting') {
      return false
    }

    // Don't trigger if recently suggested and not expired
    if (currentSuggestion && !isSuggestionExpired(currentSuggestion)) {
      return false
    }

    // Don't trigger if value is empty
    if (newValue === undefined || newValue === null || newValue === '') {
      return false
    }

    return true
  }, [formState, isSuggestionExpired])

  // Core: Handle field value change (trigger suggestion if needed)
  const handleFieldChange = useCallback(async (fieldId: string, newValue: any) => {
    if (!shouldTriggerSuggestion(fieldId, newValue)) {
      return
    }

    const result = await requestSuggestion(fieldId)
    if (result) {
      applySuggestionResult(fieldId, result)
    }
  }, [shouldTriggerSuggestion, requestSuggestion, applySuggestionResult])

  // Core: Handle dependent field suggestions
  const triggerDependentSuggestions = useCallback(async (fieldId: string) => {
    // Find fields that depend on this field
    const dependentFields: string[] = []
    fieldMap.current.forEach((field, fid) => {
      if (field.dependsOn?.includes(fieldId) && field.suggest) {
        dependentFields.push(fid)
      }
    })

    // Clear suggestions for dependent fields
    dependentFields.forEach(fid => {
      const currentSuggestion = formState.getSuggestionState(fid)
      if (currentSuggestion) {
        // Mark as needing refresh
        // This would be updated via formState internal API
      }
    })

    // Trigger new suggestions for dependent fields
    await Promise.all(
      dependentFields.map(fid => requestSuggestion(fid))
    )
  }, [formState, requestSuggestion])

  // Core: Clear expired suggestions
  const clearExpiredSuggestions = useCallback(() => {
    const expired: string[] = []

    fieldMap.current.forEach((_, fieldId) => {
      const suggestion = formState.getSuggestionState(fieldId)
      if (suggestion && isSuggestionExpired(suggestion)) {
        expired.push(fieldId)
      }
    })

    expired.forEach(fieldId => {
      // Clear suggestion via formState internal API
      // This would be implemented in the renderer component
    })
  }, [formState, isSuggestionExpired])

  // Utility: Get fields with active suggestions
  const getFieldsWithSuggestions = useCallback((): string[] => {
    const fields: string[] = []

    fieldMap.current.forEach((_, fieldId) => {
      const suggestion = formState.getSuggestionState(fieldId)
      if (suggestion && suggestion.status !== 'none' && !isSuggestionExpired(suggestion)) {
        fields.push(fieldId)
      }
    })

    return fields
  }, [formState, isSuggestionExpired])

  // Utility: Get suggestion statistics
  const getSuggestionStats = useCallback(() => {
    let total = 0
    let available = 0
    let accepted = 0
    let dismissed = 0
    let loading = 0

    fieldMap.current.forEach((_, fieldId) => {
      const suggestion = formState.getSuggestionState(fieldId)
      if (suggestion && suggestion.status !== 'none') {
        total++
        switch (suggestion.status) {
          case 'available':
          case 'reviewing':
            available++
            break
          case 'accepted':
            accepted++
            break
          case 'dismissed':
            dismissed++
            break
          case 'loading':
          case 'expecting':
            loading++
            break
        }
      }
    })

    return { total, available, accepted, dismissed, loading }
  }, [formState])

  return {
    requestSuggestion,
    applySuggestionResult,
    handleFieldChange,
    triggerDependentSuggestions,
    clearExpiredSuggestions,
    getFieldsWithSuggestions,
    getSuggestionStats,
  }
}
