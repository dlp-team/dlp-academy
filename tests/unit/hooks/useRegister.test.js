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
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  deleteDoc: vi.fn(),
  setDoc: vi.fn(),
  doc: vi.fn((db, name, id) => ({ db, name, id })),
  serverTimestamp: vi.fn(() => 'mock-ts'),
  validateInstitutionalAccessCode: vi.fn(),
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
    getDoc: mocks.getDoc,
    getDocs: mocks.getDocs,
    deleteDoc: mocks.deleteDoc,
    setDoc: mocks.setDoc,
    doc: mocks.doc,
    serverTimestamp: mocks.serverTimestamp,
  };
});

vi.mock('../../../src/services/accessCodeService', () => ({
  validateInstitutionalAccessCode: mocks.validateInstitutionalAccessCode,
}));

describe('useRegister', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });
    mocks.getDocs.mockResolvedValue({ empty: true, docs: [] });
    mocks.deleteDoc.mockResolvedValue(undefined);
    mocks.updateProfile.mockResolvedValue(undefined);
    mocks.setDoc.mockResolvedValue(undefined);
    mocks.validateInstitutionalAccessCode.mockResolvedValue({ valid: false, institutionId: null, role: 'teacher' });
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

  it('registers teacher with institutional code using uppercase normalization', async () => {
    mocks.getDoc
      .mockResolvedValueOnce({ exists: () => false, data: () => ({}) })
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          type: 'institutional',
          institutionId: 'inst-1',
        }),
      });
    mocks.createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'u-teacher-1' },
    });

    const { result } = renderHook(() => useRegister());

    await act(async () => {
      result.current.handleChange({ target: { name: 'userType', value: 'teacher', type: 'text' } });
      result.current.handleChange({ target: { name: 'firstName', value: 'Laura', type: 'text' } });
      result.current.handleChange({ target: { name: 'lastName', value: 'Profe', type: 'text' } });
      result.current.handleChange({ target: { name: 'email', value: 'laura@test.com', type: 'text' } });
      result.current.handleChange({ target: { name: 'country', value: 'es', type: 'text' } });
      result.current.handleChange({ target: { name: 'verificationCode', value: 'ab12cd', type: 'text' } });
      result.current.handleChange({ target: { name: 'password', value: 'Password123!', type: 'text' } });
      result.current.handleChange({ target: { name: 'confirmPassword', value: 'Password123!', type: 'text' } });
    });

    await act(async () => {
      await result.current.registerUser({ preventDefault: () => {} });
    });

    expect(mocks.doc).toHaveBeenCalledWith(expect.anything(), 'institution_invites', 'ab12cd');
    expect(mocks.doc).toHaveBeenCalledWith(expect.anything(), 'institution_invites', 'AB12CD');
    expect(mocks.createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(mocks.setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ role: 'teacher', institutionId: 'inst-1' })
    );
    expect(mocks.navigate).toHaveBeenCalledWith('/home');
  });

  it('keeps direct invite document ID case for lookup and deletion', async () => {
    mocks.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        type: 'direct',
        role: 'teacher',
        email: 'code@test.com',
        institutionId: 'inst-direct-1',
      }),
    });
    mocks.createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'u-direct-1' },
    });

    const { result } = renderHook(() => useRegister());

    await act(async () => {
      result.current.handleChange({ target: { name: 'userType', value: 'teacher', type: 'text' } });
      result.current.handleChange({ target: { name: 'firstName', value: 'Ana', type: 'text' } });
      result.current.handleChange({ target: { name: 'lastName', value: 'Invite', type: 'text' } });
      result.current.handleChange({ target: { name: 'email', value: 'code@test.com', type: 'text' } });
      result.current.handleChange({ target: { name: 'country', value: 'es', type: 'text' } });
      result.current.handleChange({ target: { name: 'verificationCode', value: 'aBcDeF12', type: 'text' } });
      result.current.handleChange({ target: { name: 'password', value: 'Password123!', type: 'text' } });
      result.current.handleChange({ target: { name: 'confirmPassword', value: 'Password123!', type: 'text' } });
    });

    await act(async () => {
      await result.current.registerUser({ preventDefault: () => {} });
    });

    expect(mocks.doc).toHaveBeenCalledWith(expect.anything(), 'institution_invites', 'aBcDeF12');
    expect(mocks.deleteDoc).toHaveBeenCalledTimes(1);
    expect(mocks.validateInstitutionalAccessCode).not.toHaveBeenCalled();
  });

  it('registers teacher by validating dynamic institutional code via callable when invite doc does not exist', async () => {
    mocks.getDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });
    mocks.validateInstitutionalAccessCode.mockResolvedValue({
      valid: true,
      institutionId: 'inst-dynamic-1',
      role: 'teacher',
    });
    mocks.createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'u-teacher-dynamic' },
    });

    const { result } = renderHook(() => useRegister());

    await act(async () => {
      result.current.handleChange({ target: { name: 'userType', value: 'teacher', type: 'text' } });
      result.current.handleChange({ target: { name: 'firstName', value: 'Mario', type: 'text' } });
      result.current.handleChange({ target: { name: 'lastName', value: 'Docente', type: 'text' } });
      result.current.handleChange({ target: { name: 'email', value: 'mario@escuela.com', type: 'text' } });
      result.current.handleChange({ target: { name: 'country', value: 'es', type: 'text' } });
      result.current.handleChange({ target: { name: 'verificationCode', value: 'zz99aa', type: 'text' } });
      result.current.handleChange({ target: { name: 'password', value: 'Password123!', type: 'text' } });
      result.current.handleChange({ target: { name: 'confirmPassword', value: 'Password123!', type: 'text' } });
    });

    await act(async () => {
      await result.current.registerUser({ preventDefault: () => {} });
    });

    expect(mocks.validateInstitutionalAccessCode).toHaveBeenCalledWith({
      verificationCode: 'ZZ99AA',
      email: 'mario@escuela.com',
      userType: 'teacher',
    });
    expect(mocks.setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ role: 'teacher', institutionId: 'inst-dynamic-1' })
    );
    expect(mocks.navigate).toHaveBeenCalledWith('/home');
  });

  it('registers student with institutional student code via callable when provided', async () => {
    mocks.getDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });
    mocks.validateInstitutionalAccessCode.mockResolvedValue({
      valid: true,
      institutionId: 'inst-student-1',
      role: 'student',
    });
    mocks.createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'u-student-dynamic' },
    });

    const { result } = renderHook(() => useRegister());

    await act(async () => {
      result.current.handleChange({ target: { name: 'userType', value: 'student', type: 'text' } });
      result.current.handleChange({ target: { name: 'firstName', value: 'Lucia', type: 'text' } });
      result.current.handleChange({ target: { name: 'lastName', value: 'Alumno', type: 'text' } });
      result.current.handleChange({ target: { name: 'email', value: 'lucia@colegio.com', type: 'text' } });
      result.current.handleChange({ target: { name: 'country', value: 'es', type: 'text' } });
      result.current.handleChange({ target: { name: 'verificationCode', value: 'st99aa', type: 'text' } });
      result.current.handleChange({ target: { name: 'password', value: 'Password123!', type: 'text' } });
      result.current.handleChange({ target: { name: 'confirmPassword', value: 'Password123!', type: 'text' } });
    });

    await act(async () => {
      await result.current.registerUser({ preventDefault: () => {} });
    });

    expect(mocks.validateInstitutionalAccessCode).toHaveBeenCalledWith({
      verificationCode: 'ST99AA',
      email: 'lucia@colegio.com',
      userType: 'student',
    });
    expect(mocks.setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ role: 'student', institutionId: 'inst-student-1' })
    );
    expect(mocks.navigate).toHaveBeenCalledWith('/home');
  });
});
