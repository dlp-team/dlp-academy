// tests/unit/pages/admin/RoleBadge.test.jsx
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoleBadge from '../../../../src/pages/AdminDashboard/components/RoleBadge';

describe('RoleBadge', () => {
  it('renders localized known role label', () => {
    render(<RoleBadge role="teacher" />);
    expect(screen.getByText('Profesor')).not.toBeNull();
  });

  it('falls back to raw role label when unknown', () => {
    render(<RoleBadge role="customrole" />);
    expect(screen.getByText('customrole')).not.toBeNull();
  });
});
