"use client"

import * as React from "react"
import { useFormStore } from "@/stores/form"
import { Plus, SearchCode } from "lucide-react"
import { useShallow } from "zustand/shallow"

import { fields } from "@/lib/constants"
import { generateFieldId, generateFieldName } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { FormState } from "@/types/form-store"

const selector = (state: FormState) => ({
  addFormField: state.addFormField,
})

export function FieldCommandPalette() {
  const [open, setOpen] = React.useState(false)
  const { addFormField } = useFormStore(useShallow(selector))

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSelectField = (field: typeof fields[0]) => {
    const newFormField = {
      ...field,
      id: generateFieldId(),
      name: generateFieldName(field.name),
    }
    addFormField(newFormField)
    setOpen(false)
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
      >
        <SearchCode className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Add Field</DialogTitle>
            <DialogDescription>
              Search and select a field type to add to your form
            </DialogDescription>
          </DialogHeader>
          <Command className="border-t">
            <CommandInput placeholder="Search fields..." />
            <CommandList>
              <CommandEmpty>No fields found.</CommandEmpty>
              <CommandGroup heading="Available Fields">
                {fields.map((field) => (
                  <CommandItem
                    key={field.type}
                    value={field.name}
                    onSelect={() => handleSelectField(field)}
                    className="flex items-center gap-3 py-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                      <field.Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{field.name}</div>
                      {field.description && (
                        <div className="text-sm text-muted-foreground">
                          {field.description}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}
