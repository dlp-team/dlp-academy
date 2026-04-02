// tests/unit/components/NotificationsPanel.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import NotificationsPanel from '../../../src/components/ui/NotificationsPanel';

const routerMocks = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => routerMocks.navigate,
  };
});

const renderPanel = (overrides = {}) => {
  const defaultProps = {
    notifications: [],
    onMarkAsRead: vi.fn(),
    onMarkAllAsRead: vi.fn(),
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

  it('marks as read and navigates when clicking a subject notification', () => {
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
    expect(routerMocks.navigate).toHaveBeenCalledWith('/subject/subject-1');
    expect(props.onClose).toHaveBeenCalledTimes(1);
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
