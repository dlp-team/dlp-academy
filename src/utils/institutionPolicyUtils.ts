// src/utils/institutionPolicyUtils.js
export const DEFAULT_ACCESS_POLICIES = {
    teachers: {
        requireDomain: false,
        allowedDomains: '',
        requireCode: true,
        rotationIntervalHours: 24,
        allowTeacherAutonomousSubjectCreation: true,
        canAssignClassesAndStudents: true,
        canDeleteSubjectsWithStudents: false
    },
    students: {
        requireDomain: false,
        allowedDomains: '',
        requireCode: true,
        rotationIntervalHours: 1
    }
};

export const normalizeAccessPolicies = (accessPolicies: any) => {
    const safePolicies = accessPolicies && typeof accessPolicies === 'object' ? accessPolicies : {};

    return {
        teachers: {
            ...DEFAULT_ACCESS_POLICIES.teachers,
            ...(safePolicies.teachers || {})
        },
        students: {
            ...DEFAULT_ACCESS_POLICIES.students,
            ...(safePolicies.students || {})
        }
    };
};

export const getTeacherAccessPolicy = (accessPolicies: any) => {
    return normalizeAccessPolicies(accessPolicies).teachers;
};

export const canTeacherAssignClassesAndStudents = (accessPolicies: any) => {
    return getTeacherAccessPolicy(accessPolicies).canAssignClassesAndStudents === true;
};

export const canTeacherDeleteSubjectsWithStudents = (accessPolicies: any) => {
    return getTeacherAccessPolicy(accessPolicies).canDeleteSubjectsWithStudents === true;
};

export const canTeacherCreateSubjectsAutonomously = (accessPolicies: any) => {
    return getTeacherAccessPolicy(accessPolicies).allowTeacherAutonomousSubjectCreation !== false;
};