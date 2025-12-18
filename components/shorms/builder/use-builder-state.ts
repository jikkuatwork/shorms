import { useCallback, useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import {
  AtSignIcon,
  CalendarIcon,
  ChevronsUpDownIcon,
  CircleDotIcon,
  HashIcon,
  SlidersHorizontalIcon,
  SquareCheckIcon,
  TextIcon,
  ToggleLeftIcon,
  TypeIcon,
  UploadIcon,
} from 'lucide-react'
import { FieldType, type FormField } from '@/types/field'
import type { FormPage } from './types'

// Map field types to their icons for hydration from localStorage
const fieldTypeToIcon: Record<string, typeof TypeIcon> = {
  [FieldType.INPUT]: TypeIcon,
  [FieldType.TEXTAREA]: TextIcon,
  [FieldType.NUMBER_INPUT]: HashIcon,
  [FieldType.EMAIL]: AtSignIcon,
  [FieldType.CHECKBOX]: SquareCheckIcon,
  [FieldType.SELECT]: ChevronsUpDownIcon,
  [FieldType.DATE]: CalendarIcon,
  [FieldType.RADIO_GROUP]: CircleDotIcon,
  [FieldType.SWITCH]: ToggleLeftIcon,
  [FieldType.COMBOBOX]: ChevronsUpDownIcon,
  [FieldType.SLIDER]: SlidersHorizontalIcon,
  [FieldType.FILE_UPLOAD]: UploadIcon,
}

const STORAGE_KEY = 'shorms-builder-state'

// Hydrate pages with Icon components after loading from localStorage
function hydratePages(pages: FormPage[]): FormPage[] {
  return pages.map(page => ({
    ...page,
    fields: page.fields.map(field => ({
      ...field,
      Icon: fieldTypeToIcon[field.type] || TypeIcon,
    })),
  }))
}

// Load pages from localStorage
function loadFromStorage(): FormPage[] | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return hydratePages(parsed)
    }
  } catch (e) {
    console.warn('Failed to load from localStorage:', e)
  }
  return null
}

// Save pages to localStorage (strips non-serializable Icon)
function saveToStorage(pages: FormPage[]) {
  if (typeof window === 'undefined') return
  try {
    // Strip Icon from fields before saving
    const toSave = pages.map(page => ({
      ...page,
      fields: page.fields.map(({ Icon, ...field }) => field),
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch (e) {
    console.warn('Failed to save to localStorage:', e)
  }
}

/**
 * Hook for managing Builder state
 * Provides a convenient way to manage form pages and fields without Zustand
 * Automatically persists to localStorage
 *
 * @param initialPages - Optional initial pages (defaults to single empty page)
 * @returns Builder state and operations
 */
export function useBuilderState(initialPages?: FormPage[]) {
  const [isHydrated, setIsHydrated] = useState(false)
  const [pages, setPages] = useState<FormPage[]>(
    initialPages || [
      {
        id: nanoid(),
        title: 'Page 1',
        fields: [],
      },
    ]
  )

  const [activePageId, setActivePageId] = useState(pages[0]?.id || '')

  // Load from localStorage after hydration to avoid mismatch
  useEffect(() => {
    const stored = loadFromStorage()
    if (stored && stored.length > 0) {
      setPages(stored)
      setActivePageId(stored[0].id)
    }
    setIsHydrated(true)
  }, [])

  // Persist to localStorage whenever pages change (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      saveToStorage(pages)
    }
  }, [pages, isHydrated])

  // ===== Page Operations =====

  const addPage = useCallback(() => {
    const newPage: FormPage = {
      id: nanoid(),
      title: `Page ${pages.length + 1}`,
      fields: [],
    }
    setPages([...pages, newPage])
    setActivePageId(newPage.id)
  }, [pages])

  const deletePage = useCallback(
    (pageId: string) => {
      if (pages.length === 1) {
        console.warn('Cannot delete the last page')
        return
      }

      const newPages = pages.filter((p) => p.id !== pageId)
      setPages(newPages)

      // If deleted page was active, switch to first page
      if (activePageId === pageId) {
        setActivePageId(newPages[0].id)
      }
    },
    [pages, activePageId]
  )

  const updatePageTitle = useCallback(
    (pageId: string, title: string) => {
      setPages(pages.map((p) => (p.id === pageId ? { ...p, title } : p)))
    },
    [pages]
  )

  const reorderPages = useCallback((newPages: FormPage[]) => {
    setPages(newPages)
  }, [])

  // ===== Field Operations =====

  const addField = useCallback(
    (field: FormField) => {
      setPages(
        pages.map((page) =>
          page.id === activePageId
            ? { ...page, fields: [...page.fields, field] }
            : page
        )
      )
    },
    [pages, activePageId]
  )

  const updateField = useCallback(
    (fieldId: string, updates: Partial<FormField>) => {
      setPages(
        pages.map((page): FormPage => ({
          ...page,
          fields: page.fields.map((f): FormField =>
            f.id === fieldId ? ({ ...f, ...updates } as FormField) : f
          ),
        }))
      )
    },
    [pages]
  )

  const deleteField = useCallback(
    (fieldId: string) => {
      setPages(
        pages.map((page) => ({
          ...page,
          fields: page.fields.filter((f) => f.id !== fieldId),
        }))
      )
    },
    [pages]
  )

  const reorderFields = useCallback(
    (pageId: string, newFields: FormField[]) => {
      setPages(
        pages.map((page) =>
          page.id === pageId ? { ...page, fields: newFields } : page
        )
      )
    },
    [pages]
  )

  // ===== Utility Methods =====

  const getActivePage = useCallback(() => {
    return pages.find((p) => p.id === activePageId) || pages[0]
  }, [pages, activePageId])

  const getActiveFields = useCallback(() => {
    return getActivePage()?.fields || []
  }, [getActivePage])

  const reset = useCallback((newPages?: FormPage[]) => {
    const resetPages = newPages || [
      {
        id: nanoid(),
        title: 'Page 1',
        fields: [],
      },
    ]
    setPages(resetPages)
    setActivePageId(resetPages[0].id)
  }, [])

  return {
    // State
    pages,
    activePageId,
    setPages,
    setActivePageId,

    // Page operations
    addPage,
    deletePage,
    updatePageTitle,
    reorderPages,

    // Field operations
    addField,
    updateField,
    deleteField,
    reorderFields,

    // Utility
    getActivePage,
    getActiveFields,
    reset,
  }
}
