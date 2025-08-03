# Simple Linting Setup

This project includes basic linting to catch common runtime errors before they reach production.

## Available Scripts

### Basic Commands

```bash
# Lint your code
pnpm run lint

# Auto-fix linting issues
pnpm run lint:fix

# Type checking
pnpm run type-check

# Format code with Prettier
pnpm run format

# Run both type checking and linting
pnpm run check
```

## What the Linting Catches

### TypeScript Errors

- Type mismatches
- Undefined variables
- Incorrect function calls

### Runtime Error Prevention

- Undefined variables and functions
- Incorrect method calls (like the `toDate()` error we fixed)
- Basic type safety issues

### Code Quality

- Unused variables and imports
- React Hook violations
- Basic code quality issues

## Common Issues and Fixes

### 1. "toDate is not a function" Error

This was the original issue that prompted this setup. The error occurs when trying to call `toDate()` on a value that isn't a Firestore Timestamp.

**Fix**: Always check the type before calling methods:

```typescript
// ❌ This can cause runtime errors
member.lastModified.toDate();

// ✅ Safe approach
typeof member.lastModified === "string"
  ? new Date(member.lastModified).toLocaleDateString()
  : member.lastModified.toDate().toLocaleDateString();
```

### 2. Missing Dependencies in useEffect

```typescript
// ❌ Missing dependency
useEffect(() => {
  fetchData();
}, []); // Missing fetchData dependency

// ✅ Correct approach
useEffect(() => {
  fetchData();
}, [fetchData]);
```

### 3. Unused Variables

```typescript
// ❌ Unused variable
const [data, setData] = useState(null);
const unusedVar = "something";

// ✅ Remove unused variables or prefix with underscore
const [data, setData] = useState(null);
const _unusedVar = "something"; // or remove entirely
```

## Configuration

The project includes:

- `.eslintrc.js` - Basic ESLint configuration
- `.prettierrc` - Prettier configuration
- `tsconfig.json` - TypeScript configuration

## Troubleshooting

If you see linting errors:

1. Run `pnpm run lint:fix` to auto-fix many issues
2. Check the `.eslintrc.js` file for rule configurations
3. You can temporarily disable rules with `// eslint-disable-next-line`

## Best Practices

1. **Run linting regularly**: Use `pnpm run lint` during development
2. **Fix issues early**: Don't let linting errors accumulate
3. **Use auto-fix**: Run `pnpm run lint:fix` to automatically fix issues
4. **Check types**: Run `pnpm run type-check` before major changes
5. **Format code**: Use `pnpm run format` to maintain consistent formatting

This simple setup will help catch the types of runtime errors you experienced with the `toDate()` issue and other basic problems before they reach production.
