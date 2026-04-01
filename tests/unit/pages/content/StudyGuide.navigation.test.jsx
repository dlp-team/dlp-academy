// tests/unit/pages/content/StudyGuide.navigation.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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

const studyGuideFixture = [
  {
    title: 'Seccion 1',
    content: 'Contenido de la seccion 1',
    formulas: ['x + y = z'],
  },
  {
    title: 'Segunda Seccion',
    content: 'Contenido de la seccion 2',
    formulas: ['a^2 + b^2 = c^2'],
  },
];

describe('StudyGuide navegacion de pagina', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    class MockIntersectionObserver {
      observe() {}
      disconnect() {}
      unobserve() {}
    }

    window.IntersectionObserver = MockIntersectionObserver;
    window.scrollTo = vi.fn();

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
          data: () => ({
            title: 'Guía de Navegación',
            subtitle: 'Prueba de navegación',
            studyGuide: studyGuideFixture,
          }),
        };
      }

      return { exists: () => false, data: () => ({}) };
    });
  });

  it('permite navegar a una seccion desde la tabla de contenidos', async () => {
    render(
      <MemoryRouter>
        <StudyGuide />
      </MemoryRouter>
    );

    await screen.findAllByText('Guía de Navegación');

    const tocLabel = screen.getAllByText('Navegación Premium')[0];
    fireEvent.click(tocLabel.closest('button'));

    const secondSectionEntry = screen.getAllByText('Segunda Seccion')[0];
    fireEvent.click(secondSectionEntry.closest('button'));

    await waitFor(() => {
      expect(window.scrollTo).toHaveBeenCalled();
    });
  });

  it('avanza de seccion con flecha derecha en navegacion por teclado', async () => {
    render(
      <MemoryRouter>
        <StudyGuide />
      </MemoryRouter>
    );

    await screen.findAllByText('Guía de Navegación');

    fireEvent.keyDown(window, { key: 'ArrowRight' });

    await waitFor(() => {
      expect(window.scrollTo).toHaveBeenCalled();
    });
  });
});
