ReadMe
You are a deeply professional developer. You are going to make deep analysis and resolutions on a large and professional web designed for education with ai. You must perform the changes of the following topics. But first, you have to understand the whole codebase, superficially, but you have to know where you are and where are all the things. Then you have to follow some instructions: you will first analyse all the requested changes or actions, understand them, and connect them(if one needs permissions and the other one is related to them, or maybe one has information for another one); then create an order based on the connections they have. You must then deeply understand each one, what is the objective, analyse the code that will be changed on the codebase and how to perform that change, security risks that may have, you have to cover it; ensure that the change is performed on the most efficient and optimized way, creating new files for cleaner code or reusing some hooks, components or anything that was previously created. After that execute the change, but be very aware of what you are doing, make changes lossless so other external features aren’t lost; perform lint to clean the code and optimize it; check that it works using tests if possible. Ensure it has been completely solved. Then review it, check whether something is missing, and then solve it. Do not ask questions, you are on autopilot. 
Create a plan like from the protocol with subplans for each one where you log everything so you know how to continue and what to do next, so we don't lose track of the changes and everything

Firestore Permissions
When a teacher tries to create a subject, it gets: POST https://firestore.googleapis.com/v1/projects/dlp-academ/databases/(default)/documents:batchGet?key=AIza...REDACTED 403 (Forbidden)
345.e.send @ injectScriptAdjust.js:1
h.ea @ firebase_firestore.js?v=66228a36:1853
(anonymous) @ firebase_firestore.js?v=66228a36:12585
zo @ firebase_firestore.js?v=66228a36:12544
Wo @ firebase_firestore.js?v=66228a36:12443
jo @ firebase_firestore.js?v=66228a36:12448
(anonymous) @ firebase_firestore.js?v=66228a36:13076
Promise.then
jo @ firebase_firestore.js?v=66228a36:13076
__PRIVATE_invokeBatchGetDocumentsRpc @ firebase_firestore.js?v=66228a36:15213
lookup @ firebase_firestore.js?v=66228a36:15225
get @ firebase_firestore.js?v=66228a36:18096
get @ firebase_firestore.js?v=66228a36:18141
(anonymous) @ useSubjects.ts:309
(anonymous) @ firebase_firestore.js?v=66228a36:18159
Ju @ firebase_firestore.js?v=66228a36:15328
(anonymous) @ firebase_firestore.js?v=66228a36:15314
(anonymous) @ firebase_firestore.js?v=66228a36:12752
(anonymous) @ firebase_firestore.js?v=66228a36:13546
(anonymous) @ firebase_firestore.js?v=66228a36:16053
(anonymous) @ firebase_firestore.js?v=66228a36:16084
Promise.then
cc @ firebase_firestore.js?v=66228a36:16084
enqueue @ firebase_firestore.js?v=66228a36:16053
enqueueAndForget @ firebase_firestore.js?v=66228a36:16035
handleDelayElapsed @ firebase_firestore.js?v=66228a36:13546
(anonymous) @ firebase_firestore.js?v=66228a36:13526
setTimeout
start @ firebase_firestore.js?v=66228a36:13526
createAndSchedule @ firebase_firestore.js?v=66228a36:13519
enqueueAfterDelay @ firebase_firestore.js?v=66228a36:16093
p_ @ firebase_firestore.js?v=66228a36:12752
Hu @ firebase_firestore.js?v=66228a36:15313
ju @ firebase_firestore.js?v=66228a36:15310
(anonymous) @ firebase_firestore.js?v=66228a36:15601
await in (anonymous)
(anonymous) @ firebase_firestore.js?v=66228a36:16053
(anonymous) @ firebase_firestore.js?v=66228a36:16084
Promise.then
cc @ firebase_firestore.js?v=66228a36:16084
enqueue @ firebase_firestore.js?v=66228a36:16053
enqueueAndForget @ firebase_firestore.js?v=66228a36:16035
__PRIVATE_firestoreClientTransaction @ firebase_firestore.js?v=66228a36:15599
runTransaction @ firebase_firestore.js?v=66228a36:18159
addSubject @ useSubjects.ts:308
await in addSubject
handleSaveSubject @ useHomeHandlers.ts:157
handleSubmit @ SubjectFormModal.tsx:585
executeDispatch @ react-dom_client.js?v=66228a36:13622
runWithFiberInDEV @ react-dom_client.js?v=66228a36:997
processDispatchQueue @ react-dom_client.js?v=66228a36:13658
(anonymous) @ react-dom_client.js?v=66228a36:14071
batchedUpdates$1 @ react-dom_client.js?v=66228a36:2626
dispatchEventForPluginEventSystem @ react-dom_client.js?v=66228a36:13763
dispatchEvent @ react-dom_client.js?v=66228a36:16784
dispatchDiscreteEvent @ react-dom_client.js?v=66228a36:16765Understand this error
useSubjects.ts:309 [2026-04-02T07:57:42.212Z]  @firebase/firestore: Firestore (12.8.0): RestConnection RPC 'BatchGetDocuments' 0x8f0236d2 failed with error:  {"code":"permission-denied","name":"FirebaseError"} url:  https://firestore.googleapis.com/v1/projects/dlp-academ/databases/(default)/documents:batchGet?key=AIza...REDACTED request: {"documents":["projects/dlp-academ/databases/(default)/documents/subjectInviteCodes/OfvtfLA39z0ahpnwwKPC_ZTW2GMK5"]}
defaultLogHandler @ chunk-TQ6CG7TX.js?v=66228a36:1220
warn @ chunk-TQ6CG7TX.js?v=66228a36:1284
__PRIVATE_logWarn @ firebase_firestore.js?v=66228a36:2570
(anonymous) @ firebase_firestore.js?v=66228a36:12444
Promise.then
Wo @ firebase_firestore.js?v=66228a36:12443
jo @ firebase_firestore.js?v=66228a36:12448
(anonymous) @ firebase_firestore.js?v=66228a36:13076
Promise.then
jo @ firebase_firestore.js?v=66228a36:13076
__PRIVATE_invokeBatchGetDocumentsRpc @ firebase_firestore.js?v=66228a36:15213
lookup @ firebase_firestore.js?v=66228a36:15225
get @ firebase_firestore.js?v=66228a36:18096
get @ firebase_firestore.js?v=66228a36:18141
(anonymous) @ useSubjects.ts:309
(anonymous) @ firebase_firestore.js?v=66228a36:18159
Ju @ firebase_firestore.js?v=66228a36:15328
(anonymous) @ firebase_firestore.js?v=66228a36:15314
(anonymous) @ firebase_firestore.js?v=66228a36:12752
(anonymous) @ firebase_firestore.js?v=66228a36:13546
(anonymous) @ firebase_firestore.js?v=66228a36:16053
(anonymous) @ firebase_firestore.js?v=66228a36:16084
Promise.then
cc @ firebase_firestore.js?v=66228a36:16084
enqueue @ firebase_firestore.js?v=66228a36:16053
enqueueAndForget @ firebase_firestore.js?v=66228a36:16035
handleDelayElapsed @ firebase_firestore.js?v=66228a36:13546
(anonymous) @ firebase_firestore.js?v=66228a36:13526
setTimeout
start @ firebase_firestore.js?v=66228a36:13526
createAndSchedule @ firebase_firestore.js?v=66228a36:13519
enqueueAfterDelay @ firebase_firestore.js?v=66228a36:16093
p_ @ firebase_firestore.js?v=66228a36:12752
Hu @ firebase_firestore.js?v=66228a36:15313
ju @ firebase_firestore.js?v=66228a36:15310
(anonymous) @ firebase_firestore.js?v=66228a36:15601
await in (anonymous)
(anonymous) @ firebase_firestore.js?v=66228a36:16053
(anonymous) @ firebase_firestore.js?v=66228a36:16084
Promise.then
cc @ firebase_firestore.js?v=66228a36:16084
enqueue @ firebase_firestore.js?v=66228a36:16053
enqueueAndForget @ firebase_firestore.js?v=66228a36:16035
__PRIVATE_firestoreClientTransaction @ firebase_firestore.js?v=66228a36:15599
runTransaction @ firebase_firestore.js?v=66228a36:18159
addSubject @ useSubjects.ts:308
await in addSubject
handleSaveSubject @ useHomeHandlers.ts:157
handleSubmit @ SubjectFormModal.tsx:585
executeDispatch @ react-dom_client.js?v=66228a36:13622
runWithFiberInDEV @ react-dom_client.js?v=66228a36:997
processDispatchQueue @ react-dom_client.js?v=66228a36:13658
(anonymous) @ react-dom_client.js?v=66228a36:14071
batchedUpdates$1 @ react-dom_client.js?v=66228a36:2626
dispatchEventForPluginEventSystem @ react-dom_client.js?v=66228a36:13763
dispatchEvent @ react-dom_client.js?v=66228a36:16784
dispatchDiscreteEvent @ react-dom_client.js?v=66228a36:16765Understand this warning
useHomeHandlers.ts:167 Error saving subject: FirebaseError: Missing or insufficient permissions.
handleSaveSubject @ useHomeHandlers.ts:167
await in handleSaveSubject
handleSubmit @ SubjectFormModal.tsx:585
executeDispatch @ react-dom_client.js?v=66228a36:13622
runWithFiberInDEV @ react-dom_client.js?v=66228a36:997
processDispatchQueue @ react-dom_client.js?v=66228a36:13658
(anonymous) @ react-dom_client.js?v=66228a36:14071
batchedUpdates$1 @ react-dom_client.js?v=66228a36:2626
dispatchEventForPluginEventSystem @ react-dom_client.js?v=66228a36:13763
dispatchEvent @ react-dom_client.js?v=66228a36:16784
dispatchDiscreteEvent @ react-dom_client.js?v=66228a36:16765Understand this error


