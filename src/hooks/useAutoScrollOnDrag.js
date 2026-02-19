// useAutoScrollOnDrag.js
import { useEffect, useRef } from 'react';

/**
 * useAutoScrollOnDrag
 * Adds auto-scroll behavior to a scrollable container when dragging near top/bottom.
 * @param {Object} options
 * @param {boolean} options.isDragging - Whether a drag is in progress
 * @param {React.RefObject} options.containerRef - Ref to the scrollable container
 * @param {number} [options.edgeThreshold=60] - px from edge to trigger scroll
 * @param {number} [options.scrollSpeed=24] - px per interval
 */
export function useAutoScrollOnDrag({ isDragging, containerRef, edgeThreshold = 60, scrollSpeed = 24 }) {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isDragging || !containerRef.current) {
      clearInterval(intervalRef.current);
      return;
    }

    function onDragOver(e) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const y = e.clientY;
      let scrollDelta = 0;
      if (y - rect.top < edgeThreshold) {
        scrollDelta = -scrollSpeed;
      } else if (rect.bottom - y < edgeThreshold) {
        scrollDelta = scrollSpeed;
      }
      if (scrollDelta !== 0) {
        if (!intervalRef.current) {
          intervalRef.current = setInterval(() => {
            containerRef.current.scrollBy({ top: scrollDelta, behavior: 'auto' });
          }, 30);
        }
      } else {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    function onDragLeaveOrEnd() {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const node = containerRef.current;
    node.addEventListener('dragover', onDragOver);
    node.addEventListener('dragleave', onDragLeaveOrEnd);
    node.addEventListener('drop', onDragLeaveOrEnd);
    node.addEventListener('dragend', onDragLeaveOrEnd);
    return () => {
      node.removeEventListener('dragover', onDragOver);
      node.removeEventListener('dragleave', onDragLeaveOrEnd);
      node.removeEventListener('drop', onDragLeaveOrEnd);
      node.removeEventListener('dragend', onDragLeaveOrEnd);
      clearInterval(intervalRef.current);
    };
  }, [isDragging, containerRef, edgeThreshold, scrollSpeed]);
}
