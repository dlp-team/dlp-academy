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
  writeBatch,
  where,
} from 'firebase/firestore';
import { db } from '../../../firebase/config';

const normalizeEntityStatus = (entity: any) => String(entity?.status || 'active').trim().toLowerCase();
const isTrashedEntity = (entity: any) => normalizeEntityStatus(entity) === 'trashed';

const applyDeleteBatchInChunks = async (docRefs: any[] = [], chunkSize = 450) => {
  for (let index = 0; index < docRefs.length; index += chunkSize) {
    const batch = writeBatch(db);
    const chunk = docRefs.slice(index, index + chunkSize);
    chunk.forEach((docRef) => {
      batch.delete(docRef);
    });
    await batch.commit();
  }
};

export const useClassesCourses = (user, institutionIdOverride = null) => {
  const effectiveInstitutionId = institutionIdOverride || user?.institutionId || null;
  const [courses, setCourses] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [trashedCourses, setTrashedCourses] = useState<any[]>([]);
  const [trashedClasses, setTrashedClasses] = useState<any[]>([]);
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

      const allCourses = cSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const allClasses = clSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      setCourses(allCourses.filter((course) => !isTrashedEntity(course)));
      setClasses(allClasses.filter((cls) => !isTrashedEntity(cls)));
      setTrashedCourses(allCourses.filter((course) => isTrashedEntity(course)));
      setTrashedClasses(allClasses.filter((cls) => isTrashedEntity(cls)));
    } catch (e) {
      console.error('useClassesCourses fetchAll:', e);
    } finally {
      setLoading(false);
    }
  }, [effectiveInstitutionId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Course CRUD ───────────────────────────────────────────────────────────
  const createCourse = async (form: any) => {
    await addDoc(collection(db, 'courses'), {
      ...form,
      institutionId: effectiveInstitutionId,
      status: 'active',
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await fetchAll();
  };

  const updateCourse = async (id, patch: any) => {
    await updateDoc(doc(db, 'courses', id), { ...patch, updatedAt: serverTimestamp() });
    await fetchAll();
  };

  const deleteCourse = async (id: any) => {
    if (!id) return;

    await updateDoc(doc(db, 'courses', id), {
      status: 'trashed',
      trashedAt: serverTimestamp(),
      trashedByUid: user?.uid || null,
      updatedAt: serverTimestamp(),
    });

    const linkedClassesSnapshot = await getDocs(
      query(
        collection(db, 'classes'),
        where('institutionId', '==', effectiveInstitutionId),
        where('courseId', '==', id)
      )
    );

    await Promise.all(linkedClassesSnapshot.docs.map((classDoc: any) =>
      updateDoc(doc(db, 'classes', classDoc.id), {
        status: 'trashed',
        trashedAt: serverTimestamp(),
        trashedByUid: user?.uid || null,
        trashedByCourseId: id,
        updatedAt: serverTimestamp(),
      })
    ));

    await fetchAll();
  };

  // ── Class CRUD ────────────────────────────────────────────────────────────
  const createClass = async (form: any) => {
    await addDoc(collection(db, 'classes'), {
      ...form,
      institutionId: effectiveInstitutionId,
      status: 'active',
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await fetchAll();
  };

  const updateClass = async (id, patch: any) => {
    await updateDoc(doc(db, 'classes', id), { ...patch, updatedAt: serverTimestamp() });
    await fetchAll();
  };

  const deleteClass = async (id: any) => {
    if (!id) return;

    await updateDoc(doc(db, 'classes', id), {
      status: 'trashed',
      trashedAt: serverTimestamp(),
      trashedByUid: user?.uid || null,
      updatedAt: serverTimestamp(),
    });

    await fetchAll();
  };

  const restoreCourse = async (id: any) => {
    if (!id) return;

    await updateDoc(doc(db, 'courses', id), {
      status: 'active',
      trashedAt: null,
      trashedByUid: null,
      updatedAt: serverTimestamp(),
    });

    const linkedClassesSnapshot = await getDocs(
      query(
        collection(db, 'classes'),
        where('institutionId', '==', effectiveInstitutionId),
        where('courseId', '==', id)
      )
    );

    await Promise.all(linkedClassesSnapshot.docs.map((classDoc: any) =>
      updateDoc(doc(db, 'classes', classDoc.id), {
        status: 'active',
        trashedAt: null,
        trashedByUid: null,
        trashedByCourseId: null,
        updatedAt: serverTimestamp(),
      })
    ));

    await fetchAll();
  };

  const restoreClass = async (id: any) => {
    if (!id) return;

    await updateDoc(doc(db, 'classes', id), {
      status: 'active',
      trashedAt: null,
      trashedByUid: null,
      trashedByCourseId: null,
      updatedAt: serverTimestamp(),
    });

    await fetchAll();
  };

  const permanentlyDeleteCourse = async (id: any) => {
    if (!id) return;

    const linkedClassesSnapshot = await getDocs(
      query(
        collection(db, 'classes'),
        where('institutionId', '==', effectiveInstitutionId),
        where('courseId', '==', id)
      )
    );

    const classRefs = linkedClassesSnapshot.docs.map((classDoc: any) => doc(db, 'classes', classDoc.id));
    await applyDeleteBatchInChunks([...classRefs, doc(db, 'courses', id)]);

    await fetchAll();
  };

  const permanentlyDeleteClass = async (id: any) => {
    if (!id) return;

    await deleteDoc(doc(db, 'classes', id));
    await fetchAll();
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getCourseById  = (id) => courses.find(c => c.id === id);
  const getTeacherById = (id, allTeachers) => allTeachers.find(t => t.id === id);
  const classesForCourse = (courseId) => classes.filter(cl => cl.courseId === courseId);

  return {
    courses, classes, trashedCourses, trashedClasses, loading, fetchAll,
    createCourse, updateCourse, deleteCourse,
    createClass, updateClass, deleteClass,
    restoreCourse, restoreClass,
    permanentlyDeleteCourse, permanentlyDeleteClass,
    getCourseById, getTeacherById, classesForCourse,
  };
};