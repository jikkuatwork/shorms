"use client"

import * as React from "react"
import { useFormStore } from "@/stores/form"
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { zodResolver } from "@hookform/resolvers/zod"
import { FilePlus, GripVertical, Plus, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useShallow } from "zustand/shallow"

import { generateDefaultValues, generateZodSchema } from "@/lib/form-schema"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { FieldCommandPalette } from "@/components/field-command-palette"
import { Form } from "@/components/ui/form"
import { Field } from "@/components/field"
import { FieldLibrarySidebar } from "@/components/field-library-sidebar"
import { FormContextSidebar } from "@/components/form-context-sidebar"
import { SortableField } from "@/components/sortable-field"

import { FormField } from "@/types/field"
import { FormState } from "@/types/form-store"

const selector = (state: FormState) => ({
  pages: state.pages,
  activePageId: state.activePageId,
  setPages: state.setPages,
  setActivePage: state.setActivePage,
  addPage: state.addPage,
  deletePage: state.deletePage,
  updatePageTitle: state.updatePageTitle,
})

export interface FormEditorProps {
  width?: "sm" | "md" | "lg" | "xl" | "full" | number
  className?: string
}

const widthClasses = {
  sm: "max-w-2xl", // 672px - Not recommended: field controls may overflow
  md: "max-w-3xl", // 768px - Recommended minimum
  lg: "max-w-5xl", // 1024px
  xl: "max-w-7xl", // 1280px
  full: "max-w-full",
}

interface SortablePageTabProps {
  page: { id: string; title?: string; fields: FormField[] }
  index: number
  isActive: boolean
  canDelete: boolean
  onSelect: () => void
  onDelete: () => void
  onRename: (title: string) => void
}

