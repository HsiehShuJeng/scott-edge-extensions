/**
 * Unit tests for HTML content verification
 * Tests video grid item descriptions and button functionality
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('Video Grid HTML Content Verification', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    // Load the actual HTML file
    const htmlPath = path.join(__dirname, 'popup.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

    // Create JSDOM instance
    dom = new JSDOM(htmlContent, {
      url: 'http://localhost',
      pretendToBeVisual: true,
      resources: 'usable'
    });

    document = dom.window.document;
    window = dom.window;

    // Make globals available
    global.document = document;
    global.window = window;
  });

  describe('Video Grid Item Descriptions', () => {
    it('should have first grid item contain correct DeepSRT description', () => {
      // Requirements: 1.1 - First grid item should show DeepSRT description
      const videoGridItems = document.querySelectorAll('.video-grid-item');
      expect(videoGridItems).toHaveLength(2);

      const firstGridItem = videoGridItems[0];
      const instructionText = firstGridItem.querySelector('.instruction-text');

      expect(instructionText).toBeTruthy();
      expect(instructionText.textContent.trim()).toBe(
        'Extract questions and options from DeepSRT challenge pages'
      );
    });

    it('should have second grid item contain correct YouTube description', () => {
      // Requirements: 1.2 - Second grid item should show YouTube description
      const videoGridItems = document.querySelectorAll('.video-grid-item');
      expect(videoGridItems).toHaveLength(2);

      const secondGridItem = videoGridItems[1];
      const instructionText = secondGridItem.querySelector('.instruction-text');

      expect(instructionText).toBeTruthy();
      expect(instructionText.textContent.trim()).toBe(
        'Generate quiz from YouTube video pages'
      );
    });
  });

  describe('Button Functionality Preservation', () => {
    it('should preserve first grid item video ID input functionality and Extract Questions button', () => {
      // Requirements: 1.3 - First grid item maintains existing functionality
      const videoGridItems = document.querySelectorAll('.video-grid-item');
      const firstGridItem = videoGridItems[0];

      // Check video ID input exists
      const videoIdInput = firstGridItem.querySelector('#video-id-input');
      expect(videoIdInput).toBeTruthy();
      expect(videoIdInput.placeholder).toBe('Auto-detected or enter manually');

      // Check video ID action button exists
      const videoIdAction = firstGridItem.querySelector('#video-id-action');
      expect(videoIdAction).toBeTruthy();
      expect(videoIdAction.title).toBe('Copy ID and open YouTube');

      // Check Extract Questions button exists
      const extractButton = firstGridItem.querySelector('#extract-questions');
      expect(extractButton).toBeTruthy();
      expect(extractButton.textContent.replace(/\s+/g, ' ').trim()).toBe('Extract Questions');
      expect(extractButton.classList.contains('modern-btn')).toBe(true);
      expect(extractButton.classList.contains('extract-btn')).toBe(true);
    });

    it('should preserve second grid item Generate Quiz button functionality', () => {
      // Requirements: 1.4 - Second grid item maintains existing functionality
      const videoGridItems = document.querySelectorAll('.video-grid-item');
      const secondGridItem = videoGridItems[1];

      // Check Generate Quiz button exists
      const quizButton = secondGridItem.querySelector('#quiz-generator');
      expect(quizButton).toBeTruthy();
      expect(quizButton.textContent.replace(/\s+/g, ' ').trim()).toBe('Generate Quiz');
      expect(quizButton.classList.contains('modern-btn')).toBe(true);
      expect(quizButton.classList.contains('quiz-generator-btn')).toBe(true);
    });

    it('should have video grid container with correct structure', () => {
      // Verify overall structure is preserved
      const videoGridContainer = document.querySelector('.video-grid-container');
      expect(videoGridContainer).toBeTruthy();

      const gridItems = videoGridContainer.querySelectorAll('.video-grid-item');
      expect(gridItems).toHaveLength(2);

      // Verify each grid item has instruction text
      gridItems.forEach(item => {
        const instructionText = item.querySelector('.instruction-text');
        expect(instructionText).toBeTruthy();
        expect(instructionText.textContent.trim().length).toBeGreaterThan(0);
      });
    });

    it('should have all required button elements with correct IDs and classes', () => {
      // Comprehensive check for button preservation
      const extractButton = document.querySelector('#extract-questions');
      const quizButton = document.querySelector('#quiz-generator');
      const videoIdAction = document.querySelector('#video-id-action');

      expect(extractButton).toBeTruthy();
      expect(quizButton).toBeTruthy();
      expect(videoIdAction).toBeTruthy();

      // Verify button types
      expect(extractButton.type).toBe('button');
      expect(quizButton.type).toBe('button');
      expect(videoIdAction.type).toBe('button');
    });
  });
});