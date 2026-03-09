// tests/unit/pages/content/StudyGuide.fallback.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StudyGuide from '../../../../src/pages/Content/StudyGuide';

const routeMocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  params: { subjectId: 'subject-1', topicId: 'topic-1', fileId: 'guide-1' },
}));

const firestoreMocks = vi.hoisted(() => ({
  getDoc: vi.fn(),
  doc: vi.fn((_db, collectionName, id) => ({ collectionName, id })),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => routeMocks.navigate,
    useParams: () => routeMocks.params,
  };
});

vi.mock('../../../../src/hooks/useDarkMode', () => ({
  useDarkMode: () => ({ isDark: false, toggleDarkMode: vi.fn() }),
}));

vi.mock('../../../../src/firebase/config', () => ({
  db: { __db: true },
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    doc: (...args) => firestoreMocks.doc(...args),
    getDoc: (...args) => firestoreMocks.getDoc(...args),
  };
});

describe('StudyGuide fallback and partial states', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    class MockIntersectionObserver {
      observe() {}
      disconnect() {}
      unobserve() {}
    }

    window.IntersectionObserver = MockIntersectionObserver;
    window.scrollTo = vi.fn();
  });

  it('shows controlled fallback when guide document is missing', async () => {
    firestoreMocks.getDoc.mockImplementation(async (ref) => {
      if (ref.collectionName === 'subjects') {
        return { exists: () => false, data: () => ({}) };
      }

      return { exists: () => false, data: () => ({}) };
    });

    render(<StudyGuide />);

    await waitFor(() => {
      expect(screen.getByText(/contenido no disponible/i)).toBeTruthy();
      expect(screen.getByRole('button', { name: /volver atrás/i })).toBeTruthy();
    });
  });

  it('renders partial guide data with empty sections without crashing', async () => {
    firestoreMocks.getDoc.mockImplementation(async (ref) => {
      if (ref.collectionName === 'subjects') {
        return {
          exists: () => true,
          data: () => ({ color: 'from-blue-500 to-cyan-600' }),
        };
      }

      if (ref.collectionName === 'resumen') {
        return {
          exists: () => true,
          data: () => ({ title: '', subtitle: '', studyGuide: [] }),
        };
      }

      return { exists: () => false, data: () => ({}) };
    });

    render(<StudyGuide />);

    await waitFor(() => {
      expect(screen.getByText(/guía de estudio premium/i)).toBeTruthy();
      expect(screen.getByText(/0 capítulos disponibles/i)).toBeTruthy();
    });
  });
});
