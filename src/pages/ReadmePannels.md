Teacher dashboard
# Teacher Dashboard (Panel de Profesor)

## Overview
The Teacher Dashboard is designed for teachers to manage their students and monitor their academic performance and engagement with educational content.

## Access Requirements
- **User Role**: `teacher`
- **Route**: `/teacher-dashboard`
- **Navigation**: Accessible via the "Panel Profesor" button in the Header (only visible to users with teacher role)

## Main Features

### 1. Student Management Tab
**Purpose**: View and manage all students assigned to the teacher

**Features**:
- **Students Table**: Display all students with the following columns:
  - Student Name
  - Email
  - Current Subjects/Classes they're enrolled in
  - Last Activity Date
  - Overall Progress Percentage
  - Status (Active/Inactive)

- **Search & Filters**:
  - Search by student name or email
  - Filter by subject/class
  - Filter by activity status (Active, Inactive, At Risk)
  - Filter by progress level (Excellent, Good, Needs Improvement)

- **Quick Actions**:
  - Click on student to view detailed stats (navigate to `/teacher/student/:studentId`)
  - Send message/notification to student
  - Assign/unassign from subjects

### 2. Subject Statistics Tab
**Purpose**: View analytics and statistics for subjects the teacher is teaching

**Features**:
- **Subject Cards Grid**: Display all subjects taught by the teacher
  - Subject name and icon
  - Total enrolled students
  - Average completion rate
  - Average quiz/test scores
  - Recent activity indicator

- **Detailed Analytics** (when clicking a subject):
  - Student progress breakdown (chart)
  - Topic completion rates
  - Most challenging topics (based on quiz scores)
  - Time spent per topic (average)
  - Recent submissions/completions timeline

### 3. Class Overview Tab
**Purpose**: Quick overview of all classes/groups

**Features**:
- Cards showing each class with:
  - Class name
  - Number of students
  - Active subjects count
  - Average class performance
  - Upcoming deadlines/assignments

### 4. Analytics Dashboard
**Purpose**: High-level overview of teaching effectiveness

**Features**:
- **Key Metrics Cards**:
  - Total students
  - Active students this week
  - Average completion rate across all subjects
  - Average quiz score across all subjects

- **Charts & Visualizations**:
  - Student engagement over time (line chart)
  - Subject completion comparison (bar chart)
  - Student performance distribution (pie chart)

## Student Detail Page
**Route**: `/teacher/student/:studentId`

**Features**:
- Student profile header (name, email, photo, enrollment date)
- **Academic Progress Section**:
  - List of enrolled subjects with progress bars
  - Completion percentage per subject
  - Quiz/test scores per subject
  - Time spent studying (total and per subject)

- **Activity Timeline**:
  - Recent actions (topics completed, quizzes taken, etc.)
  - Login/access patterns
  - Engagement metrics

- **Performance Analytics**:
  - Strengths (topics with high scores)
  - Areas for improvement (topics with low scores)
  - Learning pace compared to class average
  - Consistency metrics

- **Actions**:
  - Assign/remove from subjects
  - Send message/notification
  - View detailed subject progress
  - Export student report

## Technical Implementation Notes

### Data Structure Required
```javascript
// Teacher document in Firestore
{
  id: string,
  email: string,
  displayName: string,
  role: 'teacher',
  schoolId: string,
  subjects: string[], // Array of subject IDs the teacher teaches
  classes: string[], // Array of class/group IDs
}

// Student document in Firestore (enhanced)
{
  id: string,
  email: string,
  displayName: string,
  role: 'student',
  schoolId: string,
  teacherId: string, // Reference to assigned teacher
  enrolledSubjects: string[], // Array of subject IDs
  classId: string, // Reference to class/group
}

// Student Progress Collection
{
  studentId: string,
  subjectId: string,
  topicId: string,
  completionPercentage: number,
  quizScores: number[],
  lastAccessed: timestamp,
  timeSpent: number, // in minutes
}
```

### Components to Create
1. `TeacherDashboard.jsx` - Main container
2. `StudentTable.jsx` - Reusable table component
3. `SubjectStatsCard.jsx` - Subject analytics card
4. `StudentDetailView.jsx` - Detailed student page
5. `AnalyticsChart.jsx` - Reusable chart component
6. `PerformanceMetrics.jsx` - Metrics display component

