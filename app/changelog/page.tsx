import { promises as fs } from 'fs'
import path from 'path'
import { MarkdownPage } from '@/components/markdown-page'

export const metadata = {
  title: 'Changelog - Shorms',
  description: 'Version history and release notes for Shorms',
}

export default async function ChangelogPage() {
  const filePath = path.join(process.cwd(), 'CHANGELOG.md')
  const content = await fs.readFile(filePath, 'utf-8')

  return (
    <MarkdownPage
      content={content}
      filename="CHANGELOG.md"
      title="Changelog"
      description="Version history and release notes."
    />
  )
}
