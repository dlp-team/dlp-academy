// src/components/ui/BaseModal.tsx
import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { backdropVariants, scaleVariants } from '../../utils/animationConfig';

type ModalCloseReason = 'backdrop';

type BaseModalProps = {
  isOpen: boolean;
  onClose?: () => void;
  onBeforeClose?: (reason: ModalCloseReason) => boolean;
  onBlockedCloseAttempt?: (reason: ModalCloseReason) => void;
  children: ReactNode;
  rootClassName?: string;
  rootStyle?: CSSProperties;
  backdropClassName?: string;
  contentWrapperClassName?: string;
  contentClassName?: string;
  contentWrapperStyle?: CSSProperties;
  contentStyle?: CSSProperties;
  closeOnBackdropClick?: boolean;
  stopContentClickPropagation?: boolean;
  backdropTestId?: string;
  wrapperTestId?: string;
  contentTestId?: string;
};

const BaseModal = ({
  isOpen,
  onClose,
  onBeforeClose,
  onBlockedCloseAttempt,
  children,
  rootClassName = 'fixed inset-0 z-50',
  rootStyle,
  backdropClassName = 'absolute inset-0 bg-black/50 dark:bg-black/70 transition-opacity',
  contentWrapperClassName = 'relative z-10 flex min-h-full items-center justify-center p-4',
  contentClassName = 'relative w-full max-w-md',
  contentWrapperStyle,
  contentStyle,
  closeOnBackdropClick = true,
  stopContentClickPropagation = true,
  backdropTestId = 'base-modal-backdrop',
  wrapperTestId = 'base-modal-wrapper',
  contentTestId = 'base-modal-content',
}: BaseModalProps) => {
  const handleBackdropClick = () => {
    if (!closeOnBackdropClick) {
      return;
    }

    const canClose = onBeforeClose ? onBeforeClose('backdrop') : true;
    if (!canClose) {
      onBlockedCloseAttempt?.('backdrop');
      return;
    }

    onClose?.();
  };

  const handleContentClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (stopContentClickPropagation) {
      event.stopPropagation();
    }
  };

  return (
    <AnimatePresence>
    {isOpen && (
    <motion.div
      className={rootClassName}
      style={rootStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        aria-hidden="true"
        className={backdropClassName}
        data-testid={backdropTestId}
        onClick={handleBackdropClick}
        variants={backdropVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      />
      <div className={contentWrapperClassName} data-testid={wrapperTestId} style={contentWrapperStyle}>
        <motion.div
          aria-modal="true"
          className={contentClassName}
          data-testid={contentTestId}
          role="dialog"
          style={contentStyle}
          onClick={handleContentClick}
          variants={scaleVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
    )}
    </AnimatePresence>
  );
};

export default BaseModal;
