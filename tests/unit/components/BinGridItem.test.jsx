// tests/unit/components/BinGridItem.test.jsx
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BinGridItem from '../../../src/pages/Home/components/bin/BinGridItem';

vi.mock('../../../src/components/modules/SubjectCard/SubjectCard', () => ({
  default: ({ subject }) => <div data-testid={`subject-card-${subject?.id || 'unknown'}`}>{subject?.name || 'Sin nombre'}</div>,
}));

describe('BinGridItem', () => {
  const baseProps = {
    item: { id: 'item-1', name: 'Historia', trashedAt: { toDate: () => new Date('2026-04-01T00:00:00.000Z') } },
    user: { uid: 'owner-1', role: 'teacher' },
    cardScale: 100,
    onSelect: vi.fn(),
  };

  it('applies shared selected ring visuals', () => {
    render(
      <BinGridItem
        {...baseProps}
        itemType="subject"
        isSelected
        hasSelection
      />
    );

    const card = screen.getByTestId('bin-subject-card-item-1');
    expect(card.className).toContain('ring-4');
    expect(card.className).toContain('ring-indigo-500');
  });

  it('dims unselected subject cards without opacity changes when a selection exists', () => {
    render(
      <BinGridItem
        {...baseProps}
        itemType="subject"
        isSelected={false}
        hasSelection
      />
    );

    const wrapper = screen.getByTestId('bin-grid-wrapper-subject-item-1');
    expect(wrapper.className).toContain('brightness-[0.88]');
    expect(wrapper.className).toContain('saturate-[0.58]');
    expect(wrapper.className).not.toContain('opacity-30');
  });

  it('uses softer dimming for folders to preserve legibility', () => {
    render(
      <BinGridItem
        {...baseProps}
        itemType="folder"
        isSelected={false}
        hasSelection
      />
    );

    const wrapper = screen.getByTestId('bin-grid-wrapper-folder-item-1');
    expect(wrapper.className).toContain('brightness-[0.93]');
    expect(wrapper.className).toContain('saturate-[0.76]');
  });
});
