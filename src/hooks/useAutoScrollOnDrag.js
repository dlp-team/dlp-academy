import { useEffect, useRef } from 'react';

const getWindowScrollMax = () => {
    const doc = document.documentElement;
    return Math.max(0, doc.scrollHeight - window.innerHeight);
};

const getBounds = (boundsTarget) => {
    if (boundsTarget) {
        return boundsTarget.getBoundingClientRect();
    }
    return { top: 0, bottom: window.innerHeight };
};

const useAutoScrollOnDrag = ({
    containerRef,
    enabled = true,
    edgeThreshold = 80,
    maxSpeed = 18,
    scrollContainer = 'element'
} = {}) => {
    const rafRef = useRef(null);
    const lastYRef = useRef(null);
    const isDragActiveRef = useRef(false);

    useEffect(() => {
        if (!enabled) return;

        const onDragStart = () => {
            isDragActiveRef.current = true;
        };

        const onDragEnd = () => {
            isDragActiveRef.current = false;
            lastYRef.current = null;
        };

        const onDragOver = (event) => {
            if (!isDragActiveRef.current) return;
            lastYRef.current = event.clientY;
        };

        const tick = () => {
            if (isDragActiveRef.current && lastYRef.current !== null) {
                const boundsTarget = containerRef?.current || null;
                const { top, bottom } = getBounds(boundsTarget);
                const topEdge = top + edgeThreshold;
                const bottomEdge = bottom - edgeThreshold;

                let speed = 0;
                if (lastYRef.current < topEdge) {
                    const intensity = (topEdge - lastYRef.current) / edgeThreshold;
                    speed = -maxSpeed * Math.min(1, intensity);
                } else if (lastYRef.current > bottomEdge) {
                    const intensity = (lastYRef.current - bottomEdge) / edgeThreshold;
                    speed = maxSpeed * Math.min(1, intensity);
                }

                if (speed !== 0) {
                    if (scrollContainer === 'window') {
                        const maxScrollTop = getWindowScrollMax();
                        const nextTop = window.scrollY + speed;
                        if (nextTop >= 0 && nextTop <= maxScrollTop) {
                            window.scrollBy({ top: speed, left: 0 });
                        }
                    } else if (containerRef?.current) {
                        const el = containerRef.current;
                        const maxScrollTop = Math.max(0, el.scrollHeight - el.clientHeight);
                        const nextTop = el.scrollTop + speed;
                        if (nextTop >= 0 && nextTop <= maxScrollTop) {
                            el.scrollTop = nextTop;
                        }
                    }
                }
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);

        window.addEventListener('dragstart', onDragStart);
        window.addEventListener('dragend', onDragEnd);
        window.addEventListener('drop', onDragEnd);
        window.addEventListener('dragover', onDragOver);

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
            window.removeEventListener('dragstart', onDragStart);
            window.removeEventListener('dragend', onDragEnd);
            window.removeEventListener('drop', onDragEnd);
            window.removeEventListener('dragover', onDragOver);
        };
    }, [containerRef, edgeThreshold, enabled, maxSpeed, scrollContainer]);
};

export default useAutoScrollOnDrag;
