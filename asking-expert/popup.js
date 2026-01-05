import { initializeUI } from './ui.js';
import { showNotification } from './utils.js';
import { handleExtractQuestions, autoDetectVideoId, handleVideoIdAction } from './video-extractor.js';
import { handleQuizGeneratorClick } from './youtube-quiz-generator.js';


/**
 * Sets up theme toggle functionality with automatic dark mode detection
 * Dark mode is automatically enabled between 18:00-06:00 if no preference is saved
 * @function setupThemeToggle
 * @returns {void}
 */
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');

    // Load saved theme or determine by time if not set
    chrome.storage.local.get('theme', (data) => {
        let theme = data.theme;
        if (!theme) {
            const hour = new Date().getHours();
            // Dark mode from 18:00 to 06:00
            if (hour >= 18 || hour < 6) {
                theme = 'dark';
            } else {
                theme = 'light';
            }
        }
        const isDark = theme === 'dark';
        document.body.classList.toggle('dark-theme', isDark);
        themeToggle.checked = isDark;
    });

    // Toggle theme on switch change
    themeToggle.addEventListener('change', () => {
        const isDark = themeToggle.checked;
        document.body.classList.toggle('dark-theme', isDark);
        chrome.storage.local.set({ theme: isDark ? 'dark' : 'light' });
    });
}

/**
 * Sets up tab navigation functionality with hover switching
 * Optimized for performance
 * @function setupTabNavigation
 * @returns {void}
 */
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Cache DOM elements for better performance
    const tabMap = new Map();
    tabButtons.forEach(button => {
        const targetTab = button.getAttribute('data-tab');
        const targetContent = document.getElementById(`${targetTab}-tab`);
        tabMap.set(button, { targetTab, targetContent });
    });

    function switchToTab(targetTab) {
        // Use requestAnimationFrame for smooth transitions
        requestAnimationFrame(() => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to target button and corresponding content
            const targetButton = document.querySelector(`[data-tab="${targetTab}"]`);
            const targetContent = document.getElementById(`${targetTab}-tab`);
            
            if (targetButton && targetContent) {
                targetButton.classList.add('active');
                targetContent.classList.add('active');
            }
        });
    }

    // Use event delegation for better performance
    tabButtons.forEach(button => {
        const { targetTab } = tabMap.get(button);
        
        // Click event for explicit selection
        button.addEventListener('click', (e) => {
            e.preventDefault();
            switchToTab(targetTab);
        }, { passive: true });
        
        // Hover event for preview switching with throttling
        let hoverTimeout;
        button.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => {
                switchToTab(targetTab);
            }, 50); // Small delay to prevent excessive switching
        }, { passive: true });
        
        button.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimeout);
        }, { passive: true });
    });
}

/**
 * Sets up video extractor functionality
 * @function setupVideoExtractor
 * @returns {void}
 */
