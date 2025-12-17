"use client"

import * as React from "react"
import { EditFormField } from "@/components/edit-form-field"
import { FieldCommandPalette } from "@/components/field-command-palette"
import { FormEditor, FormEditorProps } from "@/components/form-editor"
import { HeaderActions } from "@/components/header-actions"
import { Logo } from "@/components/logo"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

type WidthSize = NonNullable<FormEditorProps["width"]>

export default function OriginalPage() {
  const [width, setWidth] = React.useState<WidthSize>("lg")

  const sizes: Array<{ value: WidthSize; label: string }> = [
    { value: "sm", label: "SM" },
    { value: "md", label: "MD" },
    { value: "lg", label: "LG" },
    { value: "xl", label: "XL" },
    { value: "full", label: "Full" },
  ]

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-4 md:gap-4 md:px-6">
        <div className="flex flex-1 items-center gap-2 overflow-hidden md:gap-3">
          <div className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Logo className="size-4" />
            </div>
            <span className="hidden text-sm font-semibold sm:inline">Shorms</span>
          </div>
          <div className="hidden h-6 w-px bg-border sm:block" />
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold">Form Builder (Original)</h1>
            <p className="hidden text-xs text-muted-foreground md:block">
              Legacy Zustand-based version
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="hidden items-center gap-1 rounded-md border p-1 sm:flex">
            {sizes.map((size) => (
              <Button
                key={size.value}
                variant={width === size.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setWidth(size.value)}
                className="h-7 px-3 text-xs"
              >
                {size.label}
              </Button>
            ))}
          </div>
          <Separator orientation="vertical" className="hidden h-6 sm:block" />
          <HeaderActions />
          <Separator orientation="vertical" className="hidden h-6 sm:block" />
          <ModeToggle />
        </div>
      </header>

      <main className="flex min-h-0 flex-1 p-4 md:p-6">
        <FormEditor
          width={width}
          className="mx-auto h-full w-full overflow-hidden rounded-lg border bg-card shadow-sm"
        />
      </main>

      <EditFormField />

      <footer className="shrink-0 border-t bg-muted/30 py-4 text-center">
        <p className="text-sm text-muted-foreground">
          Shorms - Local-first form builder powered by shadcn/ui
        </p>
      </footer>
    </div>
  )
}