function SortablePageTab({
  page,
  index,
  isActive,
  canDelete,
  onSelect,
  onDelete,
  onRename,
}: SortablePageTabProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: page.id })
  const [isEditing, setIsEditing] = React.useState(false)
  const [editValue, setEditValue] = React.useState(page.title || "")
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleSave = () => {
    if (editValue.trim()) {
      onRename(editValue.trim())
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      setEditValue(page.title || "")
      setIsEditing(false)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex cursor-pointer items-center gap-1.5 rounded-lg border bg-background px-3 py-2 text-sm shadow-sm transition-all hover:bg-accent/50 hover:shadow-md",
        isActive && "border-primary bg-primary/10 font-semibold shadow-md ring-1 ring-primary/20"
      )}
      onClick={onSelect}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </div>

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="min-w-[60px] max-w-[120px] bg-transparent px-1 outline-none"
        />
      ) : (
        <span
          className="max-w-[120px] truncate"
          onDoubleClick={(e) => {
            e.stopPropagation()
            setIsEditing(true)
          }}
        >
          {page.title || `Page ${index + 1}`}
        </span>
      )}

      {canDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="ml-1 h-4 w-4 hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

export function FormEditor({ width = "lg", className }: FormEditorProps = {}) {
  const [isMounted, setIsMounted] = React.useState(false)
  const [activeFormField, setActiveFormField] =
    React.useState<FormField | null>(null)
  const [activePageDragId, setActivePageDragId] = React.useState<string | null>(
    null
  )

  const widthClass = typeof width === "string" ? widthClasses[width] : ""
  const widthStyle = typeof width === "number" ? { maxWidth: `${width}px` } : {}

  // Sidebar visibility based on width setting
  const showLeftSidebar = React.useMemo(() => {
    if (typeof width === "number") return width >= 1024 // Show if custom width >= 1024px
    return width === "lg" || width === "xl" || width === "full"
  }, [width])

  const showRightSidebar = React.useMemo(() => {
    if (typeof width === "number") return width >= 1536 // Show if custom width >= 1536px
    return width === "full"
  }, [width])

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

  const {
    pages,
    activePageId,
    setPages,
    setActivePage,
    addPage,
    deletePage,
    updatePageTitle,
  } = useFormStore(useShallow(selector))

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
  }, [defaultValues])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] overflow-auto rounded-md bg-slate-950 p-4">
          <code className="overflow-auto text-white">
            {JSON.stringify(values, null, 2)}
          </code>
        </pre>
      ),
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id && activePage) {
      const oldIndex = currentFields.findIndex(
        (field) => field.name === active.id
      )
      const newIndex = currentFields.findIndex(
        (field) => field.name === over.id
      )

      const newFields = arrayMove(currentFields, oldIndex, newIndex)

      const newPages = pages.map((p) => {
        if (p.id === activePage.id) {
          return { ...p, fields: newFields }
        }
        return p
      })

      setPages(newPages)
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

  const handlePageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = pages.findIndex((p) => p.id === active.id)
      const newIndex = pages.findIndex((p) => p.id === over.id)
      const newPages = arrayMove(pages, oldIndex, newIndex)
      setPages(newPages)
    }
    setActivePageDragId(null)
  }

  const handlePageDragStart = (event: DragStartEvent) => {
    setActivePageDragId(event.active.id as string)
  }

  return (
    <div
      className={cn("flex h-full", widthClass, className)}
      style={widthStyle}
    >
      {/* Left Sidebar - Field Library */}
      {showLeftSidebar && (
        <FieldLibrarySidebar />
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Page Tabs */}
        {isMounted ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handlePageDragEnd}
            onDragStart={handlePageDragStart}
          >
            <div className="flex shrink-0 items-center gap-2 border-b bg-muted/20 px-3 py-2.5 md:gap-3 md:px-4 md:py-3">
              {!showLeftSidebar && (
                <>
                  <FieldCommandPalette />
                  <div className="h-6 w-px bg-border" />
                </>
              )}
              <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto md:gap-3">
              <SortableContext
                items={pages.map((p) => p.id)}
                strategy={horizontalListSortingStrategy}
              >
                {pages.map((page, index) => (
                  <SortablePageTab
                    key={page.id}
                    page={page}
                    index={index}
                    isActive={activePageId === page.id}
                    canDelete={pages.length > 1}
                    onSelect={() => setActivePage(page.id)}
                    onDelete={() => deletePage(page.id)}
                    onRename={(title) => updatePageTitle(page.id, title)}
                  />
                ))}
              </SortableContext>
            </div>
            <div className="h-6 w-px bg-border" />
            <Button variant="outline" size="icon" onClick={addPage} className="shrink-0">
              <FilePlus className="h-4 w-4" />
            </Button>
          </div>
          <DragOverlay>
            {activePageDragId && (
              <div className="flex items-center gap-1 rounded-md border bg-background px-2 py-1.5 text-sm opacity-80 shadow-lg">
                <GripVertical className="h-3 w-3 text-muted-foreground" />
                <span>
                  {pages.find((p) => p.id === activePageDragId)?.title ||
                    `Page ${pages.findIndex((p) => p.id === activePageDragId) + 1}`}
                </span>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="flex items-center gap-2 border-b bg-muted/20 px-3 py-2.5 md:gap-3 md:px-4 md:py-3">
          {!showLeftSidebar && (
            <>
              <FieldCommandPalette />
              <div className="h-6 w-px bg-border" />
            </>
          )}
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto md:gap-3">
            {pages.map((page, index) => (
              <div
                key={page.id}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-lg border bg-background px-3 py-2 text-sm shadow-sm hover:bg-accent/50",
                  activePageId === page.id && "border-primary bg-primary/10 font-semibold shadow-md ring-1 ring-primary/20"
                )}
              >
                <GripVertical className="h-3 w-3 text-muted-foreground" />
                <span className="max-w-[120px] truncate">
                  {page.title || `Page ${index + 1}`}
                </span>
              </div>
            ))}
          </div>
          <div className="h-6 w-px bg-border" />
          <Button variant="outline" size="icon">
            <FilePlus className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {isMounted ? (
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
              <div className="flex h-full items-center justify-center py-24">
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                    <Plus className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold tracking-tight">No fields yet</h3>
                    <p className="max-w-md text-sm text-muted-foreground">
                      Press <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs font-semibold">⌘K</kbd> to add fields to your form
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DndContext>
        ) : (
          currentFields.length !== 0 ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-8 md:gap-6 md:px-8 md:py-10"
              >
                {currentFields.map((formField) => (
                  <Field formField={formField} key={formField.name} />
                ))}
                <Button type="submit" size="lg" className="mt-2">
                  Submit Form
                </Button>
              </form>
            </Form>
          ) : (
            <div className="flex h-full items-center justify-center py-24">
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                  <Plus className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold tracking-tight">No fields yet</h3>
                  <p className="max-w-md text-sm text-muted-foreground">
                    Press <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs font-semibold">⌘K</kbd> to add fields to your form
                  </p>
                </div>
              </div>
            </div>
          )
        )}
      </div>
      </div>
      {/* End Main Content Area */}

      {/* Right Sidebar - Form Context */}
      {showRightSidebar && (
        <FormContextSidebar />
      )}
    </div>
  )
}
