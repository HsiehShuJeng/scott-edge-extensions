/**
 * Video Question Extractor Module
 * Extracts questions and options from DeepSRT challenge pages
 */

import { showNotification } from './utils.js';

/**
 * Extracts questions and options from the current page's HTML structure
 * @returns {Promise<string>} Formatted markdown string with questions and options
 */
export async function extractQuestionsFromPage() {
    try {
        // Get the active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab) {
            throw new Error('No active tab found');
        }

        // Check if the page is a DeepSRT challenge page
        if (!tab.url.includes('challenges.deepsrt.com/challenge/')) {
            throw new Error('This feature only works on DeepSRT challenge pages');
        }

        // Execute content script to extract questions
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: extractQuestionsFromDOM
        });

        if (!results || !results[0] || !results[0].result) {
            throw new Error('Failed to extract questions from page');
        }

        const extractedData = results[0].result;
        
        if (!extractedData.success) {
            throw new Error(extractedData.error || 'Failed to extract questions');
        }

        // Format the questions as markdown
        const markdown = formatQuestionsAsMarkdown(extractedData.questions);
        
        // Copy to clipboard
        await navigator.clipboard.writeText(markdown);
        
        return markdown;
    } catch (error) {
        console.error('Error extracting questions:', error);
        throw error;
    }
}

/**
 * Content script function to extract questions from DOM
 * This function runs in the context of the webpage
 * @returns {Object} Extraction result with success status and questions data
 */
function extractQuestionsFromDOM() {
    try {
        const questions = [];
        
        // Find all question cards
        const questionCards = document.querySelectorAll('.question-card');
        
        if (questionCards.length === 0) {
            return {
                success: false,
                error: 'No questions found on this page. Make sure you are on a DeepSRT challenge page.'
            };
        }

        questionCards.forEach((card, index) => {
            try {
                // Extract question number and text
                const questionNumberEl = card.querySelector('.question-number');
                const questionTextEl = card.querySelector('.question-text');
                
                if (!questionNumberEl || !questionTextEl) {
                    console.warn(`Question ${index + 1}: Missing question number or text`);
                    return;
                }

                const questionNumber = questionNumberEl.textContent.trim();
                const questionText = questionTextEl.textContent.trim();

                // Extract options
                const options = {};
                const optionItems = card.querySelectorAll('.option-item');
                
                optionItems.forEach(item => {
                    const optionLabel = item.querySelector('.option-label');
                    const optionLetter = item.querySelector('.option-letter');
                    const optionText = item.querySelector('.option-text');
                    
                    if (optionLabel && optionLetter && optionText) {
                        const letter = optionLetter.textContent.replace(')', '').trim();
                        const text = optionText.textContent.trim();
                        options[letter] = text;
                    }
                });

                // Only add question if we have all required data
                if (questionText && Object.keys(options).length >= 3) {
                    questions.push({
                        number: questionNumber,
                        text: questionText,
                        options: options
                    });
                }
            } catch (error) {
                console.warn(`Error processing question ${index + 1}:`, error);
            }
        });

        if (questions.length === 0) {
            return {
                success: false,
                error: 'No valid questions could be extracted from the page'
            };
        }

        return {
            success: true,
            questions: questions,
            totalFound: questions.length
        };
    } catch (error) {
        return {
            success: false,
            error: `Error extracting questions: ${error.message}`
        };
    }
}

/**
 * Formats extracted questions as markdown
 * @param {Array} questions - Array of question objects
 * @returns {string} Formatted markdown string
 */
function formatQuestionsAsMarkdown(questions) {
    let markdown = '# DeepSRT Challenge Questions\n\n';
    
    questions.forEach((question, index) => {
        markdown += `## Question ${question.number}\n\n`;
        markdown += `${question.text}\n\n`;
        
        // Add options
        Object.entries(question.options).forEach(([letter, text]) => {
            markdown += `**${letter})** ${text}\n\n`;
        });
        
        // Add separator between questions (except for the last one)
        if (index < questions.length - 1) {
            markdown += '---\n\n';
        }
    });
    
    // Add footer with extraction info
    markdown += `\n*Extracted ${questions.length} questions from DeepSRT challenge page*\n`;
    markdown += `*Generated on ${new Date().toLocaleString()}*\n`;
    
    return markdown;
}

/**
 * Handles the extract questions button click
 * @returns {Promise<void>}
 */
export async function handleExtractQuestions() {
    const statusEl = document.getElementById('extraction-status');
    const extractBtn = document.getElementById('extract-questions');
    
    if (!statusEl || !extractBtn) {
        console.error('Required elements not found');
        return;
    }

    // Update UI to show loading state
    extractBtn.disabled = true;
    extractBtn.textContent = 'Extracting...';
    statusEl.className = 'status-message info';
    statusEl.textContent = 'Extracting questions from current page...';

    try {
        const markdown = await extractQuestionsFromPage();
        
        // Success state
        statusEl.className = 'status-message success';
        statusEl.textContent = `Successfully extracted and copied questions to clipboard!`;
        
        // Show notification
        showNotification('Questions extracted and copied to clipboard!', false, 'Video Extractor');
        
        // Reset button after delay
        setTimeout(() => {
            extractBtn.disabled = false;
            extractBtn.textContent = 'Extract Questions from Current Page';
            statusEl.textContent = '';
            statusEl.className = 'status-message';
        }, 3000);
        
    } catch (error) {
        // Error state
        statusEl.className = 'status-message error';
        statusEl.textContent = `Error: ${error.message}`;
        
        // Show error notification
        showNotification(`Extraction failed: ${error.message}`, true, 'Video Extractor');
        
        // Reset button
        extractBtn.disabled = false;
        extractBtn.textContent = 'Extract Questions from Current Page';
        
        // Clear error message after delay
        setTimeout(() => {
            statusEl.textContent = '';
            statusEl.className = 'status-message';
        }, 5000);
    }
}