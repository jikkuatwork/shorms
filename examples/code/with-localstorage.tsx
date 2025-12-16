/**
 * With LocalStorage Example
 *
 * Demonstrates how to persist form state to localStorage.
 * Form state is automatically saved on every change and loaded on mount.
 */

'use client'

import { ShadcnBuilder, useBuilderState, type FormPage } from 'shorms'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'shorms-builder-state'

export default function WithLocalStorageExample() {
  const builder = useBuilderState()
  const [isLoaded, setIsLoaded] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY)
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        if (parsed.pages && Array.isArray(parsed.pages)) {
          builder.setPages(parsed.pages)
          if (parsed.activePageId) {
            builder.setActivePageId(parsed.activePageId)
          }
          console.log('Loaded form from localStorage')
        }
      } catch (error) {
        console.error('Failed to parse saved state:', error)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage on every change
  useEffect(() => {
    if (!isLoaded) return // Don't save during initial load

    const state = {
      pages: builder.pages,
      activePageId: builder.activePageId,
      savedAt: new Date().toISOString()
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    setLastSaved(new Date())
    console.log('Saved to localStorage')
  }, [builder.pages, builder.activePageId, isLoaded])

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all form data?')) {
      localStorage.removeItem(STORAGE_KEY)
      builder.setPages([
        {
          id: '1',
          title: 'Page 1',
          fields: []
        }
      ])
      builder.setActivePageId('1')
      setLastSaved(null)
      alert('Form cleared!')
    }
  }

  const handleExport = () => {
    const state = localStorage.getItem(STORAGE_KEY)
    if (!state) {
      alert('No saved data to export')
      return
    }

    const blob = new Blob([state], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `form-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (data.pages && Array.isArray(data.pages)) {
        builder.setPages(data.pages)
        if (data.activePageId) {
          builder.setActivePageId(data.activePageId)
        }
        alert('Form imported successfully!')
      } else {
        alert('Invalid backup file')
      }
    } catch (error) {
      alert('Failed to import backup')
      console.error(error)
    }
  }

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">Form Builder with Auto-Save</h1>
          {lastSaved && (
            <p className="text-sm text-gray-600">
              Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <label className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer">
            Import Backup
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export Backup
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Auto-save indicator */}
      <div className="bg-green-50 border-b border-green-200 px-4 py-2 text-sm text-green-800">
        ✓ Auto-save enabled - All changes are automatically saved to localStorage
      </div>

      {/* Builder */}
      <div className="flex-1">
        <ShadcnBuilder
          pages={builder.pages}
          activePageId={builder.activePageId}
          onPagesChange={builder.setPages}
          onActivePageChange={builder.setActivePageId}
          onPageAdd={builder.addPage}
          onPageDelete={builder.deletePage}
          onPageRename={builder.updatePageTitle}
          onFieldAdd={builder.addField}
          onFieldUpdate={builder.updateField}
          onFieldDelete={builder.deleteField}
          onFieldReorder={builder.reorderFields}
          width="full"
        />
      </div>
    </div>
  )
}
