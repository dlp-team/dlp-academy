// src/pages/Profile/Profile.jsx
import React, { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Header from '../../components/layout/Header';

// Hooks
import { useProfile } from './hooks/useProfile';
import useUserStatistics from './hooks/useUserStatistics';
import { useAdminProfileStats } from './hooks/useAdminProfileStats';

// Components
import UserCard from './components/UserCard';
import ProfileSubjects from './components/ProfileSubjects';
import StatsSidebar from './components/StatsSidebar';
import UserStatistics from './components/UserStatistics';
import Notas from './components/Notas';
import BadgesSection from './components/BadgesSection';
import EditProfileModal from './modals/EditProfileModal';
import AdminStatsPanel from './components/AdminStatsPanel';
import { getActiveRole } from '../../utils/permissionUtils';

const Profile = ({ user }: any) => {
  const {
    userProfile,
    subjects,
    assignedStudents,
    loading,
    updateUserProfile,
    logout,
    awardBadgeToStudent
  } = useProfile(user);
  const [isEditing, setIsEditing] = useState(false);
  const [headerUser, setHeaderUser] = useState(user);

  const role = userProfile?.role === 'teacher' ? 'teacher' : 'student';
  const activeRole = getActiveRole(user);
  const isAdminUser = activeRole === 'admin' || activeRole === 'institutionadmin';
  const institutionId = user?.institutionId || null;
  const badges = userProfile?.badges || [];

  const assignedUserIds = useMemo(
    () => assignedStudents.map((student) => String(student.id || '')).filter(Boolean),
    [assignedStudents]
  );

  const assignedUsersById = useMemo(
    () => assignedStudents.reduce((acc, student: any) => {
      if (!student?.id) return acc;
      acc[String(student.id)] = student.displayName || student.email || 'Alumno';
      return acc;
    }, {}),
    [assignedStudents]
  );

  const statsOptions = useMemo(() => {
    if (role !== 'teacher') return {};
    return {
      aggregateMode: true,
      aggregateUserIds: assignedUserIds,
      aggregateUsersById: assignedUsersById
    };
  }, [role, assignedUserIds, assignedUsersById]);

  const { stats, loading: statsLoading, getChartData } = useUserStatistics(subjects, user?.uid, statsOptions);
  const adminStats = useAdminProfileStats(isAdminUser ? institutionId : null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-12 transition-colors">
      <Header user={headerUser} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 space-y-8">

        {/* User Card */}
        <UserCard
          user={user}
          userProfile={userProfile}
          onEdit={() => setIsEditing(true)}
          onLogout={logout}
        />

        {/* Subjects (2/3) + Sidebar with chart & badges (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ProfileSubjects subjects={subjects} />
          {isAdminUser ? (
            <AdminStatsPanel stats={adminStats.stats} loading={adminStats.loading} />
          ) : (
            <StatsSidebar
              chartData={!statsLoading ? getChartData('all') : []}
              role={role}
              loading={statsLoading}
              badges={badges}
              showBadges={role !== 'teacher'}
            />
          )}
        </div>

        {/* Notas — full width (hidden for admin users) */}
        {!isAdminUser && !statsLoading && stats.totalQuizzes > 0 && (
          <Notas
            subjectPerformance={stats.subjectPerformance}
            recentActivity={stats.recentActivity}
            role={role}
            teacherDashboardPath="/dashboard/stats"
          />
        )}

        {role === 'teacher' && (
          <BadgesSection
            role="teacher"
            students={assignedStudents}
            onAwardBadge={async (studentUid, badgeKey: any) => {
              await awardBadgeToStudent(studentUid, badgeKey, {
                awardedBy: user?.uid || 'teacher'
              });
            }}
          />
        )}

        {/* Full Detailed Statistics (hidden for admin users) */}
        {!isAdminUser && (
          <UserStatistics
            subjects={subjects}
            userId={user.uid}
            statsOptions={statsOptions}
            role={role}
          />
        )}

      </main>

      <EditProfileModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        initialData={{
          ...userProfile,
          displayName: userProfile?.displayName || user?.displayName,
          uid: user?.uid
        }}
        onSave={async (newData: any) => {
          await updateUserProfile(newData);
          setHeaderUser(prev => ({ ...prev, ...newData }));
        }}
      />
    </div>
  );
};

export default Profile;