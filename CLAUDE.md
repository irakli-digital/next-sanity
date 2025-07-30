# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Next.js + Sanity CMS monorepo** for the Amonashvili Academy platform, demonstrating advanced integration patterns with the `next-sanity` toolkit. The project uses PNPM workspaces and Turborepo for coordinated builds across multiple applications and shared packages.

**Amonashvili Academy** is a comprehensive digital platform for psychology and parenting education featuring:
- Content management system for courses, programs, and educational materials
- E-commerce capabilities with guest checkout flow  
- Blog and resources section
- Event management and video gallery
- Analytics and marketing integration

## Commands

### Root Level (use from project root)
```bash
pnpm dev          # Start all applications in development mode
pnpm build        # Build packages only  
pnpm start        # Build and start all applications
pnpm format       # Format code with Prettier + oxlint
pnpm lint         # Lint code with oxlint
pnpm type-check   # Type check all packages
```

### Individual Applications
```bash
# MVP App (full-featured with embedded Studio)
cd apps/mvp && pnpm dev      # Development server on port 3000
cd apps/mvp && pnpm build    # Build with Studio manifest
cd apps/mvp && pnpm typegen  # Generate TypeScript types from Sanity schema

# Static App (static export)
cd apps/static && pnpm dev   # Development server on port 3001
cd apps/static && pnpm build # Build static export to /out
cd apps/static && pnpm start # Serve static files
```

### Sanity CLI Commands (if sanity.cli.ts is configured)
```bash
npx sanity help              # List all available Sanity commands
npx sanity cors add          # Add CORS origins for Studio
npx sanity schema extract    # Extract schema to JSON file
npx sanity typegen generate  # Generate TypeScript types
```

## Architecture

### Monorepo Structure
- **apps/mvp/**: Full-featured Next.js app with embedded Sanity Studio at `/studio`
- **apps/static/**: Static export version optimized for production hosting
- **packages/next-sanity/**: Main toolkit package for Next.js + Sanity integration
- **packages/sanity-config/**: Shared Sanity configuration and schema
- **packages/typescript-config/**: Shared TypeScript configuration

### Technology Stack
- **Next.js 15.3.5** with App Router and React 19
- **Sanity CMS 4.2.0** with Studio and Visual Editing
- **PNPM workspaces** with package catalog for dependency management
- **Turborepo** for coordinated builds and caching
- **TypeScript 5.8.3** with auto-generated types from Sanity schema

### Key Features
- **Live Content API**: Real-time content updates without page refresh using `defineLive()`
- **Visual Editing**: Interactive content editing in preview mode with Presentation Tool
- **Draft Mode**: Preview unpublished content with secure preview URLs
- **Type Safety**: Full TypeScript integration from CMS schema to frontend components
- **Guest Checkout**: Simplified purchase flow without user accounts
- **E-commerce Integration**: TBC Bank payment gateway with automated digital delivery

### Content Model
The project uses an educational platform schema with Program, Book, Event, Video, Blog Post, Author, and Category types. Content is managed through the embedded Sanity Studio accessible at `/studio` in the MVP app.

### Deployment Patterns
- **MVP App**: Dynamic server-side rendering with real-time content updates
- **Static App**: Static site generation for optimal performance and hosting flexibility

## Environment Setup

Required environment variables (copy from `.env.local.example`):
```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_SANITY_DATASET=<your-dataset>
SANITY_API_READ_TOKEN=<viewer-token>
SANITY_REVALIDATE_SECRET=<random-string>  # For webhook revalidation
```

## Development Workflow

1. Install dependencies: `pnpm install`
2. Set up environment variables in `.env.local`
3. Start development: `pnpm dev`
4. Access applications:
   - MVP app: http://localhost:3000
   - Static app: http://localhost:3001
   - Sanity Studio: http://localhost:3000/studio

After schema changes, run `cd apps/mvp && pnpm typegen` to regenerate TypeScript types.

## Installation & Setup

### Quick Start

Instantly create a new free Sanity project – or link to an existing one – from the command line:

```bash
npx sanity@latest init  # Creates project, installs dependencies, sets up Studio route
```

### Manual Installation

If you don't have a Next.js application yet:

```bash
npx create-next-app@latest
```

Install the next-sanity toolkit:

```bash
pnpm install next-sanity @sanity/image-url
```

This also installs `@sanity/image-url` for On-Demand Image Transformations to render images from Sanity's CDN.

### Manual Configuration

**Create environment variables:**

```bash
# .env.local
NEXT_PUBLIC_SANITY_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_SANITY_DATASET=<your-dataset-name>
```

**Create environment file:**

```ts
// ./src/sanity/env.ts
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-07-11'
```

### Write GROQ Queries

`next-sanity` exports the `defineQuery` function for syntax highlighting and type generation:

```ts
// ./src/sanity/lib/queries.ts
import {defineQuery} from 'next-sanity'

export const PROGRAMS_QUERY = defineQuery(`*[_type == "program" && defined(slug.current)][0...12]{
  _id, title, slug, price, description
}`)

export const PROGRAM_QUERY = defineQuery(`*[_type == "program" && slug.current == $slug][0]{
  title, description, price, curriculum, mainImage
}`)
```

### Generate TypeScript Types

Configure Sanity TypeGen:

```json
// sanity-typegen.json
{
  "path": "./src/**/*.{ts,tsx,js,jsx}",
  "schema": "./src/sanity/extract.json",
  "generates": "./src/sanity/types.ts"
}
```

Run type generation:

```bash
npx sanity@latest schema extract
npx sanity@latest typegen generate
```

Update package.json:

```json
"scripts": {
  "predev": "npm run typegen",
  "dev": "next",
  "prebuild": "npm run typegen",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typegen": "sanity schema extract --path=src/sanity/extract.json && sanity typegen generate"
}
```

## Query Content from Sanity

### Configuring Sanity Client

```ts
// ./src/sanity/lib/client.ts
import {createClient} from 'next-sanity'
import {apiVersion, dataset, projectId} from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
})
```

### Fetching in App Router Components

```tsx
// ./src/app/programs/page.tsx
import {client} from '@/sanity/lib/client'
import {PROGRAMS_QUERY} from '@/sanity/lib/queries'

