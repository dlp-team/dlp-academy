// tests/unit/components/BinView.listPressState.test.jsx
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import BinView from '../../../src/pages/Home/components/BinView';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../../../src/components/modules/ListViewItem', () => ({
  default: ({ item, type, onNavigate, onNavigateSubject }) => (
    <button
      type="button"
      data-testid={`bin-list-item-${type}-${item?.id}`}
      onClick={() => {
        if (type === 'folder') {
          onNavigate?.(item);
          return;
        }
        onNavigateSubject?.(item?.id);
      }}
    >
      {item?.name || 'Elemento'}
    </button>
  ),
}));

vi.mock('../../../src/hooks/useSubjects', () => ({
  useSubjects: () => ({
    getTrashedSubjects: vi.fn(async () => ([
      {
        id: 'subject-1',
        name: 'Historia',
        folderId: null,
        trashedAt: '2026-04-01T10:00:00.000Z',
      },
    ])),
    restoreSubject: vi.fn(async () => {}),
    permanentlyDeleteSubject: vi.fn(async () => {}),
  }),
}));

vi.mock('../../../src/hooks/useFolders', () => ({
  useFolders: () => ({
    getTrashedFolders: vi.fn(async () => []),
    restoreFolder: vi.fn(async () => {}),
    permanentlyDeleteFolder: vi.fn(async () => {}),
  }),
}));

vi.mock('../../../src/hooks/useShortcuts', () => ({
  useShortcuts: () => ({
    getTrashedShortcuts: vi.fn(async () => []),
    restoreShortcut: vi.fn(async () => {}),
    permanentlyDeleteShortcut: vi.fn(async () => {}),
  }),
}));

describe('BinView list pressed-state parity', () => {
  it('applies scale and pressed shadow to selected list item outside selection mode', async () => {
    render(<BinView user={{ uid: 'user-1', role: 'teacher' }} layoutMode="list" cardScale={100} />);

    await waitFor(() => {
      expect(screen.getByTestId('bin-list-item-subject-subject-1')).toBeTruthy();
    });

    fireEvent.click(screen.getByTestId('bin-list-item-subject-subject-1'));

    const wrapper = screen.getByTestId('bin-list-wrapper-subject-subject-1');
    expect(wrapper.className).toContain('scale-[1.01]');
    expect(wrapper.className).toContain('shadow-[0_14px_30px_rgba(15,23,42,0.18)]');
  });
});
