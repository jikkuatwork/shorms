"use client"

import * as React from "react"
import { useFormStore } from "@/stores/form"
import { SearchCode } from "lucide-react"
import { useShallow } from "zustand/shallow"

import { fields } from "@/lib/constants"
import { generateFieldId, generateFieldName } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

import { FormState } from "@/types/form-store"

const selector = (state: FormState) => ({
  addFormField: state.addFormField,
})

// Group fields by category
const fieldCategories = [
  {
    name: "Text Input",
    types: ["INPUT", "TEXTAREA", "EMAIL"],
  },
  {
    name: "Numbers & Dates",
    types: ["NUMBER_INPUT", "SLIDER", "DATE"],
  },
  {
    name: "Selection",
    types: ["SELECT", "RADIO_GROUP", "COMBOBOX"],
  },
  {
    name: "Toggles",
    types: ["CHECKBOX", "SWITCH"],
  },
  {
    name: "Special",
    types: ["FILE_UPLOAD"],
  },
]

export function FieldLibrarySidebar() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const { addFormField } = useFormStore(useShallow(selector))

  const handleAddField = (field: typeof fields[0]) => {
    const newFormField = {
      ...field,
      id: generateFieldId(),
      name: generateFieldName(field.name),
    }
    addFormField(newFormField)
  }

  const filteredCategories = React.useMemo(() => {
    if (!searchQuery.trim()) return fieldCategories

    const query = searchQuery.toLowerCase()
    return fieldCategories
      .map((category) => ({
        ...category,
        types: category.types.filter((type) => {
          const field = fields.find((f) => f.type === type)
          return (
            field?.name.toLowerCase().includes(query) ||
            field?.description?.toLowerCase().includes(query)
          )
        }),
      }))
      .filter((category) => category.types.length > 0)
  }, [searchQuery])

  return (
    <div className="flex h-full w-[280px] flex-col border-r bg-muted/20">
      {/* Search - prominently at the top */}
      <div className="shrink-0 p-4">
        <div className="relative">
          <SearchCode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search fields..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Field Categories */}
      <ScrollArea className="flex-1">
        <div className="space-y-6 p-4">
          {filteredCategories.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No fields found
            </div>
          ) : (
            filteredCategories.map((category) => (
              <div key={category.name}>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {category.name}
                </h3>
                <div className="space-y-2">
                  {category.types.map((type) => {
                    const field = fields.find((f) => f.type === type)
                    if (!field) return null

                    return (
                      <button
                        key={field.type}
                        onClick={() => handleAddField(field)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-lg border bg-card p-3 text-left transition-all hover:border-primary hover:bg-accent hover:shadow-md"
                        )}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-muted/50">
                          <field.Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="text-sm font-medium leading-none">
                            {field.name}
                          </div>
                          {field.description && (
                            <div className="text-xs text-muted-foreground">
                              {field.description}
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
