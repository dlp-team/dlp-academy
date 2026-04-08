ReadMe
You are a deeply professional developer. You are going to make deep analysis and resolutions on a large and professional web designed for education with ai. You must perform the changes of the following topics. But first, you have to understand the whole codebase, superficially, but you have to know where you are and where are all the things. Then you have to follow some instructions: you will first analyse all the requested changes or actions, understand them, and connect them(if one needs permissions and the other one is related to them, or maybe one has information for another one); then create an order based on the connections they have. You must then deeply understand each one, what is the objective, analyse the code that will be changed on the codebase and how to perform that change, security risks that may have, you have to cover it; ensure that the change is performed on the most efficient and optimized way, creating new files for cleaner code or reusing some hooks, components or anything that was previously created. After that execute the change, but be very aware of what you are doing, make changes lossless so other external features aren’t lost; perform lint to clean the code and optimize it; check that it works using tests if possible. Ensure it has been completely solved. Then review it, check whether something is missing, and then solve it. Do not ask questions, you are on autopilot. 
Create a plan like from the protocol with subplans for each one where you log everything so you know how to continue and what to do next, so we don't lose track of the changes and everything
Selection Mode
When elements are selected on the selection mode, I want that they can be dragged and dropped on other elements, like with individual elements, and have the same behaviour as individual ones.
Also, after performing an action(move to a folder, delete, etc), let cntrl+z be enabled to undo the action and also add a notification at the bottom that lasts 5 seconds to undo the action(but cntrl+z can still be done until there is some new action that will replace the undo behaviour).
In addition, when moving a selection of elements to a folder and there is a confirmation, like the one when trying to move subjects inside a shared folder, when confirming the action, it only moves one element inside and not all of them.
Also, when selection mode is active, make the salir de la selección have a border with a color that is related to the primary color of the page.
When selection mode is active, make the crear nueva asignatura button do nothing when clicking.
On the list mode, when pressing a folder during the selection mode, it selects the whole folder, which is perfect, but then if I press on an element inside the folder, it is also selected, and the folder remains selected, which doesn’t make sense, make that if an element inside a folder is pressed, then the folder that contains it is unselected, so we don’t duplicate elements and to be more clear to the user.
Bin Section
On the bin section of the home mode, I want to make some improvements:
When the user is in grid mode and it presses an element, the whole background loses opacity, but it loses too much opacity, make it less evident, and the options is appearing with delay, make it appear at the same time. Also, when pressing a subject it gets like a border, I only want that if the selection mode on the bin tab is selected, if it is not active, then only make the card bigger, apply this to both the grid and list mode.
In the list mode, match the same style for this, so when pressing an element the background also loses opacity.
Also, when pressing ver contenido on an element, I want that it works the same way as pressing an element on the other tabs(manual, course, usage), which sent you to the subject page to see the different topics and see the contents, but you have to ensure that it cannot modify absolutely anything, only viewing and reading, nothing more.
Institution Admin Dashboard
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
Scrollbar
I need to fix the global scrollbar for this web application. I have two specific requirements:
Theme Support: The scrollbar is currently having very strange colors for the dark and light mode, change them so they are adapted to the theme correctly.
Before I told you this: “Prevent Layout Shift (Overlay Scrollbar): When the scrollbar appears/disappears, it pushes the entire page layout to the left. I do not want the scrollbar to occupy physical DOM width. It must act as a floating 'overlay' on the rightmost edge of the screen. Since overflow: overlay is deprecated in modern Chrome, please implement a robust alternative. You can achieve this by styling a custom ::-webkit-scrollbar to float over the content, using absolute positioning for the scroll container, or using scrollbar-gutter: stable both-edges; if that best preserves the perfectly centered layout without shifting”. But you have taken out a piece of the web on both the left and right to not make the shift. The thing is that this is terrifically unaesthetic, you are cutting off the web on the edges. It is very simple what I am saying to you, you just have to make the web occupy the whole screen again and the scroll bar has to be OVER the web, you must not make new space on the web when the scroll bar is active because it is going to be OVER the rightmost part of it, but it will not move or anything the web, the web must be centered.
Gemini advice:
This is a classic CSS headache! The AI took your instruction about scrollbar-gutter: stable both-edges a bit too literally. While that property does stop the layout shift, it does so by carving out permanent empty columns on both sides of your website, which looks terrible on a full-screen app.

You want a true, transparent, floating scrollbar that sits on top of the content, exactly like how macOS handles scrollbars natively, without crushing the website's width.

Since overflow: overlay is deprecated, the modern way to force this in CSS (especially for Windows users) is to set the main layout to exactly 100vw (viewport width) so it ignores the scrollbar's physical space, hide the horizontal overflow, and make the scrollbar track completely transparent.

Here is the exact, corrected prompt to give Copilot so it undoes the ugly borders and implements the true floating overlay:

Copy and paste this to Copilot:

"I need to fix the global scrollbar implementation. The previous attempt using scrollbar-gutter or padding was incorrect because it cuts off the edges of the website and leaves unaesthetic blank space.

Please implement the following corrections in index.css (or your main global stylesheet) in a single session:

1. Remove the Layout Cut-offs: Remove any scrollbar-gutter properties or artificial padding that was added to the body/root to accommodate the scrollbar. The website MUST occupy the full screen width again and remain perfectly centered.

2. True Overlay Scrollbar: To prevent layout shift WITHOUT squishing the web, the main container/body must span under the scrollbar. Use a custom ::-webkit-scrollbar implementation. Make the scrollbar track completely transparent (background-color: transparent). To ensure the scrollbar doesn't subtract from the 100% width, ensure the body or root wrapper is styled to allow the scrollbar to visually float OVER the rightmost content. (Hint: ensuring the layout width is calculated independent of the scrollbar, such as using 100vw with overflow-x: hidden, or absolute positioning for a custom scroll container if strictly necessary).

3. Theme Colors: The scrollbar thumb (::-webkit-scrollbar-thumb) currently has strange colors. Update it to use our existing CSS variables for dark/light mode so it blends naturally with the theme (e.g., a semi-transparent gray/white that adapts nicely).

Constraint Check: Do not use scrollbar-gutter. Do not reduce the width of the main web container. The scrollbar must sit OVER the rightmost edge of the content."

Why this will work:
"Remove scrollbar-gutter": This explicitly tells the AI to delete the code that is causing the ugly blank spaces on the sides.

"background-color: transparent": This ensures that the "track" (the rail the scrollbar slides on) is invisible, allowing your website's background to show through perfectly.

"100vw / overflow-x: hidden": This is the CSS trick to force the webpage to be the exact width of the monitor, completely ignoring the 15 pixels the scrollbar usually takes up. The scrollbar will just render on top of whatever is on the far right edge!
Element actions
Any element action like drag and dropping and so should be able to be undone(except element creation) using cntrl+z. Also, in cases where a confirmation was needed let there also appear a notification like on the selection mode when moving to a folder to undo the action, make a specific component to reuse and centralize the code for this notifications. 
Notifications
When a subject is shared with another user or it has been assigned to a class of students or enrolled students, they must get a notification about it.
Topic
THIS IS EXTREMELY IMPORTANT. On the topic page, the create button has disappeared for everything, there is no button to create the quizzes, or the exams or the study guides. I still have this in the previous version which is on the main branch, so you must go to that branch, make an analysis of how the creation worked and how it was exactly before, retrieve that to the current branch now and implement it.
