import { generateTranslationPrompt, generateOutput } from './translation.js';
import { handleStartEnglishSession, handleEndEnglishSession, handleStartKoreanSession, handleEndKoreanSession } from './session.js';
import { $, showNotification, ID_KOREAN_WORD, handleResultClick } from './utils.js';
import { autoResize } from './popup.js'; // Import autoResize

export function calculateMaxHeight() {
    const sections = document.querySelectorAll('#english-section, #korean-section');
    let maxHeight = 0;
    sections.forEach(section => {
        let originalVisibility = section.style.visibility;
        let originalHeight = section.style.height;
        section.style.visibility = 'visible';
        section.style.height = 'auto';
        const currentHeight = section.offsetHeight;
        maxHeight = Math.max(maxHeight, currentHeight);
        section.style.visibility = originalVisibility;
        section.style.height = originalHeight;
    });
    applyMaxHeight(maxHeight);
}

function applyMaxHeight(maxHeight) {
    const sections = document.querySelectorAll('#english-section, #korean-section');
    sections.forEach(section => {
        section.style.height = `${maxHeight}px`;
    });
}

export function toggleSectionVisibility(targetId) {
    const sections = document.querySelectorAll('#english-section, #korean-section');
    sections.forEach(section => {
        if (section.id === targetId) {
            section.style.display = 'block';
            section.style.opacity = 1;

            // Call autoResize after the section is made visible
            if (section.id === 'english-section') {
                const sentenceTextarea = document.getElementById('sentence');
                if (sentenceTextarea) {
                    autoResize(sentenceTextarea);
                }
            } else if (section.id === 'korean-section') {
                const koreanTextarea = document.getElementById('korean-word');
                if (koreanTextarea) {
                    autoResize(koreanTextarea);
                }
            }
        } else {
            section.style.display = 'none';
            section.style.opacity = 0;
        }
    });
    updateActiveFlag();
}

export function updateActiveFlag() {
    const englishSection = document.getElementById('english-section');
    const koreanSection = document.getElementById('korean-section');
    const englishFlag = document.querySelector('#english-btn img');
    const koreanFlag = document.querySelector('#korean-btn img');
    if (englishSection && koreanSection && englishFlag && koreanFlag) {
        if (englishSection.style.display !== 'none') {
            englishFlag.classList.add('active-flag');
            koreanFlag.classList.remove('active-flag');
        } else if (koreanSection.style.display !== 'none') {
            koreanFlag.classList.add('active-flag');
            englishFlag.classList.remove('active-flag');
        }
    }
}

export function registerEventListeners() {
    document.getElementById('translate_zh').addEventListener('click', () => generateTranslationPrompt('zh'));
    document.getElementById('translate_en').addEventListener('click', () => generateTranslationPrompt('en'));
    document.getElementById('generate').addEventListener('click', () => generateOutput('english'));
    document.getElementById('generate-korean').addEventListener('click', async () => {
        let content = $(ID_KOREAN_WORD).value.trim();
        if (!content) {
            // Optionally, fetch from content.js if needed
            showNotification('No content to generate!', true);
            return;
        }
        generateOutput('korean');
    });
    document.getElementById('result-english').addEventListener('click', () => handleResultClick('result-english'));
    document.getElementById('result-korean').addEventListener('click', () => handleResultClick('result-korean'));
    document.getElementById('english-btn').addEventListener('mouseenter', () => {
        toggleSectionVisibility('english-section');
    });
    document.getElementById('korean-btn').addEventListener('mouseenter', () => {
        toggleSectionVisibility('korean-section');
    });
    document.getElementById('start-english').addEventListener('click', handleStartEnglishSession);
    document.getElementById('end-english').addEventListener('click', handleEndEnglishSession);
    document.getElementById('start-korean').addEventListener('click', handleStartKoreanSession);
    document.getElementById('end-korean').addEventListener('click', handleEndKoreanSession);
}

export function initializeUI() {
    calculateMaxHeight();
    toggleSectionVisibility('english-section');
    updateActiveFlag();
    registerEventListeners();
}
