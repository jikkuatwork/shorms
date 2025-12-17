'use client'

import * as React from 'react'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Field } from '@/components/field'
import { SortableField } from '@/components/sortable-field'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { generateDefaultValues, generateZodSchema } from '@/lib/form-schema'
import { generateFieldId, generateFieldName, cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import type { FormField } from '@/types/field'

import { defaultFieldTemplates, widthClasses } from './constants'
import { FieldLibrary } from './field-library'
import { FormContext } from './form-context'
import { PageTabs } from './page-tabs'
import type { BuilderProps, FieldTemplate } from './types'

/**
 * Main Builder component (controlled)
 * A library-ready form builder with no internal global state
 */
export function Builder({
  pages,
  activePageId,
  onPagesChange,
  onActivePageChange,
  onPageAdd,
  onPageDelete,
  onPageRename,
  onPageReorder,
  onFieldAdd,
  onFieldUpdate,
  onFieldDelete,
  onFieldEdit,
  onFieldReorder,
  width = 'lg',
  showFieldLibrary,
  showFormContext,
  fieldTemplates = defaultFieldTemplates,
  features = {
    dragDrop: true,
    pageManagement: true,
    fieldSearch: true,
    commandPalette: true,
  },
  renderCommandPalette,
  className,
}: BuilderProps) {
  const [isMounted, setIsMounted] = React.useState(false)
  const [activeFormField, setActiveFormField] =
    React.useState<FormField | null>(null)

  const widthClass = typeof width === 'string' ? widthClasses[width] : ''
  const widthStyle = typeof width === 'number' ? { maxWidth: `${width}px` } : {}

  // Sidebar visibility based on width setting
  const leftSidebarVisible = React.useMemo(() => {
    if (showFieldLibrary !== undefined) return showFieldLibrary
    if (typeof width === 'number') return width >= 1024
    return width === 'lg' || width === 'xl' || width === 'full'
  }, [width, showFieldLibrary])

  const rightSidebarVisible = React.useMemo(() => {
    if (showFormContext !== undefined) return showFormContext
    if (typeof width === 'number') return width >= 1536
    return width === 'full'
  }, [width, showFormContext])

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const activePage = React.useMemo(
    () => pages.find((p) => p.id === activePageId) || pages[0],
    [pages, activePageId]
  )

  const currentFields = React.useMemo(
    () => activePage?.fields || [],
    [activePage]
  )

  const formSchema = React.useMemo(
    () => generateZodSchema(currentFields),
    [currentFields]
  )

  const defaultValues = React.useMemo(
    () => generateDefaultValues(currentFields),
    [currentFields]
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onChange',
  })

  React.useEffect(() => {
    form.reset(defaultValues, { keepDefaultValues: false })
  }, [defaultValues, form])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    toast({
      title: 'You submitted the following values:',
      description: (
        <pre className="mt-2 w-[340px] overflow-auto rounded-md bg-slate-950 p-4">
          <code className="overflow-auto text-white">
            {JSON.stringify(values, null, 2)}
          </code>
        </pre>
      ),
    })
  }

  // Handle field drag and drop
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id && activePage && onFieldReorder) {
      const oldIndex = currentFields.findIndex(
        (field) => field.name === active.id
      )
      const newIndex = currentFields.findIndex(
        (field) => field.name === over.id
      )

      const newFields = arrayMove(currentFields, oldIndex, newIndex)
      onFieldReorder(activePage.id, newFields)
    }
    setActiveFormField(null)
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    const formField = currentFields.find((field) => field.name === active.id)
    if (formField) {
      setActiveFormField(formField)
    }
  }

  // Handle field template selection from library
  const handleFieldSelect = (template: FieldTemplate) => {
    if (!onFieldAdd) {
      console.warn('onFieldAdd callback not provided')
      return
    }

    const newField: FormField = {
      ...template.defaultConfig,
      id: generateFieldId(),
      name: generateFieldName(template.name),
      type: template.type,
      label: template.label,
      Icon: template.Icon,
      registryDependencies: [],
    } as FormField

    onFieldAdd(newField)
  }

  return (
    <div
      className={cn('flex h-full', widthClass, className)}
      style={widthStyle}
    >
      {/* Left Sidebar - Field Library */}
      {leftSidebarVisible && (
        <FieldLibrary
          fieldTemplates={fieldTemplates}
          onFieldSelect={handleFieldSelect}
          showSearch={features.fieldSearch}
        />
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Page Tabs */}
        {features.pageManagement && (
          <PageTabs
            pages={pages}
            activePageId={activePageId}
            onPageSelect={onActivePageChange}
            onPageAdd={onPageAdd}
            onPageDelete={onPageDelete}
            onPageRename={onPageRename}
            onPageReorder={onPageReorder}
            dragDropEnabled={features.dragDrop}
            showCommandPalette={features.commandPalette}
            showLeftSidebar={leftSidebarVisible}
            renderCommandPalette={renderCommandPalette}
          />
        )}

        {/* Field List */}
        <div className="flex-1 overflow-y-auto">
          {isMounted && features.dragDrop ? (
            <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
              {currentFields.length !== 0 ? (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-8 md:gap-6 md:px-8 md:py-10"
                  >
                    <SortableContext
                      items={currentFields.map((formField) => formField.name)}
                      strategy={verticalListSortingStrategy}
                    >
                      {currentFields.map((formField) => (
                        <SortableField
                          formField={formField}
                          form={form}
                          key={formField.name}
                          onDelete={onFieldDelete}
                          onEdit={onFieldEdit}
                        />
                      ))}
                    </SortableContext>
                    <DragOverlay className="bg-background">
                      {activeFormField ? (
                        <Field formField={activeFormField} />
                      ) : (
                        <></>
                      )}
                    </DragOverlay>
                    <Button type="submit" size="lg" className="mt-2">
                      Submit Form
                    </Button>
                  </form>
                </Form>
              ) : (
                <EmptyState />
              )}
            </DndContext>
          ) : currentFields.length !== 0 ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-8 md:gap-6 md:px-8 md:py-10"
              >
                {currentFields.map((formField) => (
                  <Field formField={formField} key={formField.name} onDelete={onFieldDelete} onEdit={onFieldEdit} />
                ))}
                <Button type="submit" size="lg" className="mt-2">
                  Submit Form
                </Button>
              </form>
            </Form>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
      {/* End Main Content Area */}

      {/* Right Sidebar - Form Context */}
      {rightSidebarVisible && (
        <FormContext pages={pages} activePageId={activePageId} />
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center py-24">
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <Plus className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight">No fields yet</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            Press{' '}
            <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs font-semibold">
              ⌘K
            </kbd>{' '}
            to add fields to your form
          </p>
        </div>
      </div>
    </div>
  )
}
