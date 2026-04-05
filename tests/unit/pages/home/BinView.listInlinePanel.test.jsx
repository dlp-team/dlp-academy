// tests/unit/pages/home/BinView.listInlinePanel.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BinView from '../../../../src/pages/Home/components/BinView';

const mocks = vi.hoisted(() => ({
  useSubjects: vi.fn(),
  useFolders: vi.fn(),
  useShortcuts: vi.fn(),
  getActiveRole: vi.fn(),
}));

vi.mock('../../../../src/hooks/useSubjects', () => ({
  useSubjects: mocks.useSubjects,
}));

vi.mock('../../../../src/hooks/useFolders', () => ({
  useFolders: mocks.useFolders,
}));

vi.mock('../../../../src/hooks/useShortcuts', () => ({
  useShortcuts: mocks.useShortcuts,
}));

vi.mock('../../../../src/utils/permissionUtils', async () => {
  const actual = await vi.importActual('../../../../src/utils/permissionUtils');
  return {
    ...actual,
    getActiveRole: mocks.getActiveRole,
  };
});

vi.mock('../../../../src/components/modules/ListViewItem', () => ({
  default: ({ item, type, onNavigate, onNavigateSubject }) => (
    <button
      type="button"
      data-testid={`bin-list-row-${item.itemType}-${item.id}`}
      onClick={() => {
        if (type === 'folder') {
          onNavigate?.(item);
          return;
        }
        onNavigateSubject?.(item.id);
      }}
    >
      {item.name}
    </button>
  ),
}));

vi.mock('../../../../src/firebase/config', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  query: vi.fn(),
  where: vi.fn(),
}));

const buildSubject = (id, name) => ({
  id,
  name,
  trashedAt: {
    toDate: () => new Date('2026-04-05T00:00:00.000Z'),
  },
});

const buildFolder = (id, name) => ({
  id,
  name,
  trashedAt: {
    toDate: () => new Date('2026-04-05T00:00:00.000Z'),
  },
});

const buildShortcutSubject = (id, name) => ({
  id,
  name,
  targetType: 'subject',
  itemType: 'shortcut-subject',
  trashedAt: {
    toDate: () => new Date('2026-04-05T00:00:00.000Z'),
  },
});

const setTrashData = ({ subjects = [], folders = [], shortcuts = [] } = {}) => {
  mocks.useSubjects.mockReturnValue({
    getTrashedSubjects: vi.fn().mockResolvedValue(subjects),
    restoreSubject: vi.fn().mockResolvedValue(undefined),
    permanentlyDeleteSubject: vi.fn().mockResolvedValue(undefined),
  });

  mocks.useFolders.mockReturnValue({
    getTrashedFolders: vi.fn().mockResolvedValue(folders),
    restoreFolder: vi.fn().mockResolvedValue(undefined),
    permanentlyDeleteFolder: vi.fn().mockResolvedValue(undefined),
  });

  mocks.useShortcuts.mockReturnValue({
    getTrashedShortcuts: vi.fn().mockResolvedValue(shortcuts),
    restoreShortcut: vi.fn().mockResolvedValue(undefined),
    permanentlyDeleteShortcut: vi.fn().mockResolvedValue(undefined),
  });
};

beforeEach(() => {
  vi.clearAllMocks();

  mocks.getActiveRole.mockReturnValue('teacher');

  setTrashData({
    subjects: [
      buildSubject('sub-1', 'Historia'),
      buildSubject('sub-2', 'Quimica'),
    ],
    folders: [],
    shortcuts: [],
  });
});

describe('BinView list inline panel', () => {
  it('renders the action panel directly under the selected list item and moves with selection changes', async () => {
    render(<BinView user={{ uid: 'teacher-1', role: 'teacher' }} layoutMode="list" cardScale={100} />);

    await waitFor(() => {
      expect(screen.getByTestId('bin-list-row-subject-sub-1')).toBeTruthy();
      expect(screen.getByTestId('bin-list-row-subject-sub-2')).toBeTruthy();
    });

    fireEvent.click(screen.getByTestId('bin-list-row-subject-sub-1'));
    expect(screen.getByTestId('bin-list-inline-panel-subject-sub-1')).toBeTruthy();

    fireEvent.click(screen.getByTestId('bin-list-row-subject-sub-2'));

    await waitFor(() => {
      expect(screen.queryByTestId('bin-list-inline-panel-subject-sub-1')).toBeNull();
      expect(screen.getByTestId('bin-list-inline-panel-subject-sub-2')).toBeTruthy();
    });
  });

  it('does not render the inline panel while bulk selection mode is active', async () => {
    render(<BinView user={{ uid: 'teacher-1', role: 'teacher' }} layoutMode="list" cardScale={100} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Modo selección' })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Modo selección' }));
    fireEvent.click(screen.getByTestId('bin-list-row-subject-sub-1'));

    expect(screen.queryByTestId('bin-list-inline-panel-subject-sub-1')).toBeNull();
  });

  it('shows folder-specific inline actions for selected folders in list mode', async () => {
    setTrashData({
      subjects: [],
      folders: [buildFolder('folder-1', 'Carpeta principal')],
      shortcuts: [],
    });

    render(<BinView user={{ uid: 'teacher-1', role: 'teacher' }} layoutMode="list" cardScale={100} />);

    await waitFor(() => {
      expect(screen.getByTestId('bin-list-row-folder-folder-1')).toBeTruthy();
    });

    fireEvent.click(screen.getByTestId('bin-list-row-folder-folder-1'));

    expect(screen.getByTestId('bin-list-inline-panel-folder-folder-1')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Abrir contenido de carpeta' })).toBeTruthy();
  });

  it('shows shortcut restore label when selecting shortcut entries in list mode', async () => {
    setTrashData({
      subjects: [],
      folders: [],
      shortcuts: [buildShortcutSubject('shortcut-1', 'Acceso directo historia')],
    });

    render(<BinView user={{ uid: 'teacher-1', role: 'teacher' }} layoutMode="list" cardScale={100} />);

    await waitFor(() => {
      expect(screen.getByTestId('bin-list-row-shortcut-subject-shortcut-1')).toBeTruthy();
    });

    fireEvent.click(screen.getByTestId('bin-list-row-shortcut-subject-shortcut-1'));

    expect(screen.getByTestId('bin-list-inline-panel-shortcut-subject-shortcut-1')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Restaurar acceso directo' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Abrir contenido de carpeta' })).toBeNull();
  });
});
