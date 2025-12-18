/**
 * Schema Adapter - Convert between legacy FormPage[] and new ShormsSchema
 * This allows gradual migration from old to new renderer
 */

import { nanoid } from 'nanoid'
import type { FormPage } from '@/types/form-store'
import type { ShormsSchema } from '@/components/shorms/renderer/types'

/**
 * Convert legacy FormPage[] to new ShormsSchema format
 */
export function formPagesToSchema(pages: FormPage[]): ShormsSchema {
  return {
    version: '3.1.0',
    pages: pages.map(page => ({
      id: page.id,
      title: page.title,
      fields: page.fields.map(field => ({
        id: field.id || field.name || nanoid(),
        type: field.type.toLowerCase(),
        name: field.name,
        label: field.label,
        description: field.description,
        required: field.validation?.required,
        validation: field.validation ? {
          // Legacy uses min/max for both numbers and string length
          ...(field.validation.min !== undefined && { min: field.validation.min, minLength: field.validation.min }),
          ...(field.validation.max !== undefined && { max: field.validation.max, maxLength: field.validation.max }),
          ...(field.validation.regex && { pattern: field.validation.regex }),
          ...(field.type === 'EMAIL' && { email: true }),
        } : undefined,
        // Map legacy fields to config
        config: {
          ...(field.placeholder && { placeholder: field.placeholder }),
          ...('choices' in field && field.choices ? { options: field.choices } : {}),
        },
      })),
    })),
  }
}

/**
 * Convert new ShormsSchema to legacy FormPage[] format
 * Useful for backwards compatibility
 * Note: Returns partial FormField type without Icon and registryDependencies
 */
export function schemaToFormPages(schema: ShormsSchema): FormPage[] {
  return schema.pages.map(page => ({
    id: page.id,
    title: page.title,
    fields: page.fields.map(field => ({
      id: field.id,
      type: field.type,
      name: field.name,
      label: field.label,
      description: field.description,
      placeholder: (field.config?.placeholder as string) || undefined,
      required: field.required,
      choices: (field.config?.options as any[]) || undefined,
      validation: field.validation ? {
        required: field.required,
        min: field.validation.min || field.validation.minLength,
        max: field.validation.max || field.validation.maxLength,
        regex: typeof field.validation.pattern === 'string' ? field.validation.pattern : undefined,
      } : undefined,
    } as any)),
  })) as any
}
