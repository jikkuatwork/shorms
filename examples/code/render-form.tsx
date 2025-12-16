/**
 * Render Form Example
 *
 * Demonstrates how to render a form with the ShadcnRenderer component.
 * Includes handling form submission and displaying results.
 */

'use client'

import { ShadcnRenderer, type FormPage } from 'shorms'
import { useState } from 'react'

// Example: Import a feedback survey schema
import feedbackSurvey from '../feedback-survey.json'

export default function RenderFormExample() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState<Record<string, any> | null>(null)

  const handleSubmit = (data: Record<string, any>) => {
    console.log('Form submitted:', data)
    setFormData(data)
    setSubmitted(true)
  }

  const handleReset = () => {
    setSubmitted(false)
    setFormData(null)
  }

  if (submitted && formData) {
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
            <h2 className="text-2xl font-bold text-gray-900">Thank You!</h2>
            <p className="text-gray-600 mt-2">Your form has been submitted successfully.</p>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-4">Submitted Data:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>

          <button
            onClick={handleReset}
            className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Customer Feedback Survey</h1>
          <p className="text-gray-600 mt-2">Please share your experience with us</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <ShadcnRenderer
            pages={feedbackSurvey.pages as FormPage[]}
            onSubmit={handleSubmit}
            submitButtonText="Submit Feedback"
            showPageNavigation={true}
          />
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          This form demonstrates multi-page navigation, validation, and submission handling.
        </div>
      </div>
    </div>
  )
}
