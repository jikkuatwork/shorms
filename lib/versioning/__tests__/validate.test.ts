import { describe, it, expect } from 'vitest'
import { validateSchema, isSupportedFieldType, getUnsupportedFields } from '../validate'
import type { ShormsSchema } from '@/types/schema'

describe('validateSchema', () => {
  it('should validate a correct schema', () => {
    const schema = {
      version: '1.0',
      pages: [
        {
          id: 'page1',
          title: 'Test Page',
          fields: [
            { type: 'INPUT', name: 'field1', label: 'Field 1' }
          ]
        }
      ]
    }

    const result = validateSchema(schema)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should warn about missing version', () => {
    const schema = {
      pages: []
    }

    const result = validateSchema(schema)
    expect(result.warnings).toContain('Schema has no version field, assuming 1.0')
  })

  it('should detect unknown field types', () => {
    const schema = {
      version: '1.0',
      pages: [
        {
          id: 'page1',
          fields: [
            { type: 'UNKNOWN_TYPE', name: 'field1', label: 'Field 1' }
          ]
        }
      ]
    }

    const result = validateSchema(schema)
    expect(result.unknownFieldTypes).toContain('UNKNOWN_TYPE')
    expect(result.warnings.length).toBeGreaterThan(0)
  })

  it('should error on missing pages array', () => {
    const schema = { version: '1.0' }

    const result = validateSchema(schema)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain("Schema must have a 'pages' array")
  })
})

describe('isSupportedFieldType', () => {
  it('should return true for supported types', () => {
    expect(isSupportedFieldType('INPUT')).toBe(true)
    expect(isSupportedFieldType('EMAIL')).toBe(true)
    expect(isSupportedFieldType('FILE_UPLOAD')).toBe(true)
  })

  it('should return false for unsupported types', () => {
    expect(isSupportedFieldType('PHONE')).toBe(false)
    expect(isSupportedFieldType('OTP')).toBe(false)
  })
})

describe('getUnsupportedFields', () => {
  it('should return empty array for all supported fields', () => {
    const schema: ShormsSchema = {
      version: '1.0',
      pages: [
        {
          id: 'page1',
          title: 'Test',
          fields: [
            { type: 'INPUT' as any, name: 'field1', label: 'Field 1', Icon: null as any, registryDependencies: [] }
          ]
        }
      ]
    }

    const unsupported = getUnsupportedFields(schema)
    expect(unsupported).toHaveLength(0)
  })
})
