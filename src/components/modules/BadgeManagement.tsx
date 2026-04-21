// src/components/modules/BadgeManagement.tsx
import React, { useState, useCallback } from 'react';
import { Plus, Award, X, Trash2, RefreshCw } from 'lucide-react';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import BadgeTemplateForm, { ICON_OPTIONS } from './BadgeTemplateForm';
import { canManageSubjectBadges, canRevokeBadge } from '../../utils/badgePermissions';

interface BadgeManagementProps {
  /** Current user context */
  user: { uid: string; role?: string; institutionId?: string };
  /** Subject context (for subject-scoped badges) */
  subject?: { id: string; ownerId?: string; editorUids?: string[] } | null;
  /** Badge templates available for this scope */
  templates: any[];
  /** Student badges already awarded */
  studentBadges: any[];
  /** Student being managed */
  student: { uid: string; displayName?: string } | null;
  /** Institution ID for Firestore scoping */
  institutionId: string;
  /** Callback after badge state changes */
  onRefresh?: () => void;
}

const BadgeManagement: React.FC<BadgeManagementProps> = ({
  user,
  subject,
  templates,
  studentBadges,
  student,
  institutionId,
  onRefresh,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [awarding, setAwarding] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  const canManage = canManageSubjectBadges(user, subject);

  const handleCreateTemplate = useCallback(
    async (templateData: { name: string; description: string; iconKey: string; category: string }) => {
      if (!canManage || !subject?.id) return;
      setCreatingTemplate(true);
      try {
        await addDoc(collection(db, 'badgeTemplates'), {
          ...templateData,
          scope: 'subject',
          subjectId: subject.id,
          institutionId,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
          status: 'active',
        });
        setShowCreateForm(false);
        onRefresh?.();
      } finally {
        setCreatingTemplate(false);
      }
    },
    [canManage, subject, institutionId, user.uid, onRefresh]
  );

  const handleAwardBadge = useCallback(
    async (templateId: string) => {
      if (!canManage || !student?.uid) return;
      setAwarding(templateId);
      try {
        await addDoc(collection(db, 'studentBadges'), {
          templateId,
          studentId: student.uid,
          subjectId: subject?.id || null,
          institutionId,
          type: 'manual',
          scope: 'subject',
          awardedBy: user.uid,
          awardedAt: serverTimestamp(),
          status: 'active',
        });
        onRefresh?.();
      } finally {
        setAwarding(null);
      }
    },
    [canManage, student, subject, institutionId, user.uid, onRefresh]
  );

  const handleRevokeBadge = useCallback(
    async (badgeId: string, badge: any) => {
      if (!canRevokeBadge(user, badge)) return;
      setRevoking(badgeId);
      try {
        await updateDoc(doc(db, 'studentBadges', badgeId), {
          status: 'revoked',
          revokedAt: serverTimestamp(),
          revokedBy: user.uid,
        });
        onRefresh?.();
      } finally {
        setRevoking(null);
      }
    },
    [user, onRefresh]
  );

  // Separate active and revoked badges for this student
  const activeBadges = studentBadges.filter((b) => b.status === 'active');
  const revokedBadges = studentBadges.filter((b) => b.status === 'revoked');

  // Templates not yet awarded to this student
  const awardableTemplates = templates.filter(
    (t: any) => !activeBadges.some((b) => b.templateId === t.id)
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-500" />
          {student ? `Insignias de ${student.displayName || 'alumno'}` : 'Gestión de insignias'}
        </h4>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
              title="Actualizar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          {canManage && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg shadow transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Nueva insignia
            </button>
          )}
        </div>
      </div>

      {/* Create template form */}
      {showCreateForm && (
        <div className="border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 bg-indigo-50/50 dark:bg-indigo-900/20">
          <BadgeTemplateForm
            onSubmit={handleCreateTemplate}
            onCancel={() => setShowCreateForm(false)}
            loading={creatingTemplate}
          />
        </div>
      )}

      {/* Award badges section */}
      {student && canManage && awardableTemplates.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Otorgar insignia:</p>
          <div className="flex flex-wrap gap-2">
            {awardableTemplates.map((template: any) => {
              const iconOpt = ICON_OPTIONS.find((i) => i.key === template.iconKey);
              const Icon = iconOpt?.icon || Award;
              const isAwarding = awarding === template.id;
              return (
                <button
                  key={template.id}
                  onClick={() => handleAwardBadge(template.id)}
                  disabled={!!awarding}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors disabled:opacity-50"
                  title={template.description || template.name}
                >
                  <Icon className="w-3.5 h-3.5 text-indigo-500" />
                  {isAwarding ? 'Otorgando...' : template.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active badges */}
      {activeBadges.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Insignias activas:</p>
          <div className="space-y-1.5">
            {activeBadges.map((badge: any) => {
              const template = templates.find((t: any) => t.id === badge.templateId);
              const iconOpt = ICON_OPTIONS.find((i) => i.key === template?.iconKey);
              const Icon = iconOpt?.icon || Award;
              const canRevoke = canRevokeBadge(user, badge);
              const isRevoking = revoking === badge.id;
              return (
                <div
                  key={badge.id}
                  className="flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-white">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                        {template?.name || 'Insignia'}
                      </span>
                      {badge.type === 'manual' && (
                        <span className="ml-1.5 text-[10px] text-gray-400">manual</span>
                      )}
                    </div>
                  </div>
                  {canRevoke && (
                    <button
                      onClick={() => handleRevokeBadge(badge.id, badge)}
                      disabled={!!revoking}
                      className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                      title="Revocar insignia"
                    >
                      {isRevoking ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Revoked badges */}
      {revokedBadges.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Insignias revocadas:</p>
          <div className="space-y-1">
            {revokedBadges.map((badge: any) => {
              const template = templates.find((t: any) => t.id === badge.templateId);
              return (
                <div
                  key={badge.id}
                  className="flex items-center gap-2 px-3 py-1.5 opacity-40 grayscale"
                >
                  <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-400 line-through">
                    {template?.name || 'Insignia'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {activeBadges.length === 0 && revokedBadges.length === 0 && !showCreateForm && (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
          {student ? 'Este alumno aún no tiene insignias.' : 'No hay insignias configuradas.'}
        </p>
      )}
    </div>
  );
};

export default BadgeManagement;
