# Using Shorms as a Library

Shorms can be installed as a git dependency in other projects.

## Installation

```bash
npm install github:jikkuatwork/shorms
# or with specific commit/branch
npm install github:jikkuatwork/shorms#main
```

## Usage

### Import Types and Utilities

```typescript
import {
  // Types
  FieldType,
  type FormField,
  type FormPage,
  type ShormsSchema,

  // Versioning
  SCHEMA_VERSION,
  validateSchema,
  migrateSchema,

  // Schema utilities
  generateZodSchema,
  generateDefaultValues,
} from 'shorms'
```

### Example: Validate a Form Schema

```typescript
import { validateSchema } from 'shorms'

const formSchema = {
  version: '1.0',
  pages: [
    {
      id: 'page1',
      title: 'Contact Info',
      fields: [
        {
          type: 'EMAIL',
          name: 'email',
          label: 'Email Address',
          validation: { required: true }
        }
      ]
    }
  ]
}

const result = validateSchema(formSchema)
if (result.valid) {
  console.log('Schema is valid!')
} else {
  console.error('Validation errors:', result.errors)
}
```

### Example: Generate Zod Schema

```typescript
import { generateZodSchema, FieldType } from 'shorms'

const fields = [
  {
    type: FieldType.INPUT,
    name: 'username',
    label: 'Username',
    validation: { required: true, min: 3 }
  },
  {
    type: FieldType.EMAIL,
    name: 'email',
    label: 'Email'
  }
]

const zodSchema = generateZodSchema(fields)
// Use with react-hook-form or validate data directly
const result = zodSchema.safeParse({ username: 'john', email: 'john@example.com' })
```

## Features

- ✅ **Schema Versioning** - Forward-compatible schema validation
- ✅ **Zod v4** - Latest validation library
- ✅ **React 19** - Compatible with latest React
- ✅ **TypeScript** - Full type safety
- ✅ **12 Field Types** - INPUT, EMAIL, NUMBER, SELECT, CHECKBOX, etc.
- ✅ **Validation** - Required, min/max length/value, regex, file size

## Peer Dependencies

```json
{
  "react": "^18.0.0 || ^19.0.0",
  "react-dom": "^18.0.0 || ^19.0.0",
  "zod": "^3.0.0 || ^4.0.0"
}
```

## Development Mode

To run the Shorms builder app locally:

```bash
cd node_modules/shorms
npm run dev
```

Access at http://localhost:3000

## Schema Version

Current schema version: **1.0**

All exported schemas include a version field for forward compatibility. Future versions will include migration utilities.
