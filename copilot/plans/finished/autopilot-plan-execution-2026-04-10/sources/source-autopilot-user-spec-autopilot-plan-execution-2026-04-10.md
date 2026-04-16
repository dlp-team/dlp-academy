<!-- copilot/plans/finished/autopilot-plan-execution-2026-04-10/sources/source-autopilot-user-spec-autopilot-plan-execution-2026-04-10.md -->
ReadMe
You are a deeply professional developer. You are going to make deep analysis and resolutions on a large and professional web designed for education with ai. You must perform the changes of the following topics. But first, you have to understand the whole codebase, superficially, but you have to know where you are and where are all the things. Then you have to follow some instructions: you will first analyse all the requested changes or actions, understand them, and connect them(if one needs permissions and the other one is related to them, or maybe one has information for another one); then create an order based on the connections they have. You must then deeply understand each one, what is the objective, analyse the code that will be changed on the codebase and how to perform that change, security risks that may have, you have to cover it; ensure that the change is performed on the most efficient and optimized way, creating new files for cleaner code or reusing some hooks, components or anything that was previously created. After that execute the change, but be very aware of what you are doing, make changes lossless so other external features arenâ€™t lost; perform lint to clean the code and optimize it; check that it works using tests if possible. Ensure it has been completely solved. Then review it, check whether something is missing, and then solve it. Do not ask questions, you are on autopilot. 
Create a plan like from the protocol with subplans for each one where you log everything so you know how to continue and what to do next, so we don't lose track of the changes and everything
Notes:
BEFORE CREATING THE PLAN, DO THE FOLLOWING CHANGES TO COPILOT FILES:
Copilot
add to the plan creation protocol about the autopilot plan and the AUTOPILOT_EXECUTION_CHECKLIST(when autopilot plan has been mentioned, the plan creation protocol should use the autopilot_plan and follow the autopilot_execution_checklist). 
Also, include to the copilot-instructions and the agents.md that if an autopilot plan is mentioned or referenced on the prompt/chat, it must check if it exists and then use the AUTOPILOT_EXECUTION_CHECKLIST.
Add to the instructions that before merging, the autopilot must stop, it must first confirm that it can do it from the owner, it cannot merge until it has the permissions of a non-copilot(a real human).
Add a merge status to the branch log that will be used by copilot to know if it can merge or it has to wait until a real human lets it. A new rule must be configured to not let vscodequestions about if it wants to merge(when copilot is in autopilot). copilot can know if it is on autopilot by adding another autopilot status on the branch log to set up a flag where to store the current state of copilot(if it is on autopilot or not), and we have to include that copilot should set the flag to true on the execution_checklist of autopilot so it always does that when in autopilot. Add an step to the AUTOPILOT_EXECUTION_CHECKLIST to look for this on the merge step.


Selection Mode
When elements are selected on the selection mode, I want that they can be dragged and dropped on other elements, like with individual elements, and have the same behaviour as individual ones. But they must be dragged all at once, when dragging them, all the selected one should make a transition moving towards the one where it is being the drag made, and they must be mounted below this one so all move with the dragged. They must all be moved and on the ghost mode of the drag and drop, all the selected ones, not the one where dragging started.
Also, after performing an action(move to a folder, delete, etc), let the undo the whole action on all the selected/affected elements. Also, when pressing cntrl+z, after undoing it reactivates the selection mode, and I want that it does not do that, after undoing, do not activate again the selection mode. Also, when doing cntrl + z or undo on the notification, if the action was related to moving elements from a shared folder to outside this one and they were unshared, when doing the undo they come back to the shared folder, but they are not shared with the people from that folder, fix that. Also, when pressing the undo notification, only the first or the last one(i donâ€™t remember which one) is being undone instead of all of them.
When selection mode is active, make the crear nueva asignatura button do nothing when clicking, but donâ€™t hide it, because it is actually being hidden/unvisible and it must be visible so it can be used when dragging the selected to move them to another layer..
On the list mode, when pressing a folder during the selection mode and then pressing an element inside it, the border that shows it is selected is like cut off at the bottom part, like if it had been cropped from below, fix that.
Bin Section
On the bin section of the home mode, I want to make some improvements:
When the user is in grid mode and it presses an element, it is scaled, but if I press again on the same element, it like turns invisible and then goes ok, but it is not smooth and it disappears for an instant. 
Also, donâ€™t make the background change the opacity when pressing an element on the list mode, take that out.
Home notifications
On the home page, it sometimes shows a notification above the selection mode div and below the options div(the grid-list mode, scale, filter, search), and it shifts the whole page when it appears. I would prefer that it appears like when making an action on an element, the notification appears elegantly at the bottom left part for a few seconds and then goes away. Create if there isnâ€™t one yet a component to reuse this notification card so it can be centralized and easier to maintain for all notifications on the web.
Institution Admin Dashboard
This is a conversation I had with gemini:
Copilot has done what it wanted with that information about the institution admin dashboard. It has inserted the preview inside two or three divs that each have scrollbars(it is very strange), and it has returned to use a mock up preview that it has make up and does not represent the live state of the web, but a hardcoded version that is not even the same as the web. However, it has done a good job with the color things and updating on real time without saving. I want to add that the restablecer button returns to the previously saved version, not to the default one. It would be a good idea to include favorite colors or also to include an option to store and use set of colors that have been created, because the institution may change its colors for a while because of an event, but it may want to return to its original colors after that, so that would be helpful, add that also. Make a prompt solving these problems.

