/**
 * Language Module - Entry Point
 * Exports all language-related functionality
 */

export { generateTranslationPrompt, generateOutput, getSentenceContent } from './translation.js';
export { handleStartEnglishSession, handleEndEnglishSession, handleStartKoreanSession, handleEndKoreanSession } from './session.js';
export { fetchEtymologyExplanation } from './etymology.js';