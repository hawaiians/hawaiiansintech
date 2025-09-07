# Hawaiians in Tech - AI Coding Agent Instructions

## Project Overview

This is a Next.js community directory platform for Hawaiians in the tech industry, using Firebase for data storage and React Email for communications. The project features dual-mode development (mock data vs live Firebase) and a sophisticated member onboarding flow.

## Development Environment Setup

### Critical Commands

- `pnpm dev` - Development with mock data (NODE_ENV=development)
- `pnpm test` - Development with live Firebase data (NODE_ENV=test)
- `pnpm dev:email` - Email template development server
- `pnpm check` - Full validation (type-check + lint + format-check)

### Environment-Aware Architecture

The app automatically switches data sources based on `NODE_ENV`:

- **Development**: Uses mock data from `lib/firebase-helpers/stubApi.ts`
- **Test/Production**: Connects to live Firebase via `lib/firebase.ts`
- Check `lib/config/environment.ts` for environment detection logic

## Key Architectural Patterns

### Path Aliases (Always Use These)

```typescript
@/components/* → components/*
@/lib/* → lib/*
@/pages/* → pages/*
@/* → ./* (root)
```

### Firebase Integration Layer

- `lib/firebase-helpers/` - All Firebase operations with mock equivalents
- `lib/firebase-helpers/interfaces.ts` - Core data types (MemberPublic, Filter, etc.)
- Mock data lives in `lib/firebase-helpers/mock-data/` with JSON files
- Real Firebase config disabled in development mode (see `lib/firebase.ts`)

### API Route Structure

Located in `pages/api/`:

- `members.tsx` - CRUD for member directory (supports pagination cursor)
- `filters.tsx` - Dynamic filtering system
- All routes use auth helpers from `lib/api-helpers/auth.ts`

### Member Onboarding Flow

Multi-step form at `/join/01-you` through `/join/04-contact`:

- Each step managed by components in `components/intake-form/`
- Form state persisted in localStorage using `lib/hooks` utilities
- Progress tracked via `lib/utils.ts` FORM_LINKS constant

## Component Architecture

### UI Component Layers

1. **Base Components**: `components/ui/` - Radix UI + Tailwind variants
2. **Business Components**: `components/` - Application-specific logic
3. **Form Components**: `components/form/` - Reusable form controls with validation

### Styling Approach

- Tailwind CSS with custom theme in `tailwind.config.js`
- Use `cn()` utility from `lib/utils.ts` for conditional classes
- Email-specific Tailwind classes in `emails/ui/` components

### State Management Patterns

- Formik for complex forms with Yup validation
- `react-firebase-hooks` for Firebase state
- Custom localStorage hooks in `lib/hooks/`
- Debounced search/scroll using lodash

## Email System

### Email Templates

Located in `emails/` using React Email:

- `welcome-email.tsx` - New member onboarding
- `pending-member-email.tsx` - Admin notifications
- `sensitive-changes-email.tsx` - Security notifications
- Base components in `emails/ui/` for consistent styling

### Email Development

- Run `pnpm dev:email` for email template preview
- Email sending logic in `lib/email/` with Resend integration
- Templates use `@react-email/components` with Tailwind support

## Data Flow Patterns

### Member Directory

1. `pages/index.tsx` loads members via API
2. `components/MemberDirectory.tsx` handles infinite scroll pagination
3. `components/filters/FilterPicker.tsx` manages dynamic filtering
4. API routes handle Firebase queries with cursor-based pagination

### Admin Features

- Admin detection via `pages/api/is-admin.tsx`
- Admin components in `components/admin/`
- Sensitive operations require email verification flow

## Development Workflow

### Code Quality

- ESLint + TypeScript + Prettier integration (see `LINTING.md`)
- Type checking with `pnpm run type-check`
- Auto-formatting with prettier-plugin-organize-imports
- Comprehensive validation in `lib/validators/`

### Testing Approach

- Mock data generation for consistent development experience
- Turnstile integration for form protection
- Firebase emulator support for local testing

## Common Gotchas

- Always check `ENV_CONFIG.isDevelopment` when adding Firebase features
- Use `server` config from `config/index.tsx` for environment-aware URLs
- Member status uses `StatusEnum` from `lib/enums.ts`
- Form validation requires both Formik + Yup schema definitions
- Email templates need explicit Tailwind class imports

## File Organization

- `/lib/firebase-helpers/` - Data access layer with mock support
- `/lib/api-helpers/` - Reusable API utilities (auth, errors, formatting)
- `/components/intake-form/` - Multi-step onboarding components
- `/pages/api/` - Next.js API routes with Firebase integration
- `/emails/` - React Email templates with UI components
