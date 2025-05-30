import { generateTranslationPrompt, generateOutput } from './translation.js';
import { handleStartEnglishSession, handleEndEnglishSession, handleStartKoreanSession, handleEndKoreanSession } from './session.js';
import { $, showNotification, ID_KOREAN_WORD, handleResultClick } from './utils.js';

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
        } else {
            section.style.display = 'none';
            section.style.opacity = 0;
        }
    });
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
    // Remove old commit message button listener
    // Add new listeners for commit tools buttons
    document.querySelectorAll('.commit-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const commandType = event.target.dataset.command;
            handleCommitButtonClick(commandType);
        });
    });
}

export function initializeUI() {
    document.addEventListener('DOMContentLoaded', () => {
        calculateMaxHeight();
        toggleSectionVisibility('english-section');
        registerEventListeners();
    });
}
