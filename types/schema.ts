import type { FormPage } from "./form-store"

export interface ShormsSchema {
  version: string
  metadata?: {
    createdAt?: string
    createdBy?: string
    description?: string
  }
  pages: FormPage[]
}
