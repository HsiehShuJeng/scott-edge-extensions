# Design Document

## Overview

The Branch Name Suggestion Tool will be integrated into the existing PR tools section of the "Asking Expert" browser extension. The existing PR tools container will be modified to contain two equal-width functionalities side by side: branch name suggestion (left) and PR command generation (right). Users can input feature descriptions on the left to generate branch naming prompts, while the right side maintains the existing PR command generation functionality.

## Architecture

### Component Structure
```
Development Routines Container
├── Container (development-routines-container) - renamed from pr-tools-container
├── Left Side (50% width)
│   ├── Textarea (branch-description-input)
│   └── Button (generate-branch-prompt-btn)
├── Right Side (50% width)
│   ├── Textarea (pr-description) - existing
│   └── Button (generate-pr-command) - existing
└── Notification System (success/error feedback)
```

### Integration Points
- **HTML**: Rename and modify existing pr-tools section to development-routines in popup.html
- **CSS**: Rename `popup-pr.css` to `popup-development-routines.css` and update to support two-column layout
- **JavaScript**: Add branch suggestion functions to existing popup.js alongside PR functions
- **Utilities**: Leverages existing notification system from utils.js

## Components and Interfaces

### HTML Structure
```html
<div id="development-routines" class="development-routines-container">
    <!-- Left side: Branch Name Suggestion -->
    <div class="dev-routine-section dev-routine-left">
        <textarea id="branch-description" rows="4" 
                  placeholder="Feature to implement or bug to fix&#10;&#10;Example:&#10;Add user authentication with email validation&#10;Fix memory leak in image processing module" 
                  class="input-control dev-routine-textarea" 
                  aria-label="Feature description or bug report"></textarea>
        <button id="generate-branch-prompt" class="dev-routine-btn" type="button" 
                aria-label="Generate branch naming prompt">Generate Branch Prompt</button>
    </div>
    
    <!-- Right side: PR Command Generation (existing) -->
    <div class="dev-routine-section dev-routine-right">
        <textarea id="pr-description" rows="4" 
                  placeholder="PR Title and Description&#10;&#10;Example:&#10;feat(auth): add user login validation&#10;&#10;- Add email validation&#10;- Implement password strength check&#10;- Update login form UI" 
                  class="input-control dev-routine-textarea" 
                  aria-label="Pull request title and description"></textarea>
        <button id="generate-pr-command" class="dev-routine-btn" type="button" 
                aria-label="Generate pull request command">Generate PR Command</button>
    </div>
</div>
```

### CSS Design System

#### Container Styling
- Renamed from `pr-tools-container` to `development-routines-container`
- Maintains existing gradient background and glassmorphism effects
- Keeps 12px border radius and backdrop blur
- Modified to support flexbox layout for two equal-width sections

#### Section Layout
- Two equal-width sections (50% each) using flexbox
- Small gap between sections for visual separation
- Both sections maintain consistent internal padding

#### Textarea Styling
- Both textareas use `input-control dev-routine-textarea` classes (renamed from pr-textarea)
- Same height for both textareas (matching existing 136px or rows="4")
- Equal width within their respective sections
- Placeholder text provides clear usage examples for each function

#### Button Styling
- Both buttons use `dev-routine-btn` styling (renamed from pr-btn)
- Consistent glassmorphism effect with backdrop blur
- Hover and active states match existing patterns
- Full-width layout within their respective sections

### JavaScript Implementation

#### Core Functions

**setupDevelopmentRoutines()**
- Initializes both branch suggestion and PR command event listeners
- Sets up textarea auto-resize functionality for both textareas
- Handles button click events for both functionalities

**generateBranchPrompt()**
- Extracts textarea content
- Validates input (non-empty, non-whitespace)
- Generates formatted prompt string
- Copies prompt to clipboard
- Shows success/error notifications

#### Prompt Generation Logic
```javascript
const generateBranchPrompt = (featureText) => {
    const trimmedText = featureText.trim();
    if (!trimmedText) {
        showNotification('Please enter a feature description or bug report', 'error');
        return;
    }
    
    const prompt = `${trimmedText}\n\nBased on the above requirement(s), please suggest branch names for brainstorming and references. As development effort will be made based on the requirement.`;
    
    return prompt;
};
```

**copyToClipboard()**
- Uses modern Clipboard API with fallback
- Handles success and error cases
- Provides user feedback through notifications

## Data Models

### Input Data
```typescript
interface FeatureInput {
    description: string;
    trimmed: string;
    isEmpty: boolean;
}
```

### Prompt Output
```typescript
interface BranchPrompt {
    content: string;
    template: string;
    userInput: string;
}
```

### Clipboard Operation
```typescript
interface ClipboardResult {
    success: boolean;
    error?: string;
    content: string;
}
```

## Error Handling

### Input Validation
- **Empty Input**: Show notification "Please enter a feature description or bug report"
- **Whitespace Only**: Treat as empty input and show validation message
- **Valid Input**: Proceed with prompt generation

### Prompt Generation
- **Valid Input**: Always succeeds since it's a string concatenation operation
- **Template Application**: Uses fixed template with user input insertion
- **Content Preservation**: Maintains original formatting and line breaks

### Clipboard Operations
- **Copy Success**: Show notification "Branch naming prompt copied to clipboard!"
- **Copy Failure**: Show notification "Failed to copy prompt to clipboard"
- **Browser Compatibility**: Use Clipboard API with fallback for older browsers

### Error Recovery
- Non-blocking errors allow continued use of other extension features
- Clear error messages guide user to resolution
- Graceful degradation when clipboard API is unavailable

## Testing Strategy

### Unit Testing Areas
1. **Prompt Generation**
   - Test template formatting with various input types
   - Verify proper text concatenation
   - Test with special characters and line breaks

2. **Input Validation**
   - Empty input handling
   - Whitespace-only input handling
   - Valid input processing

3. **Clipboard Integration**
   - Successful copy operations
   - Error handling for clipboard failures
   - Cross-browser compatibility

### Integration Testing
1. **UI Interaction**
   - Textarea input and auto-resize
   - Button click handling
   - Notification display

2. **User Workflow**
   - Complete flow from input to clipboard
   - Error scenarios and recovery
   - Multiple consecutive uses

### Manual Testing Scenarios
1. **Happy Path**: Enter feature description, generate prompt, verify clipboard content
2. **Error Cases**: Test with empty input, clipboard failures
3. **Visual Consistency**: Verify styling matches existing components
4. **Accessibility**: Test keyboard navigation and screen reader compatibility

## Implementation Notes

### File Organization
- **popup.html**: Rename existing pr-tools section to development-routines and modify to support two-column layout
- **popup-development-routines.css**: Rename from `popup-pr.css` and update to support flexbox layout for two sections
- **popup.js**: Add branch suggestion functions alongside existing PR functions
- **utils.js**: Leverage existing notification and clipboard utilities

### Performance Considerations
- Minimal DOM manipulation
- Efficient event listener setup
- Simple string operations for prompt generation
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

### Security Considerations
- No external API calls or data transmission
- Client-side only prompt generation
- Safe clipboard operations
- No sensitive data handling