export default async function ProgramsIndex() {
  const programs = await client.fetch(PROGRAMS_QUERY)

  return (
    <div>
      {programs.map((program) => (
        <div key={program._id}>
          <h2>{program.title}</h2>
          <p>{program.description}</p>
          <button>Enroll Now - ${program.price}</button>
        </div>
      ))}
    </div>
  )
}
```

### Should `useCdn` be `true` or `false`?

Set `useCdn` to `true` when:
- Data fetching happens client-side
- Server-side rendered (SSR) data fetching is dynamic with high unique requests

Set `useCdn` to `false` when:
- Used in static site generation context
- Used in ISR on-demand webhook responder
- Good `stale-while-revalidate` caching is in place
- For Preview or Draft modes

## Caching and Revalidation

This project demonstrates three revalidation strategies:

### `sanityFetch()` Helper Function

```ts
// ./src/sanity/lib/client.ts
import {createClient, type QueryParams} from 'next-sanity'
import {apiVersion, dataset, projectId} from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
})

export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
  revalidate = 60, // default revalidation time in seconds
  tags = [],
}: {
  query: QueryString
  params?: QueryParams
  revalidate?: number | false
  tags?: string[]
}) {
  return client.fetch(query, params, {
    cache: 'force-cache',
    next: {
      revalidate: tags.length ? false : revalidate,
      tags,
    },
  })
}
```

### Time-based Revalidation
Set `revalidate` parameter in `sanityFetch()` calls for automatic cache invalidation after specified seconds.

```tsx
export default async function ProgramsIndex() {
  const programs = await sanityFetch({
    query: PROGRAMS_QUERY,
    revalidate: 3600, // update cache at most once every hour
  })

  return (
    <div>
      {programs.map((program) => (
        <div key={program._id}>
          <h2>{program.title}</h2>
        </div>
      ))}
    </div>
  )
}
```

### Path-based Revalidation  
Use `revalidatePath()` in API routes triggered by Sanity webhooks:

```ts
// ./src/app/api/revalidate-path/route.ts
import {revalidatePath} from 'next/cache'
import {type NextRequest, NextResponse} from 'next/server'
import {parseBody} from 'next-sanity/webhook'

type WebhookPayload = {path?: string}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.SANITY_REVALIDATE_SECRET) {
      return new Response('Missing environment variable SANITY_REVALIDATE_SECRET', {status: 500})
    }

    const {isValidSignature, body} = await parseBody<WebhookPayload>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
    )

    if (!isValidSignature) {
      const message = 'Invalid signature'
      return new Response(JSON.stringify({message, isValidSignature, body}), {status: 401})
    } else if (!body?.path) {
      const message = 'Bad Request'
      return new Response(JSON.stringify({message, body}), {status: 400})
    }

    revalidatePath(body.path)
    const message = `Updated route: ${body.path}`
    return NextResponse.json({body, message})
  } catch (err) {
    console.error(err)
    return new Response(err.message, {status: 500})
  }
}
```

### Tag-based Revalidation
Use `revalidateTag()` for multiple pages sharing the same cache tags:

```ts
// ./src/app/api/revalidate-tag/route.ts
import {revalidateTag} from 'next/cache'
import {type NextRequest, NextResponse} from 'next/server'
import {parseBody} from 'next-sanity/webhook'

