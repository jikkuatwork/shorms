# Shorms Library Usage Guide

**Version:** 0.3.0
**Last Updated:** 2025-12-17

This guide covers how to use the Shorms library components (Builder, Renderer, and utilities) in your React applications.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Components](#components)
  - [Builder](#builder-component)
  - [Renderer](#renderer-component)
- [Common Patterns](#common-patterns)
- [TypeScript Types](#typescript-types)
- [Migration Guide](#migration-guide)
- [Examples](#examples)
- [API Reference](#api-reference)

---

## Installation

### As a Git Dependency

```bash
npm install github:jikkuatwork/shorms
# or with specific commit/branch
npm install github:jikkuatwork/shorms#main
```

### As an npm Package (Future)

Once published to npm:

```bash
npm install shorms
# or
yarn add shorms
```

**Peer Dependencies:**
```json
{
  "react": "^19.0.0",
  "react-hook-form": "^7.0.0",
  "zod": "^4.0.0",
  "@dnd-kit/core": "^6.0.0",
  "@dnd-kit/sortable": "^8.0.0"
}
```

### Using in This Project

The library components are already available:

```typescript
import { Builder, useBuilderState } from '@/components/shorms/builder'
import { Renderer } from '@/components/shorms/shadcn-renderer'
```

---

## Quick Start

### Builder Component

Create a form builder with drag-and-drop and page management:

```typescript
'use client'

import { Builder, useBuilderState } from 'shorms'

export default function MyFormBuilder() {
  const builder = useBuilderState()

  const handleSave = () => {
    console.log('Form pages:', builder.pages)
    // Save to API, localStorage, etc.
  }

  return (
    <div className="h-screen">
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
      />
      <button onClick={handleSave}>Save Form</button>
    </div>
  )
}
```

### Renderer Component

Render a form with validation and multi-page support:

```typescript
'use client'

import { Renderer } from 'shorms'

export default function MyFormRenderer() {
  const handleSubmit = (data: Record<string, any>) => {
    console.log('Form submitted:', data)
    // Send to API
  }

  return (
    <Renderer
      pages={formPages}
      onSubmit={handleSubmit}
      submitButtonText="Submit Form"
    />
  )
}
```

### Schema Validation and Generation

```typescript
import {
  validateSchema,
  generateZodSchema,
  FieldType,
  type ShormsSchema
} from 'shorms'

// Validate a schema
const schema: ShormsSchema = {
  version: '1.0',
  pages: [
    {
      id: 'page1',
      title: 'Contact',
      fields: [
        {
          type: 'EMAIL',
          name: 'email',
          label: 'Email',
          validation: { required: true }
        }
      ]
    }
  ]
}

const result = validateSchema(schema)
if (result.valid) {
  console.log('Valid schema!')
}

// Generate Zod schema from fields
const zodSchema = generateZodSchema(schema.pages[0].fields)
```

---

## Components

### Builder Component

The Builder component provides a complete form editing interface with:
- Drag-and-drop field reordering
- Multi-page support with page management
- Field library sidebar
- Form statistics
- Fully controlled state (no global state required)

#### Basic Usage

```typescript
import { Builder, useBuilderState } from 'shorms'

function MyBuilder() {
  const builder = useBuilderState()

  return (
    <Builder
      // Required: State
      pages={builder.pages}
      activePageId={builder.activePageId}

      // Required: State updates
      onPagesChange={builder.setPages}
      onActivePageChange={builder.setActivePageId}

      // Optional: Operations
      onPageAdd={builder.addPage}
      onPageDelete={builder.deletePage}
      onPageRename={builder.updatePageTitle}
      onFieldAdd={builder.addField}
      onFieldUpdate={builder.updateField}
      onFieldDelete={builder.deleteField}
      onFieldReorder={builder.reorderFields}

      // Optional: UI configuration
      width="lg"
      showFieldLibrary={true}
      showFormContext={true}
    />
  )
}
```

#### Using Builder Wrapper

The `Builder` component includes shadcn/ui styling and preset configurations:

```typescript
import { Builder, useBuilderState } from 'shorms'

function MyBuilder() {
  const builder = useBuilderState()

  return (
    <Builder
      {...builder}
      width="full"
    />
  )
}
```

#### Builder Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `pages` | `FormPage[]` | ✅ | Array of form pages |
| `activePageId` | `string` | ✅ | Currently active page ID |
| `onPagesChange` | `(pages: FormPage[]) => void` | ✅ | Callback when pages change |
| `onActivePageChange` | `(pageId: string) => void` | ✅ | Callback when active page changes |
| `onPageAdd` | `() => void` | ❌ | Callback when adding a page |
| `onPageDelete` | `(pageId: string) => void` | ❌ | Callback when deleting a page |
| `onPageRename` | `(pageId: string, title: string) => void` | ❌ | Callback when renaming a page |
| `onFieldAdd` | `(field: FormField) => void` | ❌ | Callback when adding a field |
| `onFieldUpdate` | `(fieldId: string, updates: Partial<FormField>) => void` | ❌ | Callback when updating a field |
| `onFieldDelete` | `(fieldId: string) => void` | ❌ | Callback when deleting a field |
| `onFieldReorder` | `(pageId: string, fields: FormField[]) => void` | ❌ | Callback when reordering fields |
| `width` | `"sm" \| "md" \| "lg" \| "xl" \| "full"` | ❌ | Builder width |
| `showFieldLibrary` | `boolean` | ❌ | Show field library sidebar |
| `showFormContext` | `boolean` | ❌ | Show form context sidebar |

---

### Renderer Component

The Renderer component displays forms with validation and multi-page support.

#### Basic Usage

```typescript
import { Renderer } from 'shorms'

function MyFormRenderer() {
  const handleSubmit = (data: Record<string, any>) => {
    console.log('Form data:', data)
  }

  return (
    <Renderer
      pages={formPages}
      onSubmit={handleSubmit}
    />
  )
}
```

#### Using Renderer Wrapper

```typescript
import { Renderer } from 'shorms'

function MyFormRenderer() {
  const handleSubmit = (data: Record<string, any>) => {
    console.log('Form data:', data)
  }

  return (
    <Renderer
      pages={formPages}
      onSubmit={handleSubmit}
      submitButtonText="Submit"
      showPageNavigation={true}
    />
  )
}
```

#### Renderer Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `pages` | `FormPage[]` | ✅ | Array of form pages to render |
| `onSubmit` | `(data: Record<string, any>) => void` | ✅ | Callback when form is submitted |
| `submitButtonText` | `string` | ❌ | Text for submit button (default: "Submit") |
| `showPageNavigation` | `boolean` | ❌ | Show page navigation (default: true for multi-page) |
| `onPageChange` | `(pageIndex: number) => void` | ❌ | Callback when page changes |

---

## Common Patterns

### Pattern 1: Saving to localStorage

```typescript
import { Builder, useBuilderState } from 'shorms'
import { useEffect } from 'react'

function MyBuilder() {
  const builder = useBuilderState()

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('my-form')
    if (saved) {
      builder.setPages(JSON.parse(saved))
    }
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('my-form', JSON.stringify(builder.pages))
  }, [builder.pages])

  return <Builder {...builder} />
}
```

### Pattern 2: Loading from API

```typescript
import { Builder, useBuilderState } from 'shorms'
import { useEffect, useState } from 'react'

function MyBuilder() {
  const builder = useBuilderState()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadForm() {
      const response = await fetch('/api/forms/123')
      const data = await response.json()
      builder.setPages(data.pages)
      setLoading(false)
    }
    loadForm()
  }, [])

  if (loading) return <div>Loading...</div>

  return <Builder {...builder} />
}
```

### Pattern 3: Custom State Management with Zustand

```typescript
import { create } from 'zustand'
import { Builder, type FormPage } from 'shorms'

interface FormStore {
  pages: FormPage[]
  activePageId: string
  setPages: (pages: FormPage[]) => void
  setActivePageId: (id: string) => void
}

const useFormStore = create<FormStore>((set) => ({
  pages: [{ id: '1', title: 'Page 1', fields: [] }],
  activePageId: '1',
  setPages: (pages) => set({ pages }),
  setActivePageId: (id) => set({ activePageId: id }),
}))

function MyBuilder() {
  const store = useFormStore()

  return (
    <Builder
      pages={store.pages}
      activePageId={store.activePageId}
      onPagesChange={store.setPages}
      onActivePageChange={store.setActivePageId}
    />
  )
}
```

### Pattern 4: Building and Rendering

```typescript
import { Builder, Renderer, useBuilderState } from 'shorms'
import { useState } from 'react'

function MyApp() {
  const [mode, setMode] = useState<'build' | 'preview'>('build')
  const builder = useBuilderState()

  if (mode === 'build') {
    return (
      <div>
        <button onClick={() => setMode('preview')}>Preview</button>
        <Builder {...builder} />
      </div>
    )
  }

  return (
    <div>
      <button onClick={() => setMode('build')}>Edit</button>
      <Renderer
        pages={builder.pages}
        onSubmit={(data) => console.log('Submitted:', data)}
      />
    </div>
  )
}
```

### Pattern 5: Schema Conversion

```typescript
import { formPagesToSchema, schemaToFormPages, useBuilderState } from 'shorms'

function MyComponent() {
  const builder = useBuilderState()

  const exportSchema = () => {
    // Convert pages to ShormsSchema format
    const schema = formPagesToSchema(builder.pages)

    // Save or send schema
    const json = JSON.stringify(schema, null, 2)
    console.log(json)
  }

  const importSchema = async () => {
    // Load schema from somewhere
    const response = await fetch('/api/schema')
    const schema = await response.json()

    // Convert back to pages
    const pages = schemaToFormPages(schema)
    builder.setPages(pages)
  }

  return (
    <div>
      <button onClick={exportSchema}>Export</button>
      <button onClick={importSchema}>Import</button>
    </div>
  )
}
```

---

## TypeScript Types

### Core Types

```typescript
// Form page structure
interface FormPage {
  id: string
  title?: string
  fields: FormField[]
}

// Form field structure
interface FormField {
  id: string
  type: FieldType
  name: string
  label: string
  placeholder?: string
  description?: string
  validation?: FieldValidation
  options?: FieldOption[]
  config?: Record<string, any>
}

// Field types
enum FieldType {
  INPUT = 'INPUT',
  TEXTAREA = 'TEXTAREA',
  EMAIL = 'EMAIL',
  NUMBER_INPUT = 'NUMBER_INPUT',
  CHECKBOX = 'CHECKBOX',
  SELECT = 'SELECT',
  RADIO_GROUP = 'RADIO_GROUP',
  SLIDER = 'SLIDER',
  DATE_PICKER = 'DATE_PICKER',
  SWITCH = 'SWITCH',
  FILE_UPLOAD = 'FILE_UPLOAD',
  COMBOBOX = 'COMBOBOX',
}

// Field validation
interface FieldValidation {
  required?: boolean
  requiredMessage?: string
  pattern?: string
  patternMessage?: string
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  minMessage?: string
  maxMessage?: string
}

// Field option (for select, radio, etc.)
interface FieldOption {
  label: string
  value: string
}

// Schema with versioning
interface ShormsSchema {
  version: string
  pages: FormPage[]
}
```

### Builder Types

```typescript
// Builder state
interface BuilderState {
  pages: FormPage[]
  activePageId: string
  setPages: (pages: FormPage[]) => void
  setActivePageId: (id: string) => void
  addPage: () => void
  deletePage: (pageId: string) => void
  updatePageTitle: (pageId: string, title: string) => void
  reorderPages: (pages: FormPage[]) => void
  addField: (field: FormField) => void
  updateField: (fieldId: string, updates: Partial<FormField>) => void
  deleteField: (fieldId: string) => void
  reorderFields: (pageId: string, fields: FormField[]) => void
}

// Field template
interface FieldTemplate {
  type: FieldType
  name: string
  label: string
  description?: string
  Icon: React.ComponentType<{ className?: string }>
  defaultConfig?: Partial<FormField>
}
```

---

## Migration Guide

### From Zustand FormEditor to Library Builder

#### Before (Zustand-based)

```typescript
// app/page.tsx
import { FormEditor } from '@/components/form-editor'

export default function HomePage() {
  return <FormEditor width="full" />
}
```

The FormEditor component used Zustand store internally:
- State stored in `useFormStore()`
- No control over state from outside
- Difficult to integrate with other state management

#### After (Library-based)

```typescript
// app/page.tsx
'use client'

import { Builder, useBuilderState } from 'shorms'

export default function HomePage() {
  const builder = useBuilderState()

  return (
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
  )
}
```

Benefits:
- ✅ Full control over state
- ✅ No global state dependency
- ✅ Easy to persist to localStorage, API, etc.
- ✅ Can use with any state management library
- ✅ Better for testing

### Migration Steps

1. **Replace FormEditor import:**
   ```typescript
   // Before
   import { FormEditor } from '@/components/form-editor'

   // After
   import { Builder, useBuilderState } from 'shorms'
   ```

2. **Add state management:**
   ```typescript
   // Add this hook
   const builder = useBuilderState()
   ```

3. **Update component usage:**
   ```typescript
   // Before
   <FormEditor width="full" />

   // After
   <Builder {...builder} width="full" />
   ```

4. **Add persistence (if needed):**
   ```typescript
   // Load from localStorage
   useEffect(() => {
     const saved = localStorage.getItem('form-state')
     if (saved) {
       builder.setPages(JSON.parse(saved))
     }
   }, [])

   // Save to localStorage
   useEffect(() => {
     localStorage.setItem('form-state', JSON.stringify(builder.pages))
   }, [builder.pages])
   ```

---

## Examples

### Example 1: Simple Contact Form Builder

```typescript
'use client'

import { Builder, useBuilderState, FieldType } from 'shorms'
import { useEffect } from 'react'

export default function ContactFormBuilder() {
  const builder = useBuilderState()

  // Pre-populate with contact form fields
  useEffect(() => {
    builder.setPages([{
      id: '1',
      title: 'Contact Information',
      fields: [
        {
          id: '1',
          type: FieldType.INPUT,
          name: 'name',
          label: 'Full Name',
          validation: { required: true }
        },
        {
          id: '2',
          type: FieldType.EMAIL,
          name: 'email',
          label: 'Email Address',
          validation: { required: true }
        },
        {
          id: '3',
          type: FieldType.TEXTAREA,
          name: 'message',
          label: 'Message',
          validation: { required: true, minLength: 10 }
        }
      ]
    }])
  }, [])

  return <Builder {...builder} width="lg" />
}
```

### Example 2: Multi-Step Registration

```typescript
'use client'

import { Builder, useBuilderState, FieldType } from 'shorms'
import { useEffect } from 'react'

export default function RegistrationBuilder() {
  const builder = useBuilderState()

  useEffect(() => {
    builder.setPages([
      {
        id: '1',
        title: 'Account Details',
        fields: [
          {
            id: '1',
            type: FieldType.EMAIL,
            name: 'email',
            label: 'Email',
            validation: { required: true }
          },
          {
            id: '2',
            type: FieldType.INPUT,
            name: 'password',
            label: 'Password',
            validation: { required: true, minLength: 8 }
          }
        ]
      },
      {
        id: '2',
        title: 'Personal Information',
        fields: [
          {
            id: '3',
            type: FieldType.INPUT,
            name: 'firstName',
            label: 'First Name',
            validation: { required: true }
          },
          {
            id: '4',
            type: FieldType.INPUT,
            name: 'lastName',
            label: 'Last Name',
            validation: { required: true }
          }
        ]
      },
      {
        id: '3',
        title: 'Preferences',
        fields: [
          {
            id: '5',
            type: FieldType.CHECKBOX,
            name: 'newsletter',
            label: 'Subscribe to newsletter'
          }
        ]
      }
    ])
  }, [])

  return <Builder {...builder} width="full" />
}
```

### Example 3: Form with API Integration

```typescript
'use client'

import { Builder, useBuilderState } from 'shorms'
import { useState } from 'react'

export default function APIFormBuilder() {
  const builder = useBuilderState()
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages: builder.pages })
      })
      alert('Form saved successfully!')
    } catch (error) {
      alert('Failed to save form')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    const json = JSON.stringify(builder.pages, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'form-schema.json'
    a.click()
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex gap-2 p-4 border-b">
        <button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save to API'}
        </button>
        <button onClick={handleExport}>
          Export JSON
        </button>
      </div>
      <div className="flex-1">
        <Builder {...builder} width="full" />
      </div>
    </div>
  )
}
```

---

## API Reference

For detailed API documentation, see:
- [Builder API Design](koder/builder-design/BUILDER_API.md)
- [Renderer API Design](koder/renderer-design/API_DESIGN.md)

### Key Functions

#### `useBuilderState(initialPages?: FormPage[])`

Hook for managing builder state without Zustand.

**Returns:** `BuilderState` object with:
- `pages`: Current form pages
- `activePageId`: Currently active page
- `setPages()`: Update pages
- `setActivePageId()`: Change active page
- `addPage()`: Add a new page
- `deletePage()`: Delete a page
- `updatePageTitle()`: Rename a page
- `reorderPages()`: Reorder pages
- `addField()`: Add field to active page
- `updateField()`: Update field properties
- `deleteField()`: Delete a field
- `reorderFields()`: Reorder fields in a page

#### `formPagesToSchema(pages: FormPage[])`

Convert legacy FormPage[] format to ShormsSchema format.

#### `schemaToFormPages(schema: ShormsSchema)`

Convert ShormsSchema format to legacy FormPage[] format.

#### `validateSchema(schema: ShormsSchema)`

Validate a schema structure and field types.

**Returns:** `ValidationResult` with:
- `valid`: boolean
- `errors`: string[] (if invalid)

#### `generateZodSchema(fields: FormField[])`

Generate a Zod validation schema from form fields.

---

## Features

- ✅ **Builder Component** - Visual form builder with drag-and-drop
- ✅ **Renderer Component** - Multi-page form renderer with validation
- ✅ **Schema Versioning** - Forward-compatible schema validation
- ✅ **Zod v4** - Latest validation library
- ✅ **React 19** - Compatible with latest React
- ✅ **TypeScript** - Full type safety
- ✅ **12 Field Types** - INPUT, EMAIL, NUMBER, SELECT, CHECKBOX, etc.
- ✅ **Validation** - Required, min/max length/value, regex, file size
- ✅ **No Global State** - Fully controlled components

---

## Next Steps

- See [BUILDER_API.md](koder/builder-design/BUILDER_API.md) for complete Builder API reference
- Check `/using-library/builder-demo` for live Builder demo
- Check `/using-library/renderer-demo` for live Renderer demo
- Explore examples in `/examples` directory
- Review [CHANGELOG.md](CHANGELOG.md) for version history

---

**Questions or Issues?**

Open an issue on GitHub or check the documentation in `/koder` directory.
