# scott-edge-extensions

## Table of Contents
- [Scenarios](#scenarios)
- [Loading into Edge](#loading-into-edge)
- [Development](#development)
- [Component Diagram](#component-diagram)
- [Sequence Diagrams](#sequence-diagrams)
- [Contributor Onboarding](#contributor-onboarding)

This extension is for interacting with [ChatGPT](https://openai.com/blog/chatgpt) for learning English. There are 3 scenarios supported so far.

## Scenarios
1. A single word
   > unenforceable
2. A single word with its context sentence
   > aloof  
   His ratings remain dismal, not least because of his cold, aloof manner and his eagerness to please the party.
3. Multiple words with its context sentence

## Loading into Edge
1. Type `edge://extensions`
2. Click the 'Reload' button

## Development
1. Make sure [Microsoft Edge DevTools extension](https://learn.microsoft.com/en-us/microsoft-edge/visual-studio-code/microsoft-edge-devtools-extension) is installed on VS code.
2. When devloping in VS Code, move to an HTML file, right click the file, and then choose 'Open with Edge' > 'Open Browser with DevTools'.

## Component Diagram

```mermaid
flowchart TD
    UI["Popup UI (popup.html)"]
    ContentScript["Content Script (content.js)"]
    Session["Session Logic (session.js)"]
    Translation["Translation Logic (translation.js)"]
    Etymology["Etymology Fetcher (etymology.js)"]
    Utils["Utilities (utils.js)"]
    PopupJS["Popup Bootstrap (popup.js)"]

    UI -- interacts with --> PopupJS
    PopupJS -- initializes --> UI
    UI -- uses --> Session
    UI -- uses --> Translation
    UI -- uses --> Utils
    Translation -- uses --> Etymology
    Translation -- fetches from --> ContentScript
    Session -- uses --> Utils
    ContentScript -- provides data to --> Translation
    UI -- user actions --> UI
```

## Sequence Diagrams

### 1. Single Word
```mermaid
sequenceDiagram
    participant User
    participant PopupUI as Popup UI
    participant UIJS as ui.js
    participant Translation as translation.js
    participant Utils as utils.js
    participant Clipboard as Clipboard

    User->>PopupUI: Enter word & click "Generate Prompt"
    PopupUI->>UIJS: Event handler
    UIJS->>Translation: generateOutput('english')
    Translation->>Utils: copyToClipboard(prompt)
    Utils->>Clipboard: Write prompt
    Utils->>UIJS: showNotification
    UIJS->>User: Notification shown
```

### 2. Single Word with Context Sentence
```mermaid
sequenceDiagram
    participant User
    participant PopupUI as Popup UI
    participant UIJS as ui.js
    participant Translation as translation.js
    participant Utils as utils.js
    participant Clipboard as Clipboard

    User->>PopupUI: Enter word & context sentence, click "Generate Prompt"
    PopupUI->>UIJS: Event handler
    UIJS->>Translation: generateOutput('english')
    Translation->>Utils: copyToClipboard(prompt with context)
    Utils->>Clipboard: Write prompt
    Utils->>UIJS: showNotification
    UIJS->>User: Notification shown
```

### 3. Multiple Words with Context Sentence
```mermaid
sequenceDiagram
    participant User
    participant PopupUI as Popup UI
    participant UIJS as ui.js
    participant Translation as translation.js
    participant Utils as utils.js
    participant Clipboard as Clipboard

    User->>PopupUI: Enter multiple words & context sentence, click "Generate Prompt"
    PopupUI->>UIJS: Event handler
    UIJS->>Translation: generateOutput('english')
    Translation->>Utils: copyToClipboard(prompt with multiple words & context)
    Utils->>Clipboard: Write prompt
    Utils->>UIJS: showNotification
    UIJS->>User: Notification shown
```

## Contributor Onboarding

### Version Management
This project uses a dual versioning system:
- **Development Tools**: Versioned in `package.json` and managed by `standard-version`
- **Extension**: Versioned in `english-helper/manifest.json` and updated manually

### Development Workflow
1. Install dependencies:
   ```bash
   npm install
   ```
2. Make code changes
3. Commit changes using conventional commit format:
   ```bash
   npm run commit
   ```
4. Update versions:
   - For development tools (package.json):
     ```bash
     npm run release
     ```
   - For the extension: Manually update `english-helper/manifest.json`

### Release Process
1. Update the extension version in `english-helper/manifest.json`
2. Run the release command to update changelog and package version:
   ```bash
   npm run release
   ```
3. Submit updated files to the repository
