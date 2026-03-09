// src/pages/Topic/components/TopicHeader.jsx

# TopicHeader Component - Premium Apple-Style Design

**Last Updated**: 2026-03-09 (Ultra Premium Rounded Hero Redesign)

## Overview

TopicHeader is the premium hero section component for individual topic pages. It displays the topic title, breadcrumbs, progress tracking, and action menus with a luxurious full-width gradient background using the subject's theme color.

## Visual Architecture

### Component Structure

```
TopicHeader (Full-Width Gradient Container)
├── Decorative Blur Elements (2 positioned circles)
├── Content Section (max-w-7xl, relative z-10)
│   ├── Breadcrumbs Row (above gradient)
│   │   ├── Home > Subject > Topic Number
│   │   ├── Viewer Badge (if readonly)
│   │   └── Menu Button (if edit/delete permissions)
│   └── Hero Section (inside gradient)
│       ├── Left: Main Content
│       │   ├── Tema Badge + Course Badge
│       │   ├── Large Title (text-5xl → 8xl)
│       │   └── Meta Info (Calendar badge)
│       └── Right: Progress Card (if progress exists)
│           ├── Completed Count
│           ├── Progress Bar
│           └── Percentage Text
```

## Key Features

### 1. Full-Width Gradient Background
- Uses `subjectGradient` (dynamic from `subject.color`)
- Spans edge-to-edge with `-mx-6 px-6`
- `bg-gradient-to-br` for diagonal luxury effect
- `py-12 md:py-16` responsive padding

### 2. Decorative Blur Elements
- **Top-right**: `w-96 h-96 bg-white/10` blurred circle
- **Bottom-left**: `w-72 h-72 bg-white/5` blurred circle
- Creates glass-morphism luxury aesthetic
- Positioned absolutely, clipped by `overflow-hidden`

### 3. Subject Badge System
- **Tema Badge**: Shows current topic number
  - Style: `bg-white/20 backdrop-blur-sm border border-white/30`
  - Text: White, uppercase, bold
  - Font: `text-xs font-bold uppercase tracking-widest`

- **Course Badge** (if exists): Shows course name
  - Style: `bg-white/15 backdrop-blur-sm border border-white/20`
  - Text: White/90, slightly less prominent

### 4. Enhanced Typography
- **Title**: 
  - Mobile: `text-5xl`
  - Tablet: `text-6xl`
  - Desktop: `text-7xl`
  - Ultra-wide: `text-8xl`
  - Style: `font-black text-white drop-shadow-lg capitalize`
  - Effect: Large, bold, readable drop shadow on gradient
  - Max width: `max-w-3xl` to prevent excessive line length

### 5. Progress Section (Premium Card)
- **Container**: Glass-morphism card on right side
  - Style: `bg-white/10 backdrop-blur-sm rounded-3xl px-8 py-6 border border-white/20`
  - Positioned on right, aligns with title bottom
  - Responsive: Full width on mobile, min-w-fit on desktop

- **Content**:
  - Completed count: `text-5xl md:text-6xl font-black`
  - Progress bar: `h-2 w-40 bg-white/20` with white fill
  - Percentage text: `text-xs font-bold text-white/60`

### 6. Edit Mode Styling
- **Input Field**:
  - Style: `bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl`
  - Focus: `focus:ring-2 focus:ring-white/50`
  - Font: `text-4xl md:text-6xl font-black text-white`
  - Placeholder: `placeholder-white/50`

- **Buttons**:
  - Save Button: `bg-white/20 hover:bg-white/30 border border-white/30 hover:border-white/50`
  - Cancel Button: `bg-white/10 hover:bg-white/20 border border-white/20`
  - Both have `transition-all` and `backdrop-blur-sm`

- **Icons**: `w-6 h-6 strokeWidth={1.5}` for premium appearance

### 7. Meta Information
- **Calendar Badge**: Shows update status
  - Style: `bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20`
  - Text: `text-white/80 text-base md:text-lg`
  - Icon: Calendar with `strokeWidth={1.5}`

## Props Interface

