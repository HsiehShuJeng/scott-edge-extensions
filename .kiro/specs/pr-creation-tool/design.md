# Design Document

## Overview

The PR Creation Tool will be integrated into the existing "Scott's Assistant for Programming" section of the browser extension popup. It will provide a clean, user-friendly interface for generating pull request creation commands that can be executed directly in the user's terminal. The design follows the established visual patterns and maintains consistency with the existing commit tools section.

## Architecture

### Component Structure
```
PR Creation Tool
├── Container (pr-tools-container)
├── Textarea (pr-description-input)
├── Button (pr-generate-btn)
└── Error Handling (notification system)
```

### Integration Points
- **HTML**: New section added after existing commit-tools in popup.html
- **CSS**: New stylesheet `popup-pr.css` following existing modular CSS pattern
- **JavaScript**: New functions added to popup.js for PR command generation
- **Utilities**: Leverages existing notification system from utils.js

## Components and Interfaces

### HTML Structure
```html
<div id="pr-tools" class="pr-tools-container">
    <textarea id="pr-description" rows="4" 
              placeholder="PR Title and Description&#10;&#10;Example:&#10;feat(auth): add user login validation&#10;&#10;- Add email validation&#10;- Implement password strength check&#10;- Update login form UI" 
              class="input-control pr-textarea"></textarea>
    <button id="generate-pr-command" class="pr-btn">Generate PR Command</button>
</div>
```

### CSS Design System

#### Container Styling
- Follows the same visual pattern as `commit-tools-container`
- Uses consistent gradient background: `var(--commit-tools-bg)`
- Maintains 12px border radius and backdrop blur effects
- Responsive padding and margins matching existing sections

#### Textarea Styling
- Extends existing `input-control` class
- Custom height and resize properties for PR content
- Placeholder text provides clear usage examples
- Auto-resize functionality similar to existing textareas

#### Button Styling
- Consistent with existing `commit-btn` styling
- Uses glassmorphism effect with backdrop blur
- Hover and active states match commit buttons
- Full-width layout within container

### JavaScript Implementation

#### Core Functions

**setupPRTools()**
- Initializes PR tool event listeners
- Sets up textarea auto-resize functionality
- Handles button click events

**generatePRCommand()**
- Extracts textarea content
- Validates input (non-empty)
- Generates printf command with proper escaping
- Copies command to clipboard
- Shows success/error notifications

#### Command Generation Logic
```javascript
const generatePRCommand = (prText) => {
    const escapedText = prText.replace(/'/g, "'\"'\"'");
    return `printf "#create_pull_request\\n%b\\nowner: %s\\nrepo: %s\\nhead: %s\\nbase: %s\\n" '${escapedText}' "$(git config --get remote.origin.url | sed -E 's@.*:([^/]+)/.*@\\1@')" "$(git config --get remote.origin.url | sed -E 's@.*/([^/]+)\\.git@\\1@')" "$(git symbolic-ref --short HEAD)" "$(git remote show origin | awk '/HEAD branch/ {print $NF}')" | pbcopy`;
};
```

**Note**: The function generates a pure command string that contains embedded shell commands. The git information extraction happens when the user executes the command locally in their terminal, not within the extension.

## Data Models

### Input Data
```typescript
interface PRInput {
    title: string;
    description: string;
    fullText: string; // Combined title and description
}
```

### Git Repository Data
```typescript
interface GitInfo {
    owner: string;
    repo: string;
    currentBranch: string;
    baseBranch: string;
}
```

### Command Output
```typescript
interface PRCommand {
    command: string;
    escaped: boolean;
    copyToClipboard: boolean;
}
```

## Error Handling

### Input Validation
- **Empty Input**: Show notification "Please enter PR title and description"
- **Whitespace Only**: Treat as empty input
- **Special Characters**: Properly escape quotes and special shell characters

### Command Generation
- **Invalid Input**: Show notification for empty or whitespace-only input
- **Command Generation**: Always succeeds since it's a pure string operation
- **Git Information**: Extracted when user executes the command locally, not within extension

### Clipboard Operations
- **Copy Failure**: Show notification "Failed to copy command to clipboard"
- **Success**: Show notification "PR command copied to clipboard!"

### Error Recovery
- Non-blocking errors allow continued use of other extension features
- Clear error messages guide user to resolution
- Graceful degradation when git information is unavailable

## Testing Strategy

### Unit Testing Areas
1. **Command Generation**
   - Test proper escaping of special characters
   - Verify printf command format
   - Test with various input lengths and formats

2. **Command String Generation**
   - Test proper escaping of special characters in PR text
   - Verify printf command format matches expected output
   - Test with various input lengths and formats

3. **Input Validation**
   - Empty input handling
   - Special character escaping
   - Whitespace normalization

### Integration Testing
1. **UI Interaction**
   - Textarea input and auto-resize
   - Button click handling
   - Notification display

2. **Clipboard Integration**
   - Command copying functionality
   - Cross-browser compatibility
   - Error handling for clipboard API

### Manual Testing Scenarios
1. **Happy Path**: Enter PR text, generate command, verify clipboard content
2. **Error Cases**: Test with no git repo, invalid input, clipboard failures
3. **Visual Consistency**: Verify styling matches existing components
4. **Responsive Design**: Test on different popup sizes

## Implementation Notes

### File Organization
- **popup.html**: Add PR tools section after commit tools
- **popup-pr.css**: New stylesheet following existing naming convention
- **popup.js**: Add PR-specific functions to existing file structure
- **utils.js**: Leverage existing notification system

### Performance Considerations
- Minimal DOM manipulation
- Efficient event listener setup
- Lazy loading of git information only when needed
- Debounced auto-resize for textarea

### Accessibility
- Proper ARIA labels for textarea and button
- Keyboard navigation support
- Screen reader compatible notifications
- High contrast support through existing theme system

### Browser Compatibility
- Uses existing Chrome extension APIs
- Clipboard API with fallback handling
- CSS features supported in target browsers
- JavaScript ES6+ features already in use