/**
 * Video Question Extractor Module
 * Extracts questions and options from DeepSRT challenge pages
 */

import { showNotification } from '../core/utils.js';

/**
 * Auto-detects video ID from DeepSRT page and populates the input field
 * @returns {Promise<string|null>} The detected video ID or null if not found
 */
export async function autoDetectVideoId() {
    try {
        // Get the active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab) {
            return null;
        }

        // Check if the page is a DeepSRT challenge page
        if (!tab.url.includes('challenges.deepsrt.com/challenge/')) {
            return null;
        }

        // Execute content script to extract video ID from page
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: extractVideoIdFromPage
        });

        if (results && results[0] && results[0].result) {
            return results[0].result;
        }

        return null;
    } catch (error) {
        console.error('Error auto-detecting video ID:', error);
        return null;
    }
}

/**
 * Content script function to extract video ID from DOM
 * This function runs in the context of the webpage
 * @returns {string|null} The extracted video ID or null if not found
 */
function extractVideoIdFromPage() {
    try {
        // Try to find video ID from img src attribute
        const videoThumbnail = document.querySelector('img[src*="youtube.com"]');
        if (videoThumbnail) {
            const src = videoThumbnail.src;
            const videoIdMatch = src.match(/\/vi\/([^\/]+)\//);
            if (videoIdMatch) {
                return videoIdMatch[1];
            }
        }

        // Alternative: try to find video ID from any YouTube links on the page
        const youtubeLinks = document.querySelectorAll('a[href*="youtube.com/watch"], a[href*="youtu.be/"]');
        for (const link of youtubeLinks) {
            const href = link.href;
            let videoIdMatch = href.match(/[?&]v=([^&]+)/);
            if (!videoIdMatch) {
                videoIdMatch = href.match(/youtu\.be\/([^?]+)/);
            }
            if (videoIdMatch) {
                return videoIdMatch[1];
            }
        }

        return null;
    } catch (error) {
        console.error('Error extracting video ID from page:', error);
        return null;
    }
}

/**
 * Handles the video ID action button click (copy ID and open YouTube)
 * @returns {Promise<void>}
 */
export async function handleVideoIdAction() {
    const videoIdInput = document.getElementById('video-id-input');
    
    if (!videoIdInput) {
        console.error('Video ID input not found');
        return;
    }

    const videoId = videoIdInput.value.trim();
    
    if (!videoId) {
        showNotification('Please enter a video ID first', true, 'Video ID');
        videoIdInput.focus();
        return;
    }

    try {
        // Copy video ID to clipboard
        await navigator.clipboard.writeText(videoId);
        
        // Open YouTube video in new tab
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        await chrome.tabs.create({ url: youtubeUrl });
        
        showNotification('Video ID copied and YouTube opened!', false, 'Video ID');
    } catch (error) {
        console.error('Error handling video ID action:', error);
        showNotification('Failed to copy ID or open YouTube', true, 'Video ID');
    }
}

/**
 * Extracts questions and options from the current page's HTML structure
 * @returns {Promise<string>} Formatted TSV string with Chinese instructions
 */
export async function extractQuestionsFromPage() {
    try {
        // Get the video ID from the input field
        const videoIdInput = document.getElementById('video-id-input');
        const videoId = videoIdInput ? videoIdInput.value.trim() : '';
        
        // Get the active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab) {
            throw new Error('No active tab found');
        }

        // Check if the page is a DeepSRT challenge page
        if (!tab.url.includes('challenges.deepsrt.com/challenge/')) {
            throw new Error('This feature only works on DeepSRT challenge pages');
        }

        // Execute content script to extract questions and page info
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: extractQuestionsAndPageInfo
        });

        if (!results || !results[0] || !results[0].result) {
            throw new Error('Failed to extract questions from page');
        }

        const extractedData = results[0].result;
        
        if (!extractedData.success) {
            throw new Error(extractedData.error || 'Failed to extract questions');
        }

        // Format the questions as TSV with Chinese instructions using video ID from input
        const tsvOutput = formatQuestionsAsTSV(
            extractedData.questions, 
            extractedData.videoTitle, 
            videoId
        );
        
        // Copy to clipboard
        await navigator.clipboard.writeText(tsvOutput);
        
        return tsvOutput;
    } catch (error) {
        console.error('Error extracting questions:', error);
        throw error;
    }
}

/**
 * Content script function to extract questions and page info from DOM
 * This function runs in the context of the webpage
 * @returns {Object} Extraction result with success status, questions data, video title, and URL
 */
