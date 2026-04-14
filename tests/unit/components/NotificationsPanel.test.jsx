// tests/unit/components/NotificationsPanel.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import NotificationsPanel from '../../../src/components/ui/NotificationsPanel';

const renderPanel = (overrides = {}) => {
  const defaultProps = {
    notifications: [],
    onMarkAsRead: vi.fn(),
    onMarkAllAsRead: vi.fn(),
    onOpenAll: vi.fn(),
    onResolveMoveRequest: vi.fn().mockResolvedValue(undefined),
    isResolvingMoveRequest: vi.fn(() => false),
    onClose: vi.fn(),
  };

  const props = {
    ...defaultProps,
    ...overrides,
  };

  const rendered = render(<NotificationsPanel {...props} />);
  return { ...rendered, props };
};

describe('NotificationsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows empty state when there are no notifications', () => {
    renderPanel();
    expect(screen.getByText(/sin notificaciones/i)).toBeTruthy();
  });

  it('marks as read and opens full history when clicking a notification', () => {
    const { props } = renderPanel({
      notifications: [
        {
          id: 'notif-subject-1',
          read: false,
          title: 'Nueva actividad',
          message: 'Hay contenido nuevo',
          subjectId: 'subject-1',
          createdAt: new Date(),
        },
      ],
    });

    fireEvent.click(screen.getByRole('button', { name: /nueva actividad/i }));

    expect(props.onMarkAsRead).toHaveBeenCalledWith('notif-subject-1');
    expect(props.onOpenAll).toHaveBeenCalledWith(expect.objectContaining({ id: 'notif-subject-1' }));
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenAll when the full-history action is clicked', () => {
    const { props } = renderPanel();

    fireEvent.click(screen.getByRole('button', { name: /ver todas/i }));

    expect(props.onOpenAll).toHaveBeenCalledTimes(1);
  });

  it('ignores outside-close handler when mousedown happens on trigger boundary', () => {
    const triggerElement = document.createElement('div');
    document.body.appendChild(triggerElement);

    const triggerRef = { current: triggerElement };
    const { props } = renderPanel({ triggerRef });

    fireEvent.mouseDown(triggerElement);
    expect(props.onClose).toHaveBeenCalledTimes(0);

    fireEvent.mouseDown(document.body);
    expect(props.onClose).toHaveBeenCalledTimes(1);

    triggerElement.remove();
  });

  it('renders approve/reject actions for pending shortcut move requests', async () => {
    const { props } = renderPanel({
      notifications: [
        {
          id: 'notif-move-1',
          read: false,
          title: 'Solicitud pendiente',
          message: 'Un usuario solicita mover un elemento.',
          type: 'shortcut_move_request',
          shortcutMoveRequestStatus: 'pending',
          shortcutMoveRequestId: 'move-request-1',
          createdAt: new Date(),
        },
      ],
    });

    const approveActionButton = screen.getByText('Aprobar').closest('button');
    const rejectActionButton = screen.getByText('Rechazar').closest('button');

    expect(approveActionButton).toBeTruthy();
    expect(rejectActionButton).toBeTruthy();

    fireEvent.click(approveActionButton);

    await waitFor(() => {
      expect(props.onResolveMoveRequest).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'notif-move-1' }),
        'approved'
      );
    });

    fireEvent.click(rejectActionButton);

    await waitFor(() => {
      expect(props.onResolveMoveRequest).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'notif-move-1' }),
        'rejected'
      );
    });
  });
});
