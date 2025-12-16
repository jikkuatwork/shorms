'use client'

/**
 * Shadcn-styled Renderer Wrapper
 * Uses the core Renderer with shadcn/ui components for styling
 */

import * as React from 'react'
import { Renderer } from './renderer'
import type { RendererProps, FormField as ShormsFormField, FormPage } from './renderer/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

interface ShadcnRendererProps extends Omit<RendererProps, 'renderField' | 'renderPage' | 'renderProgress'> {
  className?: string
}

export function ShadcnRenderer({ className, ...props }: ShadcnRendererProps) {
  // Custom field renderer using shadcn components
  const renderField = React.useCallback((field: ShormsFormField, value: any, onChange: (value: any) => void) => {
    return (
      <div key={field.id} className="space-y-2">
        <Label htmlFor={field.name}>
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>

        {field.description && (
          <p className="text-sm text-muted-foreground">{field.description}</p>
        )}

        {renderFieldInput(field, value, onChange)}
      </div>
    )
  }, [])

  // Render different input types with shadcn components
  const renderFieldInput = (
    field: ShormsFormField,
    value: any,
    onChange: (value: any) => void
  ) => {
    // Extract common properties from config if available
    const placeholder = (field.config?.placeholder || field.config?.placeholderText) as string | undefined
    const options = (field.config?.options || []) as Array<{ label: string; value: string }>

    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <Input
            id={field.name}
            name={field.name}
            type={field.type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={field.required}
          />
        )

      case 'number':
        return (
          <Input
            id={field.name}
            name={field.name}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        )

      case 'textarea':
        return (
          <Textarea
            id={field.name}
            name={field.name}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={field.required}
            rows={4}
          />
        )

      case 'select':
        return (
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger id={field.name}>
              <SelectValue placeholder={placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'radio':
        return (
          <RadioGroup value={value || ''} onValueChange={onChange}>
            {options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.name}-${option.value}`} />
                <Label htmlFor={`${field.name}-${option.value}`} className="font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={!!value}
              onCheckedChange={onChange}
            />
            <Label htmlFor={field.name} className="font-normal">
              {placeholder || 'Check this box'}
            </Label>
          </div>
        )

      case 'switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.name}
              checked={!!value}
              onCheckedChange={onChange}
            />
            <Label htmlFor={field.name} className="font-normal">
              {placeholder || 'Toggle'}
            </Label>
          </div>
        )

      case 'slider':
        return (
          <div className="space-y-2">
            <Slider
              id={field.name}
              value={[value || field.validation?.min || 0]}
              onValueChange={(vals) => onChange(vals[0])}
              min={field.validation?.min || 0}
              max={field.validation?.max || 100}
              step={1}
            />
            <div className="text-sm text-muted-foreground text-center">
              {value || field.validation?.min || 0}
            </div>
          </div>
        )

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !value && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => onChange(date?.toISOString())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )

      case 'file':
        return (
          <Input
            id={field.name}
            name={field.name}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0]
              onChange(file)
            }}
            required={field.required}
          />
        )

      default:
        return (
          <Input
            id={field.name}
            name={field.name}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={field.required}
          />
        )
    }
  }

  // Custom page renderer
  const renderPage = React.useCallback((page: FormPage, children: React.ReactNode) => {
    return (
      <div className="space-y-6">
        {page.title && (
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">{page.title}</h2>
            {page.description && (
              <p className="text-sm text-muted-foreground">{page.description}</p>
            )}
          </div>
        )}
        <div className="space-y-4">
          {children}
        </div>
      </div>
    )
  }, [])

  // Custom progress indicator
  const renderProgress = React.useCallback((current: number, total: number, progress: number) => {
    return (
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {current} of {total}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    )
  }, [])

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      <Renderer
        {...props}
        renderField={renderField}
        renderPage={renderPage}
        renderProgress={renderProgress}
      />
    </div>
  )
}
