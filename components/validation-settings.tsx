"use client"

import * as React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import { FieldType, type FormField } from "@/types/field"

interface ValidationSettingsProps {
  selectedField: FormField
  onUpdate: (field: FormField) => void
}

export function ValidationSettings({ selectedField, onUpdate }: ValidationSettingsProps) {
  const handleValidationChange = (key: string, value: any) => {
    onUpdate({
      ...selectedField,
      validation: {
        ...selectedField.validation,
        [key]: value,
      },
    })
  }

  const showRegex = [
    FieldType.INPUT,
    FieldType.TEXTAREA,
    FieldType.EMAIL,
  ].includes(selectedField.type)

  const showTextLength = [
    FieldType.INPUT,
    FieldType.TEXTAREA,
    FieldType.EMAIL,
  ].includes(selectedField.type)

  const showNumberRange = [
    FieldType.NUMBER_INPUT,
    FieldType.SLIDER,
  ].includes(selectedField.type)

  const showFileSize = selectedField.type === FieldType.FILE_UPLOAD

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label className="text-base">Required</Label>
          <p className="text-sm text-muted-foreground">
            Mark this field as required.
          </p>
        </div>
        <Switch
          checked={selectedField.validation?.required || false}
          onCheckedChange={(checked) =>
            handleValidationChange("required", checked)
          }
        />
      </div>

      {showTextLength && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minLength">Min Length</Label>
            <Input
              id="minLength"
              type="number"
              placeholder="e.g. 3"
              value={selectedField.validation?.min || ""}
              onChange={(e) =>
                handleValidationChange("min", e.target.value ? parseInt(e.target.value) : undefined)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxLength">Max Length</Label>
            <Input
              id="maxLength"
              type="number"
              placeholder="e.g. 100"
              value={selectedField.validation?.max || ""}
              onChange={(e) =>
                handleValidationChange("max", e.target.value ? parseInt(e.target.value) : undefined)
              }
            />
          </div>
        </div>
      )}

      {showNumberRange && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minValue">Min Value</Label>
            <Input
              id="minValue"
              type="number"
              placeholder="e.g. 0"
              value={selectedField.validation?.min || ""}
              onChange={(e) =>
                handleValidationChange("min", e.target.value ? parseFloat(e.target.value) : undefined)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxValue">Max Value</Label>
            <Input
              id="maxValue"
              type="number"
              placeholder="e.g. 100"
              value={selectedField.validation?.max || ""}
              onChange={(e) =>
                handleValidationChange("max", e.target.value ? parseFloat(e.target.value) : undefined)
              }
            />
          </div>
        </div>
      )}

      {showFileSize && (
        <div className="space-y-2">
          <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
          <Input
            id="maxFileSize"
            type="number"
            step="0.1"
            placeholder="e.g. 5"
            value={selectedField.validation?.maxFileSize || ""}
            onChange={(e) =>
              handleValidationChange("maxFileSize", e.target.value ? parseFloat(e.target.value) : undefined)
            }
          />
          <p className="text-xs text-muted-foreground">
            Maximum file size in megabytes.
          </p>
        </div>
      )}

      {showRegex && (
        <div className="space-y-2">
          <Label htmlFor="regex">Regex Pattern</Label>
          <Input
            id="regex"
            placeholder="e.g. ^[A-Za-z]+$"
            value={selectedField.validation?.regex || ""}
            onChange={(e) => handleValidationChange("regex", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Regular expression for validation.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="errorMessage">Custom Error Message</Label>
        <Input
          id="errorMessage"
          placeholder="e.g. This field is required"
          value={selectedField.validation?.errorMessage || ""}
          onChange={(e) =>
            handleValidationChange("errorMessage", e.target.value)
          }
        />
        <p className="text-xs text-muted-foreground">
          Override default validation error messages.
        </p>
      </div>
    </div>
  )
}
