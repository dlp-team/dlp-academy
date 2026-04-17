import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLogin } from '../../../src/pages/Auth/hooks/useLogin';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  setPersistence: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  collection: vi.fn((db, name) => ({ db, name })),
  query: vi.fn((...args) => ({ args })),
  where: vi.fn((...args) => ({ args })),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
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
  provider: { __type: 'provider' },
}));

vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth');
  return {
    ...actual,
    signInWithEmailAndPassword: mocks.signInWithEmailAndPassword,
    signInWithPopup: mocks.signInWithPopup,
    setPersistence: mocks.setPersistence,
    sendPasswordResetEmail: mocks.sendPasswordResetEmail,
    browserLocalPersistence: 'local',
    browserSessionPersistence: 'session',
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
    getDoc: mocks.getDoc,
    setDoc: mocks.setDoc,
    doc: mocks.doc,
    serverTimestamp: mocks.serverTimestamp,
  };
});

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDocs.mockResolvedValue({ empty: true, docs: [] });
    mocks.getDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });
    mocks.setPersistence.mockResolvedValue(undefined);
  });

  it('logs in and navigates to home', async () => {
    mocks.signInWithEmailAndPassword.mockResolvedValue({
      user: {
        uid: 'u-1',
        email: 'user@test.com',
        displayName: 'User Test',
        photoURL: null,
      },
    });

    const { result } = renderHook(() => useLogin());

    await act(async () => {
      result.current.handleChange({ target: { name: 'email', value: 'user@test.com', type: 'text' } });
      result.current.handleChange({ target: { name: 'password', value: 'Password123!', type: 'text' } });
      await result.current.handleLogin({ preventDefault: () => {} });
    });

    expect(mocks.signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(mocks.navigate).toHaveBeenCalledWith('/home');
    expect(result.current.error).toBe('');
  });

  it('sets invalid credentials error on login failure', async () => {
    mocks.signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/invalid-credential' });

    const { result } = renderHook(() => useLogin());

    await act(async () => {
      result.current.handleChange({ target: { name: 'email', value: 'bad@test.com', type: 'text' } });
      result.current.handleChange({ target: { name: 'password', value: 'wrong', type: 'text' } });
      await result.current.handleLogin({ preventDefault: () => {} });
    });

    expect(result.current.error).toBe('Correo o contraseña incorrectos.');
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});
