export { SCHEMA_VERSION, SUPPORTED_VERSIONS, SUPPORTED_FIELD_TYPES } from "./constants"
export { validateSchema, isSupportedFieldType, getUnsupportedFields } from "./validate"
export { migrateSchema, ensureVersion } from "./migrate"
export type { ValidationResult } from "./validate"
