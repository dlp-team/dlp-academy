1. Data Structure Evolution
Make the course field of a subject be mandatory and required.

It should support multiple access vectors:

Bulk Access: supplement the course field with a classId. This links the subject to a specific cohort.

Individual Access: Add an enrolledStudentUids array to the subject document. This stores the UIDs of students who joined via a code, regardless of their assigned class.

Discovery: Add a unique inviteCode to each subject during creation to facilitate these manual joins.

2. Subject Creation & Assignment
When a teacher creates a subject, the flow should change:

Teachers should have the ability to create a new subject and share it with classes with no permission of the institution admin(by default), this will be an option of the institution that can be changed on the institutionadmindashboard or on the admin dashboard.

The teacher selects a Course (academic level) and then a specific Class (group).

The system generates a unique inviteCode automatically that will only work inside the institutionId users.

The subject document is initialized with an empty enrolledStudentUids array, ready for individual students.

3. Permission & Query Logic
You must update how the application "sees" subjects. Instead of a simple where clause, use a logical OR query:

Teachers: Fetch where ownerId matches their UID.

Standard Students: Fetch where the subject's classId matches the student's classId.

Guest Students: Fetch where the student's UID exists within the subject's enrolledStudentUids array.

4. Transition & Archiving (The "Completed" State) - I'm not sure about this, audit is necessary before execution.
To handle students passing a subject without deleting data or cluttering the UI:

Avoid Deletion: Do not remove the shortcut or the student's ID from the subject, as they may need to review materials later. 

Make it invisible on the manual tab?
Disabling the user from entering quizzes or exams?

User-Level State: Store a completedSubjects array in the User's profile.

Frontend Filtering: The application should fetch all accessible subjects and then split them into two UI sections: "Active" (not in the completed array) and "History/Archived" (present in the completed array).