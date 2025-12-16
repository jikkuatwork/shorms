"use client"

import * as React from "react"
import { useFormStore } from "@/stores/form"
import { Play } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShadcnRenderer } from "@/components/shorms/shadcn-renderer"
import { formPagesToSchema } from "@/lib/schema-adapter"

export function FormPreviewDialog() {
  const [open, setOpen] = React.useState(false)
  const pages = useFormStore((state) => state.pages)
  const { toast } = useToast()

  // Convert legacy FormPage[] to new ShormsSchema
  const schema = React.useMemo(() => formPagesToSchema(pages), [pages])

  const handleSubmit = React.useCallback((values: any) => {
    console.log('Form submitted:', values)
    toast({
      title: "Form Submitted",
      description: "Check the console for submitted values.",
    })
  }, [toast])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default" className="gap-2">
          <Play className="size-4" />
          Run Form
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
  )
}
