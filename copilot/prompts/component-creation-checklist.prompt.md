# Component Creation & Registry Checklist

**Use this prompt when:** Creating new UI components, refactoring overlays, or centralizing reusable UI patterns.

---

## 📋 Pre-Implementation Checklist

Before writing ANY new UI component:

- [ ] Read [copilot/REFERENCE/COMPONENT_REGISTRY.md](copilot/REFERENCE/COMPONENT_REGISTRY.md) fully
- [ ] Search for similar components that already exist
- [ ] If a similar component exists, determine: Should I extend it or create new?
- [ ] If creating new, is this a one-off or will it be reused across 2+ features?
  - If one-off → Keep inline in the feature component
  - If 2+ uses → Create in `src/components/ui/` and register

---

## 🏗️ Component Creation Protocol

### Step 1: Define Component Purpose
```
- What problem does this component solve?
- What other components is it similar to?
- Will this be used in 2+ places? (If no, keep it inline)
- Does a similar component already exist in the registry? (If yes, extend it instead)
```

### Step 2: Design Component API (Props)
```
- What data does it need? (props)
- What events does it emit? (callbacks)
- What are the required vs. optional props?
- What are sensible defaults?
- Test the prop names for clarity: Would another developer understand what each prop does?
```

### Step 3: Create Component
```
- TypeScript-first: Use .tsx extension
- Add file path comment at the top: // src/components/ui/MyComponent.jsx
- Use semantic HTML
- Spanish text only
- Icons only (no emojis)
- Apply Tailwind for styling
- Export default component
```

### Step 4: Create Test Coverage
```
- Create `tests/unit/components/MyComponent.test.jsx`
- Test happy path
- Test error states
- Test edge cases
- Run: npm run test -- MyComponent.test.jsx
```

### Step 5: Add to Registry
```
- Open [copilot/REFERENCE/COMPONENT_REGISTRY.md](copilot/REFERENCE/COMPONENT_REGISTRY.md)
- Add new section with:
  - File path
  - Status (✅ Active)
  - Purpose (1-2 sentences)
  - Full props list with types
  - Usage example
  - DO/DON'T guidelines
- Update the Quick Lookup table
```

### Step 6: Update copilot-instructions.md (If Game-Changing)
```
- If this component replaces many custom implementations (like BaseOverlay did),
  add it to the "Non-Negotiable Performance Standards" rule about UI consistency
```

---

## 🔄 Refactoring Existing Overlays to BaseOverlay

When migrating custom overlays to `BaseOverlay`:

1. **Identify the custom overlay HTML** (usually inline in component or separate file)
2. **Extract the form content** into a separate component
3. **Wrap entire modal with BaseOverlay:**
   ```jsx
   <BaseOverlay
     isOpen={isOpen}
     onClose={handleClose}
     title="Crear Asignatura"  // Spanish
     icon={Plus}              // Lucide icon
     showFooter={true}
     onSubmit={handleSubmit}
   >
     <SubjectForm />          // The extracted form content
   </BaseOverlay>
   ```
4. **Delete the old custom overlay HTML** (backdrop, centered div, close button, etc.)
5. **Run full validation:**
   - `npm run test` (all tests pass)
   - `npm run lint` (no errors)
   - `get_errors` (clean)
6. **Create lossless report** documenting what was refactored

---

## 🎯 Example: Creating a New Button Component

### Request Format
```
"I want to create a new component called IconButton that displays a Lucide icon 
with optional label. It should handle loading state and disabled state.

Requirements:
- TypeScript (.tsx)
- Spanish text
- Tailwind styling
- Props: icon (required), label (optional), onClick, disabled, isLoading, className
- Use in multiple places (confirm this qualifies for registration)
- Add to component registry after creation
- Full test coverage
- Run npm run test to validate"
```

### What Copilot Should Do
1. Read the registry first
2. Check if similar button already exists (PrimaryButton, SecondaryButton, etc.)
3. Decide: Extend existing or create new?
4. Create `src/components/ui/IconButton.tsx`
5. Implement with props matching the spec
6. Create `tests/unit/components/IconButton.test.tsx`
7. Run `npm run test` to validate
8. Add to `copilot/REFERENCE/COMPONENT_REGISTRY.md`
9. Create lossless report

---

## ✅ Definition of Done (Component Addition)

A component is complete when:
- [ ] Component file created in appropriate `src/components/` folder
- [ ] TypeScript (.tsx) used for app code
- [ ] File path comment at top
- [ ] All visible text in Spanish
- [ ] Uses icons not emojis
- [ ] Props fully documented (JSDoc comments)
- [ ] Test file created with 3+ test cases
- [ ] `npm run test` passes
- [ ] `npm run lint` passes
- [ ] Added to [copilot/REFERENCE/COMPONENT_REGISTRY.md](copilot/REFERENCE/COMPONENT_REGISTRY.md)
- [ ] Lossless report created (if replacing existing overlays)
- [ ] Git committed with message: `feat(components): Add [ComponentName] to registry`
- [ ] Git pushed to feature branch

---

## 🚀 Quick Reference: When to Register

| Scenario | Register? | Action |
|----------|-----------|--------|
| New button used in 1 place | ❌ No | Keep inline in component |
| New button used in 3+ places | ✅ Yes | Create in `ui/`, register |
| Overlay used for multiple purposes | ✅ Yes | Use `BaseOverlay` (already registered) |
| Form input field for 1 feature | ❌ No | Keep inline |
| Generic input wrapper used 2+ times | ✅ Yes | Create in `ui/`, register |
| Modal for create/edit flows | ✅ Yes | Extend `BaseOverlay` |

---

## 💡 Pro Tips

1. **Prop Drilling Context:** If a component needs many props, consider wrapping children with React Context instead
2. **Compound Components:** For complex features, use compound component pattern (e.g., `<Form><Form.Field><Form.Submit></Form>`)
3. **Composition Over Inheritance:** Build small, simple components and combine them
4. **Test Driven:** Write tests FIRST, then implement (helps design better APIs)
5. **Registry is Source of Truth:** If it's not in the registry, pretend it doesn't exist

