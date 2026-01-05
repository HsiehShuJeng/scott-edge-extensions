---
inclusion: manual
---

# Development Workflow and Quality Standards

## Code Quality Tools
- **HTMLHint**: Use `.htmlhintrc` configuration for HTML validation
- **Stylelint**: Follow `.stylelintrc.json` configuration for CSS standards
- **Commitizen**: Use `npm run commit` for standardized commit messages
- **Standard Version**: Use `npm run release` for automated versioning and changelog generation

## Git Workflow
- Use conventional commits format via Commitizen
- Update CHANGELOG.md automatically through standard-version
- Ensure all linting passes before commits

## File Structure Standards
- Keep extension assets in `asking-expert/` directory
- Images in `asking-expert/images/`
- Styles in `asking-expert/styles/` with descriptive filenames
- Scripts organized by functionality (ui, translation, session, etc.)

## Testing and Validation
- Test extension functionality across supported browsers
- Validate HTML with HTMLHint before commits
- Validate CSS with Stylelint before commits
- Ensure manifest.json follows Manifest V3 specifications

## Language Learning Features
- Support for English and Korean language learning
- Integration with ChatGPT for language assistance
- Etymology and translation functionality
- Session management for learning progress
