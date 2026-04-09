// tests/unit/hooks/useHomeKeyboardShortcuts.test.js
import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useHomeKeyboardShortcuts } from '../../../src/pages/Home/hooks/useHomeKeyboardShortcuts';

const shortcutsBridge = vi.hoisted(() => ({
  handlers: null,
}));

vi.mock('../../../src/hooks/useKeyShortcuts', () => ({
  useKeyShortcuts: (handlers) => {
    shortcutsBridge.handlers = handlers;
  },
}));

const createLogic = (overrides = {}) => ({
  subjects: [],
  folders: [],
  currentFolder: null,
  addSubject: vi.fn(async () => 'new-subject-id'),
  addFolder: vi.fn(async () => ({ id: 'new-folder-id' })),
  updateSubject: vi.fn(async () => {}),
  updateFolder: vi.fn(async () => {}),
  deleteSubject: vi.fn(async () => {}),
  deleteFolder: vi.fn(async () => {}),
  getTrashedSubjects: vi.fn(async () => []),
  restoreSubject: vi.fn(async () => {}),
  ...overrides,
});

const user = { uid: 'user-1', institutionId: 'inst-1' };

const getHandlers = () => {
  expect(shortcutsBridge.handlers).toBeTruthy();
  return shortcutsBridge.handlers;
};

