# Code Examples

This directory contains practical code examples showing how to use the Shorms library components in your React applications.

## Examples

1. **basic-builder.tsx** - Simple form builder with state management
2. **load-schema.tsx** - Import and use existing JSON schemas
3. **render-form.tsx** - Render a form with validation
4. **with-localstorage.tsx** - Persist forms to localStorage
5. **with-api.tsx** - Save and load forms from an API
6. **build-and-preview.tsx** - Toggle between building and previewing

## Running the Examples

These examples can be used in any Next.js or React application with the Shorms library installed.

### Installation

```bash
npm install github:jikkuatwork/shorms
```

### Usage

Copy any example file into your app and adjust the imports as needed:

```typescript
// For external projects using npm package
import { ShadcnBuilder, useBuilderState } from 'shorms'

// For this project (internal usage)
import { ShadcnBuilder, useBuilderState } from '@/components/shorms/builder'
```

## Example Descriptions

### 1. Basic Builder (basic-builder.tsx)

Shows the simplest way to set up a form builder:
- Using `useBuilderState` hook for state management
- Minimal configuration
- Save button to console log the form data

### 2. Load Schema (load-schema.tsx)

Demonstrates how to:
- Import an existing JSON schema
- Load it into the builder
- Modify and save it

### 3. Render Form (render-form.tsx)

Shows how to:
- Use ShadcnRenderer to display a form
- Handle form submission
- Display validation errors
- Navigate between pages

### 4. With LocalStorage (with-localstorage.tsx)

Demonstrates:
- Saving form state to localStorage on every change
- Loading saved state on mount
- Clear/reset functionality

### 5. With API (with-api.tsx)

Shows how to:
- Fetch form schema from an API endpoint
- Display loading states
- Save form changes back to API
- Handle errors

### 6. Build and Preview (build-and-preview.tsx)

Demonstrates:
- Toggle between edit and preview modes
- Use the same state for both Builder and Renderer
- Export JSON functionality

## TypeScript Support

All examples include full TypeScript types. Make sure your `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "jsx": "react-jsx"
  }
}
```

## Next Steps

- See [LIBRARY_USAGE.md](../../LIBRARY_USAGE.md) for comprehensive documentation
- Check [BUILDER_API.md](../../koder/builder-design/BUILDER_API.md) for API reference
- Visit the live demos at `/using-library/builder-demo` and `/using-library/renderer-demo`
