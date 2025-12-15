/**
 * Shorms Renderer - Background Jobs Hook
 * Handles long-running jobs with progress tracking and cancellation
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  BackgroundJob,
  BulkSuggestResponse,
  FormStateAPI,
  ShormsSchema,
  SuggestionResult,
  FieldSuggestionState,
} from './types'

interface UseBackgroundJobOptions {
  schema: ShormsSchema
  formState: FormStateAPI
  onJobProgress?: (jobId: string) => Promise<BackgroundJob>
  onJobCancel?: (jobId: string) => Promise<void>
  onBulkSuggest?: (files: File[], schema: ShormsSchema, currentValues: any) => Promise<BulkSuggestResponse>
  pollInterval?: number  // milliseconds, default: 2000
  blocking?: boolean     // block form while processing
}

export function useBackgroundJob(options: UseBackgroundJobOptions) {
  const {
    schema,
    formState,
    onJobProgress,
    onJobCancel,
    onBulkSuggest,
    pollInterval = 2000,
    blocking = false,
  } = options

  const [currentJob, setCurrentJob] = useState<BackgroundJob | null>(null)
  const [isBlocking, setIsBlocking] = useState(false)

  // Refs
  const pollTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const processedUpdatesRef = useRef<Set<string>>(new Set())

  // Core: Start bulk suggestion job
  const startBulkSuggest = useCallback(async (files: File[]): Promise<string | null> => {
    if (!onBulkSuggest) {
      return null
    }

    try {
      const response = await onBulkSuggest(files, schema, formState.values)

      // Handle immediate results
      if (response.immediate) {
        Object.entries(response.immediate.suggestions).forEach(([fieldId, suggestion]) => {
          // Apply suggestion to form state
          const currentUserValue = formState.getValue(fieldId)
          const suggestionState: FieldSuggestionState = {
            userValue: currentUserValue,
            suggestedValue: suggestion.suggestedValue,
            originalSuggestedValue: suggestion.suggestedValue,
            activeValue: 'user',
            suggestedValueModified: false,
            status: 'available',
            confidence: suggestion.confidence || 0,
            reason: suggestion.reason || '',
            timestamp: Date.now(),
            source: suggestion.source,
          }
          // This would be set via formState internal API
        })

        return null
      }

      // Handle job-based results
      if (response.job) {
        const { jobId, affectedFields, estimatedDuration, estimatedFieldCount } = response.job

        // Mark affected fields as "expecting"
        affectedFields.forEach(fieldId => {
          const suggestionState: FieldSuggestionState = {
            userValue: formState.getValue(fieldId),
            suggestedValue: undefined,
            originalSuggestedValue: undefined,
            activeValue: 'user',
            suggestedValueModified: false,
            status: 'expecting',
            confidence: 0,
            reason: 'Loading...',
            timestamp: Date.now(),
          }
          // This would be set via formState internal API
        })

        // Initialize job
        const job: BackgroundJob = {
          jobId,
          status: 'queued',
          progress: 0,
          partialResults: {},
          fieldsCompleted: [],
          fieldsPending: affectedFields,
          startedAt: Date.now(),
          estimatedTimeRemaining: estimatedDuration,
        }

        setCurrentJob(job)

        // Start polling
        startPolling(jobId)

        // Block form if configured
        if (blocking) {
          setIsBlocking(true)
        }

        return jobId
      }

      return null
    } catch (error) {
      console.error('Error starting bulk suggest:', error)
      return null
    }
  }, [onBulkSuggest, schema, formState, blocking])

  // Core: Poll for job progress
  const pollJob = useCallback(async (jobId: string) => {
    if (!onJobProgress) {
      return
    }

    try {
      const job = await onJobProgress(jobId)
      setCurrentJob(job)

      // Process new updates
      if (job.newUpdates) {
        job.newUpdates.forEach(update => {
          const updateKey = `${jobId}:${update.fieldId}:${update.timestamp}`

          // Skip if already processed
          if (processedUpdatesRef.current.has(updateKey)) {
            return
          }

          // Mark field as loading
          const suggestionState: FieldSuggestionState = {
            userValue: formState.getValue(update.fieldId),
            suggestedValue: update.value,
            originalSuggestedValue: update.value,
            activeValue: 'user',
            suggestedValueModified: false,
            status: 'available',
            confidence: update.confidence,
            reason: '',
            timestamp: update.timestamp,
          }
          // This would be set via formState internal API

          processedUpdatesRef.current.add(updateKey)
        })
      }

      // Update field states based on job progress
      job.fieldsCompleted.forEach(fieldId => {
        const value = job.partialResults[fieldId]
        if (value !== undefined) {
          // Update suggestion state to available
          const currentSuggestion = formState.getSuggestionState(fieldId)
          if (currentSuggestion && currentSuggestion.status === 'expecting') {
            const updatedState: FieldSuggestionState = {
              ...currentSuggestion,
              suggestedValue: value,
              originalSuggestedValue: value,
              status: 'available',
            }
            // This would be set via formState internal API
          }
        }
      })

      // Check if job is complete
      if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
        stopPolling()
        setIsBlocking(false)

        // Clear processed updates
        processedUpdatesRef.current.clear()

        // Mark any remaining expecting fields as available or failed
        job.fieldsPending.forEach(fieldId => {
          const currentSuggestion = formState.getSuggestionState(fieldId)
          if (currentSuggestion && currentSuggestion.status === 'expecting') {
            const updatedState: FieldSuggestionState = {
              ...currentSuggestion,
              status: job.status === 'failed' ? 'none' : 'available',
              error: job.errors?.[fieldId],
            }
            // This would be set via formState internal API
          }
        })
      }
    } catch (error) {
      console.error('Error polling job:', error)
      stopPolling()
      setIsBlocking(false)
    }
  }, [onJobProgress, formState])

  // Core: Start polling
  const startPolling = useCallback((jobId: string) => {
    // Clear existing timer
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current)
    }

    // Start new polling interval
    pollTimerRef.current = setInterval(() => {
      pollJob(jobId)
    }, pollInterval)

    // Poll immediately
    pollJob(jobId)
  }, [pollJob, pollInterval])

  // Core: Stop polling
  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current)
      pollTimerRef.current = undefined
    }
  }, [])

  // Core: Cancel job
  const cancelJob = useCallback(async (jobId: string) => {
    if (!onJobCancel) {
      console.warn('onJobCancel not provided')
      return
    }

    try {
      await onJobCancel(jobId)

      // Update job status
      setCurrentJob(prev => {
        if (prev && prev.jobId === jobId) {
          return {
            ...prev,
            status: 'cancelled',
          }
        }
        return prev
      })

      stopPolling()
      setIsBlocking(false)

      // Clear all expecting/loading fields
      if (currentJob) {
        [...currentJob.fieldsCompleted, ...currentJob.fieldsPending].forEach(fieldId => {
          const suggestion = formState.getSuggestionState(fieldId)
          if (suggestion && (suggestion.status === 'expecting' || suggestion.status === 'loading')) {
            const updatedState: FieldSuggestionState = {
              ...suggestion,
              status: 'none',
            }
            // This would be set via formState internal API
          }
        })
      }
    } catch (error) {
      console.error('Error cancelling job:', error)
    }
  }, [onJobCancel, currentJob, formState, stopPolling])

  // Core: Resume job (from saved state)
  const resumeJob = useCallback(async (jobId: string) => {
    if (!onJobProgress) {
      console.warn('onJobProgress not provided, cannot resume job')
      return
    }

    try {
      const job = await onJobProgress(jobId)
      setCurrentJob(job)

      // If job is still active, start polling
      if (job.status === 'queued' || job.status === 'processing') {
        startPolling(jobId)

        if (blocking) {
          setIsBlocking(true)
        }
      }
    } catch (error) {
      console.error('Error resuming job:', error)
    }
  }, [onJobProgress, startPolling, blocking])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [stopPolling])

  // Computed: Job progress info
  const jobInfo = currentJob ? {
    jobId: currentJob.jobId,
    status: currentJob.status,
    progress: currentJob.progress,
    fieldsCompleted: currentJob.fieldsCompleted.length,
    fieldsPending: currentJob.fieldsPending.length,
    estimatedTimeRemaining: currentJob.estimatedTimeRemaining,
    isActive: currentJob.status === 'queued' || currentJob.status === 'processing',
  } : null

  return {
    currentJob,
    jobInfo,
    isBlocking,
    startBulkSuggest,
    cancelJob,
    resumeJob,
  }
}
