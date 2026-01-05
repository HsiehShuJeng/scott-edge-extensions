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
    const prompt = `Please create 10 multiple-choice questions based on the following YouTube video:

Video Title: ${title}
Video URL: ${url}

Requirements:
1. Generate exactly 10 questions that test comprehension of the video content
2. Each question should have 4 options (A, B, C, D)
3. Provide the correct answer for each question
4. Include a brief explanation for why the answer is correct
5. Questions should cover key concepts, facts, and insights from the video
6. Vary the difficulty level from basic recall to analytical thinking
7. Format the output as a clean, numbered list

Please analyze the video transcript and create engaging, educational questions that would help viewers test their understanding of the content.`;

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