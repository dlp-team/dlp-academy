<!-- copilot/architectures/active/multi-feature-enhancement-2026-04-19/phases/phase-07-badges-schema.md -->
# Phase 07: Badges System — Data Model & Schema

**Status**: `not-started`
**Sub-Branch**: `arch/multi-feature-enhancement-2026-04-19/phase-07-badges-schema`
**Dependencies**: Phase 06 (conduct context)
**Threat Refs**: T-SEC-01, T-SEC-02, T-SEC-03, T-DATA-04, T-PERM-02, T-ROLL-01

---

## Objective

Design and implement the Firestore data model for the enhanced badge system. This is the foundation for auto-badges (Phase 08) and manual/subject badges (Phase 09).

---

## Data Model Design

### Badge Template Schema (`badgeTemplates` collection)
```typescript
interface BadgeTemplate {
  id: string;
  institutionId: string;
  name: string;                          // "Excelencia académica"
  description: string;                   // "Otorgada por rendimiento sobresaliente"
  icon: string;                          // lucide-react icon name
  type: 'auto' | 'manual';              // How it's assigned
  scope: 'general' | 'subject';         // Who manages it
  category: string;                      // 'grades' | 'behavior' | 'participation' | 'custom'
  gradingConfig?: {                      // For auto grade-based badges
    metric: 'mean' | 'min' | 'max';
    threshold: number;                   // Minimum score to earn (default from institution setting)
    perfectScore: number;                // Score considered "perfect" (default 10)
  };
  styleConfig: {
    baseColor: string;                   // Tailwind gradient start
    progressColors: {                    // Color stops by score (for grade-based)
      [score: number]: string;           // e.g., { 8: 'green', 9: 'amber', 10: 'gold' }
    };
    perfectStyle?: string;              // Special class for perfect score
  };
  createdBy: string;                     // UID of creator
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isDefault: boolean;                    // Pre-configured by system
  subjectId?: string;                    // Only for scope: 'subject'
}
```

### Student Badge Record (`studentBadges` subcollection of `users`)
```typescript
interface StudentBadge {
  id: string;
  templateId: string;
  institutionId: string;
  studentId: string;
  subjectId?: string;                    // For subject-scoped badges
  type: 'auto' | 'manual';
  scope: 'general' | 'subject';
  status: 'active' | 'revoked';
  currentScore?: number;                 // For grade-based: current mean
  styleLevel?: string;                   // Computed style based on currentScore
  awardedBy?: string;                    // UID — null for auto badges
  awardedAt: Timestamp;
  revokedAt?: Timestamp;
  revokedBy?: string;
  metadata?: Record<string, any>;        // Extra context
}
```

### Institution Badge Settings (`institutions/{id}/settings/badgeConfig`)
```typescript
interface InstitutionBadgeConfig {
  gradeThreshold: number;                // Default: 8
  enableAutoBadges: boolean;             // Default: true
  enableManualBadges: boolean;           // Default: true
  defaultTemplates: string[];            // Template IDs auto-created for new subjects
}
```

---

## Tasks

### 7.1 — Create TypeScript Interfaces
- [ ] File: `src/types/badges.ts`
- [ ] Define `BadgeTemplate`, `StudentBadge`, `InstitutionBadgeConfig`
- [ ] Define `BadgeScope`, `BadgeType`, `BadgeCategory` enums/unions
- [ ] Define `BadgeStyleLevel` type for grade-to-style mapping

### 7.2 — Create Badge Utilities
- [ ] File: `src/utils/badgeUtils.ts`
- [ ] `getDefaultThreshold(config?: InstitutionBadgeConfig): number` — returns threshold or 8
- [ ] `computeStyleLevel(score: number, threshold: number, perfectScore: number): BadgeStyleLevel`
  - score < threshold → null (no badge)
  - score == threshold → 'threshold' (green)
  - score > threshold && < perfect → interpolated level
  - score == perfect → 'perfect' (gold)
- [ ] `getStyleColors(level: BadgeStyleLevel): { gradient: string, glow: string }`
  - Maps levels to Tailwind gradient classes
  - Discrete stops: threshold=green, mid=lime, high=amber, near-perfect=orange, perfect=gold
- [ ] `computeMean(grades: number[]): number` — safe mean computation
  - Empty array → NaN (handle upstream)
  - Single value → that value
  - Standard mean
- [ ] `isEligibleForBadge(mean: number, threshold: number): boolean`
- [ ] `getDefaultBadgeTemplates(): BadgeTemplate[]` — system default badge set

### 7.3 — Create Badge Data Hook
- [ ] File: `src/hooks/useBadges.ts`
- [ ] Fetches badge templates for current institution
- [ ] Fetches student badge records (scoped by institutionId)
- [ ] CRUD operations: create template, award badge, revoke badge
- [ ] All queries include `institutionId` filter
- [ ] Real-time listeners for badge changes (onSnapshot)

### 7.4 — Create Institution Badge Settings Hook
- [ ] File: `src/hooks/useInstitutionBadgeSettings.ts`
- [ ] Fetches badge config from institution settings
- [ ] Default values when config doesn't exist
- [ ] Update function for institution admin

### 7.5 — Firestore Security Considerations
- [ ] Document required Firestore rules (do NOT deploy — document only)
- [ ] Rules: teachers can write to subject-scoped badges they own
- [ ] Rules: institution admins can write to general badges
- [ ] Rules: students have read-only access to their badges
- [ ] Rules: all queries must include institutionId match

### 7.6 — Testing
- [ ] Unit test: `computeStyleLevel` — all score ranges
- [ ] Unit test: `getStyleColors` — all levels produce valid gradients
- [ ] Unit test: `computeMean` — empty, single, multiple, edge cases
- [ ] Unit test: `isEligibleForBadge` — boundary conditions (exactly threshold, just below, just above)
- [ ] Unit test: `getDefaultThreshold` — with and without config
- [ ] Unit test: Hook data fetching (mocked Firestore)

---

## Acceptance Criteria

- [ ] TypeScript interfaces cover all badge variants
- [ ] Badge utilities handle all edge cases (NaN, undefined, empty)
- [ ] Style progression produces visually distinct levels from green→gold
- [ ] Data hook scopes all queries by institutionId
- [ ] Institution settings hook defaults gracefully when no config exists
- [ ] Firestore rules documented (not deployed)
- [ ] All unit tests pass

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/types/badges.ts` | TypeScript interfaces |
| `src/utils/badgeUtils.ts` | Badge computation utilities |
| `src/hooks/useBadges.ts` | Badge data CRUD hook |
| `src/hooks/useInstitutionBadgeSettings.ts` | Institution settings hook |

---

## Validation Evidence

_(Fill after implementation)_

| Check | Result |
|-------|--------|
| Type definitions complete | |
| Utility unit tests pass | |
| Hook unit tests pass | |
| Style level visual test | |
| Firestore rules documented | |
