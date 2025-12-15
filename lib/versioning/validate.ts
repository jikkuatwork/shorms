import type { ShormsSchema } from "@/types/schema"
import { SUPPORTED_FIELD_TYPES, SUPPORTED_VERSIONS } from "./constants"

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  unknownFieldTypes: string[]
}

export function validateSchema(schema: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const unknownTypes = new Set<string>()

  // Check version
  if (!schema.version) {
    warnings.push("Schema has no version field, assuming 1.0")
  } else if (!SUPPORTED_VERSIONS.includes(schema.version)) {
    warnings.push(`Schema version ${schema.version} may not be fully supported`)
  }

  // Check pages exist
  if (!schema.pages || !Array.isArray(schema.pages)) {
    errors.push("Schema must have a 'pages' array")
    return { valid: false, errors, warnings, unknownFieldTypes: [] }
  }

  // Check for unknown field types
  schema.pages.forEach((page: any, pageIndex: number) => {
    if (!page.fields || !Array.isArray(page.fields)) {
      errors.push(`Page ${pageIndex} has no fields array`)
      return
    }

    page.fields.forEach((field: any, fieldIndex: number) => {
      if (!field.type) {
        errors.push(`Field ${fieldIndex} on page ${pageIndex} has no type`)
      } else if (!SUPPORTED_FIELD_TYPES.includes(field.type)) {
        unknownTypes.add(field.type)
      }

      if (!field.name) {
        errors.push(`Field ${fieldIndex} on page ${pageIndex} has no name`)
      }
    })
  })

  if (unknownTypes.size > 0) {
    warnings.push(
      `Schema contains unsupported field types: ${Array.from(unknownTypes).join(", ")}`
    )
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    unknownFieldTypes: Array.from(unknownTypes)
  }
}

export function isSupportedFieldType(type: string): boolean {
  return SUPPORTED_FIELD_TYPES.includes(type as any)
}

export function getUnsupportedFields(schema: ShormsSchema): string[] {
  const unsupported: string[] = []

  schema.pages.forEach((page) => {
    page.fields.forEach((field) => {
      if (!isSupportedFieldType(field.type)) {
        unsupported.push(field.type)
      }
    })
  })

  return Array.from(new Set(unsupported))
}