### Firebase Queries Needed
- Get all students assigned to teacher
- Get all subjects taught by teacher
- Get student progress data for all enrolled subjects
- Get aggregated statistics per subject
- Get student activity logs

## Design Considerations
- Use charts library (recharts) for visualizations
- Implement real-time updates for active student data
- Mobile-responsive design for tablet use in classroom
- Export functionality for reports (PDF/CSV)
- Implement caching for frequently accessed data
- Consider pagination for large student lists


Admin Dashboard
# Admin Dashboard (Panel de Administrador)

## Overview
The Admin Dashboard is the highest-level control panel for platform administrators to manage all schools/universities, users, and system-wide settings across the entire DLP Academy platform.

## Access Requirements
- **User Role**: `admin`
- **Route**: `/admin-dashboard`
- **Navigation**: Accessible via the "Panel Admin" button in the Header (only visible to users with admin role)

## Main Features

### 1. Schools/Universities Management Tab
**Purpose**: Manage all educational institutions using the platform

**Features**:
- **Schools Table**: Display all registered schools/universities
  - School Name
  - School ID
  - School Admin Email
  - Total Teachers Count
  - Total Students Count
  - Subscription Status (Active, Trial, Expired)
  - Subscription Tier (Free, Pro, Enterprise)
  - Registration Date
  - Status (Active/Suspended)

- **Search & Filters**:
  - Search by school name or admin email
  - Filter by subscription status
  - Filter by subscription tier
  - Filter by activity status
  - Sort by student count, teacher count, or registration date

- **Quick Actions**:
  - Click on school to view detailed analytics (navigate to `/admin/school/:schoolId`)
  - Add new school
  - Suspend/activate school
  - Manage subscription
  - Contact school admin

- **Add New School**:
  - School name
  - School admin email (will receive setup instructions)
  - Subscription tier selection
  - Initial configuration (logo, colors, etc.)

### 2. Global User Management Tab
**Purpose**: View and manage all users across all schools

**Features**:
- **User Filters**:
  - Filter by role (Admin, School Admin, Teacher, Student)
  - Filter by school
  - Filter by status (Active, Suspended, Pending Verification)
  - Search by email or name

- **Users Table**:
  - Email
  - Name
  - Role
  - School Name
  - Status
  - Last Login
  - Registration Date

- **Bulk Actions**:
  - Export user data (CSV/PDF)
  - Send mass notifications
  - Suspend multiple accounts
  - Role management

### 3. Platform Analytics Tab
**Purpose**: High-level analytics for the entire platform

**Features**:
- **Key Metrics Dashboard**:
  - Total Schools
  - Total Users (breakdown by role)
  - Total Active Users (last 30 days)
  - Total Subjects Created
  - Total Topics/Content Items
  - Average Engagement Rate
  - Platform Growth Rate (monthly)

- **Charts & Visualizations**:
  - User growth over time (line chart)
  - Schools by subscription tier (pie chart)
  - Active users by school (bar chart)
  - Content creation trends (area chart)
  - Geographic distribution of schools (map - if applicable)

- **Usage Statistics**:
  - Most active schools (by user engagement)
  - Most used features
  - Peak usage times
  - Average session duration
  - Content completion rates across platform

### 4. Subscription Management Tab
**Purpose**: Manage subscriptions and billing

**Features**:
- **Subscription Plans Configuration**:
  - Define tier features (Free, Pro, Enterprise)
  - Set pricing
  - Manage feature flags per tier

- **Schools by Subscription**:
  - List schools per tier
  - Upcoming renewals
  - Expired subscriptions
  - Trial accounts expiring soon

- **Financial Overview**:
  - Monthly recurring revenue (MRR)
  - Active subscriptions count
  - Churn rate
  - Revenue by tier

### 5. System Settings Tab
**Purpose**: Configure platform-wide settings

**Features**:
- **Platform Configuration**:
  - Default theme settings
  - Default language
  - Session timeout settings
  - Password requirements
  - Email notification templates
  - Terms of Service / Privacy Policy links