```javascript
{
  subject: {
    name: string,           // Subject name for breadcrumb
    color: string,          // Tailwind gradient (e.g., "from-blue-500 to-cyan-500")
    course?: string,        // Optional course name badge
  },
  topic: {
    number: number,         // Topic number (displayed large)
    name?: string,          // Topic title (shown in header)
    title?: string,         // Fallback title if name not available
  },
  subjectId: string,        // For breadcrumb navigation
  navigate: function,       // React Router navigate function
  showMenu: boolean,        // Menu visibility state
  setShowMenu: function,    // Menu toggle handler
  isEditingTopic: boolean,  // Edit mode state
  setIsEditingTopic: function, // Edit mode toggle
  editTopicData: {
    name: string,           // Edited title
  },
  setEditTopicData: function, // EditTopicData setter
  handleSaveTopicTitle: function, // Save edited title
  handleGenerateQuizSubmit: function, // Generate AI quiz
  handleDeleteTopic: function, // Delete topic
  globalProgress: {
    total: number,          // Total items
    completed: number,      // Completed items
    percentage: number,     // Completion percentage (0-100)
  } | null,
  permissions: {
    isViewer: boolean,      // Readonly mode (shows badge)
    showEditUI: boolean,    // Show edit options in menu
    showDeleteUI: boolean,  // Show delete option in menu
  },
}
```

## Color & Style System

### Gradient Integration
- **Source**: `subject.color` prop (comes from Firestore subject document)
- **Format**: Tailwind gradient string (e.g., `"from-indigo-500 to-purple-600"`)
- **Fallback**: `"from-indigo-500 to-purple-600"` if color not provided
- **Usage**: Applied via `bg-gradient-to-br ${subjectGradient}`

### Glass-Morphism Effects
- All interactive elements use `backdrop-blur-sm` or `backdrop-blur-xl`
- Transparency: White/10 (major), White/20 (accents), White/5 (subtle)
- Borders: `border-white/20`, `border-white/30`, `border-white/50` (on focus)
- Creates layered luxury aesthetic

### Text Colors
- **Primary**: White (`text-white`)
- **Secondary**: White with opacity (`text-white/80`, `text-white/70`)
- **Tertiary**: White with lower opacity (`text-white/60`)
- All text contrasts well against gradient backgrounds

### Icons
- **Size**: 4x4 (breadcrumb), 5x5 (menu), 3x3 (badges), 6x6 (buttons)
- **Weight**: `strokeWidth={1.5}` for minimalista aesthetic
- **Color**: Inherits from parent text color (white)

## Responsive Behavior

### Breakpoints
- **Mobile** (< 768px):
  - Padding: `py-12`
  - Title: `text-5xl`
  - Progress: Full width layout
  - Flex direction: Column

- **Tablet** (≥ 768px):
  - Padding: `py-16`
  - Title: `text-6xl to text-7xl`
  - Progress: Inline with title (right-aligned)
  - Flex direction: Row with gap-8

- **Desktop** (≥ 1024px):
  - Title: `text-7xl`
  - Progress: Premium card styling
  - Max content width: `max-w-7xl`

### Flex Layout
- Outer: `flex flex-col md:flex-row items-start md:items-end gap-8 justify-between`
- Adapts from stacked (mobile) to side-by-side (desktop)
- Items bottom-aligned on desktop for visual balance

## State Management

### Editing State Flow
1. User clicks title = `setIsEditingTopic(true)`
2. Input field appears with current title
3. User edits text = `setEditTopicData({ name: newValue })`
4. User clicks save = `handleSaveTopicTitle()` (also calls `setIsEditingTopic(false)`)
5. User clicks cancel = `setIsEditingTopic(false)` directly

### Menu Visibility
1. `showMenu` boolean controls dropdown visibility
2. Menu only shows if `hasAnyMenuAction` is true (edit OR delete permission)
3. Clicking menu button = `setShowMenu(!showMenu)`
4. Clicking item = Executes action + `setShowMenu(false)`
5. Clicking outside = `setShowMenu(false)` via overlay

### Permission-Based Rendering
- **Viewer Badge**: Only shows if `permissions.isViewer === true`
- **Edit Option**: Only shows if `permissions.showEditUI === true`
- **Wand Icon**: Only shows if `permissions.showEditUI === true`
- **Delete Option**: Only shows if `permissions.showDeleteUI === true`
- **Menu Button**: Only renders if `hasAnyMenuAction` (either edit or delete available)

## Animation & Transitions

### Entry Animation
- Container: `animate-in fade-in slide-in-from-bottom-4 duration-500`
- Creates smooth slide-up + fade-in effect on component mount

