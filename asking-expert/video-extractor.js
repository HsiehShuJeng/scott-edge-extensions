/**
 * Video Question Extractor Module
 * Extracts questions and options from DeepSRT challenge pages
 */

import { showNotification } from './utils.js';

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
        
        // Extract video title from the page
        const videoTitleEl = document.querySelector('.video-title');
        const videoTitle = videoTitleEl ? videoTitleEl.textContent.trim() : '';
        
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
 * Formats extracted questions as TSV with Chinese instructions
 * @param {Array} questions - Array of question objects
 * @param {string} videoTitle - Title of the video
 * @param {string} videoId - Video ID from input field
 * @returns {string} Formatted TSV string with Chinese instructions
 */
function formatQuestionsAsTSV(questions, videoTitle = '', videoId = '') {
    const videoUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';
    
    const chineseInstructions = `請把上面的 10 道題目整理成 TSV（tab 分隔），以 MD 格式輸出資料本體、不要表頭、不要多餘解說。 固定 9 欄且順序為：Video Title、Question、Answer、Option A、Option B、Option C、Option D、Reason、Related URL with Timestamp

規則：
1. 只用 TAB 分隔；每題一列，正好 10 列。
2. 若題目只有 A/B/C，Option D 一律填「無」。
3. Answer 請填正確「選項文字」（不是 A/B/C/D）。
4. Reason 僅一句話依據。
5. 連結要加時間錨點 &t={秒}s。
6. 題目或選項若有換行，改成單行（可用空白或 / 串接）。

影片轉錄內容請參考上方影片 URL：${videoUrl}

\`\`\`
`;

    // Process each question into TSV format
    const tsvRows = questions.map((question, index) => {
        // Clean text by removing line breaks and normalizing spaces
        const cleanText = (text) => text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        
        const questionText = cleanText(question.text);
        const optionA = cleanText(question.options.A || '');
        const optionB = cleanText(question.options.B || '');
        const optionC = cleanText(question.options.C || '');
        const optionD = question.options.D ? cleanText(question.options.D) : '無';
        
        // For now, we'll use placeholder values for Answer, Reason, and URL with timestamp
        // These would need to be filled in manually or extracted from additional data
        const answer = '待填入正確選項文字';
        const reason = '待填入一句話依據';
        const urlWithTimestamp = videoUrl ? `${videoUrl}&t=0s` : '待填入連結與時間錨點';
        
        // Create TSV row (tab-separated values)
        return [
            videoTitle,
            questionText,
            answer,
            optionA,
            optionB,
            optionC,
            optionD,
            reason,
            urlWithTimestamp
        ].join('\t');
    });
    
    const tsvContent = tsvRows.join('\n');
    
    return `${chineseInstructions}${tsvContent}\n\`\`\`\n\n*提取了 ${questions.length} 道題目*\n*生成時間：${new Date().toLocaleString()}*`;
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
        
        // Success state
        statusEl.className = 'status-message success';
        statusEl.textContent = `Successfully extracted and copied TSV format to clipboard!`;
        
        // Show notification
        showNotification('Questions extracted as TSV and copied to clipboard!', false, 'Video Extractor');
        
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