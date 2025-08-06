# Implementation Plan

- [x] 1. Create PR tools CSS stylesheet with container and component styles
  - Create `asking-expert/styles/popup-pr.css` file with PR container styling
  - Implement glassmorphism effects matching commit-tools-container design
  - Add textarea and button styles consistent with existing components
  - Include responsive design and theme support (light/dark modes)
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 2. Add PR tools HTML structure to popup
  - Insert PR tools section in `asking-expert/popup.html` after commit-tools div
  - Add textarea element with proper placeholder text and styling classes
  - Add generate button with consistent styling and accessibility attributes
  - Link the new CSS stylesheet in the HTML head section
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2_

- [x] 3. Implement core PR command generation function
  - Add `generatePRCommand()` function in `asking-expert/popup.js`
  - Implement proper shell escaping for special characters in PR text
  - Create printf command string with git repository information extraction
  - Add input validation to handle empty or whitespace-only input
  - _Requirements: 2.1, 2.2, 2.3, 4.1, 5.1, 5.2_

- [ ] 4. Add git repository information extraction utilities
  - Implement git command execution for owner/repo extraction from remote URL
  - Add current branch detection using git symbolic-ref command
  - Add base branch detection using git remote show command
  - Include error handling for missing git repository or remote configuration
  - _Requirements: 2.2, 4.1, 4.2, 5.2, 5.3_

- [ ] 5. Implement clipboard integration and user feedback
  - Add clipboard copy functionality using navigator.clipboard.writeText
  - Integrate with existing notification system from utils.js for success/error messages
  - Handle clipboard API failures with appropriate error notifications
  - Add success notification when PR command is successfully copied
  - _Requirements: 2.1, 2.3, 4.2, 4.3, 5.4_

- [ ] 6. Set up PR tools event listeners and initialization
  - Create `setupPRTools()` function to initialize PR tool functionality
  - Add event listener for generate button click events
  - Implement textarea auto-resize functionality using existing autoResize function
  - Integrate setupPRTools call into DOMContentLoaded event handler
  - _Requirements: 1.2, 1.4, 3.4, 4.3_

- [ ] 7. Add comprehensive error handling and validation
  - Implement input validation for empty textarea content
  - Add git repository validation before attempting command generation
  - Create user-friendly error messages for common failure scenarios
  - Add fallback handling for missing git information with default values
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.5_

- [ ] 8. Test and refine the complete PR tools integration
  - Test PR command generation with various input formats and special characters
  - Verify visual consistency with existing extension components across themes
  - Test error scenarios including missing git repo and clipboard failures
  - Validate that generated commands work correctly when executed in terminal
  - _Requirements: 1.1, 2.4, 3.1, 3.2, 5.4, 5.5_