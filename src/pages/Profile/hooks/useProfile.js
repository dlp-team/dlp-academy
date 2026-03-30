// src/pages/Profile/hooks/useProfile.js
import { useState, useEffect } from 'react';
import { auth, db } from '../../../firebase/config'; 
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import {
    ACADEMIC_EXCELLENCE_BADGE_KEY,
    buildAcademicExcellenceBadge,
    buildManualBadge,
    getAcademicExcellenceLevel,
    getActiveCourseBadges,
    normalizeCourseKey,
    upsertCourseBadge
} from '../../../utils/badgeUtils';

const fetchTeacherAssignedStudents = async ({ institutionId, teacherUid }) => {
    if (!institutionId || !teacherUid) return [];

    const classesSnapshot = await getDocs(
        query(
            collection(db, 'classes'),
            where('institutionId', '==', institutionId),
            where('teacherId', '==', teacherUid)
        )
    );

    const studentIds = new Set();
    classesSnapshot.docs.forEach((classDoc) => {
        const classData = classDoc.data() || {};
        (classData.studentIds || []).forEach((studentId) => {
            if (studentId) studentIds.add(studentId);
        });
    });

    if (studentIds.size === 0) return [];

    const studentsSnapshot = await getDocs(
        query(
            collection(db, 'users'),
            where('institutionId', '==', institutionId),
            where('role', '==', 'student')
        )
    );

    return studentsSnapshot.docs
        .map((studentDoc) => ({ id: studentDoc.id, ...studentDoc.data() }))
        .filter((student) => studentIds.has(student.id));
};

const buildStudentCourseAverages = async ({ subjects, assignedStudentIds }) => {
    const averagesByStudentAndCourse = new Map();

    for (const subject of subjects) {
        const courseKey = normalizeCourseKey(subject?.course || subject?.courseId || subject?.classId || 'general');
        const topicsSnapshot = await getDocs(
            query(collection(db, 'topics'), where('subjectId', '==', subject.id))
        );

        for (const topicDoc of topicsSnapshot.docs) {
            const quizResultsSnapshot = await getDocs(
                collection(db, 'subjects', subject.id, 'topics', topicDoc.id, 'quiz_results')
            );

            quizResultsSnapshot.docs.forEach((resultDoc) => {
                const resultData = resultDoc.data() || {};
                const studentId = resultData?.userId;
                const score = Number(resultData?.score);

                if (!studentId || !assignedStudentIds.has(studentId)) return;
                if (!Number.isFinite(score)) return;

                const mapKey = `${studentId}::${courseKey}`;
                const previous = averagesByStudentAndCourse.get(mapKey) || { total: 0, count: 0 };
                averagesByStudentAndCourse.set(mapKey, {
                    total: previous.total + score,
                    count: previous.count + 1
                });
            });
        }
    }

    return averagesByStudentAndCourse;
};

export const useProfile = (user) => {
    const [userProfile, setUserProfile] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [assignedStudents, setAssignedStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const awardBadgeToStudent = async (studentUid, badgeKey, options = {}) => {
        if (!user?.uid || !studentUid || !badgeKey) return false;

        const currentRole = String(userProfile?.role || user?.role || '').toLowerCase();
        const canAwardBadges = currentRole === 'teacher' || currentRole === 'institutionadmin' || currentRole === 'admin';
        if (!canAwardBadges) return false;

        if (currentRole === 'teacher') {
            const isAssignedStudent = assignedStudents.some((student) => student.id === studentUid);
            if (!isAssignedStudent) return false;
        }

        const studentRef = doc(db, 'users', studentUid);
        const studentSnapshot = await getDoc(studentRef);
        if (!studentSnapshot.exists()) return false;

        const studentData = studentSnapshot.data() || {};
        const courseKey = normalizeCourseKey(options?.courseId || studentData?.activeCourseId || 'general');

        const nextBadge = badgeKey === ACADEMIC_EXCELLENCE_BADGE_KEY
            ? buildAcademicExcellenceBadge({
                averageTenScale: options?.averageTenScale || 0,
                level: options?.level || 1,
                awardedBy: options?.awardedBy || 'system'
            })
            : buildManualBadge({
                badgeKey,
                awardedBy: options?.awardedBy || user.uid
            });

        const {
            changed,
            badgesByCourse: nextBadgesByCourse
        } = upsertCourseBadge({
            badgesByCourse: studentData?.badgesByCourse,
            courseId: courseKey,
            badge: nextBadge
        });

        if (!changed) return false;

        const activeCourseId = studentData?.activeCourseId || courseKey;
        const nextActiveBadges = getActiveCourseBadges(nextBadgesByCourse, activeCourseId);

        await updateDoc(studentRef, {
            badgesByCourse: nextBadgesByCourse,
            badges: nextActiveBadges,
            updatedAt: new Date()
        });

        setAssignedStudents((previousStudents) =>
            previousStudents.map((student) => {
                if (student.id !== studentUid) return student;
                return {
                    ...student,
                    badgesByCourse: nextBadgesByCourse,
                    badges: nextActiveBadges
                };
            })
        );

        return true;
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // 1. Get Profile
                const userDocRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userDocRef);
                const profileData = userSnap.exists() ? userSnap.data() : null;
                if (userSnap.exists()) {
                    setUserProfile(profileData);
                }

                const resolvedRole = String(profileData?.role || user?.role || '').toLowerCase();
                const effectiveInstitutionId = profileData?.institutionId || user?.institutionId || null;

                // 2. Get Subjects
                const q = query(collection(db, "subjects"), where("ownerId", "==", user.uid));
                const querySnapshot = await getDocs(q);
                const subjectsData = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                setSubjects(subjectsData);

                if (resolvedRole === 'teacher' && effectiveInstitutionId) {
                    const teacherStudents = await fetchTeacherAssignedStudents({
                        institutionId: effectiveInstitutionId,
                        teacherUid: user.uid
                    });
                    setAssignedStudents(teacherStudents);

                    if (teacherStudents.length > 0 && subjectsData.length > 0) {
                        const assignedStudentIds = new Set(teacherStudents.map((student) => student.id));
                        const averagesByStudentAndCourse = await buildStudentCourseAverages({
                            subjects: subjectsData,
                            assignedStudentIds
                        });

                        const pendingAutoAwards = [];
                        averagesByStudentAndCourse.forEach((value, mapKey) => {
                            if (!value?.count) return;

                            const averagePercent = value.total / value.count;
                            const averageTenScale = Number((averagePercent / 10).toFixed(2));
                            const level = getAcademicExcellenceLevel(averageTenScale);
                            if (!level) return;

                            const [studentUid, courseId] = mapKey.split('::');
                            pendingAutoAwards.push(
                                awardBadgeToStudent(studentUid, ACADEMIC_EXCELLENCE_BADGE_KEY, {
                                    courseId,
                                    level,
                                    averageTenScale,
                                    awardedBy: 'system'
                                })
                            );
                        });

                        if (pendingAutoAwards.length > 0) {
                            await Promise.allSettled(pendingAutoAwards);
                        }
                    }
                } else {
                    setAssignedStudents([]);
                }

            } catch (error) {
                console.error("Error loading profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const updateUserProfile = async (newData) => {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, newData);
        setUserProfile(prev => ({ ...prev, ...newData }));
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    return {
        userProfile,
        subjects,
        assignedStudents,
        loading,
        updateUserProfile,
        logout,
        awardBadgeToStudent
    };
};