// src/pages/InstitutionAdminDashboard/hooks/useClassesCourses.ts
// ─────────────────────────────────────────────────────────────────────────────
// All Firestore reads/writes for the Cursos & Clases section.
// Components stay pure – they only call functions from this hook.

import { useCallback, useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
  where,
} from 'firebase/firestore';
import { db } from '../../../firebase/config';
import {
  applyTransferPromotionPlan,
  rollbackTransferPromotionPlan,
  runTransferPromotionDryRun,
} from '../../../services/transferPromotionService';
import { isTrashRetentionExpired } from '../../../utils/trashRetentionUtils';
import {
  getDefaultAcademicYear,
  normalizeAcademicYear,
} from '../components/classes-courses/academicYearUtils';
import {
  DEFAULT_COURSE_PERIOD_MODE,
  normalizeCoursePeriodMode,
  normalizeCoursePeriodSchedule,
} from '../../../utils/coursePeriodScheduleUtils';
import {
  buildTransferPromotionDryRunPayload,
  buildTransferRollbackMetadata,
  validateTransferPromotionPayload,
} from '../utils/transferPromotionPlanUtils';

const DEFAULT_INSTITUTION_PERIOD_CONFIG = {
  periodMode: DEFAULT_COURSE_PERIOD_MODE,
  customPeriodLabel: '',
  academicCalendar: {
    startDate: '',
    ordinaryEndDate: '',
    extraordinaryEndDate: '',
  },
};

const normalizeEntityStatus = (entity: any) => String(entity?.status || 'active').trim().toLowerCase();
const isTrashedEntity = (entity: any) => normalizeEntityStatus(entity) === 'trashed';

const upsertEntityById = (entities: any[] = [], entity: any) => {
  if (!entity?.id) return entities;
  const existingIndex = entities.findIndex((entry: any) => entry.id === entity.id);
  if (existingIndex === -1) {
    return [entity, ...entities];
  }

  const next = [...entities];
  next[existingIndex] = { ...next[existingIndex], ...entity };
  return next;
};

