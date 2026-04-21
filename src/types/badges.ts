// src/types/badges.ts

import { Timestamp } from 'firebase/firestore';

export type BadgeType = 'auto' | 'manual';
export type BadgeScope = 'general' | 'subject';
export type BadgeCategory = 'grades' | 'behavior' | 'participation' | 'custom';
export type BadgeStatus = 'active' | 'revoked';

export type BadgeStyleLevel =
    | 'threshold'
    | 'mid'
    | 'high'
    | 'near-perfect'
    | 'perfect'
    | null;

export interface BadgeGradingConfig {
    metric: 'mean' | 'min' | 'max';
    threshold: number;
    perfectScore: number;
}

export interface BadgeStyleConfig {
    baseColor: string;
    progressColors: Record<number, string>;
    perfectStyle?: string;
}

export interface BadgeTemplate {
    id: string;
    institutionId: string;
    name: string;
    description: string;
    icon: string;
    type: BadgeType;
    scope: BadgeScope;
    category: BadgeCategory;
    gradingConfig?: BadgeGradingConfig;
    styleConfig: BadgeStyleConfig;
    createdBy: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    isDefault: boolean;
    subjectId?: string;
}

export interface StudentBadge {
    id: string;
    templateId: string;
    institutionId: string;
    studentId: string;
    subjectId?: string;
    type: BadgeType;
    scope: BadgeScope;
    status: BadgeStatus;
    currentScore?: number;
    styleLevel?: BadgeStyleLevel;
    awardedBy?: string;
    awardedAt: Timestamp;
    revokedAt?: Timestamp;
    revokedBy?: string;
    metadata?: Record<string, any>;
}

export interface InstitutionBadgeConfig {
    gradeThreshold: number;
    enableAutoBadges: boolean;
    enableManualBadges: boolean;
    defaultTemplates: string[];
}
