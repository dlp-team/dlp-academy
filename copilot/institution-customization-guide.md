# Institution Customization: Home Theme Colors (Technical Guide)

## Overview
This project now supports institution-level UI customization, allowing each institution to define its own color palette for the Home page (and soon, other pages). The customization is managed via Firestore and is fully integrated into the admin dashboard, with a live preview and broad color selection.

## Key Features
- **Firestore-driven color theming**: Each institution document in the `institutions` collection can store a `customization.homeThemeColors` object (and a compatible `customization.home.colors` for legacy/future-proofing).
- **Admin UI for customization**: Institution admins can set the visible name, logo, and a full color palette for Home via a dedicated tab in the dashboard.
- **Live Home-like preview**: The customization tab includes a mock Home layout that updates in real time as colors are changed.
- **CSS variable theming**: The Home page (and soon, other pages) consume these Firestore color values via CSS variables, with robust fallback to default colors if nothing is set.

## Firestore Data Model
Each institution document (in `institutions/{institutionId}`) can have:

```
customization: {
  institutionDisplayName: string,
  logoUrl: string,
  homeThemeColors: {
    primary: string,      // e.g. '#6366f1'
    secondary: string,    // e.g. '#f59e0b'
    accent: string,       // e.g. '#14b8a6'
    mutedText: string,    // e.g. '#6b7280'
    cardBorder: string,   // e.g. '#d1d5db'
    cardBackground: string // e.g. '#ffffff'
  },
  home: {
    colors: { ...same as above }
  },
  // ...other fields
}
```

## Main Pages and Files

### 1. `src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.jsx`
- **Purpose**: Admin UI for institution customization.
- **How it works**:
  - Loads current customization from Firestore on mount.
  - Lets admins edit the visible name, logo URL, and all color fields (with color pickers, swatches, and manual hex input).
  - Shows a live Home-like preview using the selected colors.
  - On save, writes the color object to Firestore under `customization.homeThemeColors` and `customization.home.colors`.

### 2. `src/utils/themeTokens.js`
- **Purpose**: Defines the default color palette, token keys, and helpers for resolving and applying theme colors.
- **Key exports**:
  - `HOME_THEME_DEFAULT_COLORS`: The fallback palette.
  - `getEffectiveHomeThemeColors(overrides)`: Merges Firestore values with defaults.
  - `buildHomeThemeCssVariables(colors)`: Produces a CSS variable map for React inline styles.
  - `resolveInstitutionHomeThemeColors(institutionData)`: Extracts color overrides from Firestore data.

### 3. `src/pages/Home/hooks/useInstitutionHomeThemeTokens.js`
- **Purpose**: Loads the current institution's theme colors and tokens for the Home page.
- **How it works**:
  - Reads the user's `institutionId`.
  - Loads the institution document from Firestore.
  - Extracts color overrides using `resolveInstitutionHomeThemeColors`.
  - Returns a merged object with tokens, color values, and a `cssVariables` object for inline style.

### 4. `src/pages/Home/Home.jsx`
- **Purpose**: The Home page, now fully color-customizable.
- **How it works**:
  - Calls `useInstitutionHomeThemeTokens(user)` to get the current theme.
  - Applies the returned `cssVariables` to the Home root container via the `style` prop.
  - All Home UI elements use CSS classes that reference these variables, so the color scheme updates instantly.

### 5. `src/index.css`
- **Purpose**: Defines the CSS variable classes and fallback values for Home theming.
- **How it works**:
  - Declares all `--home-*` variables with default values on `.home-page`.
  - Provides utility classes (e.g., `.home-token-muted-text`) that use these variables.
  - Home UI elements use these classes for color consistency.

## How the Flow Works
1. **Admin customizes colors in the dashboard** →
2. **Colors are saved to Firestore** →
3. **Home page loads colors from Firestore** →
4. **Colors are applied as CSS variables** →
5. **All Home UI elements update instantly**

## Extending to Other Pages
- The same color variable system can be applied to other pages (e.g., Header, Dashboard cards) by referencing the same CSS variables and/or using the same hook.
- This ensures a unified, institution-branded experience across the app.

## Example: Adding a New Color Field
1. Add the new field to `HOME_THEME_DEFAULT_COLORS` in `themeTokens.js`.
2. Add a selector for it in the customization form in `InstitutionAdminDashboard.jsx`.
3. Reference the new variable in CSS and UI as needed.

---

This system is robust, extensible, and easy to maintain. For any questions or to extend the system, see the code in the files above or ask for a code walkthrough.
