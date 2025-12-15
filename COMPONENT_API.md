# Component API Documentation

This document describes the API for Shorms components. These components are currently part of the Next.js application and will be extracted to framework-agnostic versions in a future release.

## FormEditor

The main form builder component that provides an interactive interface for creating and editing forms.

### Props

```typescript
interface FormEditorProps {
  /**
   * Width configuration for the form editor
   * - "sm": 672px (max-w-2xl) - ⚠️ Not recommended: field controls may overflow
   * - "md": 768px (max-w-3xl) - ✅ Recommended minimum
   * - "lg": 1024px (max-w-5xl) - default
   * - "xl": 1280px (max-w-7xl)
   * - "full": 100% width (max-w-full)
   * - number: Custom pixel width
   */
  width?: "sm" | "md" | "lg" | "xl" | "full" | number

  /**
   * Additional CSS classes to apply to the root element
   */
  className?: string
}
```

### Width Recommendations

**Use MD or larger for best experience.** The SM size (672px) is available but not recommended because:
- Field control buttons (edit, delete, reorder) are positioned outside the form area
- These buttons may overflow the container at narrow widths
- MD (768px) provides adequate space for all controls

**Sidebar visibility by width:**
- SM/MD: Command palette only (no sidebars)
- LG: Left sidebar (field library)
- XL: Left sidebar only
- Full: Both sidebars (field library + form overview)

### Usage

```tsx
import { FormEditor } from '@/components/form-editor'

function App() {
  return (
    <FormEditor
      width="lg"
      className="rounded-lg border shadow-sm"
    />
  )
}
```

### Features

- **Drag-and-drop field ordering**: Reorder fields by dragging
- **Multi-page support**: Create wizard-style forms with multiple pages
- **Responsive sidebars**: Smart layout that adapts to available space
  - **< 1024px**: Command palette only (mobile-friendly)
  - **1024px - 1536px (lg)**: Left sidebar with field library
  - **> 1536px (2xl)**: Both sidebars (field library + form overview)
- **Command palette**: Quick field addition with ⌘K shortcut (when sidebars are hidden)
- **Real-time validation**: Live form validation with Zod
- **Local storage**: Automatic persistence of form state

## FieldCommandPalette

A searchable command palette for quickly adding fields to the form. Automatically hidden on larger screens when the persistent sidebar is visible.

### Props

```typescript
// No external props - component manages its own state
```

### Usage

```tsx
import { FieldCommandPalette } from '@/components/field-command-palette'

function Toolbar() {
  return (
    <div>
      <FieldCommandPalette />
    </div>
  )
}
```

### Features

- **Keyboard shortcut**: Open with ⌘K (Cmd+K on Mac, Ctrl+K on Windows/Linux)
- **Search functionality**: Filter fields by name
- **Field descriptions**: Shows descriptions for each field type
- **Icon previews**: Visual icons for each field type
- **Responsive visibility**: Hidden on lg+ screens when sidebar is visible

## FieldLibrarySidebar

A persistent sidebar showing all available field types, organized by category. Visible on screens ≥1024px.

### Props

```typescript
// No external props - component manages its own state
```

### Features

- **Categorized fields**: Organized into logical groups (Text Input, Numbers & Dates, Selection, etc.)
- **Search functionality**: Real-time filtering by field name or description
- **Visual field cards**: Each field shows icon, name, and description
- **One-click addition**: Click any field to add it to the form
- **Responsive**: Automatically shown/hidden based on screen size

## FormContextSidebar

A context-aware sidebar showing form statistics and current page information. Visible on screens ≥1536px.

### Props

```typescript
// No external props - uses global form store
```

### Features

- **Form statistics**: Total pages, fields, required fields, validation rules
- **Current page info**: Shows fields on the active page
- **Quick tips**: Helpful keyboard shortcuts and usage tips
- **Live updates**: Automatically reflects changes to the form

## Field Component

Renders individual form fields based on their type.

### Props

```typescript
interface FieldProps {
  /**
   * The form field configuration
   */
  formField: FormField
}
```

### Supported Field Types

- `INPUT`: Single-line text input
- `TEXTAREA`: Multi-line text input
- `EMAIL`: Email input with validation
- `NUMBER_INPUT`: Numeric input
- `SELECT`: Dropdown select
- `RADIO_GROUP`: Radio button group
- `CHECKBOX`: Single checkbox
- `SWITCH`: Toggle switch
- `COMBOBOX`: Searchable select
- `SLIDER`: Range slider
- `DATE`: Date picker
- `FILE_UPLOAD`: File upload

## EditFormField

A modal dialog for editing field properties (label, description, validation rules, etc.).

### Props

```typescript
// No external props - uses global form store
```

### Features

- **Field configuration**: Edit label, description, placeholder
- **Validation rules**: Configure required, min/max, patterns
- **Options management**: Add/edit options for select, radio, checkbox groups
- **Delete field**: Remove field from form

## Store Integration

All components use Zustand for state management via `@/stores/form`. The store provides:

```typescript
interface FormState {
  pages: FormPage[]
  activePageId: string
  addFormField: (field: FormField) => void
  updateFormField: (id: string, updates: Partial<FormField>) => void
  deleteFormField: (id: string) => void
  addPage: () => void
  deletePage: (id: string) => void
  updatePageTitle: (id: string, title: string) => void
  setActivePage: (id: string) => void
  // ... more methods
}
```

## Future Plans

After Next.js dependencies are removed, these components will be:

1. **Extracted** to framework-agnostic versions
2. **Exported** from the main library entry point
3. **Documented** with full API reference and examples
4. **Tested** with comprehensive integration tests

The goal is to provide three main components:

- **FormBuilder**: Interactive form builder (current FormEditor)
- **FormRenderer**: Form rendering component
- **FormViewer**: Read-only form viewer
