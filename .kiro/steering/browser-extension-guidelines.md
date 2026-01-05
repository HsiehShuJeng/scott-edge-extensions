---
inclusion: manual
---

# Browser Extension Development Guidelines

## Project Overview
This is a Manifest V3 browser extension called "Asking Expert" for language learning (English and Korean) and programming assistance.

## Version Management
- Version numbers must be synchronized between `package.json` and `asking-expert/manifest.json`
- Use the `preversion` script to automatically sync versions before releases
- Follow semantic versioning (semver) standards

## Extension Structure
- Main extension files are located in the `asking-expert/` directory
- Popup interface: `popup.html`, `popup.js`
- Content scripts: `content.js`
- Background/service worker functionality as needed
- Styles organized in `asking-expert/styles/` directory

## Permissions and Security
- Only request necessary permissions in manifest.json
- Current permissions: `clipboardWrite`, `activeTab`, `scripting`, `storage`
- Host permissions: `<all_urls>` (review if this can be more restrictive)
- Follow principle of least privilege

## Code Organization
- Separate concerns: UI logic, content manipulation, translation, session management
- Modular JavaScript files: `ui.js`, `translation.js`, `session.js`, `utils.js`, `etymology.js`
- CSS organized by component/feature in separate files
