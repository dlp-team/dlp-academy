// tests/unit/hooks/useHomeControlTags.test.js
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useHomeControlTags } from '../../../src/pages/Home/hooks/useHomeControlTags';

const createBaseLogic = (overrides = {}) => ({
  viewMode: 'grid',
  filteredFolders: [{ id: 'f1', tags: ['matematica', 'historia'] }],
  folders: [],
  filteredSubjects: [{ id: 's1', tags: ['historia', 'fisica'] }],
  subjects: [],
  selectedTags: ['historia', 'invalida'],
  setSelectedTags: vi.fn(),
  ...overrides,
});

describe('useHomeControlTags', () => {
  it('aggregates control tags and prunes invalid manual tags', () => {
    const logic = createBaseLogic();
    const setSharedSelectedTags = vi.fn();

    const { result } = renderHook(() =>
      useHomeControlTags({
        logic,
        isStudentRole: false,
        sharedFolders: [],
        sharedSubjects: [],
        sharedSelectedTags: [],
        setSharedSelectedTags,
        effectiveSharedScopeSelected: true,
        isSharedForCurrentUser: () => false,
      })
    );

    expect(result.current.availableControlTags).toEqual(['fisica', 'historia', 'matematica']);
    expect(logic.setSelectedTags).toHaveBeenCalledWith(['historia']);
    expect(setSharedSelectedTags).not.toHaveBeenCalled();
  });

  it('prunes invalid shared tags when in shared mode', () => {
    const logic = createBaseLogic({
      viewMode: 'shared',
      filteredFolders: [],
      filteredSubjects: [],
      selectedTags: [],
    });
    const setSharedSelectedTags = vi.fn();

    renderHook(() =>
      useHomeControlTags({
        logic,
        isStudentRole: false,
        sharedFolders: [{ id: 'f1', tags: ['biologia'] }],
        sharedSubjects: [{ id: 's1', tags: ['quimica'] }],
        sharedSelectedTags: ['quimica', 'invalida'],
        setSharedSelectedTags,
        effectiveSharedScopeSelected: true,
        isSharedForCurrentUser: () => false,
      })
    );

    expect(setSharedSelectedTags).toHaveBeenCalledWith(['quimica']);
    expect(logic.setSelectedTags).not.toHaveBeenCalled();
  });
});
