// tests/unit/components/CommunicationItemCard.test.jsx
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MessageCircle } from 'lucide-react';
import CommunicationItemCard from '../../../src/components/ui/CommunicationItemCard';

describe('CommunicationItemCard', () => {
  it('renders actor metadata when provided', () => {
    render(
      <CommunicationItemCard
        title="Conversación activa"
        message="Nuevo mensaje"
        timestampLabel="hace 1m"
        icon={MessageCircle}
        iconContainerClass="bg-sky-100 text-sky-700"
        actor={{
          name: 'Profesor Martín',
          label: 'Conversación con',
          photoURL: 'https://example.com/profile.jpg',
        }}
      />
    );

    expect(screen.getByText('Conversación activa')).toBeTruthy();
    expect(screen.getByText(/Conversación con: Profesor Martín/i)).toBeTruthy();
  });

  it('supports activation callback', () => {
    const onActivate = vi.fn();

    render(
      <CommunicationItemCard
        title="Abrir chat"
        message="Mensaje pendiente"
        icon={MessageCircle}
        iconContainerClass="bg-sky-100 text-sky-700"
        onActivate={onActivate}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /abrir chat/i }));
    expect(onActivate).toHaveBeenCalledTimes(1);
  });
});