function setupVideoExtractor() {
    const extractBtn = document.getElementById('extract-questions');
    const videoIdActionBtn = document.getElementById('video-id-action');
    const videoIdInput = document.getElementById('video-id-input');
    const quizGeneratorBtn = document.getElementById('quiz-generator');
    
    if (extractBtn) {
        extractBtn.addEventListener('click', handleExtractQuestions);
    }
    
    if (videoIdActionBtn) {
        videoIdActionBtn.addEventListener('click', handleVideoIdAction);
    }
    
    if (quizGeneratorBtn) {
        quizGeneratorBtn.addEventListener('click', handleQuizGeneratorClick);
    }
    
    // Auto-detect video ID when the popup opens if on a DeepSRT page
    if (videoIdInput) {
        autoDetectVideoId().then(videoId => {
            if (videoId) {
                videoIdInput.value = videoId;
                videoIdInput.placeholder = 'Auto-detected from page';
            }
        }).catch(error => {
            console.log('Could not auto-detect video ID:', error.message);
        });
    }
}
function setupCommitButtons() {
    const commitButtons = document.querySelectorAll('.commit-btn');
    commitButtons.forEach(button => {
        button.addEventListener('click', function () {
            const commandType = this.getAttribute('data-command');
            let commandString = '';

            // Enhanced conventional commit rules
            const baseRules = `Generate a conventional commit message following these enhanced rules:

STRUCTURE:
- Format: <type>[optional scope]: <description>
- Optional body and footer sections

TYPES (prioritized):
- feat: new features or capabilities
- fix: bug fixes or corrections  
- docs: documentation only changes
- style: formatting, missing semicolons (no code change)
- refactor: code change that neither fixes bug nor adds feature
- perf: performance improvements
- test: adding missing tests or correcting existing tests
- build: changes affecting build system or dependencies
- ci: changes to CI configuration files and scripts
- chore: other changes that don't modify src or test files
- revert: reverts a previous commit

GUIDELINES:
- Subject line: imperative mood, no period, under 50 chars
- Body: wrap at 72 characters, use present tense
- Include breaking changes in footer with 'BREAKING CHANGE:'
- Reference issues with 'Closes #123' or 'Fixes #456'
- Use scope for component/module (e.g., auth, ui, api)

EXAMPLES:
- feat(auth): add user login validation
- fix(ui): resolve button alignment on mobile
- docs: update API documentation for v2.0
- style: format code according to eslint rules
- refactor(core): simplify authentication logic`;

            switch (commandType) {
                case '1':
                    commandString = `echo "${baseRules}

ANALYZE THESE UNSTAGED CHANGES:
$(git diff --word-diff --stat)

DETAILED CHANGES:
$(git diff --word-diff)" | pbcopy`;
                    break;
                case '2':
                    commandString = `echo "${baseRules}

ANALYZE THESE STAGED CHANGES:
$(git diff --cached --word-diff --stat)

DETAILED CHANGES:
$(git diff --cached --word-diff)" | pbcopy`;
                    break;
                case '3':
                    commandString = `echo "${baseRules}

ANALYZE THESE RANGE CHANGES:
$(git diff main..HEAD --stat -- . ':(exclude)**/yarn.lock' ':(exclude)**/package-lock.json')

DETAILED CHANGES:
$(git diff main..HEAD --word-diff -- . ':(exclude)**/yarn.lock' ':(exclude)**/package-lock.json')" | pbcopy`;
                    break;
                default:
                    return;
            }

            navigator.clipboard.writeText(commandString).then(() => {
                const types = {
                    '1': 'Unstaged Changes Analysis',
                    '2': 'Staged Changes Analysis',
                    '3': 'Range Changes Analysis'
                };
                showNotification(`${types[commandType]} prompt copied!`, false, 'Conventional Commits');
            }).catch(err => {
                showNotification('Error copying to clipboard!', true);
            });
        });
    });
}

/**
 * Handles Chrome runtime messages for command execution
 * Processes EXECUTE_COMMAND type messages and generates AI prompts
 * @param {Object} request - The message request object
 */
chrome.runtime.onMessage.addListener(
    function (request) {
        if (request.type === 'EXECUTE_COMMAND') {
            const command = request.command;
            (async () => {
                try {
                    const result = await executeCommand(command);
                    const prompt = `Give me a commit suggestion on title and description with the "50/72" rule within a backtick format based for the following information:\n${command}`;
                    navigator.clipboard.writeText(prompt).then(() => {
                        showNotification('Commit message copied to clipboard!', false, 'AI-Generated');
                    }).catch(err => {
                        showNotification('Error copying to clipboard!', true);
                    });
                } catch (e) {
                    showNotification('Error executing command: ' + e.message, true);
                }
            })();
        }
    }
);

/**
 * Executes shell commands via Chrome extension messaging
 * @param {string} command - The shell command to execute
 * @returns {Promise<Object>} Promise resolving to command execution result
 * @throws {Error} When command execution fails
 */
async function executeCommand(command) {
    try {
        const result = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                type: 'EXECUTE_COMMAND_TOOL',
                command: command
            }, function (response) {
                if (response && response.output) {
                    resolve({ output: response.output });
                } else if (response && response.error) {
                    reject({ error: response.error });
                } else {
                    reject(new Error('Unknown error'));
                }
            });
        });
        return result;
    } catch (e) {
        console.error("Failed to execute command:", e);
        throw e;
    }
}


/**
 * Generates branch naming prompt with user input and template
 * @param {string} featureText - The feature description or bug report text
 * @returns {string} The formatted prompt string for LLM input
 */