type WebhookPayload = {
  _type: string
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.SANITY_REVALIDATE_SECRET) {
      return new Response('Missing environment variable SANITY_REVALIDATE_SECRET', {status: 500})
    }

    const {isValidSignature, body} = await parseBody<WebhookPayload>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
    )

    if (!isValidSignature) {
      const message = 'Invalid signature'
      return new Response(JSON.stringify({message, isValidSignature, body}), {status: 401})
    } else if (!body?._type) {
      const message = 'Bad Request'
      return new Response(JSON.stringify({message, body}), {status: 400})
    }

    revalidateTag(body._type)
    return NextResponse.json({body})
  } catch (err) {
    console.error(err)
    return new Response(err.message, {status: 500})
  }
}
```

## Visual Editing

Interactive live previews of draft content provide the best authoring experience. Visual Editing is available on all Sanity plans and can be enabled on all hosting environments.

## Live Content API

The Live Content API provides real-time updates in your application when viewing both draft content in contexts like Presentation tool, and published content in your user-facing production application.

### Setup

#### 1. Configure `defineLive`

```tsx
// src/sanity/lib/live.ts
import {createClient, defineLive} from 'next-sanity'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: true,
  apiVersion: 'v2025-03-04',
  stega: {studioUrl: '/studio'},
})

const token = process.env.SANITY_API_READ_TOKEN
if (!token) {
  throw new Error('Missing SANITY_API_READ_TOKEN')
}

export const {sanityFetch, SanityLive} = defineLive({
  client,
  serverToken: token,
  browserToken: token,
})
```

#### 2. Render `<SanityLive />` in root layout

```tsx
// src/app/layout.tsx
import {VisualEditing} from 'next-sanity'
import {SanityLive} from '@/sanity/lib/live'

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        {children}
        <SanityLive />
        {(await draftMode()).isEnabled && <VisualEditing />}
      </body>
    </html>
  )
}
```

#### 3. Fetching data with `sanityFetch`

```tsx
// src/app/programs.tsx
import {defineQuery} from 'next-sanity'
import {sanityFetch} from '@/sanity/lib/live'

const PROGRAMS_QUERY = defineQuery(`*[_type == "program" && defined(slug.current)][0...$limit]`)

export default async function Page() {
  const {data: programs} = await sanityFetch({
    query: PROGRAMS_QUERY,
    params: {limit: 10},
  })

  return (
    <section>
      {programs.map((program) => (
        <article key={program._id}>
          <a href={`/programs/${program.slug}`}>{program.title}</a>
        </article>
      ))}
    </section>
  )
}
```

## Embedded Sanity Studio

Sanity Studio is embedded into the Next.js application at the `/studio` route.

### Studio Route with App Router

```tsx
// ./src/app/studio/[[...tool]]/page.tsx
import {NextStudio} from 'next-sanity/studio'
import config from '../../../../sanity.config'

export const dynamic = 'force-static'
export {metadata, viewport} from 'next-sanity/studio'

export default function StudioPage() {
  return <NextStudio config={config} />
}
```

### Manual Studio Configuration

```ts
// ./sanity.config.ts
'use client'

import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  plugins: [structureTool()],
  schema: {types: []},
})
```

## Important Notes

- This project serves as both a development environment for the `next-sanity` toolkit and a comprehensive example of modern Next.js + Sanity integration for educational platforms
- The Live Content API setup demonstrates advanced caching strategies with automatic tag-based revalidation
- Both applications share the same content model but use different deployment strategies
- Always run type generation after modifying Sanity schemas to maintain type safety
- The `useCdn` setting should be `false` for static generation and `true` for client-side fetching
- Visual Editing is available on all Sanity plans and works in all hosting environments
- Guest checkout flow eliminates the need for user authentication while maintaining purchase functionality
- Purchase buttons are integrated directly on program, book, and event pages for streamlined user experience

## Quick Setup for New Projects

To quickly bootstrap a new Next.js + Sanity project:
```bash
npx sanity@latest init  # Creates project, installs dependencies, sets up Studio route
```

## E-commerce Integration

The platform uses a simplified guest checkout flow:
1. User clicks purchase button on program/book/event page
2. Redirected to checkout page with guest information form (name, email, mobile)
3. Payment processed via TBC Bank gateway
4. Digital products delivered automatically via email
5. Order confirmation sent to customer

No user accounts or shopping cart functionality - direct purchase flow for optimal conversion.