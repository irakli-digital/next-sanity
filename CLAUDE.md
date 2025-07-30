# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Next.js + Sanity CMS monorepo** demonstrating advanced integration patterns with the `next-sanity` toolkit. The project uses PNPM workspaces and Turborepo for coordinated builds across multiple applications and shared packages.

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

### Content Model
The project uses a blog-style schema with Post, Author, Category, and Block Content types. Content is managed through the embedded Sanity Studio accessible at `/studio` in the MVP app.

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

## Caching and Revalidation

This project demonstrates three revalidation strategies:

### Time-based Revalidation
Set `revalidate` parameter in `sanityFetch()` calls for automatic cache invalidation after specified seconds.

### Path-based Revalidation  
Use `revalidatePath()` in API routes (e.g., `/api/revalidate-path/route.ts`) triggered by Sanity webhooks to revalidate specific pages when content changes.

### Tag-based Revalidation
Use `revalidateTag()` in API routes (e.g., `/api/revalidate-tag/route.ts`) to revalidate multiple pages sharing the same cache tags when content changes.

## Quick Setup for New Projects

To quickly bootstrap a new Next.js + Sanity project:
```bash
npx sanity@latest init  # Creates project, installs dependencies, sets up Studio route
```

## Important Notes

- This project serves as both a development environment for the `next-sanity` toolkit and a comprehensive example of modern Next.js + Sanity integration
- The Live Content API setup demonstrates advanced caching strategies with automatic tag-based revalidation
- Both applications share the same content model but use different deployment strategies
- Always run type generation after modifying Sanity schemas to maintain type safety
- The `useCdn` setting should be `false` for static generation and `true` for client-side fetching
- Visual Editing is available on all Sanity plans and works in all hosting environments