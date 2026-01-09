# Design Document: Video UI Improvements

## Overview

This design addresses two key improvements to the video quiz generation functionality:
1. Swapping the descriptions of video grid items to accurately reflect their functionality
2. Enhancing YouTube title extraction with fallback mechanisms for better reliability

The changes are minimal and focused, requiring only HTML content updates and JavaScript logic enhancements without affecting the overall architecture.

## Architecture

The existing modular architecture remains unchanged:
- **HTML Layer**: `popup.html` contains the UI structure
- **Video Module**: `modules/video/` contains the business logic
- **Core Module**: `modules/core/` provides shared utilities

The improvements will be isolated to:
- HTML content changes in `popup.html`
- Logic enhancements in `youtube-quiz-generator.js`

## Components and Interfaces

### HTML Structure Changes

The video grid container in `popup.html` contains two grid items that need their descriptions swapped:

**Current State:**
- First item: "Generate quiz from YouTube video pages"
- Second item: "Extract questions and options from DeepSRT challenge pages"

**Target State:**
- First item: "Extract questions and options from DeepSRT challenge pages"
- Second item: "Generate quiz from YouTube video pages"

### YouTube Title Extraction Enhancement

The `extractMetadataFromPage()` function in `youtube-quiz-generator.js` will be enhanced with a fallback mechanism:

**Current Implementation:**
```javascript
// Only uses meta[name="title"] element
const titleMeta = document.querySelector('meta[name="title"]');
```

**Enhanced Implementation:**
```javascript
// Primary: meta[name="title"] element
// Fallback: document.title with cleaning
```

## Data Models

### Title Extraction Result

```javascript
{
  success: boolean,
  title: string,
  source: 'meta' | 'title' | null,
  error?: string
}
```

### Title Cleaning Rules

For titles extracted from `document.title`:
1. Remove " - YouTube" suffix
2. Remove numeric prefixes like "(14) "
3. Trim whitespace
4. Validate non-empty result

## Error Handling

### Title Extraction Errors

1. **Meta element not found**: Fallback to document.title
2. **Document.title empty**: Return descriptive error
3. **Cleaned title empty**: Return validation error
4. **Both methods fail**: Return comprehensive error message

### Backward Compatibility

The enhanced title extraction maintains full backward compatibility:
- Existing functionality continues to work
- New fallback only activates when primary method fails
- No breaking changes to the API

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: YouTube Suffix Removal
*For any* string ending with " - YouTube", the title cleaning function should remove this suffix and return the remaining content
**Validates: Requirements 2.3**

### Property 2: Numeric Prefix Handling  
*For any* string starting with a pattern like "(number) ", the title cleaning function should preserve the core content after the prefix
**Validates: Requirements 2.4**

### Property 3: Non-empty Title Validation
*For any* title extraction result, if the cleaning process results in an empty or whitespace-only string, the system should treat this as a validation failure
**Validates: Requirements 2.5**

## Testing Strategy

### Unit Tests

**HTML Content Verification:**
- Verify first grid item contains DeepSRT description
- Verify second grid item contains YouTube description  
- Verify button functionality remains unchanged
- Test extraction method priority (meta element first)
- Test fallback behavior when meta element missing
- Test error handling when both methods fail

**Title Extraction Tests:**
- Test meta element extraction (existing functionality)
- Test document.title fallback with various formats
- Test error handling for edge cases

### Property-Based Tests

**Title Cleaning Properties:**
- Property tests for YouTube suffix removal across various input formats
- Property tests for numeric prefix handling with different prefix patterns
- Property tests for validation of cleaned titles to ensure non-empty results

**Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with: **Feature: 20250109-video-ui-improvements, Property {number}: {property_text}**