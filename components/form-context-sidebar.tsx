"use client"

import * as React from "react"
import { useFormStore } from "@/stores/form"
import { FileJson2, Info, Layers } from "lucide-react"
import { useShallow } from "zustand/shallow"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

import { FormState } from "@/types/form-store"

const selector = (state: FormState) => ({
  pages: state.pages,
  activePageId: state.activePageId,
})

export function FormContextSidebar() {
  const { pages, activePageId } = useFormStore(useShallow(selector))

  const activePage = React.useMemo(
    () => pages.find((p) => p.id === activePageId) || pages[0],
    [pages, activePageId]
  )

  const stats = React.useMemo(() => {
    const totalFields = pages.reduce((acc, page) => acc + page.fields.length, 0)
    const requiredFields = pages.reduce(
      (acc, page) =>
        acc + page.fields.filter((f) => f.validation?.required).length,
      0
    )
    const fieldsWithValidation = pages.reduce(
      (acc, page) =>
        acc + page.fields.filter((f) => f.validation && Object.keys(f.validation).length > 0).length,
      0
    )

    return {
      totalPages: pages.length,
      totalFields,
      currentPageFields: activePage?.fields.length || 0,
      requiredFields,
      fieldsWithValidation,
    }
  }, [pages, activePage])

  return (
    <div className="flex h-full w-[380px] flex-col border-l bg-muted/20">
      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="space-y-6 p-4 pt-5">
          {/* Statistics */}
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              Statistics
            </div>
            <div className="space-y-3 rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Pages</span>
                <span className="text-sm font-semibold">{stats.totalPages}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Fields</span>
                <span className="text-sm font-semibold">{stats.totalFields}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Page</span>
                <span className="text-sm font-semibold">
                  {stats.currentPageFields} {stats.currentPageFields === 1 ? "field" : "fields"}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Required Fields</span>
                <span className="text-sm font-semibold">{stats.requiredFields}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">With Validation</span>
                <span className="text-sm font-semibold">{stats.fieldsWithValidation}</span>
              </div>
            </div>
          </div>

          {/* Current Page Info */}
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Layers className="h-3.5 w-3.5" />
              Current Page
            </div>
            <div className="space-y-2 rounded-lg border bg-card p-4">
              <div>
                <span className="text-xs text-muted-foreground">Title</span>
                <p className="mt-1 text-sm font-medium">
                  {activePage?.title || `Page ${pages.findIndex((p) => p.id === activePageId) + 1}`}
                </p>
              </div>
              <Separator />
              <div>
                <span className="text-xs text-muted-foreground">Fields</span>
                {activePage && activePage.fields.length > 0 ? (
                  <div className="mt-2 space-y-1">
                    {activePage.fields.map((field) => (
                      <div
                        key={field.id}
                        className="flex items-center gap-2 rounded border bg-muted/30 px-2 py-1.5 text-xs"
                      >
                        <span className="truncate font-medium">{field.label || field.name}</span>
                        {field.validation?.required && (
                          <span className="ml-auto shrink-0 text-[10px] text-destructive">
                            Required
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">No fields yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <FileJson2 className="h-3.5 w-3.5" />
              Quick Tips
            </div>
            <div className="space-y-2 rounded-lg border bg-card p-4 text-xs text-muted-foreground">
              <p>• Click a field to edit its properties</p>
              <p>• Drag fields to reorder them</p>
              <p>• Double-click page tabs to rename</p>
              <p>• Press ⌘K to add fields quickly</p>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