describe('useHomeKeyboardShortcuts edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    shortcutsBridge.handlers = null;
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('moves subjects with folderId on Ctrl+X then Ctrl+V', async () => {
    const subject = { id: 'subject-1', name: 'Matematica', ownerId: 'user-1', folderId: 'source-folder' };
    const logic = createLogic({
      subjects: [subject],
      currentFolder: { id: 'target-folder' },
    });

    const { result } = renderHook(() => useHomeKeyboardShortcuts({ user, logic }));
    await act(async () => {
      result.current.handleCardFocus(subject, 'subject');
    });

    await act(async () => {
      await getHandlers().onCut({});
    });

    await act(async () => {
      await getHandlers().onPaste({});
    });

    expect(logic.updateSubject).toHaveBeenCalledWith('subject-1', { folderId: 'target-folder' });
    expect(logic.updateFolder).not.toHaveBeenCalled();
  });

  it('moves folders with parentId on Ctrl+X then Ctrl+V', async () => {
    const folder = { id: 'folder-1', name: 'Unidad', ownerId: 'user-1', parentId: 'source-parent' };
    const logic = createLogic({
      folders: [folder],
      currentFolder: { id: 'target-parent' },
    });

    const { result } = renderHook(() => useHomeKeyboardShortcuts({ user, logic }));
    await act(async () => {
      result.current.handleCardFocus(folder, 'folder');
    });

    await act(async () => {
      await getHandlers().onCut({});
    });

    await act(async () => {
      await getHandlers().onPaste({});
    });

    expect(logic.updateFolder).toHaveBeenCalledWith('folder-1', { parentId: 'target-parent' });
    expect(logic.updateSubject).not.toHaveBeenCalled();
  });

  it('undoes copied subject created through Ctrl+C then Ctrl+V', async () => {
    const subject = { id: 'subject-1', name: 'Biologia', ownerId: 'user-1', folderId: null, topics: [] };
    const logic = createLogic({
      subjects: [subject],
      currentFolder: { id: 'target-folder' },
      addSubject: vi.fn(async () => 'subject-copy-1'),
    });

    const { result } = renderHook(() => useHomeKeyboardShortcuts({ user, logic }));
    await act(async () => {
      result.current.handleCardFocus(subject, 'subject');
    });

    await act(async () => {
      await getHandlers().onCopy({});
    });

    await act(async () => {
      await getHandlers().onPaste({});
    });

    await act(async () => {
      await getHandlers().onUndo({});
    });

    expect(logic.addSubject).toHaveBeenCalled();
    expect(logic.deleteSubject).toHaveBeenCalledWith('subject-copy-1');
  });

  it('undoes copied folder created through Ctrl+C then Ctrl+V', async () => {
    const folder = { id: 'folder-source', name: 'Proyecto', ownerId: 'user-1', parentId: null };
    const logic = createLogic({
      folders: [folder],
      currentFolder: { id: 'target-parent' },
      addFolder: vi.fn(async () => ({ id: 'folder-copy-1' })),
    });

    const { result } = renderHook(() => useHomeKeyboardShortcuts({ user, logic }));
    await act(async () => {
      result.current.handleCardFocus(folder, 'folder');
    });

    await act(async () => {
      await getHandlers().onCopy({});
    });

    await act(async () => {
      await getHandlers().onPaste({});
    });

    await act(async () => {
      await getHandlers().onUndo({});
    });

    expect(logic.addFolder).toHaveBeenCalled();
    expect(logic.deleteFolder).toHaveBeenCalledWith('folder-copy-1');
  });

  it('blocks folder self-move and descendant moves', async () => {
    const folder = { id: 'folder-1', name: 'Raiz', ownerId: 'user-1', parentId: null };
    const logicSelf = createLogic({
      folders: [folder],
      currentFolder: { id: 'folder-1' },
    });

    const { result: selfResult } = renderHook(() => useHomeKeyboardShortcuts({ user, logic: logicSelf }));
    await act(async () => {
      selfResult.current.handleCardFocus(folder, 'folder');
    });

    await act(async () => {
      await getHandlers().onCut({});
    });

    await act(async () => {
      await getHandlers().onPaste({});
    });

    expect(logicSelf.updateFolder).not.toHaveBeenCalled();

    const logicDescendant = createLogic({
      folders: [
        { id: 'folder-1', name: 'Raiz', ownerId: 'user-1', parentId: null },
        { id: 'folder-2', name: 'Hijo', ownerId: 'user-1', parentId: 'folder-1' },
      ],
      currentFolder: { id: 'folder-2' },
    });

    const { result: descendantResult } = renderHook(() => useHomeKeyboardShortcuts({ user, logic: logicDescendant }));
    await act(async () => {
      descendantResult.current.handleCardFocus({ id: 'folder-1', name: 'Raiz', ownerId: 'user-1', parentId: null }, 'folder');
    });

    await act(async () => {
      await getHandlers().onCut({});
    });

    await act(async () => {
      await getHandlers().onPaste({});
    });

    expect(logicDescendant.updateFolder).not.toHaveBeenCalled();
  });

  it('undoes a moved subject back to original folderId', async () => {
    const subject = { id: 'subject-1', name: 'Historia', ownerId: 'user-1', folderId: 'folder-a' };
    const logic = createLogic({
      subjects: [subject],
      currentFolder: { id: 'folder-b' },
    });

    const { result } = renderHook(() => useHomeKeyboardShortcuts({ user, logic }));
    await act(async () => {
      result.current.handleCardFocus(subject, 'subject');
    });

    await act(async () => {
      await getHandlers().onCut({});
    });

    await act(async () => {
      await getHandlers().onPaste({});
    });

    await act(async () => {
      await getHandlers().onUndo({});
    });

    expect(logic.updateSubject).toHaveBeenCalledWith('subject-1', { folderId: 'folder-b' });
    expect(logic.updateSubject).toHaveBeenCalledWith('subject-1', { folderId: 'folder-a' });
  });

  it('restores latest trashed subject first when undo stack is empty', async () => {
    const logic = createLogic({
      getTrashedSubjects: vi.fn(async () => ([
        { id: 'subject-old', name: 'Vieja', trashedAt: '2026-02-01T10:00:00.000Z' },
        { id: 'subject-new', name: 'Nueva', trashedAt: '2026-03-01T10:00:00.000Z' },
      ])),
    });

    renderHook(() => useHomeKeyboardShortcuts({ user, logic }));
    const handlers = getHandlers();

    await act(async () => {
      await handlers.onUndo({});
    });

    expect(logic.restoreSubject).toHaveBeenCalledTimes(1);
    expect(logic.restoreSubject).toHaveBeenCalledWith('subject-new');
  });

  it('falls back to updateSubject restore when restoreSubject is unavailable', async () => {
    const logic = createLogic({
      restoreSubject: undefined,
      getTrashedSubjects: vi.fn(async () => ([
        { id: 'subject-1', trashedAt: '2026-03-01T10:00:00.000Z' },
      ])),
    });

    renderHook(() => useHomeKeyboardShortcuts({ user, logic }));
    const handlers = getHandlers();

    await act(async () => {
      await handlers.onUndo({});
    });

    expect(logic.updateSubject).toHaveBeenCalledWith('subject-1', { status: 'active', trashedAt: null });
  });

  it('continues restore attempts when first trashed candidate fails', async () => {
    const logic = createLogic({
      getTrashedSubjects: vi.fn(async () => ([
        { id: 'subject-new', trashedAt: '2026-03-01T10:00:00.000Z' },
        { id: 'subject-old', trashedAt: '2026-02-01T10:00:00.000Z' },
      ])),
      restoreSubject: vi
        .fn()
        .mockRejectedValueOnce(new Error('restore failed'))
        .mockResolvedValueOnce(undefined),
    });

    renderHook(() => useHomeKeyboardShortcuts({ user, logic }));
    const handlers = getHandlers();

    await act(async () => {
      await handlers.onUndo({});
    });

    expect(logic.restoreSubject).toHaveBeenNthCalledWith(1, 'subject-new');
    expect(logic.restoreSubject).toHaveBeenNthCalledWith(2, 'subject-old');
  });

  it('applies cut visual state and clears pending opacity after clipboard mode changes', async () => {
    vi.useFakeTimers();

    try {
      const subject = { id: 'subject-1', name: 'Fisica', ownerId: 'user-1', folderId: null };
      const logic = createLogic({ subjects: [subject] });
      const { result } = renderHook(() => useHomeKeyboardShortcuts({ user, logic }));

      await act(async () => {
        result.current.handleCardFocus(subject, 'subject');
      });

      const handlers = getHandlers();

      await act(async () => {
        await handlers.onCut({});
      });

      expect(result.current.getCardVisualState('subject-1', 'subject')).toEqual({
        isAnimating: true,
        isCutPending: true,
      });

      act(() => {
        vi.advanceTimersByTime(170);
      });

      expect(result.current.getCardVisualState('subject-1', 'subject')).toEqual({
        isAnimating: false,
        isCutPending: true,
      });

      await act(async () => {
        await handlers.onCopy({});
      });

      expect(result.current.getCardVisualState('subject-1', 'subject')).toEqual({
        isAnimating: true,
        isCutPending: false,
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it('ignores shortcuts while typing and blocks shortcut entities from copy/cut', async () => {
    const shortcutItem = {
      id: 'shortcut-1',
      targetId: 'subject-1',
      targetType: 'subject',
      ownerId: 'user-1',
    };

    const logic = createLogic({ subjects: [shortcutItem] });
    const { result } = renderHook(() => useHomeKeyboardShortcuts({ user, logic }));

    await act(async () => {
      result.current.handleCardFocus(shortcutItem, 'subject');
    });

    const handlers = getHandlers();
    const typingEvent = { target: { tagName: 'INPUT' } };

    let consumed = false;
    await act(async () => {
      consumed = await handlers.onCopy(typingEvent);
    });

    expect(consumed).toBe(false);

    await act(async () => {
      consumed = await handlers.onCopy({});
    });

    expect(consumed).toBe(true);
    expect(result.current.shortcutFeedback).toContain('accesos directos');
  });

  it('requires a selected card before copy/cut operations', async () => {
    const logic = createLogic();
    const { result } = renderHook(() => useHomeKeyboardShortcuts({ user, logic }));

    let consumed = false;
    await act(async () => {
      consumed = await getHandlers().onCut({});
    });

    expect(consumed).toBe(true);
    expect(result.current.shortcutFeedback).toContain('Selecciona una tarjeta');
  });

  it('shows empty clipboard feedback when paste is requested without copy/cut', async () => {
    const logic = createLogic();
    const { result } = renderHook(() => useHomeKeyboardShortcuts({ user, logic }));

    let consumed = false;
    await act(async () => {
      consumed = await getHandlers().onPaste({});
    });

    expect(consumed).toBe(true);
    expect(result.current.shortcutFeedback).toContain('portapapeles');
  });

  it('shows no-actions feedback when undo stack and trash are empty', async () => {
    const logic = createLogic({
      getTrashedSubjects: vi.fn(async () => []),
    });

    const { result } = renderHook(() => useHomeKeyboardShortcuts({ user, logic }));

    let consumed = false;
    await act(async () => {
      consumed = await getHandlers().onUndo({});
    });

    expect(consumed).toBe(true);
    expect(result.current.shortcutFeedback).toContain('No hay acciones para deshacer');
  });

  it('blocks copy/cut mutation when selected card is read-only and keeps Spanish feedback', async () => {
    const readOnlySubject = {
      id: 'subject-readonly-1',
      name: 'Lectura',
      ownerId: 'teacher-2',
      editorUids: [],
      viewerUids: ['user-1'],
      folderId: null,
    };

    const logic = createLogic({ subjects: [readOnlySubject] });
    const { result } = renderHook(() => useHomeKeyboardShortcuts({ user, logic }));

    await act(async () => {
      result.current.handleCardFocus(readOnlySubject, 'subject');
    });

    let consumedCopy = false;
    let consumedCut = false;
    await act(async () => {
      consumedCopy = await getHandlers().onCopy({});
      consumedCut = await getHandlers().onCut({});
    });

    expect(consumedCopy).toBe(true);
    expect(consumedCut).toBe(true);
    expect(result.current.shortcutFeedback).toContain('Necesitas permisos de edicion');

    await act(async () => {
      await getHandlers().onPaste({});
    });

    expect(logic.updateSubject).not.toHaveBeenCalled();
    expect(logic.updateFolder).not.toHaveBeenCalled();
  });

  it('never uses browser alert for shortcut UX feedback', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    try {
      const logic = createLogic();
      const { result } = renderHook(() => useHomeKeyboardShortcuts({ user, logic }));

      await act(async () => {
        await getHandlers().onPaste({});
      });

      expect(result.current.shortcutFeedback).toContain('No hay elementos en el portapapeles');
      expect(alertSpy).not.toHaveBeenCalled();
    } finally {
      alertSpy.mockRestore();
    }
  });
});
