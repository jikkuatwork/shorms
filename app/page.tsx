'use client'

import * as React from 'react'
import { Book, Download, Eye, History, Play, SearchCode, Trash2, Upload } from 'lucide-react'
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
import { formPagesToSchema } from '@/lib/schema-adapter'
import { generateFieldId, generateFieldName } from '@/lib/utils'
import type { FormPage } from '@/components/shorms/builder/types'
import type { FormField } from '@/types/field'

type WidthSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export default function Home() {
  const { toast } = useToast()
  const [width, setWidth] = React.useState<WidthSize>('lg')
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const [viewerOpen, setViewerOpen] = React.useState(false)
  const [importOpen, setImportOpen] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
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

      // Format the values for display
      const fieldCount = Object.keys(values).length
      const valuesList = Object.entries(values)
        .slice(0, 3)
        .map(([key, val]) => {
          const displayVal = typeof val === 'object'
            ? JSON.stringify(val)
            : String(val)
          return `${key}: ${displayVal.length > 30 ? displayVal.substring(0, 30) + '...' : displayVal}`
        })
        .join('\n')

      toast({
        title: 'Form Submitted Successfully! 🎉',
        description: (
          <div className="mt-2 space-y-1">
            <p className="font-medium">{fieldCount} field{fieldCount !== 1 ? 's' : ''} submitted:</p>
            <pre className="text-xs whitespace-pre-wrap">{valuesList}</pre>
            {fieldCount > 3 && <p className="text-xs text-muted-foreground">...and {fieldCount - 3} more</p>}
            <p className="text-xs text-muted-foreground mt-2">Check console for full data</p>
          </div>
        ),
      })
    },
    [toast]
  )

  const handleClear = () => {
    reset()
    toast({
      description: 'Form cleared successfully!',
    })
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-4 md:gap-4 md:px-6">
        <div className="flex flex-1 items-center gap-2 overflow-hidden md:gap-3">
          <div className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Logo className="size-4" />
            </div>
            <span className="hidden text-sm font-semibold sm:inline">
              Shorms
            </span>
            <span className="hidden rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
              v{VERSION}
            </span>
          </div>
          <div className="hidden h-6 w-px bg-border sm:block" />
          <nav className="hidden items-center gap-1 md:flex">
            <Button variant="ghost" size="sm" asChild className="h-8 gap-1.5 px-2 text-xs">
              <Link href="/docs">
                <Book className="size-3.5" />
                Docs
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="h-8 gap-1.5 px-2 text-xs">
              <Link href="/changelog">
                <History className="size-3.5" />
                Changelog
              </Link>
            </Button>
          </nav>
          <div className="hidden h-6 w-px bg-border md:block" />
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold">Form Builder</h1>
            <p className="hidden text-xs text-muted-foreground md:block">
              Design and preview your forms
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="hidden items-center gap-1 rounded-md border p-1 sm:flex">
            {sizes.map((size) => (
              <Button
                key={size.value}
                variant={width === size.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setWidth(size.value)}
                className="h-7 px-3 text-xs"
              >
                {size.label}
              </Button>
            ))}
          </div>
          <Separator orientation="vertical" className="hidden h-6 sm:block" />

          {/* Run Form */}
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="default" className="gap-2" title="Run Form">
                <Play className="size-4" />
                <span className="hidden lg:inline">Run Form</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="flex h-[80vh] max-w-3xl flex-col p-0">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle>Form Preview</DialogTitle>
              </DialogHeader>
              <ScrollArea className="flex-1 p-6 pt-2">
                <ShadcnRenderer
                  schema={schema}
                  onSubmit={handleSubmit}
                  features={{
                    stateManagement: true,
                  }}
                />
              </ScrollArea>
            </DialogContent>
          </Dialog>

          {/* View Button */}
          <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2" title="View Schema">
                <Eye className="size-4" />
                <span className="hidden lg:inline">View</span>
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
                  metadata={{
                    title: 'Form Schema',
                    createdAt: new Date().toISOString(),
                  }}
                />
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <Button
            size="sm"
            variant="outline"
            onClick={handleClear}
            title="Clear Form"
            className="gap-2"
          >
            <Trash2 className="size-4" />
            <span className="hidden lg:inline">Clear</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            title="Export Schema"
            className="gap-2"
          >
            <Download className="size-4" />
            <span className="hidden lg:inline">Export</span>
          </Button>

          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" title="Import Schema" className="gap-2">
                <Upload className="size-4" />
                <span className="hidden lg:inline">Import</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Import Schema</DialogTitle>
                <DialogDescription>
                  Select a JSON file to import. The form will load
                  automatically.
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

          <Separator orientation="vertical" className="hidden h-6 sm:block" />
          <ModeToggle />
        </div>
      </header>

      <main className="flex min-h-0 flex-1 p-4 md:p-6">
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
          onFieldReorder={reorderFields}
          width={width}
          features={{
            dragDrop: true,
            pageManagement: true,
            fieldSearch: true,
            commandPalette: true, // Enable command palette
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
      </main>

      <footer className="shrink-0 border-t bg-muted/30 py-4 text-center">
        <p className="text-sm text-muted-foreground">
          Shorms - Local-first form builder powered by shadcn/ui
        </p>
      </footer>
    </div>
  )
}