### Hover Effects
- Buttons: `hover:bg-slate-100 dark:hover:bg-slate-800`
- Breadcrumb links: `hover:text-indigo-600 dark:hover:text-indigo-400`
- Menu items: Specific hover bg (slate-50, purple-50, red-50, etc.)
- All have `transition-colors` or `transition-all`

### Progress Bar Animation
- Width transition: `transition-all duration-1000 ease-out`
- Smooth 1-second animation when percentage updates

## Accessibility Considerations

### Semantic HTML
- Uses semantic button elements for menu
- Proper onClick handlers for keyboard navigation
- Navigation buttons are actual buttons (not divs)

### Icon Accessibility
- Icons have parent text labels (Home, Wand, etc.)
- No floating icons without text context
- Calendar icon paired with "Actualizado hoy" text

### Color Contrast
- White text on dark gradient: High contrast (WCAG AA+)
- All badge text readable against their backgrounds
- Interactive elements clearly distinguishable

### Focus States
- Edit input: `focus:ring-2 focus:ring-white/50`
- Buttons: Can be tabbed to and activated via keyboard

## Performance Notes

- **Re-rendering**: Component re-renders when any prop changes
- **Expensive Operations**: None (pure rendering, no calculations)
- **Child Components**: Zero children (all inline JSX)
- **Animations**: CSS-based, GPU-accelerated (Tailwind animate classes)

## Known Limitations

1. **Title Width**: Very long titles may wrap awkwardly; `max-w-3xl` prevents excessive width
2. **Edit Input**: Cannot edit while other content is loading (no disabled state implemented)
3. **Progress Card**: Hides completely if `globalProgress` is null (no empty state UI)
4. **Gradient Colors**: Depends on subject.color format; invalid format shows fallback

## Recent Updates

### 2026-03-09: Ultra Premium Rounded Hero Redesign
- Rebuilt hero into a layered luxury composition with ambient gradient + glass card shell
- Added large rounded container (`rounded-[2.25rem]` to `rounded-[2.75rem]`) for stronger executive visual identity
- Introduced radial light overlays and top highlight line for depth and premium finish
- Refined typography scale and spacing for better hierarchy and legibility on long titles
- Upgraded progress card to dark-glass style with clearer KPI framing
- Added subtle quality polish to breadcrumbs and menu icons (`strokeWidth={1.5}`, transition consistency)
- Preserved all existing logic and permissions (lossless visual enhancement)

### 2026-03-09: Gradient Containment Perfection Pass
- Fixed visual artifact where the gradient looked like it spilled outside the rounded hero box.
- Moved all gradient and radial overlay layers inside the rounded shell container.
- Added `relative isolate overflow-hidden` to enforce strict clipping of decorative layers.
- Kept the same premium aesthetic while improving edge cleanliness and visual precision.

### 2024-12-19: Premium Apple-Style Redesign
- ✨ Full-width gradient background (was: bordered white box)
- ✨ Decorative blur elements for luxury aesthetic
- ✨ Enhanced typography hierarchy (larger, bolder title)
- ✨ Repositioned progress to premium right-aligned card
- ✨ Added glass-morphism effects (backdrop-blur throughout)
- ✨ Improved badge styling (white/transparency borders)
- ✨ Better edit mode input styling (matches gradient aesthetic)
- 🐛 Fixed: None (lossless redesign)
- 🔄 Preserved: All functionality, permissions, interactions

### 2024-12-15: Permission-Based UI
- Added permission props for conditional rendering
- Implemented viewer badge for readonly users
- Menu only shows when user has edit/delete permissions
- Conditional menu items based on permissions

## Related Components

- **Topic.jsx** (parent): Passes all props, manages data enrichment
- **TopicContent.jsx** (sibling): Renders quiz cards below header
- **TopicModals.jsx** (sibling): Handles edit/delete modal logic
- **useTopicLogic.js** (hook): Provides data & handlers

## Testing Checklist

- [ ] Gradient background displays correctly with different subject colors
- [ ] Title edits save and update correctly
- [ ] Menu items show/hide based on permissions
- [ ] Progress bar animates smoothly to new percentages
- [ ] Responsive layout stacks on mobile, rows on desktop
- [ ] Edit mode input has proper focus styling
- [ ] Icons have proper strokeWidth appearance
- [ ] All navigation buttons (breadcrumbs) work correctly
