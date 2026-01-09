# Implementation Plan: Video UI Improvements

## Overview

This implementation plan covers swapping video grid item descriptions and enhancing YouTube title extraction with fallback mechanisms. The changes are minimal and focused on HTML content updates and JavaScript logic improvements.

## Tasks

- [x] 1. Update HTML video grid descriptions
  - Swap the instruction text content for the two video grid items in popup.html
  - Ensure first grid item shows "Extract questions and options from DeepSRT challenge pages"
  - Ensure second grid item shows "Generate quiz from YouTube video pages"
  - _Requirements: 1.1, 1.2_

- [ ]* 1.1 Write unit tests for HTML content verification
  - Test that first grid item contains correct DeepSRT description
  - Test that second grid item contains correct YouTube description
  - Test that existing button functionality is preserved
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [-] 2. Enhance YouTube title extraction logic
  - [x] 2.1 Create title cleaning utility functions
    - Implement function to remove YouTube suffixes like " - YouTube"
    - Implement function to handle numeric prefixes like "(14) "
    - Implement function to validate non-empty titles after cleaning
    - _Requirements: 2.3, 2.4, 2.5_

  - [ ]* 2.2 Write property tests for title cleaning
    - **Property 1: YouTube Suffix Removal**
    - **Validates: Requirements 2.3**

  - [ ]* 2.3 Write property tests for prefix handling
    - **Property 2: Numeric Prefix Handling**
    - **Validates: Requirements 2.4**

  - [ ]* 2.4 Write property tests for title validation
    - **Property 3: Non-empty Title Validation**
    - **Validates: Requirements 2.5**

- [-] 3. Update extractMetadataFromPage function
  - [x] 3.1 Implement fallback title extraction logic
    - Modify extractMetadataFromPage to try meta element first
    - Add fallback to document.title when meta element fails
    - Apply title cleaning to document.title results
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 3.2 Write unit tests for extraction methods
    - Test meta element extraction (existing functionality)
    - Test document.title fallback behavior
    - Test extraction method priority
    - Test error handling when both methods fail
    - _Requirements: 2.1, 2.2, 2.6_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties for title cleaning
- Unit tests validate specific examples and integration behavior