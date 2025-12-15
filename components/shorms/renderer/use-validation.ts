/**
 * Shorms Renderer - Validation Hook
 * Handles sync and async validation with caching
 */

import { useCallback, useRef, useMemo } from 'react'
import type {
  FormField,
  FormValues,
  ValidationResult,
  ValidationContext,
  ShormsSchema,
  FormStateAPI,
} from './types'

interface UseValidationOptions {
  schema: ShormsSchema
  formState: FormStateAPI
}

interface ValidationCache {
  result: ValidationResult
  timestamp: number
  ttl: number
}

export function useValidation(options: UseValidationOptions) {
  const { schema, formState } = options

  // Cache for validation results
  const cacheRef = useRef<Map<string, ValidationCache>>(new Map())

  // Debounce timers
  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Pending async validations
  const pendingRef = useRef<Map<string, Promise<ValidationResult | true | string>>>(new Map())

  // Build a map of fieldId → FormField for quick lookup
  const fieldMap = useMemo(() => {
    const map = new Map<string, FormField>()
    schema.pages.forEach(page => {
      page.fields.forEach(field => {
        map.set(field.name, field)
      })
    })
    return map
  }, [schema])

  // Helper: Check if cached result is still valid
  const getCachedResult = useCallback((fieldId: string, value: any): ValidationResult | null => {
    const cached = cacheRef.current.get(`${fieldId}:${JSON.stringify(value)}`)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > cached.ttl * 1000) {
      // Cache expired
      cacheRef.current.delete(`${fieldId}:${JSON.stringify(value)}`)
      return null
    }

    return cached.result
  }, [])

  // Helper: Cache validation result
  const cacheResult = useCallback((fieldId: string, value: any, result: ValidationResult, ttl: number) => {
    const cacheKey = `${fieldId}:${JSON.stringify(value)}`
    cacheRef.current.set(cacheKey, {
      result,
      timestamp: Date.now(),
      ttl,
    })
  }, [])

  // Helper: Normalize validation result
  const normalizeResult = useCallback((result: ValidationResult | true | string): ValidationResult => {
    if (result === true) {
      return { valid: true }
    }

    if (typeof result === 'string') {
      return {
        valid: false,
        message: result,
        severity: 'error',
        blocking: true,
      }
    }

    return {
      ...result,
      severity: result.severity || 'error',
      blocking: result.blocking !== undefined ? result.blocking : result.severity === 'error',
    }
  }, [])

  // Core: Run sync validation
  const runSyncValidation = useCallback((field: FormField, value: any, allValues: FormValues): ValidationResult => {
    const validation = field.validation
    if (!validation) {
      return { valid: true }
    }

    // Required check
    if (field.required && (value === undefined || value === null || value === '')) {
      return {
        valid: false,
        message: `${field.label} is required`,
        severity: 'error',
        blocking: true,
      }
    }

    // Min/Max length for strings
    if (typeof value === 'string') {
      if (validation.minLength !== undefined && value.length < validation.minLength) {
        return {
          valid: false,
          message: `Minimum ${validation.minLength} characters required`,
          severity: 'error',
          blocking: true,
        }
      }
      if (validation.maxLength !== undefined && value.length > validation.maxLength) {
        return {
          valid: false,
          message: `Maximum ${validation.maxLength} characters allowed`,
          severity: 'error',
          blocking: true,
        }
      }
    }

    // Min/Max value for numbers
    if (typeof value === 'number') {
      if (validation.min !== undefined && value < validation.min) {
        return {
          valid: false,
          message: `Minimum value is ${validation.min}`,
          severity: 'error',
          blocking: true,
        }
      }
      if (validation.max !== undefined && value > validation.max) {
        return {
          valid: false,
          message: `Maximum value is ${validation.max}`,
          severity: 'error',
          blocking: true,
        }
      }
    }

    // Pattern validation
    if (validation.pattern && typeof value === 'string') {
      const regex = typeof validation.pattern === 'string'
        ? new RegExp(validation.pattern)
        : validation.pattern

      if (!regex.test(value)) {
        return {
          valid: false,
          message: 'Invalid format',
          severity: 'error',
          blocking: true,
        }
      }
    }

    // Email validation
    if (validation.email && typeof value === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return {
          valid: false,
          message: 'Invalid email address',
          severity: 'error',
          blocking: true,
        }
      }
    }

    // URL validation
    if (validation.url && typeof value === 'string') {
      try {
        new URL(value)
      } catch {
        return {
          valid: false,
          message: 'Invalid URL',
          severity: 'error',
          blocking: true,
        }
      }
    }

    // Phone validation (basic)
    if (validation.phone && typeof value === 'string') {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/
      if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
        return {
          valid: false,
          message: 'Invalid phone number',
          severity: 'error',
          blocking: true,
        }
      }
    }

    // Custom sync validation
    if (validation.validate) {
      const result = validation.validate(value, allValues)
      return normalizeResult(result)
    }

    return { valid: true }
  }, [normalizeResult])

  // Core: Run async validation
  const runAsyncValidation = useCallback(async (
    field: FormField,
    value: any,
    allValues: FormValues
  ): Promise<ValidationResult> => {
    const validation = field.validation
    if (!validation || !validation.validateAsync) {
      return { valid: true }
    }

    const context: ValidationContext = {
      fieldId: field.name,
      allValues,
      schema,
    }

    // Check cache
    const cacheEnabled = validation.cacheResults !== false
    if (cacheEnabled) {
      const cached = getCachedResult(field.name, value)
      if (cached) {
        return cached
      }
    }

    // Check if already pending
    const pendingKey = `${field.name}:${JSON.stringify(value)}`
    const pending = pendingRef.current.get(pendingKey)
    if (pending) {
      const result = await pending
      return normalizeResult(result)
    }

    // Run async validation
    const promise = validation.validateAsync(value, context)
    pendingRef.current.set(pendingKey, promise)

    try {
      const result = await promise
      const normalized = normalizeResult(result)

      // Cache result
      if (cacheEnabled) {
        const ttl = validation.cacheTtl || 300
        cacheResult(field.name, value, normalized, ttl)
      }

      return normalized
    } catch (error) {
      return {
        valid: false,
        message: error instanceof Error ? error.message : 'Validation error',
        severity: 'error',
        blocking: true,
      }
    } finally {
      pendingRef.current.delete(pendingKey)
    }
  }, [schema, getCachedResult, cacheResult, normalizeResult])

  // Core: Validate field
  const validateField = useCallback(async (fieldId: string): Promise<ValidationResult> => {
    const field = fieldMap.get(fieldId)
    if (!field) {
      return { valid: true }
    }

    const value = formState.getValue(fieldId)
    const allValues = formState.values

    // Run sync validation first
    const syncResult = runSyncValidation(field, value, allValues)
    if (!syncResult.valid) {
      return syncResult
    }

    // Run async validation if present
    if (field.validation?.validateAsync) {
      return await runAsyncValidation(field, value, allValues)
    }

    return { valid: true }
  }, [fieldMap, formState, runSyncValidation, runAsyncValidation])

  // Core: Validate field with debounce
  const validateFieldDebounced = useCallback((fieldId: string): Promise<ValidationResult> => {
    return new Promise((resolve) => {
      const field = fieldMap.get(fieldId)
      const debounce = field?.validation?.debounce || 500

      // Clear existing timer
      const existingTimer = debounceTimersRef.current.get(fieldId)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }

      // Set new timer
      const timer = setTimeout(async () => {
        const result = await validateField(fieldId)
        resolve(result)
      }, debounce)

      debounceTimersRef.current.set(fieldId, timer)
    })
  }, [fieldMap, validateField])

  // Core: Validate dependent fields
  const validateDependentFields = useCallback(async (fieldId: string) => {
    // Find fields that depend on this field
    const dependentFields: string[] = []
    fieldMap.forEach((field, fid) => {
      if (field.dependsOn?.includes(fieldId)) {
        dependentFields.push(fid)
      }
    })

    // Validate each dependent field
    await Promise.all(
      dependentFields.map(async (fid) => {
        const result = await validateField(fid)
        // Update form state with validation result
        // This would be called by the renderer
        return result
      })
    )
  }, [fieldMap, validateField])

  // Core: Validate all fields
  const validateAll = useCallback(async (): Promise<Map<string, ValidationResult>> => {
    const results = new Map<string, ValidationResult>()

    const promises = Array.from(fieldMap.keys()).map(async (fieldId) => {
      const result = await validateField(fieldId)
      results.set(fieldId, result)
    })

    await Promise.all(promises)
    return results
  }, [fieldMap, validateField])

  // Core: Validate page
  const validatePage = useCallback(async (pageId: string): Promise<Map<string, ValidationResult>> => {
    const page = schema.pages.find(p => p.id === pageId)
    if (!page) {
      return new Map()
    }

    const results = new Map<string, ValidationResult>()

    const promises = page.fields.map(async (field) => {
      const result = await validateField(field.name)
      results.set(field.name, result)
    })

    await Promise.all(promises)
    return results
  }, [schema, validateField])

  // Core: Run cross-field validation
  const validateCrossField = useCallback(async (): Promise<Map<string, ValidationResult>> => {
    const results = new Map<string, ValidationResult>()

    if (!schema.validation?.crossField) {
      return results
    }

    for (const rule of schema.validation.crossField) {
      const values: any = {}
      rule.fields.forEach(fieldId => {
        values[fieldId] = formState.getValue(fieldId)
      })

      const result = rule.validate(values)
      const normalized = normalizeResult(result)

      if (!normalized.valid) {
        // Apply error to all involved fields
        rule.fields.forEach(fieldId => {
          results.set(fieldId, normalized)
        })
      }
    }

    return results
  }, [schema, formState, normalizeResult])

  // Clear cache for a field (when dependencies change)
  const clearCacheForField = useCallback((fieldId: string) => {
    const keysToDelete: string[] = []
    cacheRef.current.forEach((_, key) => {
      if (key.startsWith(`${fieldId}:`)) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => cacheRef.current.delete(key))
  }, [])

  return {
    validateField,
    validateFieldDebounced,
    validateDependentFields,
    validateAll,
    validatePage,
    validateCrossField,
    clearCacheForField,
  }
}