There are also issues with deleting subjects, but this time there is nothing on console, so I don’t know what is happening, I know that the global admin can do it with no problems, but the teacher or institution admin not.
The deletion of folders is wrong, because they are being deleted, but not from the bin section. They should be first moved to the bin section and then deleted there when pressed deleted or when the 15 days have passed.
Institution Admin Dashboard
On the institution admin dashboard, on the customization section, I want that there is an exact, exact replica of the web on the preview but with mock data(mock subjects, folders, topics, documents, everything) so the institution admin can check how are the different configurations affecting the web. But it must be an exact replica, how can we do this? Should we use the home component and so? Should we create a specific mockstudent@domain and mockteacher@domain for each institution that is an account that only the institution admin can enter on that preview with like a live preview of these mocks? Make an audit and decide the best path.
Make that the nav icon on the customization tab works correctly, because it is not working, it gives this error: useCustomization.ts:103  POST https://firebasestorage.googleapis.com/v0/b/dlp-academ.firebasestorage.app/o?name=institutions%2FOfvtfLA39z0ahpnwwKPC%2Fbranding%2Ficon.png 403 (Forbidden)
send @ firebase_storage.js?v=66228a36:1498
doTheRequest @ firebase_storage.js?v=66228a36:456
(anonymous) @ firebase_storage.js?v=66228a36:279
setTimeout
callWithDelay @ firebase_storage.js?v=66228a36:277
start @ firebase_storage.js?v=66228a36:337
start_ @ firebase_storage.js?v=66228a36:510
(anonymous) @ firebase_storage.js?v=66228a36:432
NetworkRequest @ firebase_storage.js?v=66228a36:429
makeRequest @ firebase_storage.js?v=66228a36:562
_makeRequest @ firebase_storage.js?v=66228a36:2417
makeRequestWithTokens @ firebase_storage.js?v=66228a36:2430
await in makeRequestWithTokens
uploadBytes$1 @ firebase_storage.js?v=66228a36:2146
uploadBytes @ firebase_storage.js?v=66228a36:2442
handleIconUpload @ useCustomization.ts:103
executeDispatch @ react-dom_client.js?v=66228a36:13622
runWithFiberInDEV @ react-dom_client.js?v=66228a36:997
processDispatchQueue @ react-dom_client.js?v=66228a36:13658
(anonymous) @ react-dom_client.js?v=66228a36:14071
batchedUpdates$1 @ react-dom_client.js?v=66228a36:2626
dispatchEventForPluginEventSystem @ react-dom_client.js?v=66228a36:13763
dispatchEvent @ react-dom_client.js?v=66228a36:16784
dispatchDiscreteEvent @ react-dom_client.js?v=66228a36:16765
<input>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=66228a36:247
ImageCard @ BrandingSection.tsx:256
react_stack_bottom_frame @ react-dom_client.js?v=66228a36:18509
renderWithHooks @ react-dom_client.js?v=66228a36:5654
updateFunctionComponent @ react-dom_client.js?v=66228a36:7475
beginWork @ react-dom_client.js?v=66228a36:8525
runWithFiberInDEV @ react-dom_client.js?v=66228a36:997
performUnitOfWork @ react-dom_client.js?v=66228a36:12561
workLoopSync @ react-dom_client.js?v=66228a36:12424
renderRootSync @ react-dom_client.js?v=66228a36:12408
performWorkOnRoot @ react-dom_client.js?v=66228a36:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=66228a36:13505
performWorkUntilDeadline @ react-dom_client.js?v=66228a36:36
<ImageCard>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=66228a36:247
BrandingSection @ BrandingSection.tsx:361
react_stack_bottom_frame @ react-dom_client.js?v=66228a36:18509
renderWithHooks @ react-dom_client.js?v=66228a36:5654
updateFunctionComponent @ react-dom_client.js?v=66228a36:7475
beginWork @ react-dom_client.js?v=66228a36:8525
runWithFiberInDEV @ react-dom_client.js?v=66228a36:997
performUnitOfWork @ react-dom_client.js?v=66228a36:12561
workLoopSync @ react-dom_client.js?v=66228a36:12424
renderRootSync @ react-dom_client.js?v=66228a36:12408
performWorkOnRoot @ react-dom_client.js?v=66228a36:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=66228a36:13505
performWorkUntilDeadline @ react-dom_client.js?v=66228a36:36
<BrandingSection>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=66228a36:247
CustomizationTab @ CustomizationTab.tsx:71
react_stack_bottom_frame @ react-dom_client.js?v=66228a36:18509
renderWithHooks @ react-dom_client.js?v=66228a36:5654
updateFunctionComponent @ react-dom_client.js?v=66228a36:7475
beginWork @ react-dom_client.js?v=66228a36:8525
runWithFiberInDEV @ react-dom_client.js?v=66228a36:997
performUnitOfWork @ react-dom_client.js?v=66228a36:12561
workLoopSync @ react-dom_client.js?v=66228a36:12424
renderRootSync @ react-dom_client.js?v=66228a36:12408
performWorkOnRoot @ react-dom_client.js?v=66228a36:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=66228a36:13505
performWorkUntilDeadline @ react-dom_client.js?v=66228a36:36
<CustomizationTab>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=66228a36:247
InstitutionAdminDashboard @ InstitutionAdminDashboard.tsx:144
react_stack_bottom_frame @ react-dom_client.js?v=66228a36:18509
renderWithHooks @ react-dom_client.js?v=66228a36:5654
updateFunctionComponent @ react-dom_client.js?v=66228a36:7475
beginWork @ react-dom_client.js?v=66228a36:8525
runWithFiberInDEV @ react-dom_client.js?v=66228a36:997
performUnitOfWork @ react-dom_client.js?v=66228a36:12561
workLoopSync @ react-dom_client.js?v=66228a36:12424
renderRootSync @ react-dom_client.js?v=66228a36:12408
performWorkOnRoot @ react-dom_client.js?v=66228a36:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=66228a36:13505
performWorkUntilDeadline @ react-dom_client.js?v=66228a36:36
<InstitutionAdminDashboard>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=66228a36:247
App @ App.tsx:309
react_stack_bottom_frame @ react-dom_client.js?v=66228a36:18509
renderWithHooks @ react-dom_client.js?v=66228a36:5654
updateFunctionComponent @ react-dom_client.js?v=66228a36:7475
beginWork @ react-dom_client.js?v=66228a36:8525
runWithFiberInDEV @ react-dom_client.js?v=66228a36:997
performUnitOfWork @ react-dom_client.js?v=66228a36:12561
workLoopSync @ react-dom_client.js?v=66228a36:12424
renderRootSync @ react-dom_client.js?v=66228a36:12408
performWorkOnRoot @ react-dom_client.js?v=66228a36:11766
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=66228a36:13505
performWorkUntilDeadline @ react-dom_client.js?v=66228a36:36
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=66228a36:247
(anonymous) @ main.tsx:14Understand this error
useCustomization.ts:112 Error uploading institution icon: FirebaseError: Firebase Storage: User does not have permission to access 'institutions/OfvtfLA39z0ahpnwwKPC/branding/icon.png'. (storage/unauthorized)

