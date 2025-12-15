/**
 * Shorms - Local-first multi-page form builder
 *
 * This library provides type-safe form schema management with versioning,
 * validation, and rendering capabilities for React applications.
 *
 * @packageDocumentation
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Field types and form structure definitions
 */
export { FieldType } from './types/field'
export type { FormField } from './types/field'
export type { FormState, FormPage } from './types/form-store'

// Note: ShormsSchema is not available in legacy types
// Use the new Renderer types for the full schema with versioning

// ============================================================================
// Schema Versioning
// ============================================================================

/**
 * Schema versioning system for forward compatibility
 *
 * - validateSchema: Validate schema structure and field types
 * - migrateSchema: Migrate schemas between versions
 * - isSupportedFieldType: Check if field type is supported
 * - getUnsupportedFields: Find unsupported fields in schema
 */
export {
  SCHEMA_VERSION,
  SUPPORTED_VERSIONS,
  SUPPORTED_FIELD_TYPES,
  validateSchema,
  isSupportedFieldType,
  getUnsupportedFields,
  migrateSchema,
  ensureVersion,
  type ValidationResult
} from './lib/versioning'

// ============================================================================
// Schema Generation
// ============================================================================

/**
 * Zod schema generation utilities
 *
 * - generateZodSchema: Generate Zod validation schema from form fields
 * - generateDefaultValues: Generate default values for form fields
 * - getZodSchemaString: Get string representation of Zod schema
 */
export {
  generateZodSchema,
  generateDefaultValues,
  getZodSchemaString
} from './lib/form-schema'

// ============================================================================
// React Components
// ============================================================================

/**
 * Shorms Renderer - Form rendering component with validation and suggestions
 *
 * Note: The Renderer uses a new API design (v3.1.0) with extensible field types
 * and advanced features like state management, suggestions, and background jobs.
 *
 * For the new API types, import from '@/components/shorms/renderer' or see API_DESIGN.md
 */
export { Renderer } from './components/shorms/renderer'
export type {
  // Note: These types from the new renderer may conflict with legacy types above
  // Use qualified imports if needed: import type { FormField as RendererFormField } from '@/components/shorms/renderer'
  RendererProps,
  FormStateAPI,
  FieldSuggestionState,
  BulkSuggestResponse,
  BackgroundJob,
} from './components/shorms/renderer'

/**
 * Planned additional exports:
 * - Builder: Interactive form builder component (extracted from FormEditor)
 * - Viewer: Read-only form viewer component
 */
