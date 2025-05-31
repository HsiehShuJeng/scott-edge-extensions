# Lessons Learned: Robust Vocabulary.com Extension Implementation

## 1. Scenario Separation for User Experience
- **Manual Entry Always Works:**  
  The popup logic ensures that if the "Word" field has content, "Generate Prompt" will always generate and copy the prompt, regardless of page parsing. This prevents the extension from being blocked by parsing failures.
- **Page Parsing as Fallback:**  
  Only if the "Word" field is empty does the extension attempt to parse the active tab for a word and sentence, making the UX robust and user-friendly.

## 2. Robust Content Script Extraction
- **Targeting the Active Question:**  
  The content script always tries to find `.challenge-slide.selected` for the current question, which is the visible/active slide.
- **Multiple Supported Scenarios:**  
  - **Standard multiple-choice:** Word from `<strong>` in `.sentence`, sentence is the context.
  - **Definition-style multiple-choice:** Word from `<strong>` in `.instructions`, sentence is "What does [word] mean?" + choices.
  - **Synonym-style multiple-choice:** Word from `<strong>` in `.instructions`, sentence is "[word] has the same or almost the same meaning as:" + choices + "Please explain with the 2 words".
  - **Question-style multiple-choice:** Word from `<strong>` in `.sentence` in `.questionContent`, sentence is the question text followed by the choices.
  - **Spelling questions:** Word from `.correctspelling` if available, otherwise from `<strong>` in `.sentence.complete` or `.sentence.blanked`.
- **Word Extraction Logic:**  
  The script uses the appropriate extraction method for each scenario, with fallbacks for edge cases.
- **Debug Logging:**  
  Console logs were added to help trace which element is being selected and what text is being extracted, making debugging much easier.

## 3. Popup Event Handler Logic
- **Conditional Parsing:**  
  The event handler for "Generate Prompt" was refactored to:
  - Immediately generate/copy the prompt if fields are filled.
  - Attempt parsing and show notifications if fields are empty.
  - Only generate/copy the prompt after parsing if both fields are filled.

## 4. Clipboard and Notification Handling
- **Clipboard Copy Always Available:**  
  Clipboard copy logic is decoupled from parsing, so users can always generate a prompt if they manually enter content.
- **User Feedback:**  
  Notifications are shown if parsing fails, guiding the user to enter missing content.

## 5. General Implementation Lessons
- **Dynamic Page Handling:**  
  On dynamic sites like vocabulary.com, always use selectors that target the currently visible/active content, and provide fallbacks.
- **User Experience:**  
  Never block core functionality (like prompt generation) due to parsing failures—always allow manual input as a backup.
- **Debugging:**  
  Add clear, targeted console logs to trace the flow and quickly identify where things go wrong.

---

## 6. Iterative Scenario Expansion and Architecture Lessons

- **Incremental Support for New Scenarios:**  
  The extension was iteratively improved to support a wide range of question types, including standard, definition-style, synonym-style, question-style, opposite-style, and spelling questions. Each new scenario required careful DOM analysis and targeted extraction logic.

- **Strict DOM Scoping:**  
  All extraction logic was updated to strictly scope queries to the currently selected `.challenge-slide.selected`, preventing cross-slide contamination and ensuring accuracy.

- **Scenario Detection and Fallbacks:**  
  The content script uses scenario-based detection (by question type) to select the correct extraction logic. Fallbacks are in place to handle unexpected or new question types gracefully.

- **Popup Layout and Usability:**  
  The popup textarea was given a max-height and scroll, ensuring that action buttons remain visible even with long content. Manual entry is always supported, so users are never blocked by parsing failures.

- **Documentation and Diagrams:**  
  README.md was updated to include a Table of Contents, a scenario table, a Mermaid flowchart for extraction logic, and a component/block architecture diagram. Diagrams use double quotes for special characters, as required by Mermaid.

- **General Lessons for Future Development:**  
  - Always use strict DOM scoping and scenario detection for dynamic web content.
  - Keep user experience in mind: never block core functionality due to parsing issues.
  - Maintain clear, up-to-date documentation and diagrams as the codebase evolves.

---

## 7. Integration of Etymonline for Etymology and Part of Speech

- **Prompt Generation Enhancement:**  
  The "Generate Prompt" function was integrated with Etymonline to fetch etymology and part of speech for the extracted word, when available. This information is now included in the generated prompt, providing richer linguistic context for language learners and programmers.

- **Implementation Details:**  
  - The translation logic asynchronously queries Etymonline for the extracted word.
  - If etymology and part of speech are found, they are appended to the prompt.
  - The UI and prompt generation flow were updated to handle asynchronous etymology fetching and robust error handling for missing or ambiguous results.

- **Lessons Learned:**  
  - Integrating external linguistic data sources (like Etymonline) can significantly enhance the educational value of prompts.
  - Asynchronous data fetching must be carefully managed to avoid blocking the user experience.
  - Including part of speech helps clarify word usage, especially for words with multiple grammatical roles.
  - Documentation and diagrams must be updated to reflect new data flows and dependencies.

These lessons ensure the extension is robust, user-friendly, and maintainable.

---

## 9. Handling Restricted Browser Pages in Extension Popup

- **Problem:**  
  Users encountered an error ("Exception in getSentenceContent: Error: Cannot access chrome:// and edge:// URLs") when attempting to use the extension popup on internal browser pages (chrome://, edge://, extension://). This is due to browser security restrictions that prevent extensions from injecting scripts or accessing content on these pages.

- **Solution:**  
  The extension's popup logic was updated to detect when the active tab is a restricted internal page. If so, it now displays a user-friendly notification ("This extension cannot be used on internal browser pages. Please switch to a regular website.") and skips script injection, preventing confusing errors.

- **Lessons Learned:**  
  - Always check for browser-imposed limitations and handle them gracefully in the UI.
  - Proactive user feedback improves the extension's robustness and user experience.
  - Documenting such edge cases helps future contributors understand the rationale behind defensive coding patterns.

---

## 8. Contributor Workflow and Documentation Lessons

- **Smoother Contributor Flow:**  
  The development flow was updated to use `git commit` instead of `npm run commit` for a faster, less laggy experience. Commitizen is no longer required for standard commits, but contributors should still follow clear, descriptive commit messages.

- **Documentation Requirements:**  
  Before each commit, contributors must review and update `README.md` and `lesson_learned.md` as needed. This includes:
  - Updating diagrams, the scenario table, and contributor onboarding if the architecture, data flow, or supported scenarios change.
  - Adding new diagrams if new concepts are introduced (with permission if unsure).
  - Noting all implementation or conceptual changes in `lesson_learned.md`.

- **Manifest Version Sync Quirk:**  
  When switching or deleting branches, an unstaged change in `manifest.json` may appear due to version synchronization with `package.json`. This is a known quirk. Contributors should rerun `node scripts/sync-version.js` to resync if needed. The team decided not to automate this with a post-checkout git hook, to keep the workflow simple and avoid extra setup for contributors.

- **Continuous Alignment:**  
  The project enforces continuous alignment between code, documentation, and diagrams, ensuring that onboarding and scenario documentation are always up to date with the actual workflow and architecture.