Add pagination on the dashboards for the large lists of students or teachers to reduce the number of requests.
Ensure that the policy options of the institution admin work perfectly when applied(the requerir código dinámico, Los profesores pueden crear asignaturas sin aprobación del administrador, Los profesores pueden asignar clases y estudiantes sin permiso del administrador and 
Los profesores pueden eliminar asignaturas con estudiantes asociados sin permiso del administrador).
On the institution admin dashboard, on the classes and courses, make the field for the academic year be mandatory to have the format year1-year2, make that it automatically fills it with the current academic year(if for example we are between july and december, make it start on the current year, and if it is not, make it start on the previous year and end on the current year), but then make it be able to be changed, but compute the previous 20 years and the next 10 years so they can be selected on a calendar like pop up with the different years inside this range.
We have to make a decision on the academic year, should we only link the subjects to the academic year or the courses? Because if we make the academic year mandatory on the courses, then the subjects within that course will have the academic year autofilled, and this time not able to be changed. The thing is that once the academic year has finished, which we have to decide whether that is decided by each teacher on each subject or have on the institution admin configuration parameters one for the start and end of the academic year, which will automatically start and end the courses based on that, then the subjects have to disappear from the manual tab of the users, and there will only be seen on the courses/usage tab, but with an indication that they are ended, this can be made by changing saturation/opacity of the color or with or have like a badge or like a marcapáginas on the upper left corner of the subject card with an indicator. This one should change based on the user, a teacher should see it yellow, but a student should see it with a color varying from red to green, depending on the grade and if it has passed the subject. Another important thing to take into account is that by using the courses section, we do not need the history tab, it is unnecessary and should be removed, as well as the three dots option to send it there. Not only that, we should include on the courses and usage tab an option to only see the active/current subjects, so it is not a mess, and also, the filter should have on these tabs the option to filter by year. In fact, we are going to do the following: only on the course tab, there will be an academic year option right next to the filtrar button, this button must have options when clicking to select the academic year range(use the calendar like card where all academic years appear and let the user select an start academic year and an end academic year, make only the existing academic years appear, make it have pagination if there are more than 10 with 10 in each page). After selecting the year, if there is only 1 academic year, use the same layout as right now, having the subjects ordered within each course collapsable group. But if there are more than 1, make that each year has a collapsable extensible group with the collapsable courses group of each year. Make the collapsables be collapsed at the beginning, so it is easier to move around. Make these selections persistent for the user. Also, on the situation that there is more than 1 academic year, add to the courses collapsable titles the year inside a parenthesis like 1º Bachillerato (2025-2026).
Institution admin will have an option on the course to delete a whole course or a class, when deleting a course, the subjects and every topic, document and so will be also deleted, so make it first go to a bin that will appear on the institution admin dashboard and where it can be deleted, but first with a confirmation overlay and for deleting make the institution admin type the name of the course/class.
Selection Mode
Make a huge improve on the selection mode ui.
Ensure that all features work with no permission errors and they do what they are supposed to do. Make a deep analysis on this to ensure it.