Gemini said
It is very common for AI agents to do exactly what you just described. When you ask an AI to render a complex route using existing local components, it often gets "lazy" or confused by the imports and decides it's much easier to just write a fake, hardcoded HTML mockup. It also tends to wrap things in overflow-y-scroll divs, creating that horrible double-scrollbar effect.

Since the color logic (postMessage) is working, we just need to strictly "leash" Copilot to fix the layout, enforce the real components, and add your excellent "Saved Themes" and "Reset" features.

Because Copilot hallucinated the last layout, do not give it one massive prompt. We need to execute this in three strict, separate steps.

Here are the prompts to copy and paste one by one.

Prompt 1: Destroying the Mockup & Fixing the Layout
This prompt forces Copilot to delete its fake HTML and implement a clean, single-scrollbar iframe.

Copy and paste this to Copilot:

"I need to fix the layout of the CustomizationTab.jsx preview section. You previously hallucinated a hardcoded HTML mockup and wrapped it in multiple divs with conflicting scrollbars. We are reverting to the strict iframe architecture.

Please execute the following in one session:

1. Delete the Hardcoded Mockup: Completely remove the fake HTML/UI you built for the preview.
2. Clean the Wrappers: Remove the nested divs that are causing double/triple scrollbars. The right side of the Customization Tab should just be a clean, flex container.
3. Insert the Iframe: Replace the deleted mockup with a simple, full-width, full-height iframe: <iframe src="/theme-preview" className="w-full h-full border-0 rounded-lg shadow-md" />.
4. Scrollbar Fix: Ensure the parent container of the iframe has overflow: hidden so only the iframe itself handles the scrolling, eliminating the strange nested scrollbars.

Do not touch the postMessage color logic, as that is working perfectly."

Prompt 2: Enforcing REAL Components in the Preview Route
This forces Copilot to actually import your real web app components into the preview route, rather than faking them.

Copy and paste this to Copilot:

"Now I need you to fix the actual /theme-preview route component. You previously built a fake layout. It MUST use the exact same components the users see.

Please execute the following:

1. Import Real Components: Inside the /theme-preview file, import the actual Layout, Header, and main Dashboard (or Home) components that our app uses.
2. Bypass Firebase: Do NOT wrap this route in the Firebase Auth provider. Instead, create a constant const MOCK_DATA = { ... } containing a fake user profile, fake subjects, and fake folders.
3. Pass the Mock Data: Pass this MOCK_DATA into the Layout and Dashboard components via props or a mocked Context Provider so they render exactly as they would in production.
4. Keep the Listener: Ensure the window.addEventListener('message') remains in this file so it can catch the color variables sent by the parent dashboard and apply them to the document.documentElement.

Do not create fake HTML for the preview. You MUST reuse our existing components."

Prompt 3: The "Restablecer" Fix & New "Saved Themes" Feature
Once the layout is clean and the preview is actually showing your real website, use this prompt to add the database logic and the new Theme feature.

Copy and paste this to Copilot:

"We need to update the Customization Tab state logic to handle Resets and a new 'Saved Themes' feature.

Please implement the following in one session:

1. Fix 'Restablecer' (Reset): The reset button should NOT revert to a hardcoded default. It must revert the active colors back to the initialColors state (the last saved version fetched from Firestore when the component mounted).

2. New Feature: 'Temas Guardados' (Saved Themes): > - Institutions need to save color sets (e.g., for temporary events).

Add a new UI section below or next to the color cards called 'Temas Guardados'.

Include a button: 'Guardar como nuevo tema' (Save as new theme). Clicking this must open our BaseOverlay asking for a Theme Name (e.g., 'DÃ­a de la Independencia').

Once saved, it should appear as a clickable pill/card. Clicking a saved theme instantly applies its colors to the current active state (and sends the postMessage to the iframe preview).

These themes need to be saved to the institution's Firestore document in an array (e.g., savedThemes: [{ name: 'Theme 1', colors: {...} }]).

Constraint Check: All new text MUST be in Spanish. Use Lucide icons (no emojis). Use BaseOverlay from the component registry for the name prompt."

MAKE THE PREVIEW NOT BE A FULL MOCK PREVIEW, DO NOT HARDCODE THE SAME CODE, MAKE WHAT GEMINI SAYS, I WANT IT TO BE THE WEB, NOT A MADE UP WEB, IT MUST BE THE SAME SAME EXACT WEB, BECAUSE IT WILL BE THE WEB.
Scrollbar
I need to fix the global scrollbar for this web application. When changing the theme dark/light, it does not change its color until I refresh the page, make it to change when the mode is changed, like with the other elements of the page.
Only current one filter
On the home page, on some tabs you can see a â€œSolo Vigentesâ€ button, this one should only show the current subjects from the current academic year that are active(they must be active on the trimester and not finalized), but it is showing a lot of them.


