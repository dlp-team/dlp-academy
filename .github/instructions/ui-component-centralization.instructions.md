<!-- .github/instructions/ui-component-centralization.instructions.md -->
# UI Component Centralization & Consistency Rules

**Applies to:** All `.jsx`, `.tsx` files in `src/components/`

## 🎯 Core Rules

### 1. Component Registry is Mandatory
- **Before ANY UI creation:** Read [copilot/REFERENCE/COMPONENT_REGISTRY.md](copilot/REFERENCE/COMPONENT_REGISTRY.md)
- **Decision tree:**
  - Does a similar component exist? → Use or extend it
  - Is this reusable (2+ uses)? → Register it after creation
  - Is this one-off? → Keep inline, no registration needed

### 2. No Duplicate Components
- Never create a new component if one exists that does the same thing
- "Same thing" includes:
  - All overlays → Use `BaseOverlay`
  - Primary actions → Use `PrimaryButton`
  - Secondary actions → Use `SecondaryButton`
  - Destructive actions → Use `DangerButton`
  - Text inputs → Use `TextInput`

### 3. No Custom Overlay HTML
- **BANNED:** Creating custom `<div className="fixed inset-0 bg-black/50">` overlays
- **REQUIRED:** Use `BaseOverlay` component
- **Benefit:** Consistent styling, accessibility, keyboard handling, close behavior

### 4. Overlay Props Standardization
When using `BaseOverlay`:
```jsx
// ✅ GOOD - Correct props
<BaseOverlay
  isOpen={isOpen}
  onClose={handleClose}
  title="Crear Asignatura"           // Spanish only
  icon={Plus}                         // Lucide icon
  showFooter={true}
  onSubmit={handleSave}
>
  <YourForm />
</BaseOverlay>

// ❌ BAD - Custom HTML
<div className="fixed inset-0 bg-black/50 flex items-center justify-center">
  <div className="bg-white p-6 rounded-lg">
    {/* ... */}
  </div>
</div>
```

### 5. Button Component Standardization
Use the appropriate button for each action type:
```jsx
// ✅ GOOD
<PrimaryButton onClick={handleSave}>Guardar</PrimaryButton>
<SecondaryButton onClick={handleCancel}>Cancelar</SecondaryButton>
<DangerButton onClick={handleDelete}>Eliminar</DangerButton>

// ❌ BAD - Custom button styles
<button className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
```

### 6. Text-Only, No Emojis
- **Requirement:** Use Lucide React icons for all visual indicators
- **Pattern:** Icon + Spanish text
- **Examples:**
  - ✅ `<Plus className="w-4 h-4" /> Crear Asignatura`
  - ✅ `<Trash2 className="w-4 h-4" /> Eliminar`
  - ❌ `📝 Crear Asignatura` (emoji)
  - ❌ Just icon without text context

### 7. Spanish Text Requirement
- All visible text in UI components must be in Spanish
- This includes:
  - Button labels
  - Modal titles
  - Form labels
  - Placeholder text
  - Error messages
- Exception: Code comments can be in English

---

## 📋 Component Registration Workflow

When creating a new reusable component:

1. **Create the component** in appropriate folder (`src/components/ui/` for generic)
2. **Use TypeScript** (.tsx extension)
3. **Add file path comment** at top: `// src/components/ui/MyComponent.jsx`
4. **Create tests** with 3+ test cases
5. **Run validation:**
   ```bash
   npm run test       # All tests pass
   npm run lint       # No errors
   npm run build      # Builds successfully (if applicable)
   ```
6. **Register in** [copilot/REFERENCE/COMPONENT_REGISTRY.md](copilot/REFERENCE/COMPONENT_REGISTRY.md) with:
   - File path
   - Status (✅ Active)
   - Purpose
   - Complete prop list
   - Usage example
   - DO/DON'T guidelines

---

## 🏗️ Component Organization

```
src/components/
├── ui/                    ← Generic, reusable components
│   ├── BaseOverlay.jsx
│   ├── PrimaryButton.jsx
│   ├── TextInput.jsx
│   └── ...
├── modules/               ← Feature-specific components (not reusable yet)
│   ├── SubjectModule/
│   ├── AdminModule/
│   └── ...
└── layout/                ← Shell components (Header, Sidebar, etc.)
    ├── Header.jsx
    ├── Sidebar.jsx
    └── ...
```

**Rule:** If a component is in `modules/` and gets used by 2+ other modules, extract to `ui/` and register.

---

## 🔍 Pre-Implementation Checklist

Before implementing any new UI feature:

- [ ] Have I read the current Component Registry?
- [ ] Does a similar component already exist?
- [ ] If yes, can I extend/compose existing components?
- [ ] If I'm creating new generic UI, will it be used 2+ times?
- [ ] All text will be in Spanish? ✅
- [ ] No emojis, only Lucide icons? ✅
- [ ] Planning to add tests? ✅
- [ ] Planning to register (if reusable)? ✅

---

## 🚫 Anti-Patterns

### ❌ Creating Custom Overlays
```jsx
// BAD - Custom modal HTML
function CreateSubject() {
  return (
    <div className="fixed inset-0 bg-black/50">
      <div className="bg-white w-96 p-8 rounded">
        <h2>Crear Asignatura</h2>
        <form>...</form>
      </div>
    </div>
  );
}

// ✅ GOOD - Use BaseOverlay
function CreateSubject() {
  return (
    <BaseOverlay
      isOpen={isOpen}
      onClose={handleClose}
      title="Crear Asignatura"
      showFooter={true}
      onSubmit={handleSave}
    >
      <SubjectForm />
    </BaseOverlay>
  );
}
```

### ❌ Duplicating Buttons Across Files
```jsx
// BAD - Same button in 5 different files
<button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
  Guardar
</button>

// ✅ GOOD - Use centralized button
<PrimaryButton onClick={handleSave}>Guardar</PrimaryButton>
```

### ❌ Mixing English & Spanish
```jsx
// BAD - Mixed languages
<BaseOverlay title="Create Subject" ...>
  <FormField label="Nombre">...</FormField>
</BaseOverlay>

// ✅ GOOD - Spanish only
<BaseOverlay title="Crear Asignatura" ...>
  <FormField label="Nombre">...</FormField>
</BaseOverlay>
```

---

## 📊 Registry Maintenance

- **Registry source:** [copilot/REFERENCE/COMPONENT_REGISTRY.md](copilot/REFERENCE/COMPONENT_REGISTRY.md)
- **Update frequency:** After every new component creation or modification
- **Deprecation:** Components marked deprecated get 2 sprint cycles before removal
- **Verification:** Before closing any UI-related task, verify all components used are in the registry

---

## 🔗 Related Documentation

- **Component Registry:** [copilot/REFERENCE/COMPONENT_REGISTRY.md](copilot/REFERENCE/COMPONENT_REGISTRY.md)
- **Component Creation Prompt:** [copilot/prompts/component-creation-checklist.prompt.md](copilot/prompts/component-creation-checklist.prompt.md)
- **UI Standards:** See frontend-spanish-ui.instructions.md

