// src/pages/InstitutionAdminDashboard/components/classes-courses/studentCourseLinkUtils.ts

const normalizeId = (value: any) => String(value || '').trim();

const toUniqueIds = (values: any[] = []) => Array.from(
  new Set(values.map(normalizeId).filter(Boolean))
);

const getStudentProfileCourseIds = (student: any = {}) => {
  const directCourseId = normalizeId(student?.courseId);
  const listedCourseIds = Array.isArray(student?.courseIds) ? student.courseIds : [];
  const enrolledCourseIds = Array.isArray(student?.enrolledCourseIds) ? student.enrolledCourseIds : [];

  return toUniqueIds([directCourseId, ...listedCourseIds, ...enrolledCourseIds]);
};

const getStudentClassCourseIds = ({ studentId, classes = [] }: any) => {
  const normalizedStudentId = normalizeId(studentId);
  if (!normalizedStudentId) return [];

  const safeClasses = Array.isArray(classes) ? classes : [];

  return toUniqueIds(
    safeClasses
      .filter((cls: any) => Array.isArray(cls?.studentIds) && cls.studentIds.includes(normalizedStudentId))
      .map((cls: any) => cls?.courseId)
  );
};

export const getStudentLinkedCourseIds = ({ student, classes = [] }: any) => {
  const profileCourseIds = getStudentProfileCourseIds(student);
  const classCourseIds = getStudentClassCourseIds({ studentId: student?.id, classes });

  return toUniqueIds([...profileCourseIds, ...classCourseIds]);
};

export const resolveEligibleStudentsForCourse = ({
  students = [],
  selectedCourseId,
  classes = [],
}: any) => {
  const safeStudents = Array.isArray(students) ? students : [];
  const normalizedCourseId = normalizeId(selectedCourseId);

  if (!normalizedCourseId) {
    return {
      eligibleStudents: safeStudents,
      isLegacyFallback: false,
      studentsWithCourseLinks: 0,
    };
  }

  const linkedCourseIdsByStudentId = new Map<any, any>();

  safeStudents.forEach((student: any) => {
    const studentId = normalizeId(student?.id);
    linkedCourseIdsByStudentId.set(studentId, getStudentLinkedCourseIds({ student, classes }));
  });

  const studentsWithCourseLinks = Array.from(linkedCourseIdsByStudentId.values())
    .filter((courseIds: any) => Array.isArray(courseIds) && courseIds.length > 0)
    .length;

  // Backward-compatibility while student-course links are still being rolled out.
  if (studentsWithCourseLinks === 0) {
    return {
      eligibleStudents: safeStudents,
      isLegacyFallback: true,
      studentsWithCourseLinks,
    };
  }

  const eligibleStudents = safeStudents.filter((student: any) => {
    const studentId = normalizeId(student?.id);
    const linkedCourseIds = linkedCourseIdsByStudentId.get(studentId) || [];
    return linkedCourseIds.includes(normalizedCourseId);
  });

  return {
    eligibleStudents,
    isLegacyFallback: false,
    studentsWithCourseLinks,
  };
};
