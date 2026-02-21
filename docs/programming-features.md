# Programming & Development Features

Scott's Assistant is also built to accelerate common developer workflows, focusing heavily on GitHub integrations and commit scaffolding.

## Developer Workflows

### AI Commit Statement Generator
Say goodbye to poorly thought-out `git commit -m "fix stuff"` messages. The extension integrates deeply with your current working repository context.

- **Diff Analysis**: Uses the `git diff` output of your staged files (or selected files) to comprehensively understand *what* has changed.
- **Contextual Understanding**: Feeds the diff into an LLM with strict formatting prompts (based on Conventional Commits, e.g., `feat:`, `fix:`, `chore:`).
- **Quality Scaffolding**: Automatically generates a structured commit message with a clear title and a descriptive body outlining the "Why" and "How" of the changes.

### Automated Pull Request Drafting
Creating insightful PR summaries takes time. The extension automates this template generation.

- **Branch Comparison**: Analyzes the differences between your feature branch and the target `main`/`develop` branch.
- **Jira/Ticket Linking**: Can be configured to find ticket numbers (e.g., `PROJ-1234`) in branch names and append them to the PR description.
- **Structured Sections**: Automatically generates `## Description`, `## What Changed`, and `## Testing Instructions` based on the code semantics in the diff.
