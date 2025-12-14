"use client"

import * as React from "react"
import { useFormStore } from "@/stores/form"
import { Download, Trash2, Upload } from "lucide-react"

import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { FormPreviewDialog } from "@/components/form-preview-dialog"

import { FormPage } from "@/types/form-store"

export function HeaderActions() {
  const { toast } = useToast()
  const pages = useFormStore((state) => state.pages)
  const setPages = useFormStore((state) => state.setPages)
  const clearFormFields = useFormStore((state) => state.clearFormFields)
  const setActivePage = useFormStore((state) => state.setActivePage)

  const [importOpen, setImportOpen] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!importOpen) {
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }, [importOpen])

  const handleExport = () => {
    const dataStr = JSON.stringify(pages, null, 2)
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = "shorms-schema.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    toast({
      description: "Schema exported successfully!",
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
        throw new Error("Invalid schema: Root must be an array of pages")
      }

      if (parsed.length > 0 && !parsed[0].id) {
        throw new Error("Invalid schema: Pages must have IDs")
      }

      setPages(parsed as FormPage[])
      if (parsed.length > 0) {
        setActivePage(parsed[0].id)
      }

      setImportOpen(false)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      toast({
        description: "Schema imported successfully!",
      })
    } catch (e) {
      toast({
        title: "Import Failed",
        description: (e as Error).message,
        variant: "destructive",
      })
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="ml-auto flex items-center gap-2">
      <FormPreviewDialog />

      <Button
        size="sm"
        variant="outline"
        onClick={clearFormFields}
        title="Clear Form"
      >
        <Trash2 className="mr-2 size-4" />
        Clear
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={handleExport}
        title="Export Schema"
      >
        <Download className="mr-2 size-4" />
        Export
      </Button>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" title="Import Schema">
            <Upload className="mr-2 size-4" />
            Import
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Import Schema</DialogTitle>
            <DialogDescription>
              Select a JSON file to import. The form will load automatically.
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
  )
}
