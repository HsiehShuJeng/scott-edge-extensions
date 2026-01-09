/**
 * YouTube Quiz Generator Module
 * Extracts YouTube video metadata and generates formatted quiz prompts
 */

import { showNotification } from '../core/utils.js';

/**
 * Title Cleaning Utility Functions
 * These functions clean and validate YouTube video titles extracted from document.title
 */

/**
 * Removes YouTube-specific suffixes from video titles
 * @param {string} title - The title to clean
 * @returns {string} The title with YouTube suffixes removed
 */
export function removeYouTubeSuffix(title) {
    if (typeof title !== 'string') {
        return '';
    }
    
    // Remove " - YouTube" suffix (case-insensitive)
    return title.replace(/\s*-\s*YouTube\s*$/i, '').trim();
}

/**
 * Handles numeric prefixes in YouTube titles like "(14) " or "[5] "
 * @param {string} title - The title to clean
 * @returns {string} The title with numeric prefixes removed
 */
export function removeNumericPrefix(title) {
    if (typeof title !== 'string') {
        return '';
    }
    
    // Remove patterns like "(14) " or "[5] " from the beginning
    return title.replace(/^[\(\[]?\d+[\)\]]?\s+/, '').trim();
}

/**
 * Validates that a title is not empty after cleaning
 * @param {string} title - The title to validate
 * @returns {boolean} True if title is valid (non-empty after trimming), false otherwise
 */
export function validateNonEmptyTitle(title) {
    if (typeof title !== 'string') {
        return false;
    }
    
    return title.trim().length > 0;
}

/**
 * Comprehensive title cleaning function that applies all cleaning rules
 * @param {string} title - The raw title to clean
 * @returns {string} The cleaned title
 */
