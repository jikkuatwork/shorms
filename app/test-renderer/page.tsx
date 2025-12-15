'use client'

/**
 * Test page for the new Shorms Renderer
 * This is a minimal test to verify the Renderer component works
 */

import { Renderer } from '@/components/shorms/renderer'
import type { ShormsSchema } from '@/components/shorms/renderer'

export default function TestRendererPage() {
  // Simple test schema
  const testSchema: ShormsSchema = {
    version: '3.1.0',
    pages: [
      {
        id: 'page1',
        title: 'Basic Information',
        description: 'Testing the new Shorms Renderer',
        fields: [
          {
            id: 'name',
            type: 'text',
            name: 'name',
            label: 'Your Name',
            required: true,
            validation: {
              minLength: 2,
              maxLength: 50,
            },
          },
          {
            id: 'email',
            type: 'email',
            name: 'email',
            label: 'Email Address',
            required: true,
            validation: {
              email: true,
            },
          },
          {
            id: 'age',
            type: 'number',
            name: 'age',
            label: 'Age',
            validation: {
              min: 18,
              max: 120,
            },
          },
        ],
      },
      {
        id: 'page2',
        title: 'Additional Details',
        fields: [
          {
            id: 'bio',
            type: 'textarea',
            name: 'bio',
            label: 'Tell us about yourself',
            description: 'Write a short bio',
            validation: {
              maxLength: 500,
            },
          },
        ],
      },
    ],
  }

  const handleSubmit = (values: any) => {
    console.log('Form submitted:', values)
    alert('Form submitted! Check console for values.')
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Shorms Renderer Test</h1>
        <p className="text-muted-foreground">
          Testing the new Renderer component with basic fields
        </p>
      </div>

      <Renderer
        schema={testSchema}
        onSubmit={handleSubmit}
        features={{
          stateManagement: true,
        }}
      />

      <div className="mt-8 p-4 bg-gray-100 rounded-md">
        <h2 className="font-semibold mb-2">Test Instructions:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Fill in the form fields</li>
          <li>Try leaving required fields empty</li>
          <li>Try entering invalid email</li>
          <li>Try entering age outside range (18-120)</li>
          <li>Navigate between pages</li>
          <li>Submit the form</li>
        </ul>
      </div>
    </div>
  )
}
