# 📚 UI Component Registry

**CRITICAL COPILOT DIRECTIVE:** BEFORE creating any new UI element (modal, overlay, button, dropdown, card, form), you MUST check this registry. If a base component exists, you MUST use it or extend it. If you create a new highly reusable component, you MUST add it to this file immediately after creation.

---

## 🎯 Registry Rules
1. **Centralization First** - Check this registry before writing ANY new UI code.
2. **Reuse Over Rebuild** - Use existing components instead of creating custom HTML/Tailwind wrappers.
3. **Immediate Documentation** - When you create a new generic UI component, document it here immediately.
4. **Props Accuracy** - Keep all props lists current and remove deprecated props immediately.
5. **Spanish Text Only** - All visible text in components must be in Spanish.
6. **Icons Over Emojis** - Use Lucide React or similar icon libraries; NEVER use emojis in UI.

---

## 🔲 Overlays & Modals

### `BaseOverlay`
- **File:** `src/components/ui/BaseOverlay.jsx`
- **Status:** ✅ Active (foundational component)
- **Purpose:** Unified wrapper for ALL overlays (Create, Edit, Delete, Options menus)
- **Features:**
  - Dark semi-transparent backdrop (click-outside-to-close)
  - Centered white container with rounded corners
  - Header with optional icon and title
  - Close button (X icon) in top-right
  - Optional footer for action buttons
  - ESC key to close
  - ENTER key to submit (configurable)
- **Props:**
  - `isOpen` (boolean, required) - Controls visibility
  - `onClose` (function, required) - Triggered when clicking outside, hitting ESC, or clicking X
  - `title` (string, required) - Header text (Spanish)
  - `children` (ReactNode, required) - Main content/form
  - `icon` (Lucide React Icon, optional) - Icon displayed next to title
  - `onSubmit` (function, optional) - Callback for ENTER key or submit action
  - `submitText` (string, optional) - Custom submit button text (default: "Guardar")
  - `cancelText` (string, optional) - Custom cancel button text (default: "Cancelar")
  - `showFooter` (boolean, optional) - Show action buttons footer (default: false)
  - `isLoading` (boolean, optional) - Disable buttons during submission (default: false)
- **Example Usage:**
  ```jsx
  <BaseOverlay
    isOpen={isCreateOpen}
    onClose={() => setIsCreateOpen(false)}
    title="Crear Asignatura"
    icon={Plus}
    showFooter={true}
    onSubmit={handleCreateSubject}
  >
    <SubjectForm />
  </BaseOverlay>
  ```
- **DO USE FOR:**
  - Create forms (subjects, courses, classes)
  - Edit/modify dialogs
  - Three-dot menu overlays
  - Delete confirmation dialogs
  - Detail view modals
- **DON'T USE FOR:**
  - Alerts/toasts (use a dedicated Alert component)
  - Dropdowns (use Menu component)
  - Inline forms on pages

---

## 🔘 Buttons & Inputs

### `PrimaryButton`
- **File:** `src/components/ui/PrimaryButton.jsx`
- **Status:** ✅ Active
- **Purpose:** Main action button (create, save, submit)
- **Props:**
  - `children` (ReactNode, required) - Button text
  - `onClick` (function, required) - Click handler
  - `disabled` (boolean, optional) - Disable state
  - `isLoading` (boolean, optional) - Show loading spinner
  - `className` (string, optional) - Additional Tailwind classes
- **Example:** `<PrimaryButton onClick={handleSave}>Guardar</PrimaryButton>`

### `SecondaryButton`
- **File:** `src/components/ui/SecondaryButton.jsx`
- **Status:** ✅ Active
- **Purpose:** Secondary action button (cancel, close, back)
- **Props:** Same as PrimaryButton
- **Example:** `<SecondaryButton onClick={handleCancel}>Cancelar</SecondaryButton>`

### `DangerButton`
- **File:** `src/components/ui/DangerButton.jsx`
- **Status:** ✅ Active
- **Purpose:** Destructive action (delete, remove)
- **Props:** Same as PrimaryButton
- **Example:** `<DangerButton onClick={handleDelete}>Eliminar</DangerButton>`

---

## 📋 Forms & Inputs

### `FormField`
- **File:** `src/components/ui/FormField.jsx`
- **Status:** ✅ Active
- **Purpose:** Wrapper for form inputs with label and error message
- **Props:**
  - `label` (string, optional) - Field label (Spanish)
  - `error` (string, optional) - Error message (Spanish)
  - `children` (ReactNode, required) - Input element
  - `required` (boolean, optional) - Show required indicator
- **Example:**
  ```jsx
  <FormField label="Nombre de Asignatura" error={errors.name}>
    <input type="text" ... />
  </FormField>
  ```

### `TextInput`
- **File:** `src/components/ui/TextInput.jsx`
- **Status:** ✅ Active
- **Purpose:** Standardized text input field
- **Props:**
  - `label` (string, optional) - Field label (Spanish)
  - `placeholder` (string, optional) - Placeholder text (Spanish)
  - `value` (string, required)
  - `onChange` (function, required)
  - `error` (string, optional) - Error message
  - `required` (boolean, optional)
  - `disabled` (boolean, optional)

---

## 📄 Cards & Layouts

### `CardContainer`
- **File:** `src/components/ui/CardContainer.jsx`
- **Status:** ✅ Active
- **Purpose:** Standard card wrapper for content grouping
- **Props:**
  - `children` (ReactNode, required) - Card content
  - `title` (string, optional) - Card header
  - `icon` (Lucide React Icon, optional) - Header icon
  - `className` (string, optional) - Additional classes
- **Example:**
  ```jsx
  <CardContainer title="Detalles" icon={Info}>
    {content}
  </CardContainer>
  ```

---

## ⚠️ Deprecated / Do Not Use

*None currently. Deprecated components will be listed here with migration paths.*

---

## 🚀 Adding New Components

When creating a new reusable UI component:

1. **Create the component** in `src/components/ui/` (or appropriate category)
2. **Add it to this registry** with:
   - File path
   - Status (✅ Active)
   - Purpose (one sentence)
   - List of props with types
   - Usage example
   - DO/DON'T usage guidelines
3. **Update the rule in copilot-instructions.md** if this is a game-changing component
4. **Add test coverage** in `tests/unit/components/`

---

## 📌 Quick Lookup by Feature

| Feature | Component | Use Case |
|---------|-----------|----------|
| Create/Edit Dialog | `BaseOverlay` | All forms |
| Primary Action | `PrimaryButton` | Save, Submit, Create |
| Secondary Action | `SecondaryButton` | Cancel, Back, Close |
| Destructive Action | `DangerButton` | Delete, Remove |
| Text Input | `TextInput` | Form fields |
| Form Grouping | `FormField` | Label + Input + Error |
| Content Card | `CardContainer` | Grouping related content |

---

## 🔄 Registry Maintenance

- **Last Updated:** 2026-04-07
- **Maintainer:** GitHub Copilot
- **Review Cycle:** Every month or after major refactors
- **Deprecation Policy:** Components marked deprecated get 2 sprint cycles before removal

