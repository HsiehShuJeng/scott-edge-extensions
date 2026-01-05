/**
 * YouTube Quiz Generator Module
 * Extracts YouTube video metadata and generates formatted quiz prompts
 */

import { showNotification } from '../core/utils.js';

/**
 * Orchestrates the YouTube metadata extraction process
 * @returns {Promise<Object>} Object containing url and title properties
 * @throws {Error} When metadata extraction fails or user is not on YouTube page
 */
export async function extractYouTubeMetadata() {
    try {
        // Get the active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab) {
            throw new Error('No active tab found');
        }

        // Check if the page is a YouTube video page
        if (!tab.url.includes('youtube.com/watch')) {
            throw new Error('This feature only works on YouTube video pages');
        }

        // Execute content script to extract metadata from page
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: extractMetadataFromPage
        });

        if (!results || !results[0] || !results[0].result) {
            throw new Error('Failed to extract metadata from page');
        }

        const metadata = results[0].result;
        
        if (!metadata.success) {
            throw new Error(metadata.error || 'Failed to extract video metadata');
        }

        return {
            url: metadata.url,
            title: metadata.title
        };
    } catch (error) {
        console.error('Error extracting YouTube metadata:', error);
        throw error;
    }
}

/**
 * Content script function to extract metadata from YouTube page DOM
 * This function runs in the context of the webpage
 * @returns {Object} Extraction result with success status, url, and title
 */
function extractMetadataFromPage() {
    try {
        // Extract canonical URL from link element with rel="canonical"
        const canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink || !canonicalLink.href) {
            return {
                success: false,
                error: 'Could not find canonical URL on this page'
            };
        }
        
        const url = canonicalLink.href;
        
        // Extract video title from meta element with name="title"
        const titleMeta = document.querySelector('meta[name="title"]');
        if (!titleMeta || !titleMeta.content) {
            return {
                success: false,
                error: 'Could not find video title on this page'
            };
        }
        
        const title = titleMeta.content.trim();
        
        // Validate that we have both URL and title
        if (!url || !title) {
            return {
                success: false,
                error: 'Incomplete metadata extracted from page'
            };
        }

        return {
            success: true,
            url: url,
            title: title
        };
    } catch (error) {
        return {
            success: false,
            error: `Error extracting metadata: ${error.message}`
        };
    }
}

/**
 * Creates the formatted quiz prompt template with video URL and title
 * @param {string} url - The YouTube video URL
 * @param {string} title - The video title
 * @returns {string} The complete formatted quiz prompt template
 */
export function generateQuizPrompt(url, title) {
    // Validate input parameters
    if (!url || typeof url !== 'string') {
        throw new Error('Invalid URL provided');
    }
    
    if (!title || typeof title !== 'string') {
        throw new Error('Invalid title provided');
    }
    
    // Generate the complete quiz prompt template
    const prompt = `You are a quiz generator.

INPUT:
1) A YouTube video transcript WITH timestamps (may be partial).
2) ${url}
3) ${title}

GOAL:
Create MCQs that test understanding of what the speaker MEANS (claims, reasoning, comparisons, examples),
NOT trivia recall. Every answer must be verifiable DIRECTLY from a specific transcript segment.

HARD CONSTRAINTS (NON-NEGOTIABLE):
- Generate EXACTLY 10 MCQs.
- Each question must be answerable from the transcript ONLY (no outside knowledge, no guessing).
- Exactly ONE option is correct (A/B/C/D).
- Options must be plausible, mutually exclusive, and based on transcript language/style.
- NO duplicates: no repeated stems, no repeated "same-fact" questions, no copy-paste.
- If the transcript is too short to create 10 high-quality questions under these rules, output exactly:
TRANSCRIPT_TOO_SHORT_TO_GENERATE_10

ANTI-TRIVIA RULE (VERY IMPORTANT):
- At most 2 questions may be pure "fact recall" (e.g., birthplace, date, name, location).
- At least 6 questions must be "meaning/comprehension" that still has an explicit anchor in the transcript:
(a) cause → effect stated by speaker
(b) comparison/contrast between two things
(c) definition/explanation ("X means…", "the point is…")
(d) example → claim linkage ("the example is used to show…")
(e) reasoning or motivation ("why does the speaker say/do this?")
- Avoid questions whose correct answer is a single noun/number unless it is essential to a claim.

REQUIRED QUESTION TYPE MIX (to force depth & variety):
- At least 2 Cause–Effect questions
- At least 2 Comparison/Contrast questions
- At least 2 Definition/Explanation questions
- At least 2 Example→Point questions
- Remaining 2 can be any type, but must not be trivia unless within the max-2 limit.

BILINGUAL REQUIREMENT (English + Traditional Chinese, native-natural):
- Each Question must be bilingual in ONE field as:
"<EN sentence> / <繁中句子>"
- Each option must also be bilingual in ONE field as:
"<EN option> / <繁中選項>"
- The Correct Answer Text must EXACTLY match one of the options (character-for-character).

COVERAGE:
- Cover early/mid/late segments if transcript allows:
at least 2 questions from each third (by timestamp range).
- Prefer questions tied to key claims, transitions, and examples (not intro fluff only).

TIMESTAMP RULE:
- For each question, pick the most relevant timestamp (seconds) where the answer is stated.
- Output URL as: <base_url>&t=<seconds>s
- Use the FIRST second where the decisive phrase begins.

OUTPUT FORMAT (NO EXTRA COMMENTARY):
- First line exactly:
Video Title: <title>
- Then EXACTLY 10 lines. Each line is one record in TSV-like format using " | " as delimiter:
<Video Title> | <Question> | <Correct Answer Text> | <Option A> | <Option B> | <Option C> | <Option D> | <Reason (1-2 sentences citing transcript)> | <Related URL with Timestamp>

QUALITY CHECK BEFORE FINAL (DO THIS SILENTLY):
- Count: exactly 10 question lines.
- Correct answer text == exactly one option.
- Reasons explicitly cite what is said (no inference beyond transcript).
- No duplicate stems, no "same-answer" repeats, no near-rephrases.`;

    return prompt;
}

/**
 * Event handler for the YouTube Quiz Generator button click
 * Orchestrates the complete workflow: extract metadata, generate prompt, copy to clipboard
 * @returns {Promise<void>}
 */
export async function handleQuizGeneratorClick() {
    try {
        // Extract YouTube metadata from current page
        const metadata = await extractYouTubeMetadata();
        
        // Generate the quiz prompt with extracted metadata
        const prompt = generateQuizPrompt(metadata.url, metadata.title);
        
        // Copy the prompt to clipboard
        await navigator.clipboard.writeText(prompt);
        
        // Show success notification
        showNotification('Quiz prompt copied to clipboard!', false, 'YouTube Quiz');
        
    } catch (error) {
        console.error('Quiz generator error:', error);
        
        // Show error notification with descriptive message
        showNotification(`Error: ${error.message}`, true, 'YouTube Quiz');
    }
}