Home bin
Make the home bin section have an ordering option to order by time urgency(less/more time to be deleted first) and by alphabetic order(ascendant and descendant).
Include the selection mode here but only to delete or recover, so multiple subjects or folders can be deleted or recovered.
Ensure that when a folder is moved to the folder(folder deletion on the other tabs have 3 options: to cancel the operation, to only delete the folder and to delete the folder and everything inside), when deleting just the folder, it must immediately delete the folder(no passing through the bin); and if deleting the folder and the elements inside, it must move it to the bin, with all of its elements, but only the folder should appear, the other elements should not appear on the same layer as the folder, instead, make the folder be accessible from the bin and the elements can be individually deleted or recovered.
Escala & Filtrar
I don’t know why but the first time pressing the escala and filtrar buttons of the home page when reloading the page, they have like an animation where they come from the upper left to the final point. I don’t want any animation that does that, take it out.
Admin dashboard
On the admin dashboard, on the instituciones tab, make take out the > sign to enter the institution and make that when pressing over the institution it directly sends the admin to the institution admin dashboard of that institution.
Institution admin and teacher
I don’t know if the institution admin should be allowed to be also a teacher and have classes and subjects and so, or just use it for the web configuration, settings and management, make a great audit on this and decide. If this is not allowed, we would have to deal with having the same email with two different accounts and roles, if we have this we may have a button for the institution admins to change between the teacher and the institution admin view or something like that to prevent the error with the same email and so.
