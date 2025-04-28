# scott-edge-extensions
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

## Architecture Diagram

```mermaid
graph TD
    subgraph "Popup UI (popup.html)"
        A1["English Section"]
        A2["Korean Section"]
        A3["Programming Section"]
        A4["Flag Switch Buttons"]
    end
    
    subgraph "popup.js"
        B1["initializeUI()"]
    end
    
    subgraph "ui.js"
        C1["registerEventListeners"]
        C2["toggleSectionVisibility"]
        C3["calculateMaxHeight"]
    end
    
    subgraph "session.js"
        D1["handleStartEnglishSession"]
        D2["handleEndEnglishSession"]
        D3["handleStartKoreanSession"]
        D4["handleEndKoreanSession"]
    end
    
    subgraph "translation.js"
        E1["generateTranslationPrompt"]
        E2["generateOutput"]
        E3["getSentenceContent"]
    end
    
    subgraph "etymology.js"
        F1["fetchEtymologyExplanation"]
    end
    
    subgraph "utils.js"
        G1["$ (DOM helper)"]
        G2["showNotification"]
        G3["copyToClipboard"]
        G4["handleResultClick"]
        G5["generateCommitMessagePrompt"]
    end
    
    subgraph "content.js"
        H1["Content Script: getActiveSentenceContent, getKoreanContent"]
    end
    
    %% UI triggers
    A1-->|"Events"|B1
    A2-->|"Events"|B1
    A3-->|"Events"|B1
    A4-->|"Events"|B1
    B1-->|"Calls"|C1
    B1-->|"Calls"|C2
    B1-->|"Calls"|C3
    
    %% Event listeners
    C1-->|"Session"|D1
    C1-->|"Session"|D2
    C1-->|"Session"|D3
    C1-->|"Session"|D4
    C1-->|"Translation"|E1
    C1-->|"Output"|E2
    C1-->|"Commit"|G5
    C1-->|"Result Click"|G4
    
    %% Data flow
    E1-->|"Clipboard"|G3
    E2-->|"Clipboard"|G3
    D1-->|"Clipboard"|G3
    D2-->|"Clipboard"|G3
    D3-->|"Clipboard"|G3
    D4-->|"Clipboard"|G3
    G5-->|"Clipboard"|G3
    
    E1-->|"Notification"|G2
    E2-->|"Notification"|G2
    G5-->|"Notification"|G2
    
    E2-->|"Etymology"|F1
    E1-->|"Get Content"|E3
    E3-->|"Content Script"|H1
    
    %% Content script
    H1-->|"Returns"|E3
```

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

## Sequence Diagram (User Generates English Prompt)

```mermaid
sequenceDiagram
    participant User
    participant PopupUI as Popup UI
    participant UIJS as ui.js
    participant Translation as translation.js
    participant Utils as utils.js
    participant Clipboard as Clipboard

    User->>PopupUI: Clicks "Generate Prompt"
    PopupUI->>UIJS: Event handler
    UIJS->>Translation: generateOutput('english')
    Translation->>Utils: copyToClipboard(prompt)
    Utils->>Clipboard: Write prompt
    Utils->>UIJS: showNotification
    UIJS->>User: Notification shown
```