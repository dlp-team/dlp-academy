// src/pages/Profile.jsx
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Header from '../components/layout/Header';

// Hooks
import { useProfile } from '../hooks/useProfile';

// Components
import UserCard from '../components/profile/UserCard';
import ProfileSubjects from '../components/profile/ProfileSubjects';
import StatsSidebar from '../components/profile/StatsSidebar';
import EditProfileModal from '../components/modals/EditProfileModal';

const Profile = ({ user }) => {
  const { userProfile, subjects, loading, updateUserProfile, logout } = useProfile(user);
  const [isEditing, setIsEditing] = useState(false);

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

      <main className="max-w-5xl mx-auto px-6 pt-24">
        
        <UserCard 
            user={user} 
            userProfile={userProfile} 
            onEdit={() => setIsEditing(true)} 
            onLogout={logout} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ProfileSubjects subjects={subjects} />
          <StatsSidebar />
        </div>

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