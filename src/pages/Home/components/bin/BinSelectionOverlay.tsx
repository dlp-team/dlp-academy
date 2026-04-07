// src/pages/Home/components/bin/BinSelectionOverlay.jsx
import React, { useEffect, useLayoutEffect, useState } from 'react';
import BinSelectionPanel from './BinSelectionPanel';

const PANEL_WIDTH = 360;  // must match w-[360px] in BinSelectionPanel
const GAP        = 12;    // px gap between card and panel
const FOCUS_TRANSITION_MS = 200;

/**
 * Full-screen dimmed backdrop.
 *
 * The selected card is re-rendered at its exact screen coordinates above the
 * dim (fixed, z-50). The info panel is placed immediately flush next to the
 * card (right or left depending on available space), top-aligned, clamped so
 * it never overflows the viewport.
 *
 * The original card in the grid is still rendered but sits behind the backdrop
 * (z-index < 40). We read its position via selectedCardRef.getBoundingClientRect().
 */
const BinSelectionOverlay = ({
    item,
    itemType = 'subject',
    selectedCardRef,
    actionLoading,
    onClose,
    onShowDescription,
    onRestore,
    onDeleteConfirm,
    children,           
}: any) => {
    const [rect, setRect] = useState<any>(null);
    const [panelTop, setPanelTop] = useState(0);
    const [panelLeft, setPanelLeft] = useState(0);
    const [isCardFocused, setIsCardFocused] = useState(false);
    const [showPanel, setShowPanel] = useState(false);

    useEffect(() => {
        setIsCardFocused(false);
        setShowPanel(false);

        const rafId = window.requestAnimationFrame(() => {
            setIsCardFocused(true);
        });

        const panelTimer = window.setTimeout(() => {
            setShowPanel(true);
        }, FOCUS_TRANSITION_MS);

        return () => {
            window.cancelAnimationFrame(rafId);
            window.clearTimeout(panelTimer);
        };
    }, [item?.id, itemType]);

    useLayoutEffect(() => {
        if (!selectedCardRef?.current) return;

        const measure = () => {
            const r = selectedCardRef.current?.getBoundingClientRect();
            if (!r) return;
            setRect({ top: r.top, left: r.left, width: r.width, height: r.height });

            const spaceRight = window.innerWidth - r.right;
            const spaceLeft = r.left;

            let pLeft = 0;
            let pTop = r.top;

            if (spaceRight >= PANEL_WIDTH + GAP) {
                pLeft = r.right + GAP; 
            } else if (spaceLeft >= PANEL_WIDTH + GAP) {
                pLeft = r.left - PANEL_WIDTH - GAP;
            } else {
                pLeft = Math.max(16, (window.innerWidth - PANEL_WIDTH) / 2);
                pTop = r.bottom + GAP;
            }

            const maxTop = window.innerHeight - 320; 
            if (pTop > maxTop) pTop = maxTop;
            if (pTop < 16) pTop = 16;

            setPanelTop(pTop);
            setPanelLeft(pLeft);
        };

        measure();
        window.addEventListener('resize', measure);
        window.addEventListener('scroll', measure, true);
        
        return () => {
            window.removeEventListener('resize', measure);
            window.removeEventListener('scroll', measure, true);
        };
    }, [selectedCardRef, item?.id, itemType]);

    if (!rect) return null;

    return (
        <>
            {/* ── Fondo oscuro (Backdrop) ── */}
            <div
                data-testid="bin-selection-overlay-backdrop"
                className="fixed inset-0 z-40 bg-slate-900/45 dark:bg-slate-950/70 transition-opacity"
                onClick={onClose}
            />

            {/* ── Tarjeta seleccionada sobre el fondo ── */}
            <div
                data-testid="bin-selection-overlay-card"
                className={`fixed z-50 transform-gpu transition-transform duration-200 ease-out ${
                    isCardFocused ? 'scale-[1.02]' : 'scale-[0.985]'
                }`}
                style={{
                    top:    rect.top,
                    left:   rect.left,
                    width:  rect.width,
                    height: rect.height,
                    transformOrigin: 'center center',
                }}
            >
                <div className="relative w-full h-full">
                    {children}
                </div>
            </div>

            {/* ── Panel de opciones al lado ── */}
            {showPanel && (
                <div
                    data-testid="bin-selection-overlay-panel"
                    className="fixed z-50 animate-in fade-in slide-in-from-right-1 zoom-in-95 duration-200"
                    style={{ top: panelTop, left: panelLeft }}
                >
                    <BinSelectionPanel
                        item={item}
                        itemType={itemType}
                        actionLoading={actionLoading}
                        onClose={onClose}
                        onShowDescription={onShowDescription}
                        onRestore={onRestore}
                        onDeleteConfirm={onDeleteConfirm}
                    />
                </div>
            )}
        </>
    );
};

export default BinSelectionOverlay;