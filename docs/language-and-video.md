# Language Learning & Video Content Features

The Scott's Assistant extension provides a suite of features for extracting, studying, and quizzing yourself on web content, particularly focusing on language learning platforms and YouTube videos.

## Language Learning Features

### DeepSRT Integration (For Japanese Learning)
Designed to work seamlessly with deeply-captioned challenge pages on DeepSRT to accelerate vocabulary acquisition.

- **Vocabulary Extraction**: Scrapes Japanese vocabulary items and their respective options directly from challenging quiz formats on DeepSRT.
- **Copy to Clipboard**: Formats the extracted vocabulary and definitions cleanly and copies them to your clipboard, allowing you to paste them into Anki, flashcards, or language notebooks instantly.
- **How it Works**: Uses DOM parsing scripts (`content.js` and `background.js`) to find specific structural hints in DeepSRT tables/divs, stripping out irrelevant styling or ad elements.

## YouTube Video Features

### YouTube Quiz Generator
Transforms passive video watching into active recall learning by generating auto-quizzes from any YouTube video.

- **Fast Video ID Input**: Automatically captures the Video ID of the currently active YouTube tab, or allows manual entry if needed.
- **Quick Action Button**: The extension can open the video source directly in a distraction-free window or directly send the Video ID to the backend generator.
- **Transcript Extraction**: Bypasses the need for manual transcription. The extension hooks into YouTube's API (via background service workers) to fetch the video's subtitle/transcript track.
- **LLM Quiz Generation**: Feeds the transcript to a specialized prompt to generate highly relevant multiple-choice or short-answer questions.
- **Study Aid**: Excellent for tech talks, lectures, and long-form documentary content.
