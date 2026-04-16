ReadMe
You are a deeply professional developer. You are going to make deep analysis and resolutions on a large and professional web designed for education with ai. You must perform the changes of the following topics. But first, you have to understand the whole codebase, superficially, but you have to know where you are and where are all the things. Then you have to follow some instructions: you will first analyse all the requested changes or actions, understand them, and connect them(if one needs permissions and the other one is related to them, or maybe one has information for another one); then create an order based on the connections they have. You must then deeply understand each one, what is the objective, analyse the code that will be changed on the codebase and how to perform that change, security risks that may have, you have to cover it; ensure that the change is performed on the most efficient and optimized way, creating new files for cleaner code or reusing some hooks, components or anything that was previously created. After that execute the change, but be very aware of what you are doing, make changes lossless so other external features aren’t lost; perform lint to clean the code and optimize it; check that it works using tests if possible. Ensure it has been completely solved. Then review it, check whether something is missing, and then solve it. Do not ask questions, you are on autopilot. 
Create a plan like from the protocol with subplans for each one where you log everything so you know how to continue and what to do next, so we don't lose track of the changes and everything
Selection Mode
When elements are selected on the selection mode, I want that they can be dragged and dropped on other elements, like with individual elements, and have the same behaviour as individual ones. But they must be dragged all at once, when dragging them, all the selected one should make a transition moving towards the one where it is being the drag made, and they must be mounted below this one so all move with the dragged.
Also, after performing an action(move to a folder, delete, etc), let cntrl+z be enabled to undo the action and also add a notification at the bottom that lasts 5 seconds to undo the action(but cntrl+z can still be done until there is some new action that will replace the undo behaviour). make it undo the whole action on all the selected/affected elements.
In addition, when moving a selection of elements to a folder and there is a confirmation, like the one when trying to move subjects inside a shared folder, when confirming the action, it only moves one element inside and not all of them, make it have a confirmation that is used to move all of the elements at once with a single confirmation, instead of individual ones.
When selection mode is active, make the crear nueva asignatura button do nothing when clicking, but don’t hide it, because it can be used when dragging the selected to move them to another layer..
On the list mode, when pressing a folder during the selection mode and then pressing an element inside it, the border that shows it is selected is like cut off at the right and left part, like if it had been cropped from both sides, fix that.
Bin Section
On the bin section of the home mode, I want to make some improvements:
When the user is in grid mode and it presses an element, the card is like being duplicated,  I only want it to be scaled, as well as the text below it. Also, don’t make the background change the opacity when pressing an element on the grid mode, take that out.
ShortKeys
When applying a shortcut for copying and pasting(cntrl+c and v) on an element of the home page, it must create a copy of the element(that is working), but it must not be shared with anyone, the owner must be the one that has made the copy and also you have to add that ctrnl+z can be used to uncreate or undo the copy, this also for the cntrl+x and cntrl+v, let that be also undone with control z. When making a copy, it must also copy the topics and everything inside of it, all the quizzes and the documents and so. Also, it must copy the required elements or ask about them(like the academic year, the course and so).
Institution Admin Dashboard
This is a conversation I had with gemini:
We had this discussion: Institution Admin Dashboard

On the institution admin dashboard, in the customization tab and the preview, you have to make the preview an exact view of the web. I think we should always create with the institution a new account for this, this account would be like mockwebpreview@domainoftheinstitution. It should have a password that must be unblocked with the institution admins passwords. I mean, right now it is using the institution admin account for the preview, but I don’t want that view, because it does not represent the web as the teachers and students are going to see it, that is why I think we could use a new email account mockwebpreview@domainoftheinstitution when in the preview, it should always show the web preview from this account, which should be selected as a teacher at first, but it should have an option to change to a student view.  This account should have mock data with subjects, folders, topics, exams, quizzes and so, to show all the different changes and color previews. I think this is a better approach, because the previous one was to exactly replicate the web, which is already complicated, but it also implies that it has to be updated each time there is a new  feature, so it is better to have a real account so it “updates” in real time.

The issue is now how to show the changes of colors without saving, because the institution admin has to be able to see the new colors on the preview before saving it(because saving implies that everyone can see the new colors). Also, the save and restablecer buttons should have a confirmation to ensure there are no missclicks. Right now the save button or the restablecer are not doing anything when pressed.

Also, when clicking on a color card, it should only be selected, and the color selector should not appear, the color selector must only appear when clicking on the color of the color card(inside the card of each color there is the title like Color Primario, the number in hexadecimal, and, at the left of the card there is like a square with round borders that has the color, I mean this part, when clicking over this part the color selector should appear to change the color). Also, let the user also change the color by changing the hexadecimal text on the color card.

This was my first idea, but look at what gemini told me, it is better, so do this approach: 

You are absolutely on the right track by wanting to use the actual web layout for the preview instead of building a separate, hardcoded mockup. That will save you hundreds of hours of maintenance in the future.



However, I strongly advise against creating a literal, real Firebase Auth account (mockwebpreview@...) for the iframe. Here is why that approach will break: Firebase stores authentication tokens in the browser's LocalStorage. If the parent window is logged in as the "Institution Admin," and the iframe forces a login as the "Mock Teacher," Firebase will get confused and likely log the Admin out of the main session. Furthermore, using a real database account means you are paying for Firestore reads every time an admin opens the customization tab, which is inefficient.



The Better Alternative: A "Preview Route" with Mock State

Instead of a real account, we create a specific route in your React app (e.g., /theme-preview). When the iframe loads this route, the app bypasses Firebase Auth entirely and loads a hardcoded JSON file of "Mock Data" (fake subjects, topics, etc.).