function generateBranchPrompt(featureText) {
    const trimmedText = featureText.trim();
    if (!trimmedText) {
        return null;
    }
    
    const prompt = `${trimmedText}\n\nBased on the above requirement(s), please suggest branch names for brainstorming and references. As development effort will be made based on the requirement.`;
    
    return prompt;
}

/**
 * Validates branch description input text
 * @param {string} text - The input text to validate
 * @returns {Object} Validation result with isValid boolean and error message
 */
function validateBranchInput(text) {
    if (!text) {
        return { isValid: false, error: 'Please enter a feature description or bug report' };
    }
    
    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
        return { isValid: false, error: 'Feature description cannot be empty or just whitespace' };
    }
    
    if (trimmedText.length < 3) {
        return { isValid: false, error: 'Feature description is too short (minimum 3 characters)' };
    }
    
    if (trimmedText.length > 2000) {
        return { isValid: false, error: 'Feature description is too long (maximum 2000 characters)' };
    }
    
    return { isValid: true, error: null };
}

/**
 * Handles branch prompt generation button click
 * Validates input, generates prompt, and copies to clipboard
 * @returns {void}
 */
function handleBranchPromptGeneration() {
    const textarea = document.getElementById('branch-description');
    
    // Check if textarea element exists
    if (!textarea) {
        console.error('Branch description textarea not found');
        showNotification('Internal error: Branch input field not found', true);
        return;
    }
    
    const featureText = textarea.value;

    // Validate input with detailed error messages
    const validation = validateBranchInput(featureText);
    if (!validation.isValid) {
        showNotification(validation.error, true);
        // Focus the textarea to help user
        textarea.focus();
        return;
    }

    try {
        // Generate the prompt string
        const prompt = generateBranchPrompt(featureText);
        
        // Verify prompt was generated
        if (!prompt || prompt.trim().length === 0) {
            throw new Error('Generated prompt is empty');
        }

        // Check if clipboard API is available
        if (!navigator.clipboard) {
            showNotification('Clipboard API not available in this browser', true);
            console.error('Clipboard API not supported');
            return;
        }

        // Copy to clipboard with enhanced error handling
        navigator.clipboard.writeText(prompt).then(() => {
            showNotification('Branch naming prompt copied to clipboard!', false, 'Branch Suggestion');
            console.log('Branch prompt generated successfully');
            console.log('Prompt length:', prompt.length, 'characters');
        }).catch((clipboardError) => {
            console.error('Clipboard operation failed:', clipboardError);
            showNotification('Failed to copy prompt to clipboard. Please try again.', true);
        });
    } catch (error) {
        console.error('Error generating branch prompt:', error);
        showNotification(`Error generating branch prompt: ${error.message}`, true);
    }
}

/**
 * Generates PR command with proper shell escaping
 * @param {string} prText - The PR title and description text
 * @returns {string} The formatted printf command string for local execution
 */
function generatePRCommand(prText) {
    // Escape single quotes for shell command - simpler approach
    const escapedText = prText.replace(/'/g, "'\\''");

    // Generate the printf command exactly as specified - this is a pure string
    // that will be copied to clipboard for the user to paste and execute locally
    const command = `printf "#create_pull_request\\n%b\\nowner: %s\\nrepo: %s\\nhead: %s\\nbase: %s\\n" '${escapedText}' "$(git config --get remote.origin.url | sed -E 's@.*:([^/]+)/.*@\\1@')" "$(git config --get remote.origin.url | sed -E 's@.*/([^/]+)\\.git@\\1@')" "$(git symbolic-ref --short HEAD)" "$(git remote show origin | awk '/HEAD branch/ {print $NF}')" | pbcopy`;

    return command;
}

/**
 * Validates PR input text with detailed error checking
 * @param {string} text - The input text to validate
 * @returns {Object} Validation result with isValid boolean and error message
 */
function validatePRInput(text) {
    if (!text) {
        return { isValid: false, error: 'Please enter PR title and description' };
    }
    
    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
        return { isValid: false, error: 'PR description cannot be empty or just whitespace' };
    }
    
    if (trimmedText.length < 3) {
        return { isValid: false, error: 'PR description is too short (minimum 3 characters)' };
    }
    
    if (trimmedText.length > 5000) {
        return { isValid: false, error: 'PR description is too long (maximum 5000 characters)' };
    }
    
    return { isValid: true, error: null };
}

