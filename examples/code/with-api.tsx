/**
 * With API Example
 *
 * Demonstrates how to load and save forms to a backend API.
 * Includes loading states, error handling, and save/publish operations.
 */

'use client'

import { ShadcnBuilder, useBuilderState, type FormPage } from 'shorms'
import { useEffect, useState } from 'react'

// Mock API endpoints (replace with your actual API)
const API_BASE = '/api/forms'

export default function WithAPIExample() {
  const builder = useBuilderState()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formId, setFormId] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  // Load form from API on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get('id')

    if (id) {
      loadForm(id)
    } else {
      setLoading(false)
    }
  }, [])

  // Track changes
  useEffect(() => {
    if (!loading) {
      setIsDirty(true)
    }
  }, [builder.pages, builder.activePageId])

  const loadForm = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/${id}`)

      if (!response.ok) {
        throw new Error('Failed to load form')
      }

      const data = await response.json()

      if (data.pages && Array.isArray(data.pages)) {
        builder.setPages(data.pages)
        if (data.activePageId) {
          builder.setActivePageId(data.activePageId)
        }
        setFormId(id)
        setIsDirty(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load form')
      console.error('Load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const payload = {
        pages: builder.pages,
        activePageId: builder.activePageId,
        metadata: {
          updatedAt: new Date().toISOString(),
          totalPages: builder.pages.length,
          totalFields: builder.pages.reduce((acc, page) => acc + page.fields.length, 0)
        }
      }

      const url = formId ? `${API_BASE}/${formId}` : API_BASE
      const method = formId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Failed to save form')
      }

      const data = await response.json()

      if (data.id && !formId) {
        setFormId(data.id)
        // Update URL without reload
        window.history.pushState({}, '', `?id=${data.id}`)
      }

      setIsDirty(false)
      alert('Form saved successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save form')
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!formId) {
      alert('Please save the form first')
      return
    }

    try {
      const response = await fetch(`${API_BASE}/${formId}/publish`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to publish form')
      }

      alert('Form published successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish form')
      console.error('Publish error:', err)
    }
  }

  const handleNew = () => {
    if (isDirty && !confirm('You have unsaved changes. Are you sure you want to create a new form?')) {
      return
    }

    builder.setPages([{ id: '1', title: 'Page 1', fields: [] }])
    builder.setActivePageId('1')
    setFormId(null)
    setIsDirty(false)
    window.history.pushState({}, '', window.location.pathname)
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">Form Builder with API</h1>
          <p className="text-sm text-gray-600">
            {formId ? `Editing form ${formId}` : 'New form'}
            {isDirty && <span className="text-orange-600 ml-2">• Unsaved changes</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleNew}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            New Form
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handlePublish}
            disabled={!formId || isDirty}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Publish
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3">
          <strong>Error:</strong> {error}
          <button
            onClick={() => setError(null)}
            className="float-right text-red-700 hover:text-red-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* API info */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-sm text-blue-800">
        <strong>API Integration:</strong> This example demonstrates loading and saving forms to an API.
        Forms are automatically tracked for changes.
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

/**
 * Example API Routes (Next.js App Router)
 *
 * Create these in your app/api/forms directory:
 *
 * // app/api/forms/route.ts - List and create forms
 * export async function GET() {
 *   // Return list of forms
 * }
 *
 * export async function POST(request: Request) {
 *   // Create new form
 *   const data = await request.json()
 *   // Save to database
 *   return NextResponse.json({ id: 'new-form-id', ...data })
 * }
 *
 * // app/api/forms/[id]/route.ts - Get and update form
 * export async function GET(
 *   request: Request,
 *   { params }: { params: { id: string } }
 * ) {
 *   // Load form from database
 *   return NextResponse.json(formData)
 * }
 *
 * export async function PUT(
 *   request: Request,
 *   { params }: { params: { id: string } }
 * ) {
 *   // Update form in database
 *   const data = await request.json()
 *   return NextResponse.json({ success: true })
 * }
 *
 * // app/api/forms/[id]/publish/route.ts - Publish form
 * export async function POST(
 *   request: Request,
 *   { params }: { params: { id: string } }
 * ) {
 *   // Mark form as published
 *   return NextResponse.json({ success: true })
 * }
 */
