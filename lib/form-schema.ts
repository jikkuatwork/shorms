import * as z from "zod"

import { FieldType, FormField } from "@/types/field"

export function generateZodSchema(formFields: FormField[]) {
  const formSchemaObject: Record<string, z.ZodType<any, any>> = {}
  formFields.forEach((field) => {
    let fieldSchema: z.ZodTypeAny
    switch (field.type) {
      case FieldType.INPUT:
      case FieldType.TEXTAREA:
      case FieldType.EMAIL:
      case FieldType.SELECT:
      case FieldType.RADIO_GROUP:
      case FieldType.COMBOBOX:
        fieldSchema = z.string()
        break
      case FieldType.NUMBER_INPUT:
      case FieldType.SLIDER:
        fieldSchema = z.coerce.number()
        break
      case FieldType.CHECKBOX:
      case FieldType.SWITCH:
        fieldSchema = z.boolean()
        break
      case FieldType.DATE:
        fieldSchema = z.coerce.date()
        break
      case FieldType.FILE_UPLOAD:
        fieldSchema = z.any()
        break
      default:
        fieldSchema = z.string()
    }

    // Email validation
    if (field.type === FieldType.EMAIL) {
      fieldSchema = (fieldSchema as z.ZodString).email({
        message: field.validation?.errorMessage || "Invalid email address",
      })
    }

    // Apply min/max for text fields (length)
    if (
      field.validation &&
      (field.type === FieldType.INPUT ||
        field.type === FieldType.TEXTAREA ||
        field.type === FieldType.EMAIL)
    ) {
      if (field.validation.min !== undefined) {
        fieldSchema = (fieldSchema as z.ZodString).min(field.validation.min, {
          message: field.validation.errorMessage || `Minimum ${field.validation.min} characters required`,
        })
      }
      if (field.validation.max !== undefined) {
        fieldSchema = (fieldSchema as z.ZodString).max(field.validation.max, {
          message: field.validation.errorMessage || `Maximum ${field.validation.max} characters allowed`,
        })
      }
    }

    // Apply min/max for number fields (value)
    if (
      field.validation &&
      (field.type === FieldType.NUMBER_INPUT || field.type === FieldType.SLIDER)
    ) {
      if (field.validation.min !== undefined) {
        fieldSchema = (fieldSchema as z.ZodNumber).min(field.validation.min, {
          message: field.validation.errorMessage || `Minimum value is ${field.validation.min}`,
        })
      }
      if (field.validation.max !== undefined) {
        fieldSchema = (fieldSchema as z.ZodNumber).max(field.validation.max, {
          message: field.validation.errorMessage || `Maximum value is ${field.validation.max}`,
        })
      }
    }

    // Apply Regex (Text based fields)
    if (
      field.validation?.regex &&
      (field.type === FieldType.INPUT ||
        field.type === FieldType.TEXTAREA ||
        field.type === FieldType.EMAIL)
    ) {
      try {
        fieldSchema = (fieldSchema as z.ZodString).regex(
          new RegExp(field.validation.regex),
          { message: field.validation.errorMessage || "Invalid format" }
        )
      } catch {
        // Invalid regex, ignore
        console.error("Invalid regex:", field.validation.regex)
      }
    }

    // File size validation for file uploads
    if (field.type === FieldType.FILE_UPLOAD && field.validation?.maxFileSize) {
      // Custom validation for file size (in MB)
      fieldSchema = z.any().refine(
        (file) => {
          if (!file || !(file instanceof File)) return true
          return file.size <= (field.validation!.maxFileSize! * 1024 * 1024)
        },
        {
          message: `File size must be less than ${field.validation.maxFileSize}MB`,
        }
      )
    }

    // Apply Required / Optional
    if (field.validation?.required) {
      // For strings, required usually implies min(1) to disallow empty strings
      if (fieldSchema instanceof z.ZodString) {
        fieldSchema = fieldSchema.min(1, {
          message: field.validation?.errorMessage || "This field is required",
        })
      }
    } else {
      fieldSchema = fieldSchema.optional()
    }

    formSchemaObject[field.name] = fieldSchema
  })

  return z.object(formSchemaObject)
}

export const generateDefaultValues = (
  formFields: FormField[]
): Record<string, any> => {
  const defaultValues: Record<string, any> = {}

  formFields.forEach((field) => {
    if (field.default !== undefined) {
      defaultValues[field.name] = field.default
    } else {
      // Provide type-appropriate defaults to avoid controlled/uncontrolled warnings
      switch (field.type) {
        case FieldType.CHECKBOX:
        case FieldType.SWITCH:
          defaultValues[field.name] = false
          break
        case FieldType.NUMBER_INPUT:
        case FieldType.SLIDER:
          defaultValues[field.name] = 0
          break
        default:
          defaultValues[field.name] = ""
      }
    }
  })

  return defaultValues
}

export const zodSchemaToString = (schema: z.ZodTypeAny): string => {
  if (schema instanceof z.ZodDefault) {
    return `${zodSchemaToString(schema._def.innerType)}.default(${JSON.stringify(schema._def.defaultValue())})`
  }

  if (schema instanceof z.ZodBoolean) {
    return `z.boolean()`
  }

  if (schema instanceof z.ZodNumber) {
    let result = "z.coerce.number()"
    if ("checks" in schema._def) {
      schema._def.checks.forEach((check: z.ZodNumberCheck) => {
        if (check.kind === "min") {
          result += `.min(${check.value}${check.message ? `, "${check.message}"` : ""})`
        } else if (check.kind === "max") {
          result += `.max(${check.value}${check.message ? `, "${check.message}"` : ""})`
        }
      })
    }
    return result
  }

  if (schema instanceof z.ZodString) {
    let result = "z.string()"
    if ("checks" in schema._def) {
      schema._def.checks.forEach((check: z.ZodStringCheck) => {
        if (check.kind === "min") {
          result += `.min(${check.value}${check.message ? `, "${check.message}"` : ""})`
        } else if (check.kind === "max") {
          result += `.max(${check.value}${check.message ? `, "${check.message}"` : ""})`
        } else if (check.kind === "email") {
          result += `.email(${check.message ? `"${check.message}"` : ""})`
        } else if (check.kind === "regex") {
          result += `.regex(new RegExp("${check.regex.source.replace(/\\/g, "\\\\")}")${check.message ? `, "${check.message}"` : ""})`
        }
      })
    }
    return result
  }

  if (schema instanceof z.ZodDate) {
    return `z.coerce.date()`
  }

  if (schema instanceof z.ZodObject) {
    const shape = schema.shape
    const shapeStrs = Object.entries(shape).map(
      ([key, value]) => `${key}: ${zodSchemaToString(value as z.ZodTypeAny)}`
    )
    return `z.object({
  ${shapeStrs.join(",\n  ")}
})`
  }

  if (schema instanceof z.ZodOptional) {
    return `${zodSchemaToString(schema.unwrap())}.optional()`
  }

  return "z.unknown()"
}

export const getZodSchemaString = (formFields: FormField[]): string => {
  const schema = generateZodSchema(formFields)
  const schemaEntries = Object.entries(schema.shape)
    .map(([key, value]) => {
      return `  ${key.replaceAll(" ", "_")}: ${zodSchemaToString(value as z.ZodTypeAny)}`
    })
    .join(",\n")

  return `const formSchema = z.object({\n${schemaEntries}\n})`
}
