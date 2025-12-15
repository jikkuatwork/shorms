import type { ShormsSchema } from "@/types/schema"
import { SCHEMA_VERSION, SUPPORTED_VERSIONS } from "./constants"

export function migrateSchema(
  schema: any,
  fromVersion?: string,
  toVersion: string = SCHEMA_VERSION
): ShormsSchema {
  // If no version, assume 1.0
  const sourceVersion = fromVersion || schema.version || "1.0"

  // If already at target version, return as-is
  if (sourceVersion === toVersion) {
    return {
      version: toVersion,
      pages: schema.pages || [],
      metadata: schema.metadata
    }
  }

  // Future: Add migration logic for different versions
  // For now, just add version field if missing
  return {
    version: toVersion,
    pages: schema.pages || [],
    metadata: schema.metadata
  }
}

export function ensureVersion(schema: any): ShormsSchema {
  if (schema.version) {
    return schema as ShormsSchema
  }

  return migrateSchema(schema)
}
