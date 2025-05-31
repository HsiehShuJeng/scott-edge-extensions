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

These lessons ensure the extension is robust, user-friendly, and maintainable.
