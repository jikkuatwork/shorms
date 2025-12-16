/**
 * Build and Preview Example
 *
 * Demonstrates how to toggle between building a form and previewing it.
 * This is useful for creating a full form creation workflow.
 */

'use client'

import {
  ShadcnBuilder,
  ShadcnRenderer,
  useBuilderState,
  type FormPage
} from 'shorms'
import { useState } from 'react'

type Mode = 'build' | 'preview'

export default function BuildAndPreviewExample() {
  const builder = useBuilderState()
  const [mode, setMode] = useState<Mode>('build')
  const [submittedData, setSubmittedData] = useState<Record<string, any> | null>(null)

  const handleSubmit = (data: Record<string, any>) => {
    console.log('Form submitted:', data)
    setSubmittedData(data)
  }

  const handleExportJSON = () => {
    const schema = {
      version: '1.0',
      pages: builder.pages,
      metadata: {
        createdAt: new Date().toISOString(),
        totalPages: builder.pages.length,
        totalFields: builder.pages.reduce((acc, page) => acc + page.fields.length, 0)
      }
    }

    const json = JSON.stringify(schema, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `form-schema-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const hasFields = builder.pages.some(page => page.fields.length > 0)

  // Show submission results
  if (submittedData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Form Submitted!</h2>
            <p className="text-gray-600 mt-2">Here's what was submitted:</p>
          </div>

          <div className="border-t pt-6">
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm max-h-96">
              {JSON.stringify(submittedData, null, 2)}
            </pre>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={() => {
                setSubmittedData(null)
                setMode('build')
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Builder
            </button>
            <button
              onClick={() => setSubmittedData(null)}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">
            {mode === 'build' ? 'Build Your Form' : 'Preview Form'}
          </h1>
          <p className="text-sm text-gray-600">
            {mode === 'build'
              ? 'Create and customize your form'
              : 'Test how your form will look and behave'}
          </p>
        </div>

        <div className="flex gap-2">
          {/* Mode toggle */}
          <div className="flex border rounded overflow-hidden">
            <button
              onClick={() => setMode('build')}
              className={`px-4 py-2 ${
                mode === 'build'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Build
            </button>
            <button
              onClick={() => setMode('preview')}
              disabled={!hasFields}
              className={`px-4 py-2 ${
                mode === 'preview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Preview
            </button>
          </div>

          {/* Export button */}
          <button
            onClick={handleExportJSON}
            disabled={!hasFields}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Export JSON
          </button>
        </div>
      </div>

      {/* Mode-specific content */}
      {mode === 'build' ? (
        <>
          {/* Build mode info */}
          <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-sm text-blue-800">
            <strong>Build Mode:</strong> Add fields, configure validation, and organize pages.
            Click "Preview" to test your form.
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
        </>
      ) : (
        <>
          {/* Preview mode info */}
          <div className="bg-green-50 border-b border-green-200 px-4 py-2 text-sm text-green-800">
            <strong>Preview Mode:</strong> This is how your form will appear to users.
            Fill it out to test validation and submission.
          </div>

          {/* Renderer */}
          <div className="flex-1 overflow-auto bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <ShadcnRenderer
                  pages={builder.pages}
                  onSubmit={handleSubmit}
                  submitButtonText="Submit Form"
                  showPageNavigation={builder.pages.length > 1}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Footer stats */}
      <div className="border-t px-4 py-2 bg-gray-50 text-sm text-gray-600 flex justify-between">
        <div>
          <strong>Pages:</strong> {builder.pages.length} |{' '}
          <strong>Total Fields:</strong>{' '}
          {builder.pages.reduce((acc, page) => acc + page.fields.length, 0)}
        </div>
        <div>
          {mode === 'build' ? (
            <span>💡 Tip: Add fields from the sidebar and preview to test</span>
          ) : (
            <span>🧪 Fill out the form to test validation</span>
          )}
        </div>
      </div>
    </div>
  )
}
