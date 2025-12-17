import type { FormField } from '@/types/field'
import type { LucideIcon } from 'lucide-react'

/**
 * Form page structure
 */
export interface FormPage {
  id: string
  title?: string
  fields: FormField[]
}

/**
 * Builder state (controlled from outside)
 */
export interface BuilderState {
  pages: FormPage[]
  activePageId: string
}

/**
 * Field template for field library
 */
export interface FieldTemplate {
  type: string
  name: string
  label: string
  description?: string
  Icon: LucideIcon
  defaultConfig?: Partial<FormField>
}

/**
 * Builder component props (controlled component)
 */
export interface BuilderProps {
  // Required: Controlled state
  pages: FormPage[]
  activePageId: string

  // Required: State change callbacks
  onPagesChange: (pages: FormPage[]) => void
  onActivePageChange: (pageId: string) => void

  // Optional: Page operations callbacks
  onPageAdd?: () => void
  onPageDelete?: (pageId: string) => void
  onPageRename?: (pageId: string, title: string) => void
  onPageReorder?: (pages: FormPage[]) => void

  // Optional: Field operations callbacks
  onFieldAdd?: (field: FormField) => void
  onFieldUpdate?: (fieldId: string, updates: Partial<FormField>) => void
  onFieldDelete?: (fieldId: string) => void
  onFieldEdit?: (fieldId: string) => void
  onFieldReorder?: (pageId: string, fields: FormField[]) => void

  // Optional: UI configuration
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | number
  showFieldLibrary?: boolean // default: true for width >= 1024px
  showFormContext?: boolean // default: true for width >= 1536px
  fieldTemplates?: FieldTemplate[] // default: built-in fields

  // Optional: Feature flags
  features?: {
    dragDrop?: boolean // default: true
    pageManagement?: boolean // default: true
    fieldSearch?: boolean // default: true
    commandPalette?: boolean // default: true
  }

  // Optional: Custom renderers
  renderCommandPalette?: () => React.ReactNode

  // Optional: Styling
  className?: string
}

/**
 * Field Library component props
 */
export interface FieldLibraryProps {
  fieldTemplates: FieldTemplate[]
  onFieldSelect: (template: FieldTemplate) => void
  searchPlaceholder?: string
  showSearch?: boolean
  className?: string
  width?: number
}

/**
 * Form Context component props
 */
export interface FormContextProps {
  pages: FormPage[]
  activePageId: string
  className?: string
  width?: number
  sections?: {
    statistics?: boolean
    currentPage?: boolean
    tips?: boolean
  }
}

/**
 * Page tabs component props
 */
export interface PageTabsProps {
  pages: FormPage[]
  activePageId: string
  onPageSelect: (pageId: string) => void
  onPageAdd?: () => void
  onPageDelete?: (pageId: string) => void
  onPageRename?: (pageId: string, title: string) => void
  onPageReorder?: (pages: FormPage[]) => void
  dragDropEnabled?: boolean
  showCommandPalette?: boolean
  showLeftSidebar?: boolean
  className?: string
  renderCommandPalette?: () => React.ReactNode
}

/**
 * Field list component props
 */
export interface FieldListProps {
  fields: FormField[]
  pageId: string
  onFieldReorder?: (fields: FormField[]) => void
  onFieldUpdate?: (fieldId: string, updates: Partial<FormField>) => void
  onFieldDelete?: (fieldId: string) => void
  dragDropEnabled?: boolean
  className?: string
}