- **Feature Flags**:
  - Enable/disable features globally
  - Beta feature rollout controls
  - Maintenance mode toggle

- **Security Settings**:
  - Two-factor authentication requirements
  - IP whitelisting (if needed)
  - Login attempt limits
  - Session security settings

### 6. Content Moderation Tab
**Purpose**: Monitor and moderate platform content

**Features**:
- **Flagged Content Review**:
  - List of content flagged by users or automatic systems
  - Review and approve/reject shared content
  - Remove inappropriate content

- **Content Statistics**:
  - Total public subjects/content
  - Most shared subjects
  - Content creation by school

## School Detail Page
**Route**: `/admin/school/:schoolId`

**Features**:
- **School Profile**:
  - School name, logo, contact info
  - School admin details
  - Subscription information
  - Registration and activity dates

- **School Analytics**:
  - User count breakdown (teachers/students)
  - Active users (last 7/30 days)
  - Content created (subjects, topics)
  - Average engagement metrics
  - Growth trends

- **User Management** (for this school):
  - List all teachers
  - List all students
  - Promote users to school admin
  - Suspend/activate users

- **Subscription Management**:
  - Current tier and features
  - Upgrade/downgrade subscription
  - Extend trial period
  - View billing history

- **Customization Preview**:
  - View school's custom branding
  - Preview their customized interface

- **Actions**:
  - Contact school admin
  - Suspend/activate school
  - Export school data
  - Delete school (with confirmation)

## Technical Implementation Notes

### Data Structure Required
```javascript
// School/University document in Firestore
{
  id: string,
  name: string,
  logo: string, // URL to logo
  primaryColor: string,
  secondaryColor: string,
  adminEmail: string,
  adminId: string, // Reference to school admin user
  subscriptionTier: 'free' | 'pro' | 'enterprise',
  subscriptionStatus: 'active' | 'trial' | 'expired' | 'suspended',
  subscriptionStartDate: timestamp,
  subscriptionEndDate: timestamp,
  trialEndDate: timestamp,
  teacherCount: number,
  studentCount: number,
  status: 'active' | 'suspended',
  createdAt: timestamp,
  lastActivity: timestamp,
  settings: {
    // Custom settings per school
  }
}

// Admin user document
{
  id: string,
  email: string,
  displayName: string,
  role: 'admin',
  permissions: string[], // Array of permission flags
  lastLogin: timestamp,
}

// Platform Analytics Collection (aggregated data)
{
  date: timestamp,
  totalSchools: number,
  totalUsers: number,
  activeUsers: number,
  totalSubjects: number,
  totalTopics: number,
  // ... other metrics
}
```

### Components to Create
1. `AdminDashboard.jsx` - Main container
2. `SchoolsTable.jsx` - Schools management table
3. `GlobalUsersTable.jsx` - All users table
4. `PlatformAnalytics.jsx` - Platform-wide analytics
5. `SchoolDetailView.jsx` - Detailed school page
6. `SubscriptionManager.jsx` - Subscription management
7. `SystemSettings.jsx` - Platform settings
8. `AnalyticsDashboard.jsx` - Charts and metrics

### Firebase Queries Needed
- Get all schools with pagination
- Get aggregated user counts per school
- Get platform-wide statistics
- Get subscription data
- Get activity logs and analytics
- Get content moderation queue

### Security Considerations
- Implement strict admin role verification
- Audit log for all admin actions
- Two-factor authentication required for admin accounts
- Rate limiting on sensitive operations
- Encrypt sensitive school data
- Implement data retention policies
- GDPR compliance for data export/deletion

## Design Considerations
- Professional, data-dense interface
- Advanced filtering and search capabilities
- Bulk action support
- Export functionality (CSV, PDF, JSON)
- Real-time updates for critical metrics
- Responsive design for large datasets
- Color-coded status indicators
- Confirmation dialogs for destructive actions
- Activity audit trail
- Performance optimization for large-scale data

## Advanced Features (Future)
- AI-powered insights and recommendations
- Automated anomaly detection (unusual activity patterns)
- Predictive analytics for churn prevention
- Automated billing and invoicing
- Integration with payment gateways
- White-label capabilities for enterprise clients
- Multi-language support management
- A/B testing framework for features
- Advanced reporting and custom dashboards