function extractQuestionsAndPageInfo() {
    try {
        const questions = [];
        
        // Extract video title from the page - prioritize .video-title div
        let videoTitle = '';
        const videoTitleDiv = document.querySelector('.video-title');
        if (videoTitleDiv) {
            videoTitle = videoTitleDiv.textContent.trim();
        } else {
            // Fallback to img alt attribute
            const videoThumbnail = document.querySelector('img[src*="youtube.com"]');
            videoTitle = videoThumbnail ? videoThumbnail.alt : 'Video Title Not Found';
        }
        
        // Extract video URL - try to get YouTube URL from the page
        let videoUrl = '';
        const videoThumbnail = document.querySelector('img[src*="youtube.com"]');
        if (videoThumbnail) {
            const src = videoThumbnail.src;
            const videoIdMatch = src.match(/\/vi\/([^\/]+)\//);
            if (videoIdMatch) {
                videoUrl = `https://www.youtube.com/watch?v=${videoIdMatch[1]}`;
            }
        }
        
        // Extract questions using DOM traversal approach
        const allElements = Array.from(document.querySelectorAll('*'));
        const textElements = allElements.filter(el => 
            el.children.length === 0 && 
            el.textContent.trim().length > 0
        );
        
        for (let i = 0; i < textElements.length; i++) {
            const element = textElements[i];
            const text = element.textContent.trim();
            
            // Check if this is a question number (1-10)
            if (/^[1-9]|10$/.test(text) && text.length <= 2) {
                // Next element should be the question text
                if (i + 1 < textElements.length) {
                    const questionElement = textElements[i + 1];
                    const questionText = questionElement.textContent.trim();
                    
                    // Make sure it's a reasonable question (contains Chinese characters and is long enough)
                    if (questionText.length > 10 && /[\u4e00-\u9fff]/.test(questionText)) {
                        const question = {
                            number: parseInt(text),
                            text: questionText,
                            options: {}
                        };
                        
                        // Look for options in the following elements
                        let j = i + 2;
                        let expectedOption = 'A';
                        
                        while (j < textElements.length && j < i + 20) { // Look ahead max 20 elements
                            const optionElement = textElements[j];
                            const optionText = optionElement.textContent.trim();
                            
                            // Check if this is an option letter
                            if (optionText === `${expectedOption})`) {
                                // Next element should be the option text
                                if (j + 1 < textElements.length) {
                                    const optionTextElement = textElements[j + 1];
                                    const optionContent = optionTextElement.textContent.trim();
                                    
                                    if (optionContent.length > 0) {
                                        question.options[expectedOption] = optionContent;
                                        
                                        // Move to next expected option
                                        if (expectedOption === 'A') expectedOption = 'B';
                                        else if (expectedOption === 'B') expectedOption = 'C';
                                        else if (expectedOption === 'C') break; // We have all 3 options
                                        
                                        j += 2; // Skip both the letter and text elements
                                    } else {
                                        j++;
                                    }
                                } else {
                                    j++;
                                }
                            } else {
                                j++;
                            }
                        }
                        
                        // If we found at least 3 options, add this question
                        if (Object.keys(question.options).length >= 3) {
                            questions.push(question);
                        }
                        
                        // Stop if we've found 10 questions
                        if (questions.length >= 10) break;
                    }
                }
            }
        }

        if (questions.length === 0) {
            return {
                success: false,
                error: 'No questions found on this page. Make sure you are on a DeepSRT challenge page.'
            };
        }

        return {
            success: true,
            questions: questions,
            totalFound: questions.length,
            videoTitle: videoTitle,
            videoUrl: videoUrl
        };
    } catch (error) {
        return {
            success: false,
            error: `Error extracting questions: ${error.message}`
        };
    }
}

/**
 * Formats extracted questions as simple numbered list with Chinese instructions
 * @param {Array} questions - Array of question objects
 * @param {string} videoTitle - Title of the video
 * @param {string} videoId - Video ID from input field
 * @returns {string} Formatted string with questions list and Chinese instructions
 */
function formatQuestionsAsTSV(questions, videoTitle = '', videoId = '') {
    const videoUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';
    
    // Include video title at the top
    let output = '';
    
    // Process each question into simple numbered format
    const questionsList = questions.map((question, index) => {
        // Clean text by removing line breaks and normalizing spaces
        const cleanText = (text) => text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        
        const questionText = cleanText(question.text);
        const optionA = cleanText(question.options.A || '');
        const optionB = cleanText(question.options.B || '');
        const optionC = cleanText(question.options.C || '');
        
        // Format as simple numbered list
        let formattedQuestion = `${index + 1}. ${questionText}`;
        formattedQuestion += `\n\tA. ${optionA}`;
        formattedQuestion += `\n\tB. ${optionB}`;
        formattedQuestion += `\n\tC. ${optionC}`;
        
        return formattedQuestion;
    }).join('\n\n');
    
    output += questionsList;
    
    const chineseInstructions = `

*提取了 ${questions.length} 道題目*
*生成時間：${new Date().toLocaleString()}*

請把上面的 ${questions.length} 道題目整理成 TSV（tab 分隔），以 MD 格式輸出資料本體、不要表頭、不要多餘解說。 固定 9 欄且順序為：Video Title、Question、Answer、Option A、Option B、Option C、Option D、Reason、Related URL with Timestamp

規則：
1. 只用 TAB 分隔；每題一列，正好 ${questions.length} 列。
2. 若題目只有 A/B/C，Option D 一律填「無」。
3. Answer 請填正確「選項文字」（不是 A/B/C/D）。
4. Reason 僅一句話依據。
5. 連結要加時間錨點 &t={秒}s。
6. 題目或選項若有換行，改成單行（可用空白或 / 串接）。

影片標題：${videoTitle}
影片轉錄內容請參考上方影片 URL：${videoUrl}`;
    
    return output + chineseInstructions;
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
        const tsvOutput = await extractQuestionsFromPage();
        
        // Success state - smooth transition to "Extracted"
        extractBtn.textContent = 'Extracted';
        statusEl.className = 'status-message success';
        statusEl.textContent = `Successfully extracted and copied to clipboard!`;
        
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