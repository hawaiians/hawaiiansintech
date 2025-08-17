# ESLint & Prettier Setup

This project includes a comprehensive linting setup that integrates ESLint, TypeScript, and Prettier seamlessly.

## 🚀 **Available Scripts**

### Core Commands

```bash
# Lint your code (will show warnings but won't fail)
pnpm run lint

# Auto-fix many linting issues
pnpm run lint:fix

# Type checking (must pass for production)
pnpm run type-check

# Format code with Prettier
pnpm run format

# Run both type checking and linting
pnpm run check
```

### Quick Fixes

```bash
# Fix formatting issues
pnpm run format

# Fix auto-fixable ESLint issues
pnpm run lint:fix
```

## 🔧 **What the Linting Catches**

### ✅ **Critical Issues (Now Fixed)**

- Type mismatches
- Undefined variables and functions
- Incorrect method calls
- Unused variables and imports
- React Hook violations
- Basic code quality issues

### ⚠️ **Current Warnings (Code Quality)**

- Missing `alt` attributes on images
- Missing dependencies in `useEffect` hooks
- Using `<img>` instead of Next.js `<Image />` component
- `any` types in TypeScript
- Empty interfaces

## 🏗️ **Configuration Files**

### `.eslintrc.js`

- **Next.js Integration**: Uses `next/core-web-vitals` and `next/typescript`
- **TypeScript Support**: Full TypeScript ESLint integration
- **Prettier Integration**: No formatting conflicts
- **React Hooks**: Proper hook dependency checking

### `.prettierrc`

- **Tailwind Integration**: `prettier-plugin-tailwindcss`
- **Import Organization**: `prettier-plugin-organize-imports`
- **Consistent Formatting**: 2-space tabs, 80 char width

### `tsconfig.json`

- **Strict Mode**: Currently disabled for migration (TODO: enable)
- **Path Aliases**: Clean import paths with `@/` prefix
- **Next.js Optimized**: Built for Next.js 15

## 🛠️ **Troubleshooting**

### **If you see linting errors:**

1. **Run auto-fix**: `pnpm run lint:fix`
2. **Format code**: `pnpm run format`
3. **Check types**: `pnpm run type-check`

### **Common Issues:**

- **Prettier conflicts**: Run `pnpm run format` first
- **Type errors**: Check `pnpm run type-check`
- **Hook warnings**: Review `useEffect` dependencies

## 🏆 **Best Practices**

1. **Run linting regularly**: Use `pnpm run lint` during development
2. **Fix warnings early**: Don't let them accumulate
3. **Use auto-fix**: Run `pnpm run lint:fix` to automatically fix issues
4. **Check types**: Run `pnpm run type-check` before major changes
5. **Format code**: Use `pnpm run format` to maintain consistent formatting
6. **Commit hooks**: Consider adding pre-commit hooks for automatic formatting

## 📈 **Performance Impact**

- **Build Time**: Minimal impact (ESLint runs in parallel)
- **Development**: Real-time feedback in your editor
- **Production**: Zero impact (linting only runs during build/dev)
