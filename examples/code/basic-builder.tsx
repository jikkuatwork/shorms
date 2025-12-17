/**
 * Basic Builder Example
 *
 * Shows the simplest way to set up a form builder with Shorms.
 * Uses the useBuilderState hook for state management.
 */

'use client'

import { Builder, useBuilderState } from '@/index'

export default function BasicBuilderExample() {
  // Initialize builder with default state
  const builder = useBuilderState()

  const handleSave = () => {
    // Get the current form pages
    const formData = {
      pages: builder.pages,
      metadata: {
        createdAt: new Date().toISOString(),
        totalPages: builder.pages.length,
        totalFields: builder.pages.reduce((acc, page) => acc + page.fields.length, 0)
      }
    }

    console.log('Form saved:', formData)
    alert('Form saved to console! Check the developer tools.')
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header with save button */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold">Form Builder</h1>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Form
        </button>
      </div>

      {/* Builder component */}
      <div className="flex-1">
        <Builder
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