export function cleanTitle(title) {
    if (typeof title !== 'string') {
        return '';
    }
    
    let cleaned = title;
    
    // Apply all cleaning functions in sequence
    cleaned = removeYouTubeSuffix(cleaned);
    cleaned = removeNumericPrefix(cleaned);
    
    return cleaned.trim();
}

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
        
        // Primary: Extract video title from meta element with name="title"
        const titleMeta = document.querySelector('meta[name="title"]');
        let title = '';
        let source = null;
        
        if (titleMeta && titleMeta.content && titleMeta.content.trim()) {
            title = titleMeta.content.trim();
            source = 'meta';
        } else {
            // Fallback: Extract title from document.title and apply cleaning
            if (document.title && document.title.trim()) {
                // Apply title cleaning functions
                let cleanedTitle = document.title.trim();
                
                // Remove YouTube-specific suffixes
                cleanedTitle = cleanedTitle.replace(/\s*-\s*YouTube\s*$/i, '').trim();
                
                // Remove numeric prefixes like "(14) " or "[5] "
                cleanedTitle = cleanedTitle.replace(/^[\(\[]?\d+[\)\]]?\s+/, '').trim();
                
                // Validate that cleaned title is not empty
                if (cleanedTitle.length > 0) {
                    title = cleanedTitle;
                    source = 'title';
                }
            }
        }
        
        // Validate that we have both URL and title
        if (!url || !title) {
            return {
                success: false,
                error: 'Could not extract video title from this page'
            };
        }

        return {
            success: true,
            url: url,
            title: title,
            source: source
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
Create multiple-choice questions (MCQs) that test understanding of what is being CLAIMED or ARGUED
(reasoning, comparisons, explanations, examples),
NOT trivial fact recall.

Every correct answer must be verifiable DIRECTLY from a specific segment of the provided transcript.

────────────────────────
HARD CONSTRAINTS (NON-NEGOTIABLE)
────────────────────────
- Generate EXACTLY 10 MCQs.
- Each question must be answerable from the provided transcript ONLY.
- Exactly ONE option is correct (A/B/C/D).
- Options must be plausible, mutually exclusive, and grounded in the video’s language and logic.
- NO duplicates: no repeated question intent, no rephrased repeats, no copy-paste patterns.
- If the transcript is too short to generate 10 high-quality questions under these rules, output EXACTLY:
  TRANSCRIPT_TOO_SHORT_TO_GENERATE_10

────────────────────────
ANTI-TRIVIA RULE (VERY IMPORTANT)
────────────────────────
- At most 2 questions may be pure fact recall (names, dates, locations).
- At least 6 questions must test meaning or comprehension with an explicit anchor in the video:
  (a) Cause → effect
  (b) Comparison / contrast
  (c) Definition / explanation
  (d) Example → point being made
  (e) Reasoning or motivation
- Avoid questions whose correct answer is just a single noun or number unless essential to a claim.

────────────────────────
REQUIRED QUESTION TYPE MIX
────────────────────────
- ≥ 2 Cause–Effect questions
- ≥ 2 Comparison / Contrast questions
- ≥ 2 Definition / Explanation questions
- ≥ 2 Example → Point questions
- Remaining 2 may be any type, but must respect the anti-trivia rule

────────────────────────
GENERAL ATTRIBUTION & STYLE RULES (NON-NEGOTIABLE)
────────────────────────
- Do NOT overuse generic labels like “the speaker” / 「講者」.
- Attribute claims using the most accurate role:
  EN: the narrator, the host, the interviewer, the guest, the quoted person, the expert, the report, the video
  ZH-TW: 旁白、主持人、訪談者、來賓、受訪者、被引用的人、專家、報導、影片中
- If a specific person is explicitly named in the video (e.g., Parker, Xi Jinping), use that name.
- If the video is a narrated script with no interviews, default to:
  EN: “the narrator”
  ZH-TW: 「旁白」
- Clearly separate:
  who is speaking vs who is being described or quoted.
- Maintain a neutral, descriptive tone. Do NOT endorse or refute claims.

────────────────────────
PROHIBITED WORDING
────────────────────────
- Do NOT use the word “transcript” or 「逐字稿」 anywhere in questions, options, or reasons.

────────────────────────
REASON FORMAT (STRICT)
────────────────────────
- Each Reason must be 1–2 sentences.
- Use this exact structure:
  EN: "At <mm:ss>, the narrator/host states that …"
  ZH-TW: 「在 <mm:ss>，旁白／主持人提到…」
- Cite only what is explicitly said in the video.

────────────────────────
COVERAGE RULE
────────────────────────
- If the provided transcript covers early, middle, and late portions of the video,
  select questions across these ranges as evenly as possible.
- If the transcript is partial, still distribute questions across the available timestamps.

────────────────────────
TIMESTAMP RULE
────────────────────────
- For each question, choose the FIRST second where the decisive statement begins.
- Output URLs in this exact format:
  <base_url>&t=<seconds>s
- Use seconds in the URL; use mm:ss only inside the Reason text.

────────────────────────
LANGUAGE OUTPUT REQUIREMENT (NON-NEGOTIABLE)
────────────────────────
- Output TWO TSV blocks in Markdown, in this exact order:
  1) English block: exactly 10 rows, all fields in English.
  2) Traditional Chinese (zh-Hant) block: exactly 10 rows, all fields in Traditional Chinese.
- The two blocks must align 1-to-1:
  same question intent, same correct option meaning, same timestamp URL.
- Do NOT mix languages within a single field.
- Wrap each TSV block in its own Markdown code fence using \`\`\`tsv.

────────────────────────
OUTPUT FORMAT (NO EXTRA COMMENTARY)
────────────────────────
- First line EXACTLY:
  Video Title: <title>
- Then TWO TSV blocks.

Each TSV row must use " | " as the delimiter, in this exact order:
<Video Title> | <Question> | <Correct Answer Text> | <Option A> | <Option B> | <Option C> | <Option D> | <Reason> | <Related URL with Timestamp>

────────────────────────
QUALITY CHECK (DO SILENTLY)
────────────────────────
- Exactly 10 questions per block.
- Each correct answer matches EXACTLY one option (character-for-character).
- No duplicated intent or recycled facts.
- Reasons are explicitly grounded in the video.
`;

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