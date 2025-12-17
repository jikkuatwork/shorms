'use client'

import * as React from 'react'
import { Book, ChevronDown, Download, Eye, History, Play, Trash2, Upload } from 'lucide-react'
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
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/docs" className="gap-2">
                  <Book className="size-4" />
                  Documentation
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/changelog" className="gap-2">
                  <History className="size-4" />
                  Changelog
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="https://github.com/jikkuatwork/shorms" target="_blank" rel="noopener noreferrer" className="gap-2">
                  GitHub
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Center: Size selector */}
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

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Primary actions */}
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5" title="Run Form">
                <Play className="size-3.5" />
                <span className="hidden sm:inline">Run</span>
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
                  features={{ stateManagement: true }}
                />
              </ScrollArea>
            </DialogContent>
          </Dialog>

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

          <Button
            size="sm"
            variant="ghost"
            onClick={handleClear}
            title="Clear Form"
            className="h-8 px-2"
          >
            <Trash2 className="size-3.5" />
          </Button>

          <Separator orientation="vertical" className="h-5" />
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
