/**
 * Load Schema Example
 *
 * Demonstrates how to import an existing JSON schema and load it into the builder.
 * This is useful when you want to edit pre-defined forms.
 */

'use client'

import { ShadcnBuilder, useBuilderState, type FormPage } from 'shorms'
import { useState } from 'react'

// Example: Import a contact form schema
import contactFormSchema from '../contact-form.json'

export default function LoadSchemaExample() {
  const builder = useBuilderState()
  const [loaded, setLoaded] = useState(false)

  const handleLoadContactForm = () => {
    // Load the contact form schema
    builder.setPages(contactFormSchema.pages as FormPage[])
    setLoaded(true)
    alert('Contact form loaded!')
  }

  const handleLoadFromFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const schema = JSON.parse(text)

      if (schema.pages && Array.isArray(schema.pages)) {
        builder.setPages(schema.pages)
        setLoaded(true)
        alert('Form loaded successfully!')
      } else {
        alert('Invalid schema format')
      }
    } catch (error) {
      alert('Failed to load schema')
      console.error(error)
    }
  }

  const handleExport = () => {
    const schema = {
      version: '1.0',
      pages: builder.pages
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

  return (
    <div className="h-screen flex flex-col">
      {/* Header with load/export buttons */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold">Load Schema Example</h1>
        <div className="flex gap-2">
          <button
            onClick={handleLoadContactForm}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Load Contact Form
          </button>
          <label className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer">
            Import JSON
            <input
              type="file"
              accept=".json"
              onChange={handleLoadFromFile}
              className="hidden"
            />
          </label>
          <button
            onClick={handleExport}
            disabled={!loaded && builder.pages.length === 0}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Export JSON
          </button>
        </div>
      </div>

      {/* Status */}
      {loaded && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3">
          Form loaded successfully! You can now edit it.
        </div>
      )}

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
