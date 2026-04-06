// copilot/prompts/api-design-review-checklist.prompt.md
# Prompt: API Design Review Checklist

## Overview
Use this prompt to review API contracts, function signatures, and interface designs for consistency and best practices.

## API Design Checklist

### 1. **Naming Conventions** 📝
- [ ] Function names are verbs (get, create, update, delete, fetch)
- [ ] Resource names are nouns (user, subject, topic, document)
- [ ] Constants are SCREAMING_SNAKE_CASE
- [ ] Variables/functions are camelCase
- [ ] Boolean functions prefixed with `is`, `has`, `can`, or `should`
- [ ] Async functions clearly indicate asynchronous nature (Promises)
- [ ] Abbreviations avoided (use `getUserData` not `getUsr`)

### 2. **Parameters & Arguments** 🔧
- [ ] Parameter order: required first, optional last
- [ ] No boolean parameters (use object options instead)
- [ ] Object parameters clearly documented
- [ ] Default values provided for optional params
- [ ] Parameters typed (TypeScript @param annotations or JSDoc)
- [ ] Parameter names are descriptive
- [ ] Avoid too many parameters (consider object destructuring)

### 3. **Return Types** ↩️
- [ ] Return type is clearly documented
- [ ] Async functions return Promises
- [ ] Null/undefined handling is explicit
- [ ] Error cases are documented (throws, error handling)
- [ ] Return values are consistent across similar functions
- [ ] Complex returns are typed (interfaces/types defined)

### 4. **Error Handling** ⚠️
- [ ] Errors are thrown or returned consistently
- [ ] Error messages are descriptive and actionable
- [ ] Error types are specific (not generic "Error")
- [ ] HTTP status codes are correct (400, 401, 403, 404, 500, etc.)
- [ ] Error documentation includes common failures
- [ ] No silent failures

### 5. **Immutability & Side Effects** 🔄
- [ ] Functions clearly indicate if they mutate input
- [ ] Pure functions documented as such
- [ ] Side effects minimized and documented
- [ ] Avoid modifying global state without explanation
- [ ] Callbacks/listeners clearly documented

### 6. **Versioning & Backward Compatibility** 📦
- [ ] API version is clear (v1, v2, etc.)
- [ ] Breaking changes require version bump
- [ ] Deprecated methods marked with `@deprecated`
- [ ] Migration path provided for deprecated APIs
- [ ] Multiple versions not maintained unnecessarily

### 7. **Documentation** 📚
- [ ] JSDoc or TSDoc comments present
- [ ] Example usage provided for complex APIs
- [ ] Edge cases and limitations documented
- [ ] Related functions linked
- [ ] Security/permission requirements documented
- [ ] Performance implications noted (if applicable)

### 8. **Firebase/Firestore Patterns** 🔥
- [ ] Queries return consistent data structures (interface defined)
- [ ] institutionId is required for data scoping
- [ ] Real-time listeners have cleanup functions
- [ ] Errors from Firestore documented (permission denied, not found, etc.)
- [ ] Batch operations documented
- [ ] Transaction handling clear

### 9. **TypeScript Compliance** 📘
- [ ] No `any` types (use proper typing)
- [ ] Generic types used appropriately
- [ ] Return types explicitly declared
- [ ] Interfaces defined for complex objects
- [ ] Types exported for external use
- [ ] Optional vs. required properties clear (? vs. required)

### 10. **React Hooks (if applicable)** ⚛️
- [ ] Hook names prefixed with `use`
- [ ] Dependencies array documented
- [ ] Return values typed
- [ ] Cleanup functions implemented
- [ ] Performance characteristics documented
- [ ] Usage restrictions documented (can't call conditionally)

## API Definition Template

```typescript
/**
 * Brief description of what this function/component does.
 * 
 * @param {ParamType} paramName - Description of parameter
 * @param {OptionalType} [optionalParam=default] - Optional parameter
 * @returns {ReturnType} Description of return value
 * 
 * @example
 * const result = myFunction(param1, { option: true });
 * console.log(result); // Output...
 * 
 * @throws {SpecificError} Error condition description
 * @see {@link relatedFunction} for related functionality
 */
async function myFunction(paramName: ParamType, options: Options): Promise<ReturnType> {
  // Implementation
}
```

## API Design Anti-Patterns ❌

| Anti-Pattern | Problem | Fix |
|---|---|---|
| Boolean parameters | `func(true, false)` unclear | Use options object: `func({active: true})` |
| Generic error messages | "Error occurred" | Specific: "User with ID X not found" |
| No TypeScript | `function getData(id)` | `function getData(id: string): Promise<User>` |
| Overloaded functions | Multiple signatures | Use union types or method options |
| Inconsistent naming | `getUser`, `fetchProfile`, `retrieveData` | Consistent: `getUser`, `getProfile`, `getData` |
| Silent failures | `if (error) return;` | Throw or explicitly handle |
| Missing documentation | Code only, no JSDoc | Add examples, parameters, returns |
| No error recovery | Throws hard errors | Return error objects or allow retries |
| Large return objects | Returns entire user profile when only email needed | Return only required fields |

## Common API Patterns

### Query Objects (Firestore)
```typescript
interface FirestoreQuery {
  institutionId: string;        // Required for multi-tenancy
  filters?: Record<string, any>; // Optional filters
  sort?: { field: string; direction: 'asc' | 'desc' }[];
  pagination?: { limit: number; offset: number };
}
```

### Error Objects
```typescript
interface ApiError {
  code: string;          // e.g., 'USER_NOT_FOUND'
  message: string;       // User-friendly message
  status: number;        // HTTP status code
  details?: Record<string, any>; // Additional context
}
```

### Hook Returns
```typescript
interface UseDataHook {
  data: DataType | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}
```

## Review Output

Document with:
```
API: [Function/Component Name]
Status: ✅ Approved / ⚠️ Needs Changes / 🔴 Reject

Issues:
- ✅ [Positive aspect]
- ⚠️ [Concern with suggestion]
- 🔴 [Blocker]

Required Changes:
- [ ] Change 1
- [ ] Change 2

---

**Use this prompt to ensure APIs are consistent, well-documented, and easy to use.**
