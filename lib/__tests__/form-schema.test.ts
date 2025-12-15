import { describe, it, expect } from 'vitest'
import { generateZodSchema, generateDefaultValues } from '../form-schema'
import { FieldType, type FormField } from '@/types/field'
import { Type } from 'lucide-react'

describe('generateZodSchema', () => {
  const mockIcon = Type

  it('should generate schema for text input field', () => {
    const fields: FormField[] = [
      {
        id: '1',
        type: FieldType.INPUT,
        name: 'username',
        label: 'Username',
        Icon: mockIcon,
        registryDependencies: [],
        validation: { required: true, min: 3, max: 20 }
      }
    ]

    const schema = generateZodSchema(fields)
    const result = schema.safeParse({ username: 'test' })
    expect(result.success).toBe(true)
  })

  it('should validate email field', () => {
    const fields: FormField[] = [
      {
        id: '1',
        type: FieldType.EMAIL,
        name: 'email',
        label: 'Email',
        Icon: mockIcon,
        registryDependencies: [],
        validation: { required: true }
      }
    ]

    const schema = generateZodSchema(fields)
    expect(schema.safeParse({ email: 'invalid' }).success).toBe(false)
    expect(schema.safeParse({ email: 'test@example.com' }).success).toBe(true)
  })

  it('should validate number ranges', () => {
    const fields: FormField[] = [
      {
        id: '1',
        type: FieldType.NUMBER_INPUT,
        name: 'age',
        label: 'Age',
        Icon: mockIcon,
        registryDependencies: [],
        validation: { min: 18, max: 100 }
      }
    ]

    const schema = generateZodSchema(fields)
    expect(schema.safeParse({ age: 17 }).success).toBe(false)
    expect(schema.safeParse({ age: 50 }).success).toBe(true)
    expect(schema.safeParse({ age: 101 }).success).toBe(false)
  })

  it('should handle optional fields', () => {
    const fields: FormField[] = [
      {
        id: '1',
        type: FieldType.INPUT,
        name: 'optional',
        label: 'Optional',
        Icon: mockIcon,
        registryDependencies: []
      }
    ]

    const schema = generateZodSchema(fields)
    expect(schema.safeParse({}).success).toBe(true)
    expect(schema.safeParse({ optional: 'value' }).success).toBe(true)
  })
})

describe('generateDefaultValues', () => {
  const mockIcon = Type

  it('should extract default values from fields', () => {
    const fields: FormField[] = [
      {
        id: '1',
        type: FieldType.INPUT,
        name: 'name',
        label: 'Name',
        Icon: mockIcon,
        registryDependencies: [],
        default: 'John'
      },
      {
        id: '2',
        type: FieldType.NUMBER_INPUT,
        name: 'age',
        label: 'Age',
        Icon: mockIcon,
        registryDependencies: [],
        default: 25
      }
    ]

    const defaults = generateDefaultValues(fields)
    expect(defaults).toEqual({ name: 'John', age: 25 })
  })
})
