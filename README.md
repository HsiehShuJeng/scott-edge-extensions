# Scott's Assistant for Language Learning and Programming

This browser extension provides comprehensive assistance for language learners (English and Korean) and programmers. It extracts vocabulary questions and context from Vocabulary.com, generates optimized LLM prompts for language learning, and provides programming tools for commit message generation and pull request creation.

## Table of Contents
- [Language Learning Features](#language-learning-features)
- [YouTube Quiz Generator](#youtube-quiz-generator)
- [Infographic Prompt Generator](#infographic-prompt-generator)
- [Gemini Image Polisher](#gemini-image-polisher)
- [Programming Features](#programming-features)
  - [Enhanced Commit Message Generation](#enhanced-commit-message-generation)
  - [Pull Request Creation](#pull-request-creation)
  - [Branch Naming Tools](#branch-naming-tools)
- [Technical Documentation](#technical-documentation)
- [UI Features](#ui-features)
- [Architecture](#architecture)
  - [Component Diagram](#component-diagram)
  - [Programming Tools Workflow](#programming-tools-workflow)
  - [Language Learning Extraction Logic](#language-learning-extraction-logic)
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

## YouTube Quiz Generator

### Educational Content Creation
- **YouTube Video Metadata Extraction**  
  Automatically extracts video URL and title from YouTube video pages using content scripts
- **Structured Quiz Prompt Generation**  
  Creates formatted 10-question multiple-choice quiz templates based on video content
- **Clipboard Integration**  
  Copies generated quiz prompts directly to clipboard for immediate use
- **Comprehensive Error Handling**  
  Validates YouTube page context and provides clear feedback for unsupported pages
- **Educational Focus**  
  Generates prompts that encourage analytical thinking and comprehension testing

#### Quiz Prompt Template Features
The generated quiz prompts include:

- **Structured Format**: Numbered questions with 4 multiple-choice options (A, B, C, D)
- **Educational Requirements**: Instructions for correct answers and explanations
- **Difficulty Variation**: Mix of basic recall and analytical thinking questions
- **Content Analysis**: Prompts for video transcript analysis and key concept identification
- **Engagement Focus**: Questions designed to test viewer understanding and retention

## Infographic Prompt Generator

### Professional Visual Design
- **9 Distinct Styles**:
  Select from professionally curated styles including Bright Enterprise, Frosted Glass, Neon Cyberpunk, Minimalist Swiss, and Cinematic Nature.
- **Global Artistic Inspiration**:
  Apply sophisticated artistic directions (e.g., "Ghost in the Shell" Cyberpunk HUD, "Final Fantasy VIII" JRPG UI) to *any* of the base styles for unique combinations.
- **Visual Previews**:
  Interactive preview images update instantly to show the aesthetic of the selected style.
- **Smart Prompt Engineering**:
  - **Context-Aware**: Generates generic templates if no topic is provided, or specific content-based prompts if a topic is entered.
  - **Auto-Localization**: Automatically appends requirements for Traditional Chinese text output suitable for the Taiwan market.



## Programming Features

### Enhanced Commit Message Generation
- **Current Changes Analysis**  
Generate commit messages for unstaged changes using `git diff --word-diff`
- **Staged Changes Analysis**  
Generate commit messages for staged changes using `git diff --cached --word-diff`
- **Range Changes Analysis**  
Generate commit messages for changes between branches using `git diff main..HEAD`
- **AI-Optimized Prompt Generation**  
Creates a structured prompt based on file changes and conventional commit rules for LLM processing.

#### Conventional Commit Framework
The extension implements comprehensive conventional commit rules with the following structure:

**Format:** `<type>[optional scope]: <description>`

**Supported Types (prioritized):**
- `feat`: new features or capabilities
- `fix`: bug fixes or corrections  
- `docs`: documentation only changes
- `style`: formatting, missing semicolons (no code change)
- `refactor`: code change that neither fixes bug nor adds feature
- `perf`: performance improvements
- `test`: adding missing tests or correcting existing tests
- `build`: changes affecting build system or dependencies
- `ci`: changes to CI configuration files and scripts
- `chore`: other changes that don't modify src or test files
- `revert`: reverts a previous commit

**Guidelines:**
- Subject line: imperative mood, no period, under 50 characters
- Body: wrap at 72 characters, use present tense
- Include breaking changes in footer with `BREAKING CHANGE:`
- Reference issues with `Closes #123` or `Fixes #456`
- Use scope for component/module (e.g., auth, ui, api)

**Examples:**
- `feat(auth): add user login validation`
- `fix(ui): resolve button alignment on mobile`
- `docs: update API documentation for v2.0`

### Pull Request Creation
- **PR Command Generation**  
Generate printf commands for PR creation with automatic git repository detection
- **Shell Command Output**  
Creates ready-to-execute commands that extract owner, repo, head, and base branch information
- **Input Validation**  
Validates PR descriptions (3-5000 characters) with detailed error messages

### Branch Naming Tools
- **Feature Description Input**  
Generate branch naming suggestions based on feature descriptions or bug reports
- **Input Validation**  
Validates input length (3-2000 characters) and provides clear error messages
- **Prompt Generation**  
Creates structured prompts for LLM-assisted branch naming with development context



## Language Learning Scenarios

- **Single word**: e.g., `unenforceable`
- **Single word with context sentence**: e.g., `aloof`  
  _His ratings remain dismal, not least because of his cold, aloof manner and his eagerness to please the party._
- **Multiple words with context sentence**
- **All major Vocabulary.com question types** (see Scenario Table below)
- **Etymology and part of speech**: If available, the prompt will include etymology and part of speech fetched from Etymonline.

---

## UI Features
- **Three-Tab Interface**: Organized into Language, Video, and Programming Engineering (PE) tabs for better feature separation (plus dedicated Infographic tool)
- **Infographic Generator**: Specialized interface for creating professional design prompts with visual style previews
- **YouTube Quiz Generator**: Dedicated functionality in the Video tab for creating educational quiz content from YouTube videos
- **Theme Toggle**: Switch between light and dark modes using the sun/moon icon in the top-right corner
- **Persistent Preferences**: Your theme preference is saved between sessions
- **Multi-language Support**: Dedicated sections for English and Korean learning in the Language tab
- **Programming Tools**: Comprehensive development tools in the PE tab including commit analysis, PR creation, and branch naming
- **Video Extraction**: Dedicated Video tab for extracting questions from DeepSRT challenge pages and generating YouTube quiz content
- **Auto-resize Textareas**: Dynamic sizing for better content input (up to 300px max height)
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
    CommitTools["Enhanced Commit Tools"]
    PRTools["PR Creation Tools"]
    BranchTools["Branch Naming Tools"]
    YouTubeQuiz["YouTube Quiz Generator (youtube-quiz-generator.js)"]

    UI -- interacts with --> PopupJS
    PopupJS -- initializes --> UI
    UI -- uses --> Session
    UI -- uses --> Translation
    UI -- uses --> Utils
    UI -- uses --> CommitTools
    UI -- uses --> PRTools
    UI -- uses --> BranchTools
    UI -- uses --> YouTubeQuiz
    Translation -- uses --> Etymology
    Translation -- fetches from --> ContentScript
    Session -- uses --> Utils
    ContentScript -- provides data to --> Translation
    CommitTools -- generates --> Utils
    PRTools -- generates --> Utils
    BranchTools -- generates --> Utils
    YouTubeQuiz -- extracts metadata --> ContentScript
    YouTubeQuiz -- generates prompts --> Utils
    UI -- user actions --> UI
```

### Programming Tools Workflow

```mermaid
flowchart TD
    Start(["User Input"])
    Start --> CommitBtn["Commit Button Click"]
    Start --> PRBtn["PR Button Click"]
    Start --> BranchBtn["Branch Button Click"]
    
    CommitBtn --> CommitType{"Select Commit Type"}
    CommitType --> |"Current"| CurrentDiff["Generate Current Changes Diff"]
    CommitType --> |"Staged"| StagedDiff["Generate Staged Changes Diff"]
    CommitType --> |"Range"| RangeDiff["Generate Range Changes Diff"]
    
    CurrentDiff --> EnhancedRules["Apply Enhanced Conventional Commit Rules"]
    StagedDiff --> EnhancedRules
    RangeDiff --> EnhancedRules
    EnhancedRules --> CopyCommit["Copy to Clipboard"]
    
    PRBtn --> ValidatePR["Validate PR Input"]
    ValidatePR --> |"Valid"| GeneratePRCmd["Generate Printf Command"]
    ValidatePR --> |"Invalid"| ShowPRError["Show Error Message"]
    GeneratePRCmd --> CopyPR["Copy to Clipboard"]
    
    BranchBtn --> ValidateBranch["Validate Branch Input"]
    ValidateBranch --> |"Valid"| GenerateBranchPrompt["Generate Branch Naming Prompt"]
    ValidateBranch --> |"Invalid"| ShowBranchError["Show Error Message"]
    GenerateBranchPrompt --> CopyBranch["Copy to Clipboard"]
    
    CopyCommit --> Notify["Show Success Notification"]
    CopyPR --> Notify
    CopyBranch --> Notify
    ShowPRError --> End
    ShowBranchError --> End
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

<!-- ... -->

## Gemini Image Polisher

A client-side tool to manipulate watermarks on images.

### Features
- **Smart Detection**: Uses **Pearson Correlation** to statistically verify the presence of a watermark before processing, ensuring clean images are never damaged.
- **Watermark Removal**: Uses advanced reverse alpha blending to remove Google Gemini generated watermarks.
- **Watermark Addition**: Adds a customizable "signature" watermark with Traditional Chinese date and calligraphy font.
    - **Customizable**: Adjust opacity, color, angle, size, and stroke.
    - **Real-time Preview**: See changes instantly as you adjust sliders.
- **Privacy Focused**: 100% client-side processing.

## Technical Documentation

- [Gemini Watermark Removal Logic](doc/gemini-watermark-removal.md)
- [Watermark Addition & Font Handling](doc/watermark-addition.md)
- [UI Resolution: Marquee Text Cutoff](doc/marquee_fix.md)


## Development & Contribution

### Loading into Edge
1. Type `edge://extensions`
2. Click the 'Reload' button

### Development
1. Make sure [Microsoft Edge DevTools extension](https://learn.microsoft.com/en-us/microsoft-edge/visual-studio-code/microsoft-edge-devtools-extension) is installed on VS code.
2. When developing in VS Code, move to an HTML file, right click the file, and then choose 'Open with Edge' > 'Open Browser with DevTools'.

#### Current Architecture
- **Main extension files**: Located in `asking-expert/` directory
- **Popup interface**: `popup.html`, `popup.js` (main bootstrap)
- **Content scripts**: `content.js` (page interaction)
- **Modular components**: Organized into feature-based modules:
  - **Video Module** (`modules/video/`): `video-extractor.js`, `youtube-quiz-generator.js`
  - **Language Module** (`modules/language/`): `translation.js`, `session.js`, `etymology.js`
  - **Core Module** (`modules/core/`): `ui.js`, `utils.js`, `content.js`
  - **Watermark Module** (`modules/watermark/`): `watermarkEngine.js`, `blendModes.js`, `alphaMap.js`
- **Styling**: Modular CSS files in `asking-expert/styles/` directory
- **Programming tools**: Integrated commit, PR, and branch naming functionality
- **YouTube tools**: Quiz generator for educational content creation

#### Module Organization

The JavaScript codebase is organized into feature-based modules for better maintainability:

```
asking-expert/
├── modules/
│   ├── video/           # Video-related functionality
│   ├── language/        # Language learning functionality
│   ├── watermark/       # Watermark removal logic
│   └── core/            # Core utilities and UI
├── popup.js (main entry point)
├── popup.html
├── manifest.json
├── images/
└── styles/
```

### Contributor Onboarding

#### Branching Strategy
```mermaid
graph TD
    A["main branch"] -->|"production-ready"| B["Release"]
    C["Feature branch"] -->|"development"| D["New features"]
    E["HOTFIX branch"] -->|"urgent fixes"| F["Critical bugs"]
```

**Feature Development Workflow:**
1. Create feature branch from main.
2. Develop and test changes.
3. Review and update `README.md` and `lesson_learned.md`.
4. Stage and commit changes.
5. Push branch and create PR.

#### Development Workflow
1. `npm install`
2. Make code changes.
3. `git add .`
4. `git commit -m "your message"`

#### Release Process
1. `npm run release`
2. `node scripts/sync-version.js`
3. `git add asking-expert/manifest.json`
4. `git commit --amend --no-edit`
5. `git tag -f vX.X.X`
6. `git push --follow-tags origin <branch-name>`

### Modular CSS & UI Consistency

- Use `gap` for flexbox spacing.
- Use `em` units for scaling spacing.
- Control overall popup spacing with `body { padding: ... }`.

### Linting & Code Quality

- **HTML:** `npx htmlhint`
- **CSS:** `npx stylelint "**/*.css"`

## Limitations & Notifications

- **Restricted Pages:** Cannot run on `chrome://` or `edge://` pages.
- **Notification UX:** Notifications fade out after 2 seconds.

## Lessons Learned

See [`lesson_learned.md`](lesson_learned.md) for implementation strategies and key takeaways.
