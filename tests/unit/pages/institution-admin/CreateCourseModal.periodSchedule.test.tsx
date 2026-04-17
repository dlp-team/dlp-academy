// tests/unit/pages/institution-admin/CreateCourseModal.periodSchedule.test.jsx
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import CreateCourseModal from '../../../../src/pages/InstitutionAdminDashboard/modals/CreateCourseModal';

describe('CreateCourseModal period schedule payload', () => {
  it('includes normalized coursePeriodSchedule when period override is enabled', () => {
    const onSubmit = vi.fn();

    render(
      <CreateCourseModal
        onClose={() => {}}
        onSubmit={onSubmit}
        submitting={false}
        error=""
        periodConfig={{
          periodMode: 'trimester',
          customPeriodLabel: '',
          academicCalendar: {
            startDate: '2025-09-01',
            ordinaryEndDate: '2026-06-30',
            extraordinaryEndDate: '2026-07-15',
          },
        }}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('1'), { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText(/eso, bachillerato/i), { target: { value: 'ESO' } });

    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /crear curso/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];

    expect(payload).toMatchObject({
      name: '1º ESO',
      academicYear: '2025-2026',
      coursePeriodSchedule: {
        periodType: 'trimester',
      },
    });
    expect(Array.isArray(payload.coursePeriodSchedule.periods)).toBe(true);
    expect(payload.coursePeriodSchedule.periods).toHaveLength(3);
    expect(payload.coursePeriodSchedule.extraordinaryEndDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
