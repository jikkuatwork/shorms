"use client"

import * as React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { RenderEditFormFieldInputs } from "@/components/render-edit-form-field-inputs"
import { ValidationSettings } from "@/components/validation-settings"

import type { FormField } from "@/types/field"

interface EditFormFieldProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedField: FormField | null
  onUpdate: (field: FormField) => void
}

export function EditFormField({
  open,
  onOpenChange,
  selectedField,
  onUpdate,
}: EditFormFieldProps) {
  if (!selectedField) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent withOverlay={false} className="sm:max-w-[614px] p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle>Edit {selectedField.name} Field</SheetTitle>
          <SheetDescription>Update info about this field.</SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="space-y-6 px-6 pb-6">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                placeholder="your field label..."
                value={selectedField.label}
                onChange={(e) =>
                  onUpdate({
                    ...selectedField,
                    label: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="your field description..."
                value={selectedField.description || ""}
                onChange={(e) =>
                  onUpdate({
                    ...selectedField,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="your field name..."
                value={selectedField.name}
                onChange={(e) =>
                  onUpdate({
                    ...selectedField,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <RenderEditFormFieldInputs
              selectedField={selectedField}
              onUpdate={onUpdate}
            />
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium leading-none">Validation</h4>
              <ValidationSettings
                selectedField={selectedField}
                onUpdate={onUpdate}
              />
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
