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

  it('sets drag image to transparent placeholder to hide native preview', () => {
    const { result } = renderHook(() =>
      useGhostDrag({ item: { id: 'subject-1' }, type: 'subject', onDragStart: vi.fn(), onDragEnd: vi.fn() })
    );

    const card = document.createElement('div');
    card.getBoundingClientRect = () => ({
      top: 10,
      left: 20,
      width: 140,
      height: 60,
      right: 160,
      bottom: 70,
      x: 20,
      y: 10,
      toJSON: () => ({}),
    });

    act(() => {
      result.current.itemRef.current = card;
    });

    const startEvent = buildDragEvent({ clientX: 40, clientY: 30 });
    act(() => {
      result.current.dragHandlers.onDragStart(startEvent);
    });

    expect(startEvent.dataTransfer.setDragImage).toHaveBeenCalledTimes(1);
    expect(startEvent.dataTransfer.setDragImage).toHaveBeenCalledWith(expect.any(Image), 0, 0);
  });

  it('computes transform origin using cursor offset from the source card', () => {
    const { result } = renderHook(() =>
      useGhostDrag({ item: { id: 'folder-2' }, type: 'folder', onDragStart: vi.fn(), onDragEnd: vi.fn() })
    );

    const card = document.createElement('div');
    card.getBoundingClientRect = () => ({
      top: 20,
      left: 35,
      width: 120,
      height: 55,
      right: 155,
      bottom: 75,
      x: 35,
      y: 20,
      toJSON: () => ({}),
    });

    act(() => {
      result.current.itemRef.current = card;
    });

    act(() => {
      result.current.dragHandlers.onDragStart(buildDragEvent({ clientX: 47, clientY: 29 }));
    });

    const ghost = document.getElementById('active-drag-ghost');
    expect(ghost?.style.transformOrigin).toBe('12px 9px');
  });

  it('strips drag-interference classes from the cloned ghost node', () => {
    const { result } = renderHook(() =>
      useGhostDrag({ item: { id: 'folder-3' }, type: 'folder', onDragStart: vi.fn(), onDragEnd: vi.fn() })
    );

    const card = document.createElement('div');
    card.className = 'opacity-0 transition-all duration-300 scale-95 hover:scale-105 keep-me';
    card.getBoundingClientRect = () => ({
      top: 0,
      left: 0,
      width: 100,
      height: 40,
      right: 100,
      bottom: 40,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    act(() => {
      result.current.itemRef.current = card;
      result.current.dragHandlers.onDragStart(buildDragEvent({ clientX: 10, clientY: 10 }));
    });

    const ghost = document.getElementById('active-drag-ghost');
    expect(ghost?.classList.contains('opacity-0')).toBe(false);
    expect(ghost?.classList.contains('transition-all')).toBe(false);
    expect(ghost?.classList.contains('duration-300')).toBe(false);
    expect(ghost?.classList.contains('scale-95')).toBe(false);
    expect(ghost?.classList.contains('hover:scale-105')).toBe(false);
    expect(ghost?.classList.contains('keep-me')).toBe(true);
  });

  it('keeps expected fixed-position visual styles on created ghost', () => {
    const { result } = renderHook(() =>
      useGhostDrag({ item: { id: 'topic-2' }, type: 'topic', onDragStart: vi.fn(), onDragEnd: vi.fn() })
    );

    const card = document.createElement('div');
    card.getBoundingClientRect = () => ({
      top: 15,
      left: 25,
      width: 90,
      height: 45,
      right: 115,
      bottom: 60,
      x: 25,
      y: 15,
      toJSON: () => ({}),
    });

    act(() => {
      result.current.itemRef.current = card;
      result.current.dragHandlers.onDragStart(buildDragEvent({ clientX: 30, clientY: 25 }));
    });

    const ghost = document.getElementById('active-drag-ghost');
    expect(ghost?.style.position).toBe('fixed');
    expect(ghost?.style.pointerEvents).toBe('none');
    expect(ghost?.style.zIndex).toBe('2147483647');
    expect(ghost?.style.transform).toContain('scale(0.95)');
  });

  it('does not move ghost when horizontal pointer coordinate is zero', () => {
    const { result } = renderHook(() =>
      useGhostDrag({ item: { id: 'subject-2' }, type: 'subject', onDragStart: vi.fn(), onDragEnd: vi.fn() })
    );

    const card = document.createElement('div');
    card.getBoundingClientRect = () => ({
      top: 10,
      left: 10,
      width: 100,
      height: 50,
      right: 110,
      bottom: 60,
      x: 10,
      y: 10,
      toJSON: () => ({}),
    });

    act(() => {
      result.current.itemRef.current = card;
      result.current.dragHandlers.onDragStart(buildDragEvent({ clientX: 40, clientY: 30 }));
      result.current.dragHandlers.onDrag({ clientX: 80, clientY: 70 });
    });

    const ghost = document.getElementById('active-drag-ghost');
    const prevLeft = ghost?.style.left;
    const prevTop = ghost?.style.top;

    act(() => {
      result.current.dragHandlers.onDrag({ clientX: 0, clientY: 70 });
    });

    expect(ghost?.style.left).toBe(prevLeft);
    expect(ghost?.style.top).toBe(prevTop);
  });

  it('does not move ghost when vertical pointer coordinate is zero', () => {
    const { result } = renderHook(() =>
      useGhostDrag({ item: { id: 'subject-3' }, type: 'subject', onDragStart: vi.fn(), onDragEnd: vi.fn() })
    );

    const card = document.createElement('div');
    card.getBoundingClientRect = () => ({
      top: 12,
      left: 12,
      width: 100,
      height: 50,
      right: 112,
      bottom: 62,
      x: 12,
      y: 12,
      toJSON: () => ({}),
    });

    act(() => {
      result.current.itemRef.current = card;
      result.current.dragHandlers.onDragStart(buildDragEvent({ clientX: 52, clientY: 32 }));
      result.current.dragHandlers.onDrag({ clientX: 90, clientY: 80 });
    });

    const ghost = document.getElementById('active-drag-ghost');
    const prevLeft = ghost?.style.left;
    const prevTop = ghost?.style.top;

    act(() => {
      result.current.dragHandlers.onDrag({ clientX: 90, clientY: 0 });
    });

    expect(ghost?.style.left).toBe(prevLeft);
    expect(ghost?.style.top).toBe(prevTop);
  });

  it('keeps dragging state true after start when no onDragStart callback is provided', () => {
    const { result } = renderHook(() =>
      useGhostDrag({ item: { id: 'folder-4' }, type: 'folder', onDragEnd: vi.fn() })
    );

    const card = document.createElement('div');
    card.getBoundingClientRect = () => ({
      top: 5,
      left: 5,
      width: 60,
      height: 30,
      right: 65,
      bottom: 35,
      x: 5,
      y: 5,
      toJSON: () => ({}),
    });

    act(() => {
      result.current.itemRef.current = card;
      result.current.dragHandlers.onDragStart(buildDragEvent({ clientX: 15, clientY: 15 }));
    });

    expect(result.current.isDragging).toBe(true);
    expect(document.getElementById('active-drag-ghost')).toBeTruthy();
  });

  it('ends drag safely when no ghost exists and no onDragEnd callback is provided', () => {
    const { result } = renderHook(() =>
      useGhostDrag({ item: { id: 'topic-3' }, type: 'topic', onDragStart: vi.fn() })
    );

    act(() => {
      result.current.dragHandlers.onDragEnd({});
    });

    expect(document.getElementById('active-drag-ghost')).toBeNull();
    expect(result.current.isDragging).toBe(false);
  });

  it('invokes onDragStart callback with event, item, and type payload', () => {
    const onDragStart = vi.fn();
    const item = { id: 'subject-4', name: 'Historia' };
    const { result } = renderHook(() =>
      useGhostDrag({ item, type: 'subject', onDragStart, onDragEnd: vi.fn() })
    );

    const card = document.createElement('div');
    card.getBoundingClientRect = () => ({
      top: 0,
      left: 0,
      width: 70,
      height: 35,
      right: 70,
      bottom: 35,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const event = buildDragEvent({ clientX: 8, clientY: 8 });
    act(() => {
      result.current.itemRef.current = card;
      result.current.dragHandlers.onDragStart(event);
    });

    expect(onDragStart).toHaveBeenCalledWith(event, item, 'subject');
  });

  it('invokes onDragEnd callback with the same end event object', () => {
    const onDragEnd = vi.fn();
    const { result } = renderHook(() =>
      useGhostDrag({ item: { id: 'folder-5' }, type: 'folder', onDragStart: vi.fn(), onDragEnd })
    );

    const endEvent = { type: 'dragend', clientX: 0, clientY: 0 };
    act(() => {
      result.current.dragHandlers.onDragEnd(endEvent);
    });

    expect(onDragEnd).toHaveBeenCalledWith(endEvent);
  });
});
