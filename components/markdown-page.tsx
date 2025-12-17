'use client'

import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, Check, Copy, FileText } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MarkdownPageProps {
  content: string
  filename: string
  title: string
  description?: string
}

export function MarkdownPage({ content, filename, title, description }: MarkdownPageProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <h1 className="text-sm font-semibold">{title}</h1>
              <p className="text-xs text-muted-foreground">{filename}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Markdown
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-10">
        {description && (
          <p className="mb-8 text-lg text-muted-foreground">{description}</p>
        )}
        <article
          className={cn(
            'prose prose-neutral dark:prose-invert max-w-none',
            // Headings
            'prose-headings:scroll-mt-20 prose-headings:font-semibold prose-headings:tracking-tight',
            'prose-h1:text-3xl prose-h1:border-b prose-h1:pb-4 prose-h1:mb-6',
            'prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:pb-2',
            'prose-h3:text-xl prose-h3:mt-8',
            // Paragraphs and lists
            'prose-p:leading-7',
            'prose-li:my-1',
            // Code
            'prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none',
            'prose-pre:rounded-lg prose-pre:border prose-pre:bg-muted/50',
            // Links
            'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
            // Tables
            'prose-table:border prose-th:border prose-th:px-4 prose-th:py-2 prose-th:bg-muted/50',
            'prose-td:border prose-td:px-4 prose-td:py-2',
            // Blockquotes
            'prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:not-italic',
            // HR
            'prose-hr:my-8'
          )}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>
      </main>
    </div>
  )
}
