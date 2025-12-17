import * as React from "react"
import { useFormStore } from "@/stores/form"
import { GripVertical, PenIcon, Trash2 } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import { useShallow } from "zustand/shallow"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form"
import { renderFormFieldComponent } from "@/components/render-form-field-component"
import { TooltipWrapper } from "@/components/tooltip-wrapper"

import type { FormField as FormFieldType } from "@/types/field"
import { FormState } from "@/types/form-store"

export interface FieldProps {
  formField: FormFieldType
  form?: UseFormReturn<any>
  style?: React.CSSProperties
  isDragging?: boolean
  onDelete?: (fieldId: string) => void
  onEdit?: (fieldId: string) => void
}

const selector = (state: FormState) => ({
  deleteFormField: state.deleteFormField,
  setSelectedFormField: state.setSelectedFormField,
  setIsEditFormFieldOpen: state.setIsEditFormFieldOpen,
})

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ formField, form, style, isDragging, onDelete, onEdit, ...props }, ref) => {
    const { deleteFormField, setSelectedFormField, setIsEditFormFieldOpen } =
      useFormStore(useShallow(selector))

    const handleDelete = () => {
      if (!formField.id) return
      if (onDelete) {
        onDelete(formField.id)
      } else {
        deleteFormField(formField.id)
      }
    }

    const handleEdit = () => {
      if (!formField.id) return
      if (onEdit) {
        onEdit(formField.id)
      } else {
        setSelectedFormField(formField.id)
        setIsEditFormFieldOpen(true)
      }
    }

    return (
      <div
        className={cn(
          "group relative flex items-center gap-2 rounded-md border-2 border-dashed border-transparent",
          {
            "rounded-md border-foreground bg-muted opacity-60": isDragging,
          }
        )}
        style={style}
        ref={ref}
      >
        <div className="absolute -left-12 top-1/2 flex -translate-y-1/2 flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <TooltipWrapper text="Edit field">
            <Button
              size="icon"
              variant="secondary"
              onClick={handleEdit}
              type="button"
              className="h-8 w-8 hover:bg-primary hover:text-primary-foreground"
            >
              <PenIcon className="size-4" />
            </Button>
          </TooltipWrapper>
          <TooltipWrapper text="Delete field" side="bottom">
            <Button
              size="icon"
              variant="secondary"
              onClick={handleDelete}
              type="button"
              className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="size-4" />
            </Button>
          </TooltipWrapper>
        </div>
        <div className="w-full">
          <FormField
            control={form?.control}
            name={formField.name}
            render={({ field }) =>
              renderFormFieldComponent({ field, formField })
            }
          />
        </div>
        <Button
          size="icon"
          variant="secondary"
          type="button"
          {...props}
          className="absolute -right-12 top-1/2 h-8 w-8 -translate-y-1/2 opacity-0 transition-opacity hover:bg-primary hover:text-primary-foreground group-hover:opacity-100"
        >
          <GripVertical className="size-4" />
        </Button>
      </div>
    )
  }
)

Field.displayName = "Field"
