## [2026-02-24] Complete: Data Model Single Source of Truth - All Layers Fixed

### Problem Solved
1. **New folders were created with `subjectIds` field** - FIXED
2. **UI components used `folderIds` and `subjectIds` arrays** - FIXED
3. **List mode and FolderTreeModal didn't use parentId/folderId** - FIXED

### Root Cause Analysis

The `subjectIds` field appeared in new folders because:
1. **FolderManager.jsx** initialized form data with `subjectIds: []`
2. This formData was passed to `addFolder` function
3. The addFolder function didn't filter it out - it accepted the entire payload

### Complete Solution Applied

#### Backend Fixes (Completed Previously)
✅ `useFolders.js` - Removed addFolderToParent calls, no folderIds creation
✅ `useHomeState.js` - Removed descendantFolderIds memo, simplified scope to direct children
✅ `folderUtils.js` - Uses parentId queries instead of folderIds arrays

#### Frontend Fixes (Completed Now)
✅ **FolderManager.jsx** - Removed `subjectIds: []` from all form initializations
✅ **FolderTreeModal.jsx** - Queries children by `parentId`/`folderId` instead of arrays
✅ **FolderListItem.jsx** - Direct children count via queries, removed array logic
✅ **FolderCard/useFolderCardLogic.js** - Recursive traversal uses relationship queries
✅ **HomeModals.jsx** - Removed folderIds reference from delete count

### Files Modified (6 Total)

| File | Changes |
|------|---------|
| `src/pages/Home/components/FolderManager.jsx` | Removed subjectIds from form data (3 locations) |
| `src/components/modals/FolderTreeModal.jsx` | Query children by parentId/folderId (2 sections) |
| `src/components/modules/ListItems/FolderListItem.jsx` | Query direct children, removed recursive array logic |
| `src/components/modules/FolderCard/useFolderCardLogic.js` | Refactored traverse to use relationship queries |
| `src/utils/folderUtils.js` | Query children by parentId instead of folderIds array |
| `src/pages/Home/components/HomeModals.jsx` | Removed folderIds reference |

### Data Model Summary

**Single Source of Truth Relationships:**
```
Folder Hierarchy: child.parentId === parent.id
Subject Membership: subject.folderId === folder.id
```

**NO Redundant Arrays:**
- ❌ folder.folderIds (removed)
- ❌ folder.subjectIds (removed)
- ✅ Only relationship pointers on child documents

### Testing Checklist
✅ New folder creation - no subjectIds field
✅ List view - displays direct children only
✅ Tree modal - shows correct hierarchy
✅ Grid view cards - show accurate child counts
✅ Move operations - work correctly with direct children
✅ No syntax errors in any modified file

### Expected Behavior After Fix
- Creating a new folder → no `subjectIds` field
- Navigating folders → sees only direct children (one level)
- Moving subjects → no duplication
- Moving folders → parentId updates only
- UI updates → live queries always reflect current data

---

**Status: COMPLETE** - All layers (backend, display logic, UI components) now use single source of truth for relationships.
