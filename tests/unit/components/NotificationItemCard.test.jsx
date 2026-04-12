// tests/unit/components/NotificationItemCard.test.jsx
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import NotificationItemCard from '../../../src/components/ui/NotificationItemCard';

describe('NotificationItemCard', () => {
  it('renders shared-subject actor identity', () => {
    render(
      <NotificationItemCard
        notification={{
          id: 'notif-shared-1',
          type: 'subject_shared',
          title: 'Asignatura compartida',
          message: 'Te compartieron una asignatura.',
          sharedByDisplayName: 'Ana García',
          sharedByPhotoURL: 'https://example.com/ana.jpg',
          createdAt: new Date(),
          read: false,
        }}
        onActivate={vi.fn()}
      />
    );

    expect(screen.getByText('Asignatura compartida')).toBeTruthy();
    expect(screen.getByText(/Compartido por: Ana García/i)).toBeTruthy();
  });

  it('activates notification on card click', () => {
    const onActivate = vi.fn();
    render(
      <NotificationItemCard
        notification={{
          id: 'notif-1',
          title: 'Nueva actividad',
          message: 'Hay contenido nuevo.',
          createdAt: new Date(),
          read: false,
        }}
        onActivate={onActivate}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /nueva actividad/i }));
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('triggers move request resolution actions', async () => {
    const onResolveMoveRequest = vi.fn().mockResolvedValue(undefined);

    render(
      <NotificationItemCard
        notification={{
          id: 'notif-move-1',
          title: 'Solicitud pendiente',
          message: 'Mover acceso directo.',
          type: 'shortcut_move_request',
          shortcutMoveRequestStatus: 'pending',
          shortcutMoveRequestId: 'move-request-1',
          createdAt: new Date(),
          read: false,
        }}
        onActivate={vi.fn()}
        onResolveMoveRequest={onResolveMoveRequest}
        isResolvingMoveRequest={() => false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Aprobar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Rechazar' }));

    await waitFor(() => {
      expect(onResolveMoveRequest).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'notif-move-1' }),
        'approved'
      );
      expect(onResolveMoveRequest).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'notif-move-1' }),
        'rejected'
      );
    });
  });
});