This solves everything:



It uses your real UI components, so it updates automatically as you build new features.



It doesn't touch Firebase, saving money and preventing Auth conflicts.



The Admin Dashboard can instantly send color changes to it using postMessage (as we discussed before) so colors update without saving to the database.



Because this is a massive change, do not give this to Copilot all at once. If you do, it will hit the rate limit and likely break your app. We need to split this into manageable prompts.



Prompt 1: The UI Fixes (Color Cards & Confirmations)

Let's fix the dashboard UI first, making sure the buttons work, the confirmations use your unified BaseOverlay, and the color card click logic is correct.



Copy and paste this to Copilot:



"I need to fix the UI interactions in the Customization Tab (CustomizationTab.jsx or similar) of the Institution Admin Dashboard. Please execute these fixes in one session:



1. Color Card Click Logic: Fix the click events on the Color Cards.



Clicking the body of the card should ONLY set it as the 'active/selected' card in the state.



The color picker overlay/selector must ONLY open when the user clicks the specific color swatch (the square with rounded borders on the left). Use e.stopPropagation() on the swatch click to prevent triggering the card selection if necessary.



Add a text input field for the Hexadecimal value inside the card so the user can type to change the color directly.



2. Save & Reset Confirmations: The 'Guardar' (Save) and 'Restablecer' (Reset) buttons currently do nothing.



Wrap the actual save/reset logic behind confirmation modals.



You MUST use our unified BaseOverlay component from docs/COMPONENT_REGISTRY.md for these confirmations.



The text must be in Spanish (e.g., '¿Estás seguro de que deseas guardar estos cambios?', '¿Estás seguro de que deseas restablecer los colores?').



Constraint Check: Ensure no emojis are used, only Lucide icons. Update the component state safely."



Prompt 2: The Iframe & Mock Data Architecture

Once the UI is fixed, use this prompt to set up the preview architecture safely without breaking Firebase Auth.



Copy and paste this to Copilot:



"Now, we need to implement the live preview architecture. We will NOT use a real secondary Firebase account, as that will cause LocalStorage Auth collisions. We will use a Mock Route approach.



Phase 1: The Iframe Setup: Update the Customization Tab to render an iframe. The src of this iframe should point to a new route we are going to create: /theme-preview?role=teacher (or ?role=student depending on a toggle you add to the dashboard).



Phase 2: Live Color Injection (No DB Save): Implement a useEffect in the Admin Dashboard that listens for changes to the unsaved color state. When a color changes in the dashboard, use iframeRef.current.contentWindow.postMessage(newColors, '*') to send the payload to the iframe.



Phase 3: The Preview Route Component: Create the new /theme-preview route component.



It should render the exact same Layout and Dashboard components that a real user sees.



CRITICAL: It must bypass Firebase Auth. Feed it a hardcoded mock JSON object containing fake user data, subjects, folders, and exams so the UI populates realistically.



Add a window.addEventListener('message') inside this route to catch the postMessage from the parent. When it receives new colors, it should dynamically update the CSS variables (document.documentElement.style.setProperty) on its own DOM, allowing the admin to see live changes without touching the database.



Please acknowledge this architecture and ask any clarifying questions before writing the code."



This separates the visual fixes from the complex routing, which will keep Copilot focused and prevent it from destroying your active layout.







But copilot has done what it wanted with that information. It has inserted the preview inside two or three divs that each have scrollbars(it is very strange), and it has returned to use a mock up preview that it has make up and does not represent the live state of the web, but a hardcoded version that is not even the same as the web. However, it has done a good job with the color things and updating on real time without saving. I want to add that the restablecer button returns to the previously saved version, not to the default one. It would be a good idea to include favorite colors or also to include an option to store and use set of colors that have been created, because the institution may change its colors for a while because of an event, but it may want to return to its original colors after that, so that would be helpful, add that also. Make a prompt solving these problems.

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

Include a button: 'Guardar como nuevo tema' (Save as new theme). Clicking this must open our BaseOverlay asking for a Theme Name (e.g., 'Día de la Independencia').

Once saved, it should appear as a clickable pill/card. Clicking a saved theme instantly applies its colors to the current active state (and sends the postMessage to the iframe preview).

These themes need to be saved to the institution's Firestore document in an array (e.g., savedThemes: [{ name: 'Theme 1', colors: {...} }]).

Constraint Check: All new text MUST be in Spanish. Use Lucide icons (no emojis). Use BaseOverlay from the component registry for the name prompt."
Scrollbar
I need to fix the global scrollbar for this web application. I have two specific requirements:
Theme Support: The scrollbar is currently having very strange colors for the dark and light mode, change them to have cleaner colors, use grey and I want that the scrollbar div or the whole part does not have any color, make it transparent, so only the scrollbar is visible, but not the thing behind the scrollbar .
Element actions
Any element action like drag and dropping moving has an undo card that appears after performing the action, I want this to be cleaner and more elegant, use simpler colors and make it not very highlighted, for example use white and gray for the light mode.
Notifications
Make the notifications appear at the bottom left part of the web and disappear after 10 seconds of having appeared and not appearing again for that specific notification(I mean the notification cards). Change the style of the notification card so it is cleaner and more elegant. Take out the brain like icon, if you can use the same icon as the element shared(in the case of sharing an element like a subject or folder), else set up some icons for each possible notification, use a simple color for the icon and for the backgound, simple, elegant. The same for the notifications that appear on the notification page history.


