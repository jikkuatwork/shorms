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
export type { FormField, FormPage, ShormsSchema } from './types/field'
export type { FormState } from './types/form-store'

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
// React Components (Coming Soon)
// ============================================================================

/**
 * React components will be exported here after Next.js dependencies are removed
 * and components are extracted to framework-agnostic versions.
 *
 * Planned exports:
 * - FormBuilder: Interactive form builder component
 * - FormRenderer: Form rendering component
 * - FormViewer: Read-only form viewer component
 * - FieldCommandPalette: Command palette for field selection
 */
