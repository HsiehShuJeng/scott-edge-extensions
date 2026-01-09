# Requirements Document

## Introduction

This specification covers improvements to the video quiz generation functionality in the browser extension. The changes involve swapping UI descriptions and enhancing title extraction capabilities for YouTube videos.

## Glossary

- **Video_Grid_Container**: The HTML container with class "video-grid-container" that holds two video-related tools
- **Quiz_Generator**: The tool that generates quiz prompts from YouTube video pages
- **Question_Extractor**: The tool that extracts questions from DeepSRT challenge pages
- **Title_Extraction**: The process of extracting video titles from YouTube pages
- **Meta_Title_Element**: The HTML `<meta name="title">` element currently used for title extraction
- **Page_Title_Element**: The HTML `<title>` element that contains the page title

## Requirements

### Requirement 1: Swap Video Grid Item Descriptions

**User Story:** As a user, I want the video grid item descriptions to accurately reflect their functionality, so that I can easily understand what each tool does.

#### Acceptance Criteria

1. WHEN the video tab is displayed, THE Video_Grid_Container SHALL show "Extract questions and options from DeepSRT challenge pages" as the description for the first grid item
2. WHEN the video tab is displayed, THE Video_Grid_Container SHALL show "Generate quiz from YouTube video pages" as the description for the second grid item
3. THE first grid item SHALL maintain its existing video ID input functionality and "Extract Questions" button
4. THE second grid item SHALL maintain its existing "Generate Quiz" button functionality

### Requirement 2: Enhanced YouTube Title Extraction

**User Story:** As a user, I want the quiz generator to extract video titles from multiple sources, so that it works reliably across different YouTube page configurations.

#### Acceptance Criteria

1. WHEN extracting YouTube metadata, THE Quiz_Generator SHALL first attempt to extract the title from the Meta_Title_Element
2. IF the Meta_Title_Element is not found or empty, THEN THE Quiz_Generator SHALL extract the title from the Page_Title_Element
3. WHEN extracting from the Page_Title_Element, THE Quiz_Generator SHALL clean the title by removing YouTube-specific suffixes like " - YouTube"
4. WHEN extracting from the Page_Title_Element, THE Quiz_Generator SHALL handle titles with prefixes like "(14) " by preserving the core title content
5. THE Quiz_Generator SHALL validate that the extracted title is not empty after cleaning
6. IF both extraction methods fail, THEN THE Quiz_Generator SHALL return an appropriate error message