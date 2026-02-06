# Source Code Structure

Welcome to the DLP Academy source code. This project uses **React**, **Tailwind CSS v4**, and **Firebase**.

## 📂 Directory Guide

- **`/components`**: Reusable UI blocks. Organized by Atomic Design principles (UI -> Layout -> Features).
- **`/hooks`**: Custom React hooks. All Firebase/Backend interaction happens here.
- **`/pages`**: Route components. These act as controllers connecting Hooks to Components.
- **`/utils`**: Static constants and helper functions.
- **`/firebase`**: Firebase configuration and initialization (`config.js`).
- **`/assets`**: Static images and global resources.

## 🎨 Styling
We use **Tailwind CSS v4**. 
- Global styles are in `index.css`.
- We avoid CSS Modules (`.module.css`) in favor of utility classes.
- Theme variables are defined in the `@theme` block in `index.css`.