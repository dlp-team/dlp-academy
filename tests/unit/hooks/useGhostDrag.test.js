// tests/unit/hooks/useGhostDrag.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGhostDrag } from '../../../src/hooks/useGhostDrag';

describe('useGhostDrag', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    const ghost = document.getElementById('active-drag-ghost');
    if (ghost?.parentNode) {
      ghost.parentNode.removeChild(ghost);
    }
  });

  const buildDragEvent = (overrides = {}) => ({
    clientX: 120,
    clientY: 80,
    dataTransfer: {
      setDragImage: vi.fn(),
    },
    ...overrides,
  });

  it('creates a drag ghost with fixed scale metadata and removes it on drag end', () => {
    const onDragStart = vi.fn();
    const onDragEnd = vi.fn();

    const { result } = renderHook(() =>
      useGhostDrag({ item: { id: 'folder-1' }, type: 'folder', onDragStart, onDragEnd })
    );

    const card = document.createElement('div');
    card.style.width = '200px';
    card.style.height = '100px';
    card.getBoundingClientRect = () => ({
      top: 20,
      left: 40,
      width: 200,
      height: 100,
      right: 240,
      bottom: 120,
      x: 40,
      y: 20,
      toJSON: () => ({}),
    });

    act(() => {
      result.current.itemRef.current = card;
    });

    const startEvent = buildDragEvent();

    act(() => {
      result.current.dragHandlers.onDragStart(startEvent);
    });

    const ghost = document.getElementById('active-drag-ghost');
    expect(ghost).toBeTruthy();
    expect(ghost?.dataset.originalScale).toBe('0.95');
    expect(ghost?.dataset.scale).toBe('0.95');
    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(result.current.isDragging).toBe(true);

    act(() => {
      result.current.dragHandlers.onDragEnd({});
    });

    expect(document.getElementById('active-drag-ghost')).toBeNull();
    expect(onDragEnd).toHaveBeenCalledTimes(1);
    expect(result.current.isDragging).toBe(false);
  });

  it('updates ghost position during drag and ignores zeroed pointer events', () => {
    const { result } = renderHook(() =>
      useGhostDrag({ item: { id: 'subject-1' }, type: 'subject', onDragStart: vi.fn(), onDragEnd: vi.fn() })
    );

    const card = document.createElement('div');
    card.getBoundingClientRect = () => ({
      top: 10,
      left: 10,
      width: 180,
      height: 80,
      right: 190,
      bottom: 90,
      x: 10,
      y: 10,
      toJSON: () => ({}),
    });

    act(() => {
      result.current.itemRef.current = card;
    });

    act(() => {
      result.current.dragHandlers.onDragStart(buildDragEvent({ clientX: 50, clientY: 40 }));
    });

    const ghost = document.getElementById('active-drag-ghost');
    expect(ghost).toBeTruthy();

    act(() => {
      result.current.dragHandlers.onDrag({ clientX: 160, clientY: 120 });
    });

    expect(ghost?.style.left).toBe('120px');
    expect(ghost?.style.top).toBe('90px');

    const prevLeft = ghost?.style.left;
    const prevTop = ghost?.style.top;

    act(() => {
      result.current.dragHandlers.onDrag({ clientX: 0, clientY: 0 });
    });

    expect(ghost?.style.left).toBe(prevLeft);
    expect(ghost?.style.top).toBe(prevTop);
  });

  it('handles missing card node without creating ghost and still calls callbacks', () => {
    const onDragStart = vi.fn();
    const onDragEnd = vi.fn();

    const { result } = renderHook(() =>
      useGhostDrag({ item: { id: 'topic-1' }, type: 'topic', onDragStart, onDragEnd })
    );

    act(() => {
      result.current.dragHandlers.onDragStart(buildDragEvent());
    });

    expect(document.getElementById('active-drag-ghost')).toBeNull();
    expect(onDragStart).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.dragHandlers.onDragEnd({});
    });

    expect(onDragEnd).toHaveBeenCalledTimes(1);
    expect(result.current.isDragging).toBe(false);
  });
});
