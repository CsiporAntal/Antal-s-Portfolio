# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Start Next.js development server on http://localhost:3000
- **Build**: `npm run build` - Create production build
- **Production server**: `npm run start` - Start production server (requires build first)
- **Type checking**: No separate typecheck command - TypeScript validation happens during build

## Project Architecture

This is a **Next.js 15** portfolio website built with the **App Router** architecture featuring:

### Core Technology Stack
- **Framework**: Next.js 15.3.4 with App Router
- **Styling**: Tailwind CSS 4.1.11 with custom CSS variables and animations
- **TypeScript**: 5.8.3 with relaxed strict mode (`"strict": false`)
- **Theme**: `next-themes` for dark/light mode switching
- **Analytics**: Vercel Analytics and Speed Insights
- **Content**: MDX support via `next-mdx-remote`

### Key Architectural Patterns

#### File Structure
```
app/
├── components/          # Reusable UI components
│   ├── nav.tsx         # Mobile-responsive navigation with scroll effects
│   ├── theme-switch.tsx # Dark/light mode toggle
│   └── footer.tsx      # Social links footer
├── lib/
│   ├── config.ts       # Site metadata and social links
│   └── posts.ts        # MDX content handling
├── page.tsx            # Main homepage with particle system
├── layout.tsx          # Root layout with theme provider
├── projects/           # Projects page
├── photos/             # Photo gallery page
└── globals.css         # Global styles and CSS variables
```

#### Configuration Architecture
- **Site metadata**: Centralized in `app/lib/config.ts` with `metaData` and `socialLinks` exports
- **Projects data**: Defined in `app/projects/project-data.tsx` as typed interfaces
- **Content**: MDX files stored in `content/` directory
- **Feed generation**: RSS/Atom/JSON feeds generated via API routes in `app/feed/`

### Advanced Interactive Systems

#### Particle System (`app/page.tsx`)
The homepage features a sophisticated Canvas-based particle system with multiple particle types:
- **Island particles**: Orbit around profile picture, attracted to mouse
- **Click particles**: Explosion effects on clicks
- **Text particles**: Golden particles on title hover
- **Air particles**: Amber floating particles with physics
- **Connection lines**: Dynamic lines between particles and mouse cursor

Key functions:
- `createParticle()`: Factory for different particle types
- `updateParticles()`: Physics and interaction logic
- `drawParticles()`: Canvas rendering with gradients and effects
- Global window functions: `createTextParticles()`, `createProfileClickEffect()`

#### Animation Architecture
- **CSS animations**: Custom keyframes in `<style jsx>` blocks for profile picture effects
- **Intersection Observer**: Scroll-triggered animations via `ScrollTriggeredSection` component
- **Mouse tracking**: Smooth cursor follower with requestAnimationFrame
- **Scroll effects**: Smooth scroll-triggered animations (scroll particles removed)

### Component Architecture

#### Higher-Order Components
- `AnimatedSection`: Delayed entrance animations
- `ScrollTriggeredSection`: Intersection Observer-based animations with multiple animation types
- `SkillBadge`: Reusable skill display component

#### Theme System
- Uses `next-themes` with system preference detection
- CSS variables for syntax highlighting in both themes
- Backdrop blur effects throughout UI
- Gradient backgrounds with theme-specific colors

### Image and Asset Handling
- **Next.js Image optimization**: Used throughout with proper sizing
- **Profile image**: Referenced via `metaData.ogImage` from config
- **Logo handling**: Responsive logo sizing based on scroll state
- **Public assets**: Stored in `public/` directory

### SEO and Meta
- **Comprehensive metadata**: OpenGraph, Twitter cards, robots.txt
- **Feed generation**: Multiple format support (RSS, Atom, JSON)
- **Sitemap**: Auto-generated via `app/sitemap.ts`
- **URL rewrites**: Feed endpoints configured in `next.config.ts`

### State Management Patterns
- **React hooks**: useState, useEffect, useRef for component state
- **Refs for performance**: Animation frames, mouse positions, particle arrays
- **Event listeners**: Proper cleanup in useEffect returns
- **Intersection Observer**: Scroll-based animations with threshold configuration

### Performance Optimizations
- **Canvas rendering**: RequestAnimationFrame loops with viewport culling
- **Particle lifecycle**: Automatic cleanup and regeneration
- **Scroll debouncing**: 50ms debounce on navigation scroll effects
- **Image optimization**: Next.js Image component with priority loading
- **CSS-in-JS**: Scoped animations to prevent global style conflicts

### Content Management
- **MDX integration**: Remote MDX processing for blog-like content
- **Type safety**: Proper TypeScript interfaces for projects and metadata
- **Static generation**: Pre-rendered pages for optimal performance

## Important Implementation Notes

- The particle system stores references in `particlesRef.current` - never directly mutate, use array methods
- Profile picture interactions are detected via `data-profile-picture` attribute
- Particle coordinates use world coordinates (with scroll offset) for consistency
- Animation cleanup is critical - always cancel `requestAnimationFrame` in cleanup functions
- Theme switching affects CSS variables - test both themes when making style changes
- Mobile navigation uses transform animations - test on actual mobile devices
- Canvas dimensions are set to window size - handle resize events properly

## Development Workflow

1. **Local development**: Run `npm run dev` and visit http://localhost:3000
2. **Content changes**: Edit MDX files in `content/` directory
3. **Project updates**: Modify `app/projects/project-data.tsx`
4. **Style changes**: Update `app/globals.css` for global styles, component files for local styles
5. **Configuration**: Update `app/lib/config.ts` for site metadata and links
6. **Build testing**: Always run `npm run build` before deployment to catch build errors

## Deployment Notes

- Optimized for **Vercel deployment**
- Uses Vercel Analytics and Speed Insights
- Image optimization requires proper domain configuration in `next.config.ts`
- Feed generation uses API routes - ensure they work in production
- Canvas-based animations require client-side rendering - components marked with `"use client"`