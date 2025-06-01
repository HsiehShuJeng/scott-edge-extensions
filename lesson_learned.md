# Lessons Learned: Robust Vocabulary.com Extension Implementation

## 1. Scenario Separation for User Experience
- **Manual Entry Always Works:**  
  The popup logic ensures that if the "Word" field has content, "Generate Prompt" will always generate and copy the prompt, regardless of page parsing. This prevents the extension from being blocked by parsing failures.
- **Page Parsing as Fallback:**  
  Only if the "Word" field is empty does the extension attempt to parse the active tab for a word and sentence, making the UX robust and user-friendly.
