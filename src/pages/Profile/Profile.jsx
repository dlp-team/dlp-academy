// src/pages/Profile/Profile.jsx
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Header from '../../components/layout/Header';

// Hooks
import { useProfile } from './hooks/useProfile';
import useUserStatistics from './hooks/useUserStatistics';

// Components
import UserCard from './components/UserCard';
import ProfileSubjects from './components/ProfileSubjects';
import StatsSidebar from './components/StatsSidebar';
import UserStatistics from './components/UserStatistics';
import Notas from './components/Notas';
import EditProfileModal from './modals/EditProfileModal';

const Profile = ({ user }) => {
  const { userProfile, subjects, loading, updateUserProfile, logout } = useProfile(user);
  const [isEditing, setIsEditing] = useState(false);

  const { stats, loading: statsLoading, getChartData } = useUserStatistics(subjects, user?.uid);

  const role = userProfile?.role === 'teacher' ? 'teacher' : 'student';
  const badges = userProfile?.badges || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-12 transition-colors">
      <Header user={user} />

      <main className="max-w-5xl mx-auto px-6 pt-24 space-y-8">

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
          <StatsSidebar
            chartData={!statsLoading ? getChartData('all') : []}
            role={role}
            loading={statsLoading}
            badges={badges}
          />
        </div>

        {/* Notas — full width */}
        {!statsLoading && stats.totalQuizzes > 0 && (
          <Notas
            subjectPerformance={stats.subjectPerformance}
            recentActivity={stats.recentActivity}
            role={role}
            teacherDashboardPath="/dashboard/stats"
          />
        )}

        {/* Full Detailed Statistics */}
        <UserStatistics subjects={subjects} userId={user.uid} />

      </main>

      <EditProfileModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        initialData={{
          ...userProfile,
          displayName: userProfile?.displayName || user?.displayName
        }}
        onSave={updateUserProfile}
      />
    </div>
  );
};

export default Profile;