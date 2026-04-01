// tests/unit/hooks/useHomeCreationGuards.test.js
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useHomeCreationGuards } from '../../../src/pages/Home/hooks/useHomeCreationGuards';

describe('useHomeCreationGuards', () => {
  it('blocks folder creation for student users in manual grid context', () => {
    const { result } = renderHook(() =>
      useHomeCreationGuards({
        user: { uid: 'u1', role: 'student' },
        logic: { viewMode: 'grid', currentFolder: null, groupedContent: {} },
        isStudentRole: true,
        hasContent: false,
      })
    );

    expect(result.current.canCreateFolderInManualContext).toBe(false);
  });

  it('uses grouped content for student effectiveHasContent', () => {
    const { result } = renderHook(() =>
      useHomeCreationGuards({
        user: { uid: 'u1', role: 'student' },
        logic: {
          viewMode: 'grid',
          currentFolder: null,
          groupedContent: {
            today: [{ id: 's1' }],
          },
        },
        isStudentRole: true,
        hasContent: false,
      })
    );

    expect(result.current.effectiveHasContent).toBe(true);
  });

  it('blocks teacher subject creation when institution policy disables autonomous creation', () => {
    const { result } = renderHook(() =>
      useHomeCreationGuards({
        user: { uid: 'teacher-1', role: 'teacher' },
        logic: { viewMode: 'grid', currentFolder: null, groupedContent: {} },
        isStudentRole: false,
        hasContent: true,
        teacherSubjectCreationAllowed: false,
      })
    );

    expect(result.current.canCreateInManualContext).toBe(false);
  });
});
