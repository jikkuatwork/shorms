<a id="readme-top"></a>

<h3 align="center">Shorms - Shadcn Forms Builder</h3>

<p align="center">
  Multi-Page Form Builder for Shadcn/ui & React Hook Form
  <br />
  Build, preview, and export production-ready forms locally
</p>

## Table of Contents

- [About The Project](#about-the-project)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Updating](#updating)
- [Features](#features)
- [Documentation](#documentation)
- [License](#license)

## About The Project

**Shorms** (Shadcn + Forms) is a local-first form builder built on [shadcn/ui](https://ui.shadcn.com) and [React Hook Form](https://www.react-hook-form.com/).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Installation

```bash
npm install github:jikkuatwork/shorms
```

**Peer Dependencies:** React 19+, react-hook-form, zod, @dnd-kit/core, @dnd-kit/sortable

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Quick Start

### Builder - Create Forms

```typescript
import { Builder, useBuilderState } from 'shorms'

export default function MyFormBuilder() {
  const builder = useBuilderState()

  return (
    <Builder
      pages={builder.pages}
      activePageId={builder.activePageId}
      onPagesChange={builder.setPages}
      onActivePageChange={builder.setActivePageId}
      onPageAdd={builder.addPage}
      onFieldAdd={builder.addField}
      width="full"
    />
  )
}
```

### Renderer - Display Forms

```typescript
import { Renderer } from 'shorms'

export default function MyForm({ schema }) {
  const handleSubmit = (data) => {
    console.log('Form submitted:', data)
  }

  return <Renderer schema={schema} onSubmit={handleSubmit} />
}
```

### Viewer - Read-only Display

```typescript
import { Viewer } from 'shorms'

export default function FormViewer({ pages, submission }) {
  return <Viewer pages={pages} submissionData={submission} mode="detailed" />
}
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Updating

Add this script to your `package.json`:

```json
{
  "scripts": {
    "shorms:update": "npm install github:jikkuatwork/shorms --force"
  }
}
```

Then run:

```bash
npm run shorms:update
```

**Pin to specific version:**

```bash
npm install github:jikkuatwork/shorms#v0.3.0
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Features

### Components
- **Builder** - Drag-and-drop form builder with field library
- **Renderer** - Multi-page form with validation
- **Viewer** - Read-only form display with submission data

### Capabilities
- Multi-page wizard forms
- Advanced validation (regex, min/max, required, custom messages)
- File upload with size validation
- Drag-and-drop field reordering
- JSON import/export
- TypeScript support
- Zero global state dependency

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Documentation

- **[LIBRARY_USAGE.md](LIBRARY_USAGE.md)** - Complete usage guide
- **[Builder API](koder/builder-design/BUILDER_API.md)** - Builder component reference
- **[Code Examples](examples/code/)** - Practical examples

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

MIT License

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Built With

[Next.js](https://nextjs.org/) · [shadcn/ui](https://ui.shadcn.com/) · [React Hook Form](https://www.react-hook-form.com/) · [Zod](https://zod.dev/) · [dnd-kit](https://dndkit.com/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
