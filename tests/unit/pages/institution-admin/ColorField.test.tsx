// tests/unit/pages/institution-admin/ColorField.test.jsx
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ColorField from '../../../../src/pages/InstitutionAdminDashboard/components/customization/ColorField';

describe('ColorField', () => {
  it('selects card token without opening native picker', () => {
    const onFocus = vi.fn();
    const onChange = vi.fn();
    const pickerClickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');

    render(
      <ColorField
        token="primary"
        label="Color Primario"
        description="Botones principales"
        icon={<span>P</span>}
        value="#6366f1"
        onChange={onChange}
        onFocus={onFocus}
        onBlur={() => {}}
        isActive={false}
      />
    );

    fireEvent.click(screen.getByTestId('color-field-primary'));

    expect(onFocus).toHaveBeenCalledWith('primary');
    expect(pickerClickSpy).not.toHaveBeenCalled();
  });

  it('opens native picker when swatch button is clicked', () => {
    const pickerClickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');

    render(
      <ColorField
        token="primary"
        label="Color Primario"
        description="Botones principales"
        icon={<span>P</span>}
        value="#6366f1"
        onChange={() => {}}
        onFocus={() => {}}
        onBlur={() => {}}
        isActive={false}
      />
    );

    fireEvent.click(screen.getByTestId('color-field-swatch-primary'));

    expect(pickerClickSpy).toHaveBeenCalled();
  });
});