const removeEntitiesById = (entities: any[] = [], ids: any[] = []) => {
  const idSet = new Set(ids);
  if (idSet.size === 0) return entities;
  return entities.filter((entry: any) => !idSet.has(entry.id));
};

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
  const [institutionPeriodConfig, setInstitutionPeriodConfig] = useState<any>(DEFAULT_INSTITUTION_PERIOD_CONFIG);
  const [loading, setLoading] = useState(true);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!effectiveInstitutionId) return;
    setLoading(true);
    try {
      const readInstitutionCollections = async () => {
        const [cSnap, clSnap, institutionSnap] = await Promise.all([
          getDocs(query(collection(db, 'courses'), where('institutionId', '==', effectiveInstitutionId))),
          getDocs(query(collection(db, 'classes'), where('institutionId', '==', effectiveInstitutionId))),
          getDoc(doc(db, 'institutions', effectiveInstitutionId)),
        ]);

        const allCourses: any[] = cSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const allClasses: any[] = clSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const institutionData = institutionSnap.exists() ? institutionSnap.data() : {};
        const academicCalendar = institutionData?.academicCalendar || {};
        const periodization = academicCalendar?.periodization || {};
        const nextInstitutionPeriodConfig = {
          periodMode: normalizeCoursePeriodMode(periodization?.mode),
          customPeriodLabel: String(periodization?.customLabel || '').trim(),
          academicCalendar: {
            startDate: String(academicCalendar?.startDate || '').trim(),
            ordinaryEndDate: String(academicCalendar?.ordinaryEndDate || '').trim(),
            extraordinaryEndDate: String(academicCalendar?.extraordinaryEndDate || '').trim(),
          },
        };

        return {
          allCourses,
          allClasses,
          nextInstitutionPeriodConfig,
        };
      };

      let { allCourses, allClasses, nextInstitutionPeriodConfig } = await readInstitutionCollections();
      setInstitutionPeriodConfig(nextInstitutionPeriodConfig || DEFAULT_INSTITUTION_PERIOD_CONFIG);

      const nowMs = Date.now();
      const expiredCourseIds = new Set(
        allCourses
          .filter((course) => isTrashedEntity(course) && isTrashRetentionExpired(course?.trashedAt, nowMs))
          .map((course) => course.id)
      );

      const expiredClassIds = new Set<any>();

      allClasses.forEach((cls) => {
        if (expiredCourseIds.has(cls?.courseId)) {
          expiredClassIds.add(cls.id);
          return;
        }

        if (isTrashedEntity(cls) && isTrashRetentionExpired(cls?.trashedAt, nowMs)) {
          expiredClassIds.add(cls.id);
        }
      });

      if (expiredCourseIds.size > 0 || expiredClassIds.size > 0) {
        try {
          const deleteRefs = [
            ...Array.from(expiredClassIds).map((classId: any) => doc(db, 'classes', classId)),
            ...Array.from(expiredCourseIds).map((courseId: any) => doc(db, 'courses', courseId)),
          ];

          await applyDeleteBatchInChunks(deleteRefs);
          ({ allCourses, allClasses, nextInstitutionPeriodConfig } = await readInstitutionCollections());
          setInstitutionPeriodConfig(nextInstitutionPeriodConfig || DEFAULT_INSTITUTION_PERIOD_CONFIG);
        } catch (purgeError) {
          console.error('useClassesCourses purgeExpired:', purgeError);
        }
      }

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
    const normalizedAcademicYear = normalizeAcademicYear(form?.academicYear) || getDefaultAcademicYear();
    const normalizedCoursePeriodSchedule = normalizeCoursePeriodSchedule({
      coursePeriodSchedule: form?.coursePeriodSchedule,
      periodMode: institutionPeriodConfig?.periodMode,
      customPeriodLabel: institutionPeriodConfig?.customPeriodLabel,
    });

    const clientCourseDraft = {
      ...form,
      academicYear: normalizedAcademicYear,
      coursePeriodSchedule: normalizedCoursePeriodSchedule,
      institutionId: effectiveInstitutionId,
      status: 'active',
      createdBy: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const courseRef = await addDoc(collection(db, 'courses'), {
      ...clientCourseDraft,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const nextCourse = { id: courseRef.id, ...clientCourseDraft };
    setCourses((previous) => upsertEntityById(previous, nextCourse));
    setTrashedCourses((previous) => removeEntitiesById(previous, [courseRef.id]));
  };

  const updateCourse = async (id, patch: any) => {
    const hasAcademicYearPatch = Object.prototype.hasOwnProperty.call(patch || {}, 'academicYear');
    const hasCoursePeriodSchedulePatch = Object.prototype.hasOwnProperty.call(patch || {}, 'coursePeriodSchedule');
    const normalizedPatch = { ...patch };
    let normalizedAcademicYear = '';

    if (hasAcademicYearPatch) {
      normalizedAcademicYear = normalizeAcademicYear(patch?.academicYear) || getDefaultAcademicYear();
      normalizedPatch.academicYear = normalizedAcademicYear;
    }

    if (hasCoursePeriodSchedulePatch) {
      normalizedPatch.coursePeriodSchedule = normalizeCoursePeriodSchedule({
        coursePeriodSchedule: patch?.coursePeriodSchedule,
        periodMode: institutionPeriodConfig?.periodMode,
        customPeriodLabel: institutionPeriodConfig?.customPeriodLabel,
      });
    }

    const nextUpdatedAt = new Date();
    await updateDoc(doc(db, 'courses', id), { ...normalizedPatch, updatedAt: serverTimestamp() });

    if (hasAcademicYearPatch) {
      const linkedClassesSnapshot = await getDocs(
        query(
          collection(db, 'classes'),
          where('institutionId', '==', effectiveInstitutionId),
          where('courseId', '==', id)
        )
      );

      await Promise.all(linkedClassesSnapshot.docs.map((classDoc: any) =>
        updateDoc(doc(db, 'classes', classDoc.id), {
          academicYear: normalizedAcademicYear,
          updatedAt: serverTimestamp(),
        })
      ));

      setClasses((previous) => previous.map((cls: any) => (
        cls?.courseId === id
          ? {
            ...cls,
            academicYear: normalizedAcademicYear,
            updatedAt: nextUpdatedAt,
          }
          : cls
      )));

      setTrashedClasses((previous) => previous.map((cls: any) => (
        cls?.courseId === id
          ? {
            ...cls,
            academicYear: normalizedAcademicYear,
            updatedAt: nextUpdatedAt,
          }
          : cls
      )));
    }

    const nextCoursePatch = {
      id,
      ...normalizedPatch,
      updatedAt: nextUpdatedAt,
    };
    setCourses((previous) => upsertEntityById(previous, nextCoursePatch));
    setTrashedCourses((previous) => upsertEntityById(previous, nextCoursePatch));
  };

  const deleteCourse = async (id: any) => {
    if (!id) return;

    const nextTrashedAt = new Date();
    const trashedByUid = user?.uid || null;

    await updateDoc(doc(db, 'courses', id), {
      status: 'trashed',
      trashedAt: serverTimestamp(),
      trashedByUid,
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
        trashedByUid,
        trashedByCourseId: id,
        updatedAt: serverTimestamp(),
      })
    ));

    const linkedClassIds = linkedClassesSnapshot.docs.map((classDoc: any) => classDoc.id);

    setCourses((previous) => removeEntitiesById(previous, [id]));
    setTrashedCourses((previous) => {
      const sourceCourse = courses.find((course: any) => course.id === id) || trashedCourses.find((course: any) => course.id === id);
      const nextCourse = {
        ...(sourceCourse || { id }),
        status: 'trashed',
        trashedAt: nextTrashedAt,
        trashedByUid,
        updatedAt: nextTrashedAt,
      };
      return upsertEntityById(previous, nextCourse);
    });

    setClasses((previous) => removeEntitiesById(previous, linkedClassIds));
    setTrashedClasses((previous) => {
      const previousById = new Map(previous.map((entry: any) => [entry.id, entry]));
      const activeById = new Map(classes.map((entry: any) => [entry.id, entry]));
      const nextEntries = linkedClassIds.map((classId: any) => {
        const sourceClass = activeById.get(classId) || previousById.get(classId) || { id: classId, courseId: id };
        return {
          ...sourceClass,
          status: 'trashed',
          trashedAt: nextTrashedAt,
          trashedByUid,
          trashedByCourseId: id,
          updatedAt: nextTrashedAt,
        };
      });

      return nextEntries.reduce((acc: any, entry: any) => upsertEntityById(acc, entry), previous);
    });
  };

  // ── Class CRUD ────────────────────────────────────────────────────────────
  const resolveCourseAcademicYear = async (courseId: any) => {
    const normalizedCourseId = String(courseId || '').trim();
    if (!normalizedCourseId) return '';

    const stateCourse = courses.find((course: any) => course.id === normalizedCourseId)
      || trashedCourses.find((course: any) => course.id === normalizedCourseId);

    const stateAcademicYear = normalizeAcademicYear(stateCourse?.academicYear);
    if (stateAcademicYear) {
      return stateAcademicYear;
    }

    try {
      const linkedCourseSnapshot = await getDoc(doc(db, 'courses', normalizedCourseId));
      if (linkedCourseSnapshot.exists()) {
        return normalizeAcademicYear(linkedCourseSnapshot.data()?.academicYear);
      }
    } catch (error) {
      console.error('useClassesCourses resolveCourseAcademicYear:', error);
    }

    return '';
  };

  const createClass = async (form: any) => {
    const linkedCourseAcademicYear = await resolveCourseAcademicYear(form?.courseId);
    const fallbackAcademicYear = normalizeAcademicYear(form?.academicYear);
    const resolvedAcademicYear = linkedCourseAcademicYear || fallbackAcademicYear || getDefaultAcademicYear();

    const clientClassDraft = {
      ...form,
      academicYear: resolvedAcademicYear,
      institutionId: effectiveInstitutionId,
      status: 'active',
      createdBy: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const classRef = await addDoc(collection(db, 'classes'), {
      ...clientClassDraft,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const nextClass = { id: classRef.id, ...clientClassDraft };
    setClasses((previous) => upsertEntityById(previous, nextClass));
    setTrashedClasses((previous) => removeEntitiesById(previous, [classRef.id]));
  };

  const updateClass = async (id, patch: any) => {
    const normalizedPatch = { ...patch };

    const hasAcademicYearPatch = Object.prototype.hasOwnProperty.call(patch || {}, 'academicYear');
    const hasCoursePatch = Object.prototype.hasOwnProperty.call(patch || {}, 'courseId');
    const shouldReconcileAcademicYear = hasAcademicYearPatch || hasCoursePatch;

    if (shouldReconcileAcademicYear) {
      const currentClass = classes.find((entry: any) => entry.id === id)
        || trashedClasses.find((entry: any) => entry.id === id);
      const patchCourseId = String(patch?.courseId || '').trim();
      const currentCourseId = String(currentClass?.courseId || '').trim();
      const targetCourseId = hasCoursePatch ? patchCourseId : currentCourseId;

      const linkedCourseAcademicYear = await resolveCourseAcademicYear(targetCourseId);
      const fallbackAcademicYear = normalizeAcademicYear(currentClass?.academicYear)
        || normalizeAcademicYear(patch?.academicYear);

      if (targetCourseId) {
        normalizedPatch.academicYear = linkedCourseAcademicYear || fallbackAcademicYear || getDefaultAcademicYear();
      } else if (hasAcademicYearPatch) {
        normalizedPatch.academicYear = normalizeAcademicYear(patch?.academicYear) || getDefaultAcademicYear();
      }
    }

    const nextUpdatedAt = new Date();
    await updateDoc(doc(db, 'classes', id), { ...normalizedPatch, updatedAt: serverTimestamp() });

    const nextClassPatch = {
      id,
      ...normalizedPatch,
      updatedAt: nextUpdatedAt,
    };
    setClasses((previous) => upsertEntityById(previous, nextClassPatch));
    setTrashedClasses((previous) => upsertEntityById(previous, nextClassPatch));
  };

  const deleteClass = async (id: any) => {
    if (!id) return;

    const nextTrashedAt = new Date();
    const trashedByUid = user?.uid || null;

    await updateDoc(doc(db, 'classes', id), {
      status: 'trashed',
      trashedAt: serverTimestamp(),
      trashedByUid,
      updatedAt: serverTimestamp(),
    });

    setClasses((previous) => removeEntitiesById(previous, [id]));
    setTrashedClasses((previous) => {
      const sourceClass = classes.find((entry: any) => entry.id === id) || trashedClasses.find((entry: any) => entry.id === id);
      const nextClass = {
        ...(sourceClass || { id }),
        status: 'trashed',
        trashedAt: nextTrashedAt,
        trashedByUid,
        updatedAt: nextTrashedAt,
      };
      return upsertEntityById(previous, nextClass);
    });
  };

  const restoreCourse = async (id: any) => {
    if (!id) return;

    const restoredAt = new Date();

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

    const linkedClassIds = linkedClassesSnapshot.docs.map((classDoc: any) => classDoc.id);

    setTrashedCourses((previous) => removeEntitiesById(previous, [id]));
    setCourses((previous) => {
      const sourceCourse = trashedCourses.find((entry: any) => entry.id === id) || courses.find((entry: any) => entry.id === id);
      const nextCourse = {
        ...(sourceCourse || { id }),
        status: 'active',
        trashedAt: null,
        trashedByUid: null,
        updatedAt: restoredAt,
      };
      return upsertEntityById(previous, nextCourse);
    });

    setTrashedClasses((previous) => removeEntitiesById(previous, linkedClassIds));
    setClasses((previous) => {
      const trashedById = new Map(trashedClasses.map((entry: any) => [entry.id, entry]));
      const activeById = new Map(previous.map((entry: any) => [entry.id, entry]));
      const nextEntries = linkedClassIds.map((classId: any) => {
        const sourceClass = activeById.get(classId) || trashedById.get(classId) || { id: classId, courseId: id };
        return {
          ...sourceClass,
          status: 'active',
          trashedAt: null,
          trashedByUid: null,
          trashedByCourseId: null,
          updatedAt: restoredAt,
        };
      });

      return nextEntries.reduce((acc: any, entry: any) => upsertEntityById(acc, entry), previous);
    });
  };

  const restoreClass = async (id: any) => {
    if (!id) return;

    const restoredAt = new Date();

    await updateDoc(doc(db, 'classes', id), {
      status: 'active',
      trashedAt: null,
      trashedByUid: null,
      trashedByCourseId: null,
      updatedAt: serverTimestamp(),
    });

    setTrashedClasses((previous) => removeEntitiesById(previous, [id]));
    setClasses((previous) => {
      const sourceClass = trashedClasses.find((entry: any) => entry.id === id) || classes.find((entry: any) => entry.id === id);
      const nextClass = {
        ...(sourceClass || { id }),
        status: 'active',
        trashedAt: null,
        trashedByUid: null,
        trashedByCourseId: null,
        updatedAt: restoredAt,
      };
      return upsertEntityById(previous, nextClass);
    });
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

    const linkedClassIds = linkedClassesSnapshot.docs.map((classDoc: any) => classDoc.id);
    setCourses((previous) => removeEntitiesById(previous, [id]));
    setTrashedCourses((previous) => removeEntitiesById(previous, [id]));
    setClasses((previous) => removeEntitiesById(previous, linkedClassIds));
    setTrashedClasses((previous) => removeEntitiesById(previous, linkedClassIds));
  };

  const permanentlyDeleteClass = async (id: any) => {
    if (!id) return;

    await deleteDoc(doc(db, 'classes', id));

    setClasses((previous) => removeEntitiesById(previous, [id]));
    setTrashedClasses((previous) => removeEntitiesById(previous, [id]));
  };

  const runTransferPromotionDryRunPreview = async ({
    sourceAcademicYear,
    targetAcademicYear,
    mode,
    options,
  }: any) => {
    if (!effectiveInstitutionId) {
      throw new Error('MISSING_INSTITUTION');
    }

    const payloadInput = {
      institutionId: effectiveInstitutionId,
      sourceAcademicYear,
      targetAcademicYear,
      mode,
      options,
      initiatedByUid: user?.uid || null,
    };

    const payloadValidation = validateTransferPromotionPayload(payloadInput);
    if (!payloadValidation.valid) {
      throw new Error(payloadValidation.errors[0] || 'INVALID_TRANSFER_PROMOTION_PAYLOAD');
    }

    const dryRunPayload = buildTransferPromotionDryRunPayload(payloadInput);
    const callableResult: any = await runTransferPromotionDryRun(dryRunPayload);

    const plannedCourses = Array.isArray(callableResult?.mappings?.courses) ? callableResult.mappings.courses : [];
    const plannedClasses = Array.isArray(callableResult?.mappings?.classes) ? callableResult.mappings.classes : [];
    const plannedStudentAssignments = Array.isArray(callableResult?.mappings?.studentAssignments)
      ? callableResult.mappings.studentAssignments
      : [];

    const rollbackMetadata = callableResult?.rollbackMetadata
      || buildTransferRollbackMetadata({
        dryRunPayload,
        plannedCourses,
        plannedClasses,
        plannedStudentAssignments,
      });

    return {
      ...callableResult,
      dryRunPayload: callableResult?.dryRunPayload || dryRunPayload,
      rollbackMetadata,
      mappings: {
        courses: plannedCourses,
        classes: plannedClasses,
        studentAssignments: plannedStudentAssignments,
      },
      warnings: Array.isArray(callableResult?.warnings) ? callableResult.warnings : [],
    };
  };

  const applyTransferPromotionDryRunPlan = async ({
    dryRunPayload,
    mappings,
    rollbackMetadata,
  }: any) => {
    if (!effectiveInstitutionId) {
      throw new Error('MISSING_INSTITUTION');
    }

    const normalizedDryRunPayload = {
      ...(dryRunPayload || {}),
      institutionId: String(dryRunPayload?.institutionId || effectiveInstitutionId).trim(),
      initiatedByUid: String(dryRunPayload?.initiatedByUid || user?.uid || '').trim() || null,
    };

    const payloadValidation = validateTransferPromotionPayload(normalizedDryRunPayload);
    if (!payloadValidation.valid) {
      throw new Error(payloadValidation.errors[0] || 'INVALID_TRANSFER_PROMOTION_PAYLOAD');
    }

    const applyResult: any = await applyTransferPromotionPlan({
      dryRunPayload: normalizedDryRunPayload,
      mappings,
      rollbackMetadata,
    });

    await fetchAll();

    return {
      ...applyResult,
      warnings: Array.isArray(applyResult?.warnings) ? applyResult.warnings : [],
    };
  };

  const rollbackTransferPromotionPlanById = async ({
    rollbackId,
  }: any) => {
    if (!effectiveInstitutionId) {
      throw new Error('MISSING_INSTITUTION');
    }

    const normalizedRollbackId = String(rollbackId || '').trim();
    if (!normalizedRollbackId) {
      throw new Error('ROLLBACK_ID_REQUIRED');
    }

    const rollbackResult: any = await rollbackTransferPromotionPlan({
      rollbackId: normalizedRollbackId,
      institutionId: effectiveInstitutionId,
    });

    await fetchAll();

    return {
      ...rollbackResult,
      warnings: Array.isArray(rollbackResult?.warnings) ? rollbackResult.warnings : [],
    };
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getCourseById  = (id) => courses.find(c => c.id === id);
  const getTeacherById = (id, allTeachers) => allTeachers.find(t => t.id === id);
  const classesForCourse = (courseId) => classes.filter(cl => cl.courseId === courseId);

  return {
    courses, classes, trashedCourses, trashedClasses, loading, fetchAll,
    institutionPeriodConfig,
    createCourse, updateCourse, deleteCourse,
    createClass, updateClass, deleteClass,
    restoreCourse, restoreClass,
    permanentlyDeleteCourse, permanentlyDeleteClass,
    runTransferPromotionDryRunPreview,
    applyTransferPromotionDryRunPlan,
    rollbackTransferPromotionPlanById,
    getCourseById, getTeacherById, classesForCourse,
  };
};