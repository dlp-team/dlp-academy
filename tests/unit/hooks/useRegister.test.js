import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRegister } from '../../../src/pages/Auth/hooks/useRegister';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  collection: vi.fn((db, name) => ({ db, name })),
  query: vi.fn((...args) => ({ args })),
  where: vi.fn((...args) => ({ args })),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  doc: vi.fn((db, name, id) => ({ db, name, id })),
  serverTimestamp: vi.fn(() => 'mock-ts'),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
  };
});

vi.mock('../../../src/firebase/config', () => ({
  auth: { __type: 'auth' },
  db: { __type: 'db' },
}));

vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth');
  return {
    ...actual,
    createUserWithEmailAndPassword: mocks.createUserWithEmailAndPassword,
    updateProfile: mocks.updateProfile,
  };
});

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: mocks.collection,
    query: mocks.query,
    where: mocks.where,
    getDocs: mocks.getDocs,
    setDoc: mocks.setDoc,
    doc: mocks.doc,
    serverTimestamp: mocks.serverTimestamp,
  };
});

describe('useRegister', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDocs.mockResolvedValue({ empty: true, docs: [] });
    mocks.updateProfile.mockResolvedValue(undefined);
    mocks.setDoc.mockResolvedValue(undefined);
  });

  it('returns mismatch error when passwords are different', async () => {
    const { result } = renderHook(() => useRegister());

    await act(async () => {
      result.current.handleChange({ target: { name: 'firstName', value: 'Ana', type: 'text' } });
      result.current.handleChange({ target: { name: 'lastName', value: 'Test', type: 'text' } });
      result.current.handleChange({ target: { name: 'email', value: 'ana@test.com', type: 'text' } });
      result.current.handleChange({ target: { name: 'country', value: 'es', type: 'text' } });
      result.current.handleChange({ target: { name: 'password', value: 'Password123!', type: 'text' } });
      result.current.handleChange({ target: { name: 'confirmPassword', value: 'Password1234!', type: 'text' } });
    });

    await act(async () => {
      await result.current.registerUser({ preventDefault: () => {} });
    });

    expect(result.current.error).toBe('Las contraseñas no coinciden');
    expect(mocks.createUserWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it('registers successfully and navigates to home', async () => {
    mocks.createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'u-2' },
    });

    const { result } = renderHook(() => useRegister());

    await act(async () => {
      result.current.handleChange({ target: { name: 'firstName', value: 'Ana', type: 'text' } });
      result.current.handleChange({ target: { name: 'lastName', value: 'Test', type: 'text' } });
      result.current.handleChange({ target: { name: 'email', value: 'ana@test.com', type: 'text' } });
      result.current.handleChange({ target: { name: 'country', value: 'es', type: 'text' } });
      result.current.handleChange({ target: { name: 'password', value: 'Password123!', type: 'text' } });
      result.current.handleChange({ target: { name: 'confirmPassword', value: 'Password123!', type: 'text' } });
    });

    await act(async () => {
      await result.current.registerUser({ preventDefault: () => {} });
    });

    expect(mocks.createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(mocks.updateProfile).toHaveBeenCalledTimes(1);
    expect(mocks.setDoc).toHaveBeenCalledTimes(1);
    expect(mocks.navigate).toHaveBeenCalledWith('/home');
  });
});
