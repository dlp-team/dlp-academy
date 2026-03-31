// src/pages/InstitutionAdminDashboard/hooks/useClassesCourses.js
// ─────────────────────────────────────────────────────────────────────────────
// All Firestore reads/writes for the Cursos & Clases section.
// Components stay pure – they only call functions from this hook.

import { useCallback, useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../../firebase/config';

export const useClassesCourses = (user, institutionIdOverride = null) => {
  const effectiveInstitutionId = institutionIdOverride || user?.institutionId || null;
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!effectiveInstitutionId) return;
    setLoading(true);
    try {
      const [cSnap, clSnap] = await Promise.all([
        getDocs(query(collection(db, 'courses'), where('institutionId', '==', effectiveInstitutionId))),
        getDocs(query(collection(db, 'classes'), where('institutionId', '==', effectiveInstitutionId))),
      ]);
      setCourses(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setClasses(clSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error('useClassesCourses fetchAll:', e);
    } finally {
      setLoading(false);
    }
  }, [effectiveInstitutionId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Course CRUD ───────────────────────────────────────────────────────────
  const createCourse = async (form) => {
    await addDoc(collection(db, 'courses'), {
      ...form,
      institutionId: effectiveInstitutionId,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    });
    await fetchAll();
  };

  const updateCourse = async (id, patch) => {
    await updateDoc(doc(db, 'courses', id), { ...patch, updatedAt: serverTimestamp() });
    await fetchAll();
  };

  const deleteCourse = async (id) => {
    await deleteDoc(doc(db, 'courses', id));
    await fetchAll();
  };

  // ── Class CRUD ────────────────────────────────────────────────────────────
  const createClass = async (form) => {
    await addDoc(collection(db, 'classes'), {
      ...form,
      institutionId: effectiveInstitutionId,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    });
    await fetchAll();
  };

  const updateClass = async (id, patch) => {
    await updateDoc(doc(db, 'classes', id), { ...patch, updatedAt: serverTimestamp() });
    await fetchAll();
  };

  const deleteClass = async (id) => {
    await deleteDoc(doc(db, 'classes', id));
    await fetchAll();
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getCourseById  = (id) => courses.find(c => c.id === id);
  const getTeacherById = (id, allTeachers) => allTeachers.find(t => t.id === id);
  const classesForCourse = (courseId) => classes.filter(cl => cl.courseId === courseId);

  return {
    courses, classes, loading, fetchAll,
    createCourse, updateCourse, deleteCourse,
    createClass,  updateClass,  deleteClass,
    getCourseById, getTeacherById, classesForCourse,
  };
};