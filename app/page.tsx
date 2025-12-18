'use client'

import * as React from 'react'
import { Book, ChevronDown, Download, Eye, Github, History, Hammer, Play, Trash2, Upload } from 'lucide-react'
import Link from 'next/link'
import { VERSION } from '@/lib/version'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Logo } from '@/components/logo'
import { ModeToggle } from '@/components/mode-toggle'
import { Builder } from '@/components/shorms/builder/builder'
import { useBuilderState } from '@/components/shorms/builder/use-builder-state'
import { defaultFieldTemplates } from '@/components/shorms/builder/constants'
import { ShadcnRenderer } from '@/components/shorms/shadcn-renderer'
import { ShadcnViewer } from '@/components/shorms/shadcn-viewer'
import { ControlledFieldCommandPalette } from '@/components/controlled-field-command-palette'
import { EditFormField } from '@/components/edit-form-field'
import { formPagesToSchema } from '@/lib/schema-adapter'
import { generateFieldId, generateFieldName } from '@/lib/utils'
import type { FormPage } from '@/components/shorms/builder/types'
import type { FormField } from '@/types/field'

type WidthSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'
type AppMode = 'builder' | 'runner'

export default function Home() {
  const { toast } = useToast()
  const [width, setWidth] = React.useState<WidthSize>('lg')
  const [mode, setMode] = React.useState<AppMode>('builder')
  const [viewerOpen, setViewerOpen] = React.useState(false)
  const [importOpen, setImportOpen] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [editFieldId, setEditFieldId] = React.useState<string | null>(null)
  const [editPanelOpen, setEditPanelOpen] = React.useState(false)
  const [clearDialogOpen, setClearDialogOpen] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const builderState = useBuilderState()
  const {
    pages,
    activePageId,
    setPages,
    setActivePageId,
    addPage,
    deletePage,
    updatePageTitle,
    reorderPages,
    addField,
    updateField,
    deleteField,
    reorderFields,
    reset,
  } = builderState

  // Convert pages to schema for renderer
  const schema = React.useMemo(() => formPagesToSchema(pages), [pages])

  // Find selected field for editing
  const selectedField = React.useMemo(() => {
    if (!editFieldId) return null
    for (const page of pages) {
      const field = page.fields.find((f) => f.id === editFieldId)
      if (field) return field
    }
    return null
  }, [editFieldId, pages])

  // Handle edit field
  const handleEditField = (fieldId: string) => {
    setEditFieldId(fieldId)
    setEditPanelOpen(true)
  }

  // Handle field update from edit panel
  const handleFieldUpdate = (field: FormField) => {
    if (!field.id) return
    updateField(field.id, field)
  }

  // Determine if left sidebar (Field Library) is visible based on width
  const leftSidebarVisible = React.useMemo(() => {
    return width === 'lg' || width === 'xl' || width === 'full'
  }, [width])

  const sizes: Array<{ value: WidthSize; label: string }> = [
    { value: 'sm', label: 'SM' },
    { value: 'md', label: 'MD' },
    { value: 'lg', label: 'LG' },
    { value: 'xl', label: 'XL' },
    { value: 'full', label: 'Full' },
  ]

  // Reset file input when dialog closes
  React.useEffect(() => {
    if (!importOpen) {
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [importOpen])

  const handleExport = () => {
    const dataStr = JSON.stringify(pages, null, 2)
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    const exportFileDefaultName = 'shorms-schema.json'

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()

    toast({
      description: 'Schema exported successfully!',
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)

    try {
      const text = await file.text()
      const parsed = JSON.parse(text)

      // Basic validation
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid schema: Root must be an array of pages')
      }

      if (parsed.length > 0 && !parsed[0].id) {
        throw new Error('Invalid schema: Pages must have IDs')
      }

      setPages(parsed as FormPage[])
      if (parsed.length > 0) {
        setActivePageId(parsed[0].id)
      }

      setImportOpen(false)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      toast({
        description: 'Schema imported successfully!',
      })
    } catch (e) {
      toast({
        title: 'Import Failed',
        description: (e as Error).message,
        variant: 'destructive',
      })
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSubmit = React.useCallback(
    (values: any) => {
      console.log('Form submitted:', values)

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
    },
    [toast]
  )

  const handleClear = () => {
    reset()
    setClearDialogOpen(false)
    toast({
      description: 'Form cleared successfully!',
    })
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="z-10 flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background px-4">
        {/* Left: Logo with dropdown */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <div className="flex aspect-square size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Logo className="size-3.5" />
                </div>
                <div className="hidden sm:block text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold">Shorms</span>
                    <span className="text-[10px] font-medium text-emerald-500 drop-shadow-[0_0_3px_rgba(16,185,129,0.5)]">
                      v{VERSION}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">Shadcn Form Builder</span>
                </div>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/docs" className="flex items-start gap-2">
                  <Book className="size-4 mt-0.5" />
                  <div>
                    <div className="font-medium">Docs</div>
                    <div className="text-xs text-muted-foreground">Library usage guide</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/changelog" className="flex items-start gap-2">
                  <History className="size-4 mt-0.5" />
                  <div>
                    <div className="font-medium">Changelog</div>
                    <div className="text-xs text-muted-foreground">Version history</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="https://github.com/jikkuatwork/shorms" target="_blank" rel="noopener noreferrer" className="flex items-start gap-2">
                  <Github className="size-4 mt-0.5" />
                  <div>
                    <div className="font-medium">GitHub</div>
                    <div className="text-xs text-muted-foreground">View source code</div>
                  </div>
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Center: Mode toggle and Size selector */}
        <div className="flex items-center gap-4">
          {/* Mode toggle */}
          <div className="flex items-center rounded-md border p-0.5">
            <Button
              variant={mode === 'builder' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setMode('builder')}
              className="h-7 gap-1.5 px-3 text-xs"
            >
              <Hammer className="size-3.5" />
              Builder
            </Button>
            <Button
              variant={mode === 'runner' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setMode('runner')}
              className="h-7 gap-1.5 px-3 text-xs"
            >
              <Play className="size-3.5" />
              Runner
            </Button>
          </div>

          {/* Size selector - only show in builder mode */}
          {mode === 'builder' && (
            <div className="hidden items-center rounded-md border p-0.5 md:flex">
              {sizes.map((size) => (
                <Button
                  key={size.value}
                  variant={width === size.value ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setWidth(size.value)}
                  className="h-7 px-2.5 text-xs"
                >
                  {size.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Schema viewer */}
          <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5" title="View Schema">
                <Eye className="size-3.5" />
                <span className="hidden sm:inline">View</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="flex h-[80vh] max-w-4xl flex-col p-0">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle>Schema Viewer</DialogTitle>
              </DialogHeader>
              <ScrollArea className="flex-1 p-6 pt-2">
                <ShadcnViewer
                  pages={pages}
                  mode="detailed"
                  showValidation={true}
                  showFieldTypes={true}
                  showPageNavigation={true}
                  metadata={{ title: 'Form Schema', createdAt: new Date().toISOString() }}
                />
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <Separator orientation="vertical" className="h-5" />

          {/* File actions - segmented */}
          <div className="flex items-center rounded-md border">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleExport}
              title="Export JSON"
              className="h-8 rounded-r-none border-r px-2"
            >
              <Download className="size-3.5" />
            </Button>
            <Dialog open={importOpen} onOpenChange={setImportOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" title="Import JSON" className="h-8 rounded-l-none px-2">
                  <Upload className="size-3.5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Import Schema</DialogTitle>
                  <DialogDescription>
                    Select a JSON file to import.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileChange}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                title="Clear Form"
                className="h-8 px-2"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Clear Form</DialogTitle>
                <DialogDescription>
                  Are you sure you want to clear the entire form? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setClearDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleClear}
                >
                  Clear Form
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Separator orientation="vertical" className="h-5" />
          <ModeToggle />
        </div>
      </header>

      <main className="flex min-h-0 flex-1 p-4 md:p-6">
        {mode === 'builder' ? (
          <Builder
            pages={pages}
            activePageId={activePageId}
            onPagesChange={setPages}
            onActivePageChange={setActivePageId}
            onPageAdd={addPage}
            onPageDelete={deletePage}
            onPageRename={updatePageTitle}
            onPageReorder={reorderPages}
            onFieldAdd={addField}
            onFieldUpdate={updateField}
            onFieldDelete={deleteField}
            onFieldEdit={handleEditField}
            onFieldReorder={reorderFields}
            width={width}
            features={{
              dragDrop: true,
              pageManagement: true,
              fieldSearch: true,
              commandPalette: true,
            }}
            renderCommandPalette={() => (
              <ControlledFieldCommandPalette
                fields={defaultFieldTemplates}
                onFieldAdd={addField}
                generateFieldId={generateFieldId}
                generateFieldName={generateFieldName}
              />
            )}
            className="mx-auto h-full w-full overflow-hidden rounded-lg border bg-card shadow-sm"
          />
        ) : (
          <div className="mx-auto h-full w-full max-w-3xl overflow-hidden rounded-lg border bg-card shadow-sm">
            <div className="flex h-full flex-col">
              <div className="shrink-0 border-b bg-muted/30 px-6 py-4">
                <h2 className="text-lg font-semibold">Form Preview</h2>
                <p className="text-sm text-muted-foreground">Fill out the form and submit to test</p>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-6">
                  <ShadcnRenderer
                    schema={schema}
                    onSubmit={handleSubmit}
                    features={{ stateManagement: true }}
                  />
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </main>

      <footer className="shrink-0 border-t bg-muted/30 py-4 text-center">
        <p className="text-sm text-muted-foreground">
          Shorms - Local-first form builder powered by shadcn/ui
        </p>
      </footer>

      {/* Edit Field Panel */}
      <EditFormField
        open={editPanelOpen}
        onOpenChange={setEditPanelOpen}
        selectedField={selectedField}
        onUpdate={handleFieldUpdate}
      />
    </div>
  )
}
