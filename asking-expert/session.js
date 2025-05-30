import { ID_RESULT_ENGLISH, ID_RESULT_KOREAN, ID_LOCALITY_DROPDOWN, ID_LOCALITY_DROPDOWN_KOREAN, $, copyToClipboard } from './utils.js';

let startTime = null;

export function handleStartEnglishSession() {
    startTime = new Date();
    const hours = startTime.getHours().toString().padStart(2, '0');
    const minutes = startTime.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    const localityDropdown = $(ID_LOCALITY_DROPDOWN);
    const localityCode = localityDropdown.value;
    const command = `python record_english_learning.py '${currentTime}' -L 'English' -D ?? -LO ${localityCode}`;
    $(ID_RESULT_ENGLISH).value = command;
    copyToClipboard(command, 'Start command copied to clipboard!');
}

export function handleEndEnglishSession() {
    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 60000);
    const hours = startTime.getHours().toString().padStart(2, '0');
    const minutes = startTime.getMinutes().toString().padStart(2, '0');
    const startTimeFormatted = `${hours}:${minutes}`;
    const localityDropdown = $(ID_LOCALITY_DROPDOWN);
    const localityCode = localityDropdown.value;
    const command = `python record_english_learning.py '${startTimeFormatted}' -L 'English' -D ${duration} -LO ${localityCode}`;
    $(ID_RESULT_ENGLISH).value = command;
    copyToClipboard(command, 'Start command copied to clipboard!');
}

export function handleStartKoreanSession() {
    startTime = new Date();
    const hours = startTime.getHours().toString().padStart(2, '0');
    const minutes = startTime.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    const localityDropdown = $(ID_LOCALITY_DROPDOWN_KOREAN);
    const localityCode = localityDropdown.value;
    const command = `python record_english_learning.py '${currentTime}' -L 'Korean' -D ?? -LO ${localityCode}`;
    $(ID_RESULT_KOREAN).value = command;
    copyToClipboard(command, 'Start command copied to clipboard!');
}

export function handleEndKoreanSession() {
    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 60000);
    const hours = startTime.getHours().toString().padStart(2, '0');
    const minutes = startTime.getMinutes().toString().padStart(2, '0');
    const startTimeFormatted = `${hours}:${minutes}`;
    const localityDropdown = $(ID_LOCALITY_DROPDOWN_KOREAN);
    const localityCode = localityDropdown.value;
    const command = `python record_english_learning.py '${startTimeFormatted}' -L 'Korean' -D ${duration} -LO ${localityCode}`;
    $(ID_RESULT_KOREAN).value = command;
    copyToClipboard(command, 'End command copied to clipboard!');
}
