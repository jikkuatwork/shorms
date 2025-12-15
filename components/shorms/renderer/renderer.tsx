/**
 * Shorms Renderer - Main Component
 * Renders forms with validation, suggestions, and state management
 */

'use client'

import React, { useEffect, useImperativeHandle, useState, useCallback } from 'react'
import type { RendererProps, FormField, FormPage } from './types'
import { useFormState } from './use-form-state'
import { useValidation } from './use-validation'
import { useSuggestions } from './use-suggestions'
import { useBackgroundJob } from './use-background-job'

export const Renderer = React.forwardRef<any, RendererProps>((props, ref) => {
  const {
    schema,
    onSubmit,
    formStateRef,
    features = {},
    maxHistorySize = 50,
    onSuggest,
    onBulkSuggest,
    onJobProgress,
    onJobCancel,
    onSaveDraft,
    initialValues,
    initialJobId,
    onDirtyStateChange,
    onUndo,
    onRedo,
    renderField,
    renderPage,
    renderProgress,
  } = props

  // Extract feature flags
  const {
    stateManagement = true,
    autoSave,
    backgroundJobs,
  } = features

  // State: Current page
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const currentPage = schema.pages[currentPageIndex]

  // Initialize form state
  const formState = useFormState({
    schema,
    initialValues,
    maxHistorySize,
    onDirtyStateChange,
  })

  // Initialize validation
  const validation = useValidation({
    schema,
    formState,
  })

  // Initialize suggestions
  const suggestions = useSuggestions({
    schema,
    formState,
    onSuggest,
  })

  // Initialize background jobs
  const backgroundJob = useBackgroundJob({
    schema,
    formState,
    onJobProgress,
    onJobCancel,
    onBulkSuggest,
    pollInterval: backgroundJobs?.pollInterval || 2000,
    blocking: backgroundJobs?.blocking || false,
  })

  // Expose form state API via ref
  useImperativeHandle(formStateRef || ref, () => formState, [formState])

  // Effect: Auto-save
  useEffect(() => {
    if (!autoSave?.enabled || !onSaveDraft) {
      return
    }

    const interval = setInterval(() => {
      if (formState.isDirty) {
        const changes = formState.getChanges()
        onSaveDraft(formState.values, changes)
          .then(() => {
            formState.markClean()
          })
          .catch(error => {
            console.error('Auto-save failed:', error)
          })
      }
    }, (autoSave.interval || 30) * 1000)

    return () => clearInterval(interval)
  }, [autoSave, onSaveDraft, formState])

  // Effect: Resume job on mount
  useEffect(() => {
    if (initialJobId && backgroundJob.resumeJob) {
      backgroundJob.resumeJob(initialJobId)
    }
  }, [initialJobId, backgroundJob])

  // Effect: Clear expired suggestions periodically
  useEffect(() => {
    const interval = setInterval(() => {
      suggestions.clearExpiredSuggestions()
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [suggestions])

  // Handler: Field value change
  const handleFieldChange = useCallback(async (fieldId: string, value: any) => {
    // Update value in state
    formState.setValue(fieldId, value, 'user')

    // Run validation
    const validationResult = await validation.validateFieldDebounced(fieldId)
    // TODO: Update validation state in formState

    // Trigger suggestion if configured
    await suggestions.handleFieldChange(fieldId, value)

    // Trigger dependent field validations
    await validation.validateDependentFields(fieldId)

    // Trigger dependent field suggestions
    await suggestions.triggerDependentSuggestions(fieldId)
  }, [formState, validation, suggestions])

  // Handler: Page navigation
  const handleNextPage = useCallback(async () => {
    // Validate current page
    const pageValidation = await validation.validatePage(currentPage.id)

    // Check for blocking errors
    let hasBlockingErrors = false
    pageValidation.forEach(result => {
      if (!result.valid && result.blocking) {
        hasBlockingErrors = true
      }
    })

    if (hasBlockingErrors) {
      return
    }

    // Navigate to next page
    if (currentPageIndex < schema.pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1)
      window.scrollTo(0, 0)
    }
  }, [currentPageIndex, schema.pages.length, currentPage, validation])

  const handlePrevPage = useCallback(() => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1)
      window.scrollTo(0, 0)
    }
  }, [currentPageIndex])

  // Handler: Form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const allValidation = await validation.validateAll()

    // Check for blocking errors
    let hasBlockingErrors = false
    allValidation.forEach(result => {
      if (!result.valid && result.blocking) {
        hasBlockingErrors = true
      }
    })

    if (hasBlockingErrors) {
      console.warn('Form has validation errors')
      return
    }

    // Run cross-field validation
    const crossFieldValidation = await validation.validateCrossField()
    if (crossFieldValidation.size > 0) {
      let hasCrossFieldErrors = false
      crossFieldValidation.forEach(result => {
        if (!result.valid && result.blocking) {
          hasCrossFieldErrors = true
        }
      })

      if (hasCrossFieldErrors) {
        console.warn('Form has cross-field validation errors')
        return
      }
    }

    // Submit form
    try {
      await onSubmit(formState.values)

      // Mark as submitted
      // formState.metadata.submittedAt = Date.now()
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }, [formState, validation, onSubmit])

  // Handler: Bulk file upload
  const handleBulkFileUpload = useCallback(async (files: File[]) => {
    if (!onBulkSuggest) {
      return
    }

    const jobId = await backgroundJob.startBulkSuggest(files)
    if (jobId) {
      console.log('Started bulk suggestion job:', jobId)
    }
  }, [onBulkSuggest, backgroundJob])

  // Render field (default implementation)
  const renderFieldDefault = useCallback((field: FormField, value: any) => {
    return (
      <div key={field.id} className="space-y-2">
        <label htmlFor={field.name} className="block text-sm font-medium">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {field.description && (
          <p className="text-sm text-muted-foreground">{field.description}</p>
        )}

        <input
          id={field.name}
          type="text"
          value={value || ''}
          onChange={(e) => handleFieldChange(field.name, e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />

        {/* Validation error */}
        {formState.errors[field.name] && (
          <p className="text-sm text-red-500">{formState.errors[field.name]}</p>
        )}

        {/* Suggestion indicator */}
        {formState.getSuggestionState(field.name)?.status === 'available' && (
          <div className="text-sm text-blue-500">
            💡 Suggestion available
          </div>
        )}
      </div>
    )
  }, [formState, handleFieldChange])

  // Render page (default implementation)
  const renderPageDefault = useCallback((page: FormPage, children: React.ReactNode) => {
    return (
      <div className="space-y-6">
        {page.title && (
          <h2 className="text-2xl font-bold">{page.title}</h2>
        )}
        {page.description && (
          <p className="text-muted-foreground">{page.description}</p>
        )}
        <div className="space-y-4">
          {children}
        </div>
      </div>
    )
  }, [])

  // Render progress (default implementation)
  const renderProgressDefault = useCallback((current: number, total: number, progress: number) => {
    return (
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {current} of {total}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    )
  }, [])

  // Check if we should show page
  const isPageVisible = useCallback((page: FormPage): boolean => {
    // TODO: Implement conditional page logic based on showIf
    return true
  }, [])

  // Render current page fields
  const renderFields = useCallback(() => {
    if (!currentPage) {
      return <div>No page defined</div>
    }

    return currentPage.fields.map(field => {
      // Check field conditional logic
      if (field.showIf) {
        if (typeof field.showIf === 'function') {
          if (!field.showIf(formState.values)) {
            return null
          }
        } else {
          // TODO: Implement conditional logic evaluation
        }
      }

      const value = formState.getValue(field.name)

      if (renderField) {
        return renderField(field, value, (newValue) => handleFieldChange(field.name, newValue))
      }

      return renderFieldDefault(field, value)
    })
  }, [currentPage, formState, renderField, renderFieldDefault, handleFieldChange])

  // Calculate progress
  const progress = ((currentPageIndex + 1) / schema.pages.length) * 100

  // Main render
  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Progress indicator */}
      {renderProgress
        ? renderProgress(currentPageIndex + 1, schema.pages.length, progress)
        : renderProgressDefault(currentPageIndex + 1, schema.pages.length, progress)
      }

      {/* Background job indicator */}
      {backgroundJob.jobInfo?.isActive && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Analyzing your files...</p>
              <p className="text-sm text-muted-foreground">
                {backgroundJob.jobInfo.fieldsCompleted} of{' '}
                {backgroundJob.jobInfo.fieldsCompleted + backgroundJob.jobInfo.fieldsPending} fields completed
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{Math.round(backgroundJob.jobInfo.progress * 100)}%</p>
              {backgroundJob.jobInfo.estimatedTimeRemaining && (
                <p className="text-xs text-muted-foreground">
                  ~{Math.round(backgroundJob.jobInfo.estimatedTimeRemaining / 60)}m remaining
                </p>
              )}
            </div>
          </div>
          <div className="mt-2">
            <button
              type="button"
              onClick={() => backgroundJob.jobInfo && backgroundJob.cancelJob(backgroundJob.jobInfo.jobId)}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {renderPage
          ? renderPage(currentPage, renderFields())
          : renderPageDefault(currentPage, renderFields())
        }

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPageIndex === 0}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>

          {currentPageIndex < schema.pages.length - 1 ? (
            <button
              type="button"
              onClick={handleNextPage}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Submit
            </button>
          )}
        </div>
      </form>

      {/* Debug info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-md text-xs">
          <p><strong>Dirty:</strong> {formState.isDirty ? 'Yes' : 'No'}</p>
          <p><strong>Valid:</strong> {formState.isValid ? 'Yes' : 'No'}</p>
          <p><strong>Suggestions:</strong> {formState.getSuggestionCount()}</p>
          <p><strong>Can Undo:</strong> {formState.canUndo ? 'Yes' : 'No'}</p>
          <p><strong>Can Redo:</strong> {formState.canRedo ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  )
})

Renderer.displayName = 'Renderer'