/**
 * Handles PR command generation button click
 * Validates input, generates command, and copies to clipboard
 * @returns {void}
 */
function handlePRGeneration() {
    const textarea = document.getElementById('pr-description');
    
    // Check if textarea element exists
    if (!textarea) {
        console.error('PR description textarea not found');
        showNotification('Internal error: PR input field not found', true);
        return;
    }
    
    const prText = textarea.value;

    // Validate input with detailed error messages
    const validation = validatePRInput(prText);
    if (!validation.isValid) {
        showNotification(validation.error, true);
        // Focus the textarea to help user
        textarea.focus();
        return;
    }

    try {
        // Generate the command string
        const command = generatePRCommand(prText);
        
        // Verify command was generated
        if (!command || command.trim().length === 0) {
            throw new Error('Generated command is empty');
        }

        // Check if clipboard API is available
        if (!navigator.clipboard) {
            showNotification('Clipboard API not available in this browser', true);
            console.error('Clipboard API not supported');
            return;
        }

        // Copy to clipboard with enhanced error handling
        navigator.clipboard.writeText(command).then(() => {
            showNotification('PR command copied to clipboard!', false, 'Pull Request');
            console.log('PR command generated successfully');
            console.log('Command length:', command.length, 'characters');
            console.log('First 150 chars:', command.substring(0, 150) + '...');
        }).catch((clipboardError) => {
            console.error('Clipboard operation failed:', clipboardError);
            showNotification('Failed to copy command to clipboard. Please try again.', true);
        });
    } catch (error) {
        console.error('Error generating PR command:', error);
        showNotification(`Error generating PR command: ${error.message}`, true);
    }
}

/**
 * Auto-resizes textarea height based on content
 * @param {HTMLTextAreaElement} textarea - The textarea element to resize
 * @returns {void}
 */
export function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 300) + 'px';
}

document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    setupCommitButtons();
    setupThemeToggle();
    setupTabNavigation();
    setupVideoExtractor();

    // Setup auto-resize for textareas
    const textareas = document.querySelectorAll('#sentence, #korean-word, #pr-description, #branch-description');
    textareas.forEach(ta => {
        autoResize(ta); // Initial resize
        ta.addEventListener('input', () => autoResize(ta));
    });

    // === Branch Prompt Button Logic ===
    const generateBranchPromptBtn = document.getElementById('generate-branch-prompt');
    if (generateBranchPromptBtn) {
        generateBranchPromptBtn.addEventListener('click', handleBranchPromptGeneration);
    }

    // === PR Command Button Logic ===
    const generatePRBtn = document.getElementById('generate-pr-command');
    if (generatePRBtn) {
        generatePRBtn.addEventListener('click', handlePRGeneration);
    }

    // Also resize on window changes
    window.addEventListener('resize', () => {
        textareas.forEach(autoResize);
    });

    // === Image Prompt Button Logic ===
    const generateImageBtn = document.getElementById('generate_image');
    const sentenceTextarea = document.getElementById('sentence');
    if (generateImageBtn && sentenceTextarea) {
        generateImageBtn.addEventListener('click', () => {
            const value = sentenceTextarea.value.trim();
            if (value) {
                const prompt = `Generate an image, 16:9, matching the vibe of ${value}`;
                navigator.clipboard.writeText(prompt).then(() => {
                    showNotification('Image prompt copied to clipboard!');
                }).catch(() => {
                    showNotification('Failed to copy image prompt', true);
                });
            } else {
                // Highlight textarea and show notification inside it
                sentenceTextarea.classList.add('error-highlight');
                const original = sentenceTextarea.value;
                sentenceTextarea.value = "You need to fill a sentence or a context so that 'Build Image Prompt' can work";
                sentenceTextarea.readOnly = true;
                setTimeout(() => {
                    sentenceTextarea.classList.remove('error-highlight');
                    sentenceTextarea.value = original;
                    sentenceTextarea.readOnly = false;
                }, 4000);
            }
        });
    }
});
