import { promises as fs } from 'fs'
import path from 'path'
import { MarkdownPage } from '@/components/markdown-page'

export const metadata = {
  title: 'Documentation - Shorms',
  description: 'Complete guide to using Shorms as a library',
}

export default async function DocsPage() {
  const filePath = path.join(process.cwd(), 'LIBRARY_USAGE.md')
  const content = await fs.readFile(filePath, 'utf-8')

  return (
    <MarkdownPage
      content={content}
      filename="LIBRARY_USAGE.md"
      title="Documentation"
      description="Complete guide to using the Shorms library in your React applications."
    />
  )
}
