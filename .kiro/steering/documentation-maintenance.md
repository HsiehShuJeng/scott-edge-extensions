---
inclusion: always
---

# Documentation Maintenance Rules

## Commit Requirements
Every time a commit is made, the following documentation must be checked and updated if needed:

### README.md Updates
- **Diagrams**: All diagrams in README.md (component diagram, extraction logic flowchart, component architecture diagram) must be reviewed and updated if the architecture, data flow, or supported scenarios change
- **Scenario Table**: Must be updated if new scenarios are added or existing ones are changed
- **New Diagrams**: Any new diagram must be added to README.md (ask for permission if needed)
- **Content Sync**: The Table of Contents, scenario documentation, and contributor onboarding sections should be kept in sync with the codebase and workflow

### lesson_learned.md Updates
- All implementation or conceptual changes should be noted in lesson_learned.md

## Mermaid Diagram Standards
When creating or updating Mermaid diagrams:
- Always double quote text if there are special characters (e.g., brackets, angle brackets, etc.) to ensure compatibility
- Example: `"[Component Name]"` instead of `[Component Name]`