# Dashboard Routing Configuration

## React Router Setup

Add the following routes to your main routing configuration (usually in `App.jsx` or `Routes.jsx`):

```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SchoolAdminDashboard from './pages/SchoolAdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard'; // TODO: Create this component
import AdminDashboard from './pages/AdminDashboard'; // TODO: Create this component

// Protected Route Component
const ProtectedRoute = ({ user, requiredRole, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

function App() {
  const [user, setUser] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        {/* ... existing routes ... */}
        
        {/* School Admin Dashboard */}
        <Route 
          path="/school-admin-dashboard" 
          element={
            <ProtectedRoute user={user} requiredRole="schooladmin">
              <SchoolAdminDashboard user={user} />
            </ProtectedRoute>
          } 
        />
        
        {/* School Admin - Teacher Detail */}
        <Route 
          path="/teacher/:teacherId" 
          element={
            <ProtectedRoute user={user} requiredRole="schooladmin">
              <TeacherDetailView user={user} />
            </ProtectedRoute>
          } 
        />
        
        {/* School Admin - Student Detail */}
        <Route 
          path="/student/:studentId" 
          element={
            <ProtectedRoute user={user} requiredRole="schooladmin">
              <StudentDetailView user={user} />
            </ProtectedRoute>
          } 
        />
        
        {/* Teacher Dashboard */}
        <Route 
          path="/teacher-dashboard" 
          element={
            <ProtectedRoute user={user} requiredRole="teacher">
              <TeacherDashboard user={user} />
            </ProtectedRoute>
          } 
        />
        
        {/* Teacher - Student Detail */}
        <Route 
          path="/teacher/student/:studentId" 
          element={
            <ProtectedRoute user={user} requiredRole="teacher">
              <TeacherStudentDetailView user={user} />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Dashboard */}
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute user={user} requiredRole="admin">
              <AdminDashboard user={user} />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin - School Detail */}
        <Route 
          path="/admin/school/:schoolId" 
          element={
            <ProtectedRoute user={user} requiredRole="admin">
              <SchoolDetailView user={user} />
            </ProtectedRoute>
          } 
        />
        
      </Routes>
    </BrowserRouter>
  );
}
```

## Firestore Data Model

### User Roles Hierarchy
```
admin (highest privilege)
  └── Can access: Admin Dashboard, all schools, all users
  
schooladmin
  └── Can access: School Admin Dashboard, teachers/students in their school
  
teacher
  └── Can access: Teacher Dashboard, their assigned students
  
student (lowest privilege)
  └── Can access: Only their own content, no dashboard
```

### Required Firestore Collections

#### users Collection
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  photoURL: string,
  role: 'admin' | 'schooladmin' | 'teacher' | 'student',
  schoolId: string, // Reference to school (null for admin)
  enabled: boolean, // Can be disabled by school admin
  createdAt: timestamp,
  lastLogin: timestamp,
  theme: 'light' | 'dark',
  // For teachers
  subjects: string[], // Array of subject IDs they teach
  classes: string[], // Array of class IDs they manage
  // For students
  teacherId: string, // Reference to assigned teacher
  enrolledSubjects: string[], // Array of subject IDs
  classId: string, // Reference to class
}
```

#### schools Collection
```javascript
{
  id: string,
  name: string,
  logo: string,
  primaryColor: string,
  secondaryColor: string,
  adminId: string, // Reference to school admin user
  adminEmail: string,
  subscriptionTier: 'free' | 'pro' | 'enterprise',
  subscriptionStatus: 'active' | 'trial' | 'expired' | 'suspended',
  createdAt: timestamp,
  settings: {
    schoolName: string,
    allowStudentRegistration: boolean,
    requireEmailVerification: boolean,
    // ... other customization settings
  }
}
```

#### studentProgress Collection
```javascript
{
  id: string,
  studentId: string,
  subjectId: string,
  topicId: string,
  completionPercentage: number,
  quizScores: number[],
  lastAccessed: timestamp,
  timeSpent: number, // in minutes
  attempts: number,
}
```

## Firebase Security Rules

Update your `firestore.rules` to enforce role-based access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    function isAdmin() {
      return isAuthenticated() && getUserRole() == 'admin';
    }
    
    function isSchoolAdmin() {
      return isAuthenticated() && getUserRole() == 'schooladmin';
    }
    
    function isTeacher() {
      return isAuthenticated() && getUserRole() == 'teacher';
    }
    
    function isSameSchool(schoolId) {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.schoolId == schoolId;
    }
    
    // Users collection
    match /users/{userId} {
      // Anyone can read their own user document
      allow read: if isAuthenticated() && request.auth.uid == userId;
      
      // School admin can read/write users in their school
      allow read, write: if isSchoolAdmin() && isSameSchool(resource.data.schoolId);
      
      // Teachers can read students in their school
      allow read: if isTeacher() && isSameSchool(resource.data.schoolId) && resource.data.role == 'student';
      
      // Admins can read/write all users
      allow read, write: if isAdmin();
    }
    
    // Schools collection
    match /schools/{schoolId} {
      // School admins can read their school
      allow read: if isSchoolAdmin() && isSameSchool(schoolId);
      
      // Admins can read/write all schools
      allow read, write: if isAdmin();
    }
    
    // Student progress collection
    match /studentProgress/{progressId} {
      // Students can read/write their own progress
      allow read, write: if isAuthenticated() && resource.data.studentId == request.auth.uid;
      
      // Teachers can read progress of students in their school
      allow read: if isTeacher() && isSameSchool(get(/databases/$(database)/documents/users/$(resource.data.studentId)).data.schoolId);
      
      // School admins can read all progress in their school
      allow read: if isSchoolAdmin() && isSameSchool(get(/databases/$(database)/documents/users/$(resource.data.studentId)).data.schoolId);
      
      // Admins can read all progress
      allow read: if isAdmin();
    }
  }
}
```

## Environment Setup

### Required Dependencies
```bash
npm install recharts # For charts in dashboards
npm install date-fns # For date formatting
npm install react-hot-toast # For notifications (optional)
```

### Firebase Config
Ensure your Firebase configuration includes Firestore:

```javascript
// firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // ... your config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

## Testing Checklist

### School Admin Dashboard
- [ ] Only accessible to users with role 'schooladmin'
- [ ] Displays teachers from the same school only
- [ ] Displays students from the same school only
- [ ] Can toggle teacher/student status (enabled/disabled)
- [ ] Search functionality works correctly
- [ ] Filter by status works correctly
- [ ] Navigation to teacher/student detail pages works
- [ ] Add new teacher/student modal appears (placeholder)

### Teacher Dashboard (When implemented)
- [ ] Only accessible to users with role 'teacher'
- [ ] Displays students assigned to the teacher
- [ ] Shows subject statistics
- [ ] Navigation to student detail page works

### Admin Dashboard (When implemented)
- [ ] Only accessible to users with role 'admin'
- [ ] Displays all schools
- [ ] Shows platform-wide analytics
- [ ] Can manage subscriptions
- [ ] Navigation to school detail page works

### Header Navigation
- [ ] Admin sees "Panel Admin" button
- [ ] School Admin sees "Panel Escuela" button
- [ ] Teacher sees "Panel Profesor" button
- [ ] Student sees NO panel button
- [ ] Clicking panel button navigates to correct dashboard

## Next Steps

1. **Test School Admin Dashboard**:
   - Create a test user with role 'schooladmin'
   - Add test teachers and students to the same school
   - Test all functionality

2. **Implement Teacher Dashboard**:
   - Follow the structure in TEACHER_DASHBOARD_README.md
   - Create TeacherDashboard.jsx component
   - Implement student table and statistics

3. **Implement Admin Dashboard**:
   - Follow the structure in ADMIN_DASHBOARD_README.md
   - Create AdminDashboard.jsx component
   - Implement schools table and analytics

4. **Create Detail Views**:
   - TeacherDetailView.jsx (for school admin)
   - StudentDetailView.jsx (for school admin)
   - TeacherStudentDetailView.jsx (for teachers)
   - SchoolDetailView.jsx (for admin)