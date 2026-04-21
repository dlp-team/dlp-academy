// src/hooks/useRubberBandSelection.tsx
import React, { useState, useRef, useEffect } from 'react';

export interface RubberBandRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface UseRubberBandSelectionParams {
  /** CSS selector for selectable items within the container */
  itemSelector: string;
  /** Attribute on each item that holds the selection key */
  keyAttribute?: string;
  /** When false the hook is fully disabled (e.g. on mobile or specific views) */
  enabled?: boolean;
  /** Callback with the set of keys inside the rubber band rectangle */
  onSelectionChange: (keys: Set<string>, isAdditive: boolean) => void;
  /** Called as soon as the drag gesture is confirmed (MIN_DRAG exceeded) */
  onDragStart?: (isAdditive: boolean) => void;
}

/**
 * Hook that provides rubber-band (lasso) drag selection.
 *
 * Uses document-level listeners so dragging anywhere on the screen works,
 * including areas outside the grid container (sidebars, gutters, etc.).
 * The overlay uses `position: fixed` so it renders across the full viewport.
 *
 * Activates only when the pointer goes down on empty space (not on cards,
 * buttons, links, or other interactive elements), so it does NOT conflict
 * with card drag-and-drop even when `enabled` is always true.
 *
 * Usage:
 * 1. Attach `containerRef` to the element that contains the selectable items.
 * 2. Render `<RubberBandOverlay rect={rect} />` anywhere in the tree.
 * 3. Optionally pass `onDragStart` to auto-enter a selection mode.
 */
export const useRubberBandSelection = ({
  itemSelector,
  keyAttribute = 'data-selection-key',
  enabled = true,
  onSelectionChange,
  onDragStart,
}: UseRubberBandSelectionParams) => {
  // Used only to scope the item query — does NOT receive mouse events.
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [rect, setRect] = useState<RubberBandRect | null>(null);

  // Stable refs so the effect closure always sees current values.
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const isSelectingRef = useRef(false);
  const isAdditiveRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const onDragStartRef = useRef(onDragStart);
  useEffect(() => { onSelectionChangeRef.current = onSelectionChange; }, [onSelectionChange]);
  useEffect(() => { onDragStartRef.current = onDragStart; }, [onDragStart]);

  const MIN_DRAG_DISTANCE = 5;

  useEffect(() => {
    if (!enabled) {
      // Clean up any in-progress drag when disabled.
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startPointRef.current = null;
      isSelectingRef.current = false;
      setIsSelecting(false);
      setRect(null);
      return;
    }

    const getIntersectingKeys = (bandRect: RubberBandRect): Set<string> => {
      const container = containerRef.current;
      if (!container) return new Set();
      const keys = new Set<string>();
      const items = container.querySelectorAll(itemSelector);
      items.forEach((item) => {
        const key = item.getAttribute(keyAttribute);
        if (!key) return;
        // getBoundingClientRect() returns viewport-relative coords — same
        // coordinate space as our bandRect when the overlay is position:fixed.
        const b = item.getBoundingClientRect();
        const intersects =
          bandRect.left < b.right &&
          bandRect.left + bandRect.width > b.left &&
          bandRect.top < b.bottom &&
          bandRect.top + bandRect.height > b.top;
        if (intersects) keys.add(key);
      });
      return keys;
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      // Skip interactive elements and card items — let them handle their own events.
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('textarea') ||
        target.closest('[data-selection-key]') ||
        target.closest('[data-no-rubberband]')
      ) return;
      startPointRef.current = { x: e.clientX, y: e.clientY };
      // Capture additive intent (Ctrl or Meta key) at drag start.
      isAdditiveRef.current = e.ctrlKey || e.metaKey;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!startPointRef.current) return;
      const start = startPointRef.current;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < MIN_DRAG_DISTANCE && !isSelectingRef.current) return;

      if (!isSelectingRef.current) {
        isSelectingRef.current = true;
        setIsSelecting(true);
        onDragStartRef.current?.(isAdditiveRef.current);
      }

      // Prevent text selection while dragging the rubber band.
      e.preventDefault();

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        // All coordinates are viewport-relative (clientX/Y) — matches
        // position:fixed overlay and getBoundingClientRect() on items.
        const bandRect: RubberBandRect = {
          left: Math.min(start.x, e.clientX),
          top: Math.min(start.y, e.clientY),
          width: Math.abs(e.clientX - start.x),
          height: Math.abs(e.clientY - start.y),
        };
        setRect(bandRect);
        onSelectionChangeRef.current(getIntersectingKeys(bandRect), isAdditiveRef.current);
      });
    };

    const onMouseUp = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startPointRef.current = null;
      isSelectingRef.current = false;
      isAdditiveRef.current = false;
      setIsSelecting(false);
      setRect(null);
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  // Re-register listeners only when selector or enabled flag changes.
  // Callbacks are accessed via stable refs above.
  }, [enabled, itemSelector, keyAttribute]);

  return {
    containerRef,
    isSelecting,
    rect,
  };
};

/**
 * Visual rubber band overlay component.
 * Uses position:fixed so it renders across the entire viewport,
 * independent of scroll position or the containing element's layout.
 * Render it anywhere in the component tree (e.g., at the root).
 */
export const RubberBandOverlay: React.FC<{ rect: RubberBandRect | null }> = ({ rect }) => {
  if (!rect || rect.width < 2 || rect.height < 2) return null;

  return (
    <div
      className="fixed border-2 border-indigo-400 bg-indigo-400/10 rounded-sm pointer-events-none z-[9999]"
      style={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      }}
    />
  );
};
