# Scott's Assistant for Language Learning and Programming

This browser extension provides comprehensive assistance for language learners (English and Korean) and programmers. It extracts vocabulary questions and context from Vocabulary.com, generates optimized LLM prompts for language learning, and provides programming tools for commit message generation and pull request creation.

## Table of Contents
- [Language Learning Features](#language-learning-features)
- [Programming Features](#programming-features)
- [UI Features](#ui-features)
- [Architecture](#architecture)
  - [Component Diagram](#component-diagram)
  - [Extraction Logic Flowchart](#extraction-logic-flowchart)
  - [Component Architecture Diagram](#component-architecture-diagram)
- [Development & Contribution](#development--contribution)
  - [Loading into Edge](#loading-into-edge)
  - [Development](#development)
  - [Contributor Onboarding](#contributor-onboarding)
- [Modular CSS & UI Consistency](#modular-css--ui-consistency)
- [Linting & Code Quality](#linting--code-quality)
- [Limitations & Notifications](#limitations--notifications)
- [Lessons Learned](#lessons-learned)

---

## Language Learning Features

### English Learning
- **Vocabulary extraction** from Vocabulary.com with context
- **Etymology and part of speech** integration from Etymonline
- **Contextual prompt generation** for LLM assistance
- **Image prompt generation** for visual learning
- **Translation to Traditional Chinese**

### Korean Learning
- **Korean sentence input** with contextual prompt generation
- **Multi-line text support** for complex Korean content
- **Integrated learning session management**

## Programming Features

### Commit Message Generation
- **Current Changes Analysis**  
Generate commit messages for unstaged changes (follows enhanced conventional commit standards with AI-optimized prompts)
- **Staged Changes Analysis**  
Generate commit messages for staged changes  
- **Range Changes Analysis**  
Generate commit messages for changes between branches

### Pull Request Creation
- **PR Command Generation**  
Generate printf commands for PR creation (automatically extracts git repository information and outputs ready-to-execute shell commands)

---

## Language Learning Scenarios

- **Single word**: e.g., `unenforceable`
- **Single word with context sentence**: e.g., `aloof`  
  _His ratings remain dismal, not least because of his cold, aloof manner and his eagerness to please the party._
- **Multiple words with context sentence**
- **All major Vocabulary.com question types** (see Scenario Table below)
- **Etymology and part of speech**: If available, the prompt will include etymology and part of speech fetched from Etymonline.

---

## UI Features
- **Theme Toggle**: Switch between light and dark modes using the sun/moon icon in the top-right corner
- **Persistent Preferences**: Your theme preference is saved between sessions
- **Multi-language Support**: Dedicated sections for English and Korean learning
- **Programming Tools**: Integrated commit message and PR creation tools
- **Auto-resize Textareas**: Dynamic sizing for better content input
- **Consistent Notifications**: Clear success/error feedback across all features
- **Accessibility**: Proper ARIA labels and keyboard navigation support

---

## Architecture

### Component Diagram

```mermaid
flowchart TD
    UI["Popup UI (popup.html)"]
    ContentScript["Content Script (content.js)"]
    Session["Session Logic (session.js)"]
    Translation["Translation Logic (translation.js)"]
    Etymology["Etymology Fetcher (etymology.js)"]
    Utils["Utilities (utils.js)"]
    PopupJS["Popup Bootstrap (popup.js)"]
    CommitTools["Commit Tools"]
    PRTools["PR Creation Tools"]

    UI -- interacts with --> PopupJS
    PopupJS -- initializes --> UI
    UI -- uses --> Session
    UI -- uses --> Translation
    UI -- uses --> Utils
    UI -- uses --> CommitTools
    UI -- uses --> PRTools
    Translation -- uses --> Etymology
    Translation -- fetches from --> ContentScript
    Session -- uses --> Utils
    ContentScript -- provides data to --> Translation
    CommitTools -- generates --> Utils
    PRTools -- generates --> Utils
    UI -- user actions --> UI
```

### Programming Tools Workflow

```mermaid
flowchart TD
    Start(["User Input"])
    Start --> CommitBtn["Commit Button Click"]
    Start --> PRBtn["PR Button Click"]
    
    CommitBtn --> GitDiff["Generate Git Diff Command"]
    GitDiff --> CopyCommit["Copy to Clipboard"]
    
    PRBtn --> ValidateInput["Validate PR Input"]
    ValidateInput --> |"Valid"| GenerateCmd["Generate Printf Command"]
    ValidateInput --> |"Invalid"| ShowError["Show Error Message"]
    GenerateCmd --> CopyPR["Copy to Clipboard"]
    
    CopyCommit --> Notify["Show Success Notification"]
    CopyPR --> Notify
    ShowError --> End
    Notify --> End(["Complete"])
```

### Language Learning Extraction Logic

```mermaid
flowchart TD
    Start(["Start"])
    Start --> |"typeA"| Opposite
    Start --> |"typeT"| Spelling
    Start --> |"typeD"| Definition
    Start --> |"typeS"| Synonym
    Start --> |"typeP"| Question
    Start --> |"else"| Fallback

    Opposite --> End
    Spelling --> End
    Definition --> End
    Synonym --> End
    Question --> End
    Fallback --> End
    End(["Extract word & sentence"])
```

### Component Architecture Diagram

```mermaid
flowchart LR
    subgraph "Browser_Tab[Active Vocabulary.com Tab]"
        PageDOM["Page DOM<br/>(challenge-slide, question, etc.)"]
        ContentScript["Content Script<br/>(content.js)"]
    end
    subgraph "Extension_Popup[Extension Popup]"
        PopupUI["Popup UI<br/>(popup.html, ui.js)"]
    end
    PopupUI -- "chrome.scripting.executeScript + sendMessage" --> ContentScript
    ContentScript -- "Extract word & sentence" --> PageDOM
    ContentScript -- "Send result" --> PopupUI
```

### Scenario Table

| Type   | Word Source                | Sentence Source/Format                                 |
|--------|---------------------------|--------------------------------------------------------|
| typeA  | .instructions strong      | Instructions text + choices + explanation              |
| typeT  | .correctspelling or <strong> in .sentence.complete/.blanked | .sentence.complete or .sentence.blanked                |
| typeD  | <strong> in .instructions | "What does [word] mean?" + choices                    |
| typeS  | <strong> in .instructions | "[word] has the same or almost the same meaning as:" + choices + explanation |
| typeP  | <strong> in .sentence     | Question text + choices                                |
| else   | <strong> in .sentence     | .sentence                                              |

---

## Development & Contribution

### Loading into Edge
1. Type `edge://extensions`
2. Click the 'Reload' button

### Development
1. Make sure [Microsoft Edge DevTools extension](https://learn.microsoft.com/en-us/microsoft-edge/visual-studio-code/microsoft-edge-devtools-extension) is installed on VS code.
2. When developing in VS Code, move to an HTML file, right click the file, and then choose 'Open with Edge' > 'Open Browser with DevTools'.

### Contributor Onboarding

#### Branching Strategy
```mermaid
graph TD
    A["main branch"] -->|"production-ready"| B["Release"]
    C["Feature branch"] -->|"development"| D["New features"]
    E["HOTFIX branch"] -->|"urgent fixes"| F["Critical bugs"]
```

**Branch Types:**
- **main**: Stable, production-ready code
- **feature**: For developing new features
- **hotfix**: For critical bug fixes

**Feature Development Workflow:**
1. Create feature branch from main:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feat/your-feature-name
   ```
2. Develop and test changes
3. Before each commit, review and update `README.md` and `lesson_learned.md` as needed:
   - Update diagrams, scenario table, and contributor onboarding if the architecture, data flow, or supported scenarios change.
   - Add new diagrams if new concepts are introduced (ask for permission if unsure).
   - Note all implementation or conceptual changes in `lesson_learned.md`.
4. Stage and commit changes:
   ```bash
   git add .
   git commit -m "your message"
   ```
5. Push branch to repository:
   ```bash
   git push origin feat/your-feature-name
   ```
6. Create pull request for review
7. Merge to main after approval

**Note:**  
If you see an unstaged change in `manifest.json` after switching or deleting branches, rerun `node scripts/sync-version.js` to resync the version. This is a known quirk due to version synchronization between `package.json` and `manifest.json`.

#### Version Management
This project uses a unified versioning system where:
- `package.json` is the source of truth for the version
- The extension version in `asking-expert/manifest.json` is automatically synchronized
- Version updates are managed through `standard-version`

#### Development Workflow
1. Install dependencies:
   ```bash
   npm install
   ```
2. Make code changes
3. Before each commit, review and update `README.md` and `lesson_learned.md` as needed (see Contributor Onboarding).
4. Stage changes:
   ```bash
   git add .
   ```
5. Commit changes:
   ```bash
   git commit -m "your message"
   ```

#### Release Process
1. Run the release command to:
   - Automatically synchronize manifest.json version from package.json
   - Update `package.json` version based on commit types
   - Generate/update `CHANGELOG.md`
   - Commit version changes
   - Create git tag
   ```bash
   npm run release
   ```
2. Push changes and tags to repository:
   ```bash
   git push --follow-tags
   ```
3. Run the version sync script to ensure `manifest.json` matches the new version in `package.json`:
   ```bash
   node scripts/sync-version.js
   git add asking-expert/manifest.json
   git commit -m "chore: sync manifest version after release"
   git push
   ```
   - If you see an unstaged change in `manifest.json` after switching or deleting branches, rerun this script before proceeding.

#### Important Note About Version Sync Timing
```mermaid
graph LR
    A["npm run release"] --> B["preversion script"]
    B --> C["Sync current version to manifest.json"]
    C --> D["Bump package.json version"]
    D --> E["Generate changelog"]
```

This means:
1. The sync script runs BEFORE version bump
2. manifest.json gets the current version (before bump)
3. package.json gets bumped to the new version
4. This ensures manifest.json always matches the version that was just released

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Git as Git
    participant NPM as npm
    participant GH as GitHub
    participant Script as Sync Script

    Dev->>NPM: Run npm run release
    NPM->>Script: Execute preversion script
    Script->>Git: Sync manifest.json version
    NPM->>Git: Update package.json version
    NPM->>Git: Update CHANGELOG.md
    NPM->>Git: Commit changes
    NPM->>Git: Create version tag
    Dev->>Git: Run git push --follow-tags
    Git->>GH: Push code and tags
```

## Supported Scenarios

### 1. Standard Multiple-Choice (Context Sentence)
- **Word:** Extracted from `<strong>` in `.sentence`.
- **Sentence:** The full context sentence.

### 2. Definition-Style Multiple-Choice
- **Word:** Extracted from `<strong>` in `.instructions`.
- **Sentence:** Formatted as:
  ```
  What does [word] mean?
  1A [choice 1]
  2B [choice 2]
  ...
  ```

### 3. Synonym-Style Multiple-Choice
- **Word:** Extracted from `<strong>` in `.instructions`.
- **Sentence:** Formatted as:
  ```
  [word] has the same or almost the same meaning as:
  1A [choice 1]
  2B [choice 2]
  ...
  Please explain with the 2 words
  ```

### 4. Spelling Questions
- **Word:** Extracted from `.correctspelling` if available, otherwise from `<strong>` in `.sentence.complete` or `.sentence.blanked`.
- **Sentence:** The full sentence from `.sentence.complete` or `.sentence.blanked`.

### 5. Question-Style Multiple-Choice
- **Word:** Extracted from `<strong>` in `.sentence` in `.questionContent`.
- **Sentence:** The question text followed by the formatted choices.

### 6. Opposite-Style Multiple-Choice
- **Word:** Extracted from `<strong>` in `.instructions`.
- **Sentence:** The instructions text, followed by the choices, and ending with an explanation prompt.

### 7. Manual Entry
- If the "Word" field is filled manually, "Generate Prompt" will always generate and copy the prompt, regardless of page parsing.

---

## Extraction Logic Flowchart

```mermaid
flowchart TD
    Start(["Start"])
    Start --> |"typeA"| Opposite
    Start --> |"typeT"| Spelling
    Start --> |"typeD"| Definition
    Start --> |"typeS"| Synonym
    Start --> |"typeP"| Question
    Start --> |"else"| Fallback

    Opposite --> End
    Spelling --> End
    Definition --> End
    Synonym --> End
    Question --> End
    Fallback --> End
    End(["Extract word & sentence"])
```

---

## Component Architecture Diagram

```mermaid
flowchart LR
    subgraph "Browser_Tab[Active Vocabulary.com Tab]"
        PageDOM["Page DOM<br/>(challenge-slide, question, etc.)"]
        ContentScript["Content Script<br/>(content.js)"]
    end
    subgraph "Extension_Popup[Extension Popup]"
        PopupUI["Popup UI<br/>(popup.html, ui.js)"]
    end
    PopupUI -- "chrome.scripting.executeScript + sendMessage" --> ContentScript
    ContentScript -- "Extract word & sentence" --> PageDOM
    ContentScript -- "Send result" --> PopupUI
```

---

## Scenario Table

| Type   | Word Source                | Sentence Source/Format                                 |
|--------|---------------------------|--------------------------------------------------------|
| typeA  | .instructions strong      | Instructions text + choices + explanation              |
| typeT  | .correctspelling or <strong> in .sentence.complete/.blanked | .sentence.complete or .sentence.blanked                |
| typeD  | <strong> in .instructions | "What does [word] mean?" + choices                    |
| typeS  | <strong> in .instructions | "[word] has the same or almost the same meaning as:" + choices + explanation |
| typeP  | <strong> in .sentence     | Question text + choices                                |
| else   | <strong> in .sentence     | .sentence                                              |

---

## How It Works

- The extension always targets the currently visible `.challenge-slide.selected` for extraction.
- The popup event handler ensures that prompt generation is robust: it tries to parse the page if fields are empty, but always allows manual entry as a fallback.
- Notifications are shown if parsing fails, guiding the user to enter missing content.

## Limitations & Notifications

- **Restricted Pages:**  
  The extension cannot be used on internal browser pages (such as `chrome://`, `edge://`, or `extension://` URLs) due to browser security restrictions. If you attempt to use the extension on these pages, a notification will appear for 2 seconds and then fade out, informing you to switch to a regular website.
- **Notification UX:**  
  All notifications (including errors and user feedback) are displayed for 2 seconds and then fade out smoothly, providing a clear and non-intrusive user experience.

## Lessons Learned

See [`lesson_learned.md`](lesson_learned.md) for a concise summary of implementation strategies, key takeaways, and unique architectural decisions. Redundant scenario and workflow details have been consolidated for clarity.

---

## Modular CSS & UI Consistency

- When modularizing CSS, preserve selector order, specificity, and cascade to avoid regressions.
- Use `gap` for flexbox spacing, and remove default margins from buttons for pixel-perfect control.
- For theme-adaptive dropdown arrows, use CSS variables and set `background-image` on the correct selector.
- Use `em` units for margin/padding when you want spacing to scale with font size.
- Control overall popup spacing with `body { padding: ... }` and use `padding-top` for space above absolutely positioned elements.
- Visually test after each modularization step in both light and dark themes.
- Remove default browser margins from elements for precise control.
- Document modularization and spacing strategies in the codebase for future contributors.

---

## Linting & Code Quality

- **HTML:**  
  Run `npx htmlhint` to check HTML files using `.htmlhintrc`.
- **CSS:**  
  Run `npx stylelint "**/*.css"` to check CSS files using `.stylelintrc.json`.
- **Editor Integration:**  
  For best results, install the HTMLHint and Stylelint plugins in VSCode or your editor of choice.

- **Note:**  
  If you want to add JavaScript linting, consider adding ESLint and documenting it similarly.

---
