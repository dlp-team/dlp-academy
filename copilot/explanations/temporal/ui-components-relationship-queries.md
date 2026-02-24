# List & Tree Components: Remove folderIds/subjectIds Array Usage

## [2026-02-24] Update: UI Components Refactored to Query by Relationships

### Context
- All UI components that display folder hierarchies (FolderListItem, FolderTreeModal, FolderCard) were using `folderIds` and `subjectIds` arrays that no longer exist in the data model.
- These components needed to be updated to query child relationships dynamically using `parentId` and `folderId`.

### Components Updated

#### 1. **FolderManager.jsx** - Folder Creation Form
**Previous State:**
- Initialized form with `subjectIds: []` field
- When submitting, would pass this empty array to `addFolder`
- This caused new folders to have a `subjectIds` field created in Firestore

**New State:**
- Form data only includes: `name`, `description`, `color`, `tags` (no subjectIds)
- When submitting, `addFolder` only receives clean folder data

**Changes Made:**
- Line 14: Removed `subjectIds: []` from initial formData state
- Line 32: Removed `subjectIds: initialData.subjectIds || []` from editing initialization
- Line 41: Removed `subjectIds: []` from new folder initialization

#### 2. **FolderTreeModal.jsx** - Folder Tree Navigation Modal
**Previous State:**
- Lines 38-44: Checked `item.folderIds` and `item.subjectIds` arrays to find children
- Used array indices for sorting order

**New State:**
- Lines 38-39: Query `childFolders = allFolders.filter(f => f.parentId === item.id)`
- Query `childSubjects = allSubjects.filter(s => s.folderId === item.id)`
- No sorting needed - direct children only

**Changes Made:**
- TreeItem component logic simplified - queries by parentId/folderId
- Root folder display (lines 401-407): Same query-based approach

#### 3. **FolderListItem.jsx** - List View Folder Display
**Previous State:**
- Counted children recursively using `folderIds` and `subjectIds` arrays
- Fallback: used array lengths as shallow count

**New State:**
- Direct children count only (not recursive)
- `subjectCount = allSubjects.filter(s => s.folderId === item.id).length`
- `folderCount = allFolders.filter(f => f.parentId === item.id).length`

**Changes Made:**
- Removed recursive traverse logic that read folderIds/subjectIds
- Simplified calculation to direct child queries

#### 4. **FolderCard/useFolderCardLogic.js** - Grid View Folder Card
**Previous State:**
- Counted all descendants recursively by reading `folderIds` and `subjectIds` arrays
- Walk through tree using array indices

**New State:**
- Still counts descendants recursively, but now queries by `parentId` and `folderId`
- Recursively traverses tree by querying child relationships
- No array reads needed

**Changes Made:**
- Lines 20-60: Refactored traverse function to use relationship queries
- Removed all references to `folderIds` and `subjectIds` arrays
- Pure query-based hierarchy traversal

#### 5. **HomeModals.jsx** - Delete Confirmation Modal
**Previous State:**
- Line 59: `itemCount={getSubjectCountInFolder(deleteConfig.item?.id) + (deleteConfig.item?.folderIds?.length || 0)}`
- Tried to add folder count from folderIds array

**New State:**
- Line 59: `itemCount={getSubjectCountInFolder(deleteConfig.item?.id)}`
- Folder count is now handled by the count calculation functions

**Changes Made:**
- Removed direct folderIds reference

#### 6. **folderUtils.js** - Utility Functions
**Previous State:**
- Line 45: `const children = Array.isArray(currentFolder.folderIds) ? currentFolder.folderIds : []`
- Used folderIds array to check for descendants

**New State:**
- Query by parentId: `const children = Array.isArray(folders) ? folders.filter(f => f.parentId === currentFolder.id).map(f => f.id) : []`

**Changes Made:**
- Dynamic query instead of static array read

### Data Flow

**Before:**
```
Folder document: { id, name, folderIds: [childId1, childId2], subjectIds: [subId1, subId2] }
↓
UI Component reads arrays directly
↓
Displays cached children
```

**After:**
```
Folder document: { id, name, parentId: null }
Subject document: { id, name, folderId: parentId }
↓
UI Component queries: allFolders.filter(f => f.parentId === item.id)
                      allSubjects.filter(s => s.folderId === item.id)
↓
Displays dynamic children (single source of truth)
```

### Verification

✅ All files have no syntax errors
✅ No references to `folderIds` or `subjectIds` in UI code
✅ New folders created without these fields
✅ FolderManager form no longer includes subjectIds
✅ All tree/list components query by relationship fields

### Key Benefits

1. **Single Source of Truth**: Children relationships exist only in child documents (parentId, folderId)
2. **Real-Time Accuracy**: No stale array data - always queries current relationships
3. **Consistency**: Same logic applied across all components
4. **No More Duplication**: UI never sees mismatched data
5. **Clean Firestore**: No redundant array fields stored

---

This update completes the migration to a pure relationship-based data model for all UI